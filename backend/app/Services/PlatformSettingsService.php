<?php

namespace App\Services;

use App\Models\PlatformSettingRevision;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;
use Throwable;

class PlatformSettingsService
{
    private const CACHE_RUNTIME_PAYMENT_KEY = 'platform_settings.runtime_payment.v1';

    private const CACHE_RUNTIME_PRICING_KEY = 'platform_settings.runtime_pricing.v1';

    public const SECTION_GENERAL = 'general';

    public const SECTION_BRANDING = 'branding';

    public const SECTION_PRICING = 'pricing';

    public const SECTION_PAYMENT = 'payment';

    public const SECTION_SLA = 'sla';

    public const SECTION_NOTIFICATIONS = 'notifications';

    public const SECTION_LEGAL = 'legal';

    public const SECTIONS = [
        self::SECTION_GENERAL,
        self::SECTION_BRANDING,
        self::SECTION_PRICING,
        self::SECTION_PAYMENT,
        self::SECTION_SLA,
        self::SECTION_NOTIFICATIONS,
        self::SECTION_LEGAL,
    ];

    public function __construct(private readonly AdminAuditLogger $auditLogger) {}

    public function getOrCreateDraft(?User $creator = null): PlatformSettingRevision
    {
        $draft = PlatformSettingRevision::query()
            ->where('status', PlatformSettingRevision::STATUS_DRAFT)
            ->latest('id')
            ->first();

        if ($draft) {
            return $draft;
        }

        $published = $this->getPublishedRevision();
        $payload = $published?->payload ?? $this->defaultPayload();
        $secretPayload = $published?->secret_payload ?? $this->defaultSecretPayload();

        $createdDraft = PlatformSettingRevision::create([
            'status' => PlatformSettingRevision::STATUS_DRAFT,
            'payload' => $payload,
            'secret_payload' => $secretPayload,
            'created_by' => $creator?->id,
        ]);

        Log::info('settings.draft.created', [
            'revision_id' => $createdDraft->id,
            'created_by' => $creator?->id,
            'source' => $published ? 'published_revision' : 'defaults',
        ]);

        return $createdDraft;
    }

    public function getPublishedRevision(): ?PlatformSettingRevision
    {
        return PlatformSettingRevision::query()
            ->where('status', PlatformSettingRevision::STATUS_PUBLISHED)
            ->latest('published_at')
            ->latest('id')
            ->first();
    }

    public function getHistory(int $perPage = 20): LengthAwarePaginator
    {
        return PlatformSettingRevision::query()
            ->with(['creator', 'tester', 'publisher'])
            ->latest('id')
            ->paginate($perPage);
    }

    public function updateSection(
        PlatformSettingRevision $draft,
        string $section,
        array $sectionPayload,
        array $sectionSecretPayload = [],
        ?User $actor = null
    ): PlatformSettingRevision {
        if ($draft->status !== PlatformSettingRevision::STATUS_DRAFT) {
            throw new RuntimeException('Seule une révision brouillon peut être modifiée.');
        }

        if (! in_array($section, self::SECTIONS, true)) {
            throw new RuntimeException('Section de paramètres inconnue.');
        }

        $payload = $this->normalizePayload($draft->payload);
        $secretPayload = $this->normalizeSecretPayload($draft->secret_payload);

        $payload[$section] = $this->mergeSettingsValue(
            Arr::get($payload, $section, []),
            $sectionPayload
        );

        if ($sectionSecretPayload !== []) {
            $secretPayload[$section] = $this->mergeSettingsValue(
                Arr::get($secretPayload, $section, []),
                $sectionSecretPayload
            );
        }

        $updates = [
            'payload' => $payload,
            'secret_payload' => $secretPayload,
        ];

        if ($draft->created_by === null && $actor) {
            $updates['created_by'] = $actor->id;
        }

        $draft->update($updates);
        Log::info('settings.section.updated', [
            'revision_id' => $draft->id,
            'section' => $section,
            'actor_id' => $actor?->id,
        ]);
        $this->auditLogger->record(
            event: 'settings.section.updated',
            payload: [
                'revision_id' => $draft->id,
                'section' => $section,
            ],
            actor: $actor,
            message: 'Mise à jour section paramètres',
            targetType: 'platform_setting_revision',
            targetId: (string) $draft->id
        );

        return $draft->fresh();
    }

    public function testPaymentConfiguration(PlatformSettingRevision $draft, User $tester): array
    {
        $payment = $this->resolvePaymentConfigurationFromRevision($draft);
        $validationError = $this->validatePaymentConfiguration($payment);

        $draft->update([
            'tested_by' => $tester->id,
            'tested_at' => now(),
        ]);

        if ($validationError !== null) {
            Log::warning('settings.payment.test.failed', [
                'revision_id' => $draft->id,
                'tested_by' => $tester->id,
                'reason' => $validationError,
            ]);
            $this->auditLogger->record(
                event: 'settings.payment.test.failed',
                payload: [
                    'revision_id' => $draft->id,
                    'reason' => $validationError,
                ],
                actor: $tester,
                message: 'Test de configuration paiement échoué',
                targetType: 'platform_setting_revision',
                targetId: (string) $draft->id
            );

            return [
                'ok' => false,
                'message' => $validationError,
            ];
        }

        if (! (bool) Arr::get($payment, 'enabled', true)) {
            Log::info('settings.payment.test.skipped_disabled', [
                'revision_id' => $draft->id,
                'tested_by' => $tester->id,
            ]);
            $this->auditLogger->record(
                event: 'settings.payment.test.skipped_disabled',
                payload: [
                    'revision_id' => $draft->id,
                ],
                actor: $tester,
                message: 'Test paiement ignoré (paiement désactivé)',
                targetType: 'platform_setting_revision',
                targetId: (string) $draft->id
            );

            return [
                'ok' => true,
                'message' => 'Paiement désactivé: aucune connexion FedaPay requise.',
            ];
        }

        try {
            $response = Http::baseUrl((string) $payment['base_url'])
                ->withToken((string) $payment['secret_key'])
                ->acceptJson()
                ->asJson()
                ->timeout(15)
                ->get('/transactions', [
                    'page' => 1,
                    'per_page' => 1,
                ]);
        } catch (Throwable $exception) {
            Log::warning('settings.payment.test.failed', [
                'revision_id' => $draft->id,
                'tested_by' => $tester->id,
                'reason' => $exception->getMessage(),
            ]);
            $this->auditLogger->record(
                event: 'settings.payment.test.failed',
                payload: [
                    'revision_id' => $draft->id,
                    'reason' => $exception->getMessage(),
                ],
                actor: $tester,
                message: 'Test de configuration paiement échoué',
                targetType: 'platform_setting_revision',
                targetId: (string) $draft->id
            );

            return [
                'ok' => false,
                'message' => 'Connexion FedaPay impossible: '.$exception->getMessage(),
            ];
        }

        if ($response->successful()) {
            Log::info('settings.payment.test.succeeded', [
                'revision_id' => $draft->id,
                'tested_by' => $tester->id,
                'status' => $response->status(),
            ]);
            $this->auditLogger->record(
                event: 'settings.payment.test.succeeded',
                payload: [
                    'revision_id' => $draft->id,
                    'status' => $response->status(),
                ],
                actor: $tester,
                message: 'Test de configuration paiement réussi',
                targetType: 'platform_setting_revision',
                targetId: (string) $draft->id
            );

            return [
                'ok' => true,
                'message' => 'Connexion FedaPay réussie. La configuration est valide.',
            ];
        }

        $message = (string) Arr::get($response->json(), 'message', '');
        if ($message === '') {
            $message = 'FedaPay a répondu avec le statut HTTP '.$response->status().'.';
        }

        Log::warning('settings.payment.test.failed', [
            'revision_id' => $draft->id,
            'tested_by' => $tester->id,
            'status' => $response->status(),
            'reason' => $message,
        ]);
        $this->auditLogger->record(
            event: 'settings.payment.test.failed',
            payload: [
                'revision_id' => $draft->id,
                'status' => $response->status(),
                'reason' => $message,
            ],
            actor: $tester,
            message: 'Test de configuration paiement échoué',
            targetType: 'platform_setting_revision',
            targetId: (string) $draft->id
        );

        return [
            'ok' => false,
            'message' => 'Test FedaPay échoué: '.$message,
        ];
    }

    public function publishDraft(PlatformSettingRevision $draft, User $publisher, ?string $changeNote = null): array
    {
        if ($draft->status !== PlatformSettingRevision::STATUS_DRAFT) {
            throw new RuntimeException('Seule une révision brouillon peut être publiée.');
        }

        $payment = $this->resolvePaymentConfigurationFromRevision($draft);
        $validationError = $this->validatePaymentConfiguration($payment);
        if ($validationError !== null) {
            throw new RuntimeException('Publication impossible: '.$validationError);
        }

        $published = null;
        $nextDraft = null;

        DB::transaction(function () use ($draft, $publisher, $changeNote, &$published, &$nextDraft): void {
            PlatformSettingRevision::query()
                ->whereIn('status', [
                    PlatformSettingRevision::STATUS_PUBLISHED,
                    PlatformSettingRevision::STATUS_DRAFT,
                ])
                ->where('id', '!=', $draft->id)
                ->update(['status' => PlatformSettingRevision::STATUS_ARCHIVED]);

            $draft->update([
                'status' => PlatformSettingRevision::STATUS_PUBLISHED,
                'published_by' => $publisher->id,
                'published_at' => now(),
                'change_note' => $changeNote ?: $draft->change_note,
            ]);

            $published = $draft->fresh();

            $nextDraft = PlatformSettingRevision::create([
                'status' => PlatformSettingRevision::STATUS_DRAFT,
                'payload' => $published->payload,
                'secret_payload' => $published->secret_payload,
                'created_by' => $publisher->id,
            ]);
        });

        $this->clearRuntimeCache();
        Log::info('settings.published', [
            'published_revision_id' => $published?->id,
            'next_draft_revision_id' => $nextDraft?->id,
            'published_by' => $publisher->id,
            'change_note_present' => trim((string) ($changeNote ?? '')) !== '',
        ]);
        $this->auditLogger->record(
            event: 'settings.published',
            payload: [
                'published_revision_id' => $published?->id,
                'next_draft_revision_id' => $nextDraft?->id,
                'change_note' => $changeNote,
            ],
            actor: $publisher,
            message: 'Publication configuration plateforme',
            targetType: 'platform_setting_revision',
            targetId: (string) ($published?->id ?? '')
        );

        return [
            'published' => $published,
            'draft' => $nextDraft,
        ];
    }

    public function restoreRevisionToDraft(PlatformSettingRevision $revision, User $actor): PlatformSettingRevision
    {
        $newDraft = null;

        DB::transaction(function () use ($revision, $actor, &$newDraft): void {
            PlatformSettingRevision::query()
                ->where('status', PlatformSettingRevision::STATUS_DRAFT)
                ->update(['status' => PlatformSettingRevision::STATUS_ARCHIVED]);

            $newDraft = PlatformSettingRevision::create([
                'status' => PlatformSettingRevision::STATUS_DRAFT,
                'payload' => $this->normalizePayload($revision->payload),
                'secret_payload' => $this->normalizeSecretPayload($revision->secret_payload),
                'created_by' => $actor->id,
                'change_note' => 'Brouillon restauré depuis la révision #'.$revision->id,
            ]);
        });
        Log::info('settings.draft.restored', [
            'source_revision_id' => $revision->id,
            'new_draft_revision_id' => $newDraft?->id,
            'actor_id' => $actor->id,
        ]);
        $this->auditLogger->record(
            event: 'settings.draft.restored',
            payload: [
                'source_revision_id' => $revision->id,
                'new_draft_revision_id' => $newDraft?->id,
            ],
            actor: $actor,
            message: 'Restauration de révision en brouillon',
            targetType: 'platform_setting_revision',
            targetId: (string) ($newDraft?->id ?? '')
        );

        return $newDraft;
    }

    public function getRuntimePaymentConfiguration(): array
    {
        return Cache::remember(self::CACHE_RUNTIME_PAYMENT_KEY, now()->addMinutes(10), function (): array {
            $published = $this->getPublishedRevision();
            if (! $published) {
                return $this->defaultPaymentConfiguration();
            }

            return $this->resolvePaymentConfigurationFromRevision($published);
        });
    }

    public function getRuntimePricingConfiguration(): array
    {
        return Cache::remember(self::CACHE_RUNTIME_PRICING_KEY, now()->addMinutes(10), function (): array {
            $defaults = Arr::get($this->defaultPayload(), self::SECTION_PRICING, []);
            $published = $this->getPublishedRevision();

            if (! $published) {
                return $defaults;
            }

            $payload = $this->normalizePayload($published->payload);
            $configured = Arr::get($payload, self::SECTION_PRICING, []);

            return $this->mergeSettingsValue($defaults, is_array($configured) ? $configured : []);
        });
    }

    public function getRuntimeSlaConfiguration(): array
    {
        $defaults = Arr::get($this->defaultPayload(), self::SECTION_SLA, []);
        $published = $this->getPublishedRevision();
        if (! $published) {
            return $defaults;
        }

        $payload = $this->normalizePayload($published->payload);
        $configured = Arr::get($payload, self::SECTION_SLA, []);

        return array_replace($defaults, is_array($configured) ? $configured : []);
    }

    public function compareRevisions(PlatformSettingRevision $fromRevision, PlatformSettingRevision $toRevision): array
    {
        $fromPayloadFlat = $this->flattenArray($this->normalizePayload($fromRevision->payload));
        $toPayloadFlat = $this->flattenArray($this->normalizePayload($toRevision->payload));
        $payloadChanges = [];

        $payloadPaths = array_values(array_unique(array_merge(
            array_keys($fromPayloadFlat),
            array_keys($toPayloadFlat)
        )));
        sort($payloadPaths);

        foreach ($payloadPaths as $path) {
            $fromExists = array_key_exists($path, $fromPayloadFlat);
            $toExists = array_key_exists($path, $toPayloadFlat);
            $fromValue = $fromPayloadFlat[$path] ?? null;
            $toValue = $toPayloadFlat[$path] ?? null;

            if ($fromExists && $toExists && $fromValue === $toValue) {
                continue;
            }

            $payloadChanges[] = [
                'path' => $path,
                'section' => $this->resolveSectionFromPath($path),
                'change_type' => $this->resolveDiffType($fromExists, $toExists),
                'from' => $this->formatDiffValue($fromValue, $fromExists),
                'to' => $this->formatDiffValue($toValue, $toExists),
            ];
        }

        $fromSecretFlat = $this->flattenArray($this->normalizeSecretPayload($fromRevision->secret_payload));
        $toSecretFlat = $this->flattenArray($this->normalizeSecretPayload($toRevision->secret_payload));
        $secretChanges = [];

        $secretPaths = array_values(array_unique(array_merge(
            array_keys($fromSecretFlat),
            array_keys($toSecretFlat)
        )));
        sort($secretPaths);

        foreach ($secretPaths as $path) {
            $fromExists = array_key_exists($path, $fromSecretFlat);
            $toExists = array_key_exists($path, $toSecretFlat);
            $fromValue = $fromSecretFlat[$path] ?? null;
            $toValue = $toSecretFlat[$path] ?? null;

            $fromConfigured = $this->isSecretConfigured($fromValue, $fromExists);
            $toConfigured = $this->isSecretConfigured($toValue, $toExists);

            if ($fromConfigured === $toConfigured && (! $fromConfigured || $fromValue === $toValue)) {
                continue;
            }

            $secretChanges[] = [
                'path' => $path,
                'section' => $this->resolveSectionFromPath($path),
                'change_type' => $this->resolveSecretChangeType($fromConfigured, $toConfigured),
                'from' => $fromConfigured ? 'configured' : 'not_configured',
                'to' => $toConfigured ? 'configured' : 'not_configured',
            ];
        }

        $changedSections = array_values(array_unique(array_merge(
            array_map(static fn (array $row): string => (string) $row['section'], $payloadChanges),
            array_map(static fn (array $row): string => (string) $row['section'], $secretChanges)
        )));
        sort($changedSections);

        return [
            'payload_changes' => $payloadChanges,
            'secret_changes' => $secretChanges,
            'summary' => [
                'payload_change_count' => count($payloadChanges),
                'secret_change_count' => count($secretChanges),
                'changed_sections' => $changedSections,
            ],
        ];
    }

    public function getMaskedSecretState(PlatformSettingRevision $revision): array
    {
        $paymentSecrets = Arr::get($this->normalizeSecretPayload($revision->secret_payload), 'payment.fedapay', []);

        return [
            'secret_key_configured' => trim((string) Arr::get($paymentSecrets, 'secret_key', '')) !== '',
            'webhook_secret_configured' => trim((string) Arr::get($paymentSecrets, 'webhook_secret', '')) !== '',
        ];
    }

    public function clearRuntimeCache(): void
    {
        Cache::forget(self::CACHE_RUNTIME_PAYMENT_KEY);
        Cache::forget(self::CACHE_RUNTIME_PRICING_KEY);
    }

    public function defaultPayload(): array
    {
        return [
            self::SECTION_GENERAL => [
                'platform_name' => (string) config('app.name', 'FRILO'),
                'tagline' => 'Plateforme FRILO',
                'support_email' => (string) config('mail.from.address', 'support@frilo.com'),
                'support_phone' => '',
                'timezone' => (string) config('app.timezone', 'Africa/Porto-Novo'),
                'default_currency' => 'XOF',
            ],
            self::SECTION_BRANDING => [
                'logo_url' => '',
                'favicon_url' => '',
                'primary_color' => '#0f172a',
                'secondary_color' => '#1f2937',
                'accent_color' => '#2563eb',
            ],
            self::SECTION_PRICING => [
                'currency_label' => 'FCFA',
                'section_title' => 'Simple et transparent.',
                'section_description' => 'Un prix unique, tout inclus. Pas d\'abonnement.',
                'custom_note' => 'Projet spécifique ?',
                'standard' => [
                    'name' => 'Standard',
                    'price' => 50000,
                    'billing_label' => 'Paiement unique',
                    'cta_label' => 'Choisir',
                    'features' => [
                        'Modèle professionnel',
                        'Intégration contenu',
                        'Mise en ligne',
                        'Responsive mobile',
                        '1 révision',
                        '30j de support',
                    ],
                ],
                'premium' => [
                    'badge_label' => 'Populaire',
                    'name' => 'Premium',
                    'price' => 75000,
                    'billing_label' => 'Paiement unique',
                    'cta_label' => 'Choisir',
                    'features' => [
                        'Tout dans Standard',
                        'Design avancé',
                        'Formulaire sécurisé',
                        'Galerie optimisée',
                        '2 révisions',
                        '60j de support',
                        'Formation incluse',
                    ],
                ],
            ],
            self::SECTION_PAYMENT => [
                'fedapay' => [
                    'enabled' => (bool) config('services.fedapay.enabled', true),
                    'environment' => (string) config('services.fedapay.environment', 'sandbox'),
                    'base_url' => (string) config('services.fedapay.base_url', 'https://sandbox-api.fedapay.com/v1'),
                    'currency' => (string) config('services.fedapay.currency', 'XOF'),
                    'callback_url' => (string) config('services.fedapay.callback_url', ''),
                    'webhook_tolerance' => (int) config('services.fedapay.webhook_tolerance', 300),
                ],
            ],
            self::SECTION_SLA => [
                'confirmation_minutes' => 120,
                'preview_hours' => 24,
                'delivery_hours' => 48,
                'revision_window_hours' => 24,
            ],
            self::SECTION_NOTIFICATIONS => [
                'email_enabled' => true,
                'sms_enabled' => false,
                'whatsapp_enabled' => false,
                'notify_order_created' => true,
                'notify_payment_status_changed' => true,
                'notify_order_status_changed' => true,
                'notify_contact_request_received' => true,
            ],
            self::SECTION_LEGAL => [
                'company_name' => 'FRILO',
                'company_address' => '',
                'registration_number' => '',
                'tax_number' => '',
                'terms_url' => '',
                'privacy_url' => '',
            ],
        ];
    }

    public function defaultSecretPayload(): array
    {
        return [
            self::SECTION_PAYMENT => [
                'fedapay' => [
                    'secret_key' => (string) config('services.fedapay.secret_key', ''),
                    'webhook_secret' => (string) config('services.fedapay.webhook_secret', ''),
                ],
            ],
        ];
    }

    private function resolvePaymentConfigurationFromRevision(PlatformSettingRevision $revision): array
    {
        $payload = $this->normalizePayload($revision->payload);
        $secretPayload = $this->normalizeSecretPayload($revision->secret_payload);

        $fallback = $this->defaultPaymentConfiguration();
        $configured = Arr::get($payload, 'payment.fedapay', []);
        $secrets = Arr::get($secretPayload, 'payment.fedapay', []);

        return array_replace($fallback, $configured, $secrets);
    }

    private function defaultPaymentConfiguration(): array
    {
        return [
            'enabled' => (bool) config('services.fedapay.enabled', true),
            'environment' => (string) config('services.fedapay.environment', 'sandbox'),
            'base_url' => (string) config('services.fedapay.base_url', 'https://sandbox-api.fedapay.com/v1'),
            'currency' => (string) config('services.fedapay.currency', 'XOF'),
            'callback_url' => (string) config('services.fedapay.callback_url', ''),
            'webhook_tolerance' => (int) config('services.fedapay.webhook_tolerance', 300),
            'secret_key' => (string) config('services.fedapay.secret_key', ''),
            'webhook_secret' => (string) config('services.fedapay.webhook_secret', ''),
        ];
    }

    private function validatePaymentConfiguration(array $payment): ?string
    {
        $enabled = (bool) Arr::get($payment, 'enabled', true);
        if (! $enabled) {
            return null;
        }

        $baseUrl = trim((string) Arr::get($payment, 'base_url', ''));
        if (! filter_var($baseUrl, FILTER_VALIDATE_URL)) {
            return 'URL de base FedaPay invalide.';
        }

        $secretKey = trim((string) Arr::get($payment, 'secret_key', ''));
        if ($secretKey === '') {
            return 'La clé secrète FedaPay est obligatoire.';
        }

        $currency = trim((string) Arr::get($payment, 'currency', ''));
        if ($currency === '') {
            return 'La devise FedaPay est obligatoire.';
        }

        $callbackUrl = trim((string) Arr::get($payment, 'callback_url', ''));
        if ($callbackUrl !== '' && ! filter_var($callbackUrl, FILTER_VALIDATE_URL)) {
            return 'L’URL de callback paiement est invalide.';
        }

        $tolerance = (int) Arr::get($payment, 'webhook_tolerance', 0);
        if ($tolerance < 0) {
            return 'La tolérance webhook doit être positive.';
        }

        return null;
    }

    private function normalizePayload(?array $payload): array
    {
        return $this->mergeSettingsValue($this->defaultPayload(), is_array($payload) ? $payload : []);
    }

    private function normalizeSecretPayload(?array $secretPayload): array
    {
        return $this->mergeSettingsValue($this->defaultSecretPayload(), is_array($secretPayload) ? $secretPayload : []);
    }

    private function mergeSettingsValue(mixed $base, mixed $override): mixed
    {
        if (! is_array($base) || ! is_array($override)) {
            return $override;
        }

        if (array_is_list($base) || array_is_list($override)) {
            return $override;
        }

        $merged = $base;

        foreach ($override as $key => $value) {
            $merged[$key] = array_key_exists($key, $merged)
                ? $this->mergeSettingsValue($merged[$key], $value)
                : $value;
        }

        return $merged;
    }

    private function flattenArray(array $array, string $prefix = ''): array
    {
        $flattened = [];

        foreach ($array as $key => $value) {
            $path = $prefix === '' ? (string) $key : $prefix.'.'.$key;

            if (is_array($value)) {
                $flattened = array_merge($flattened, $this->flattenArray($value, $path));

                continue;
            }

            $flattened[$path] = $value;
        }

        return $flattened;
    }

    private function resolveSectionFromPath(string $path): string
    {
        $section = explode('.', $path)[0] ?? '';

        return $section !== '' ? $section : 'unknown';
    }

    private function resolveDiffType(bool $fromExists, bool $toExists): string
    {
        if (! $fromExists && $toExists) {
            return 'added';
        }

        if ($fromExists && ! $toExists) {
            return 'removed';
        }

        return 'updated';
    }

    private function resolveSecretChangeType(bool $fromConfigured, bool $toConfigured): string
    {
        if (! $fromConfigured && $toConfigured) {
            return 'configured';
        }

        if ($fromConfigured && ! $toConfigured) {
            return 'removed';
        }

        return 'rotated';
    }

    private function formatDiffValue(mixed $value, bool $exists): string
    {
        if (! $exists) {
            return '∅';
        }

        if ($value === null) {
            return 'null';
        }

        if (is_bool($value)) {
            return $value ? 'true' : 'false';
        }

        if (is_scalar($value)) {
            $stringValue = (string) $value;

            return mb_strlen($stringValue) > 120
                ? mb_substr($stringValue, 0, 120).'...'
                : $stringValue;
        }

        $jsonValue = json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        if (! is_string($jsonValue)) {
            return '[unserializable]';
        }

        return mb_strlen($jsonValue) > 120
            ? mb_substr($jsonValue, 0, 120).'...'
            : $jsonValue;
    }

    private function isSecretConfigured(mixed $value, bool $exists): bool
    {
        if (! $exists || $value === null) {
            return false;
        }

        if (is_string($value)) {
            return trim($value) !== '';
        }

        if (is_array($value)) {
            foreach ($value as $item) {
                if ($this->isSecretConfigured($item, true)) {
                    return true;
                }
            }

            return false;
        }

        if (is_bool($value)) {
            return $value;
        }

        return true;
    }
}
