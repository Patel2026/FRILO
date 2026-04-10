<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\PublishPlatformSettingsRequest;
use App\Http\Requests\Admin\UpdateSettingsSectionRequest;
use App\Models\PlatformSettingRevision;
use App\Services\PlatformSettingsService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;
use RuntimeException;

class SettingsController extends Controller
{
    public function __construct(private readonly PlatformSettingsService $platformSettingsService) {}

    public function index(Request $request): View
    {
        $draft = $this->platformSettingsService->getOrCreateDraft($request->user());

        return view('admin.settings.index', [
            'draft' => $draft,
            'payload' => $draft->payload,
            'secretState' => $this->platformSettingsService->getMaskedSecretState($draft),
            'published' => $this->platformSettingsService->getPublishedRevision(),
            'sections' => PlatformSettingsService::SECTIONS,
        ]);
    }

    public function updateSection(UpdateSettingsSectionRequest $request, string $section): RedirectResponse
    {
        $draft = $this->platformSettingsService->getOrCreateDraft($request->user());
        $validated = $request->validated();

        [$sectionPayload, $secretPayload] = $this->mapSectionPayload($section, $validated);

        $this->platformSettingsService->updateSection(
            $draft,
            $section,
            $sectionPayload,
            $secretPayload,
            $request->user()
        );

        return redirect()
            ->route('admin.settings.index')
            ->with('success', 'Paramètres mis à jour pour la section '.$section.'.');
    }

    public function testPayment(Request $request): RedirectResponse
    {
        $draft = $this->platformSettingsService->getOrCreateDraft($request->user());
        $result = $this->platformSettingsService->testPaymentConfiguration($draft, $request->user());

        if (! $result['ok']) {
            return redirect()
                ->route('admin.settings.index')
                ->withErrors(['payment_test' => $result['message'] ?? 'Échec du test FedaPay.']);
        }

        return redirect()
            ->route('admin.settings.index')
            ->with('success', $result['message'] ?? 'Test de paiement réussi.');
    }

    public function publish(PublishPlatformSettingsRequest $request): RedirectResponse
    {
        $draft = $this->platformSettingsService->getOrCreateDraft($request->user());

        try {
            $this->platformSettingsService->publishDraft(
                $draft,
                $request->user(),
                $request->validated('change_note')
            );
        } catch (RuntimeException $exception) {
            return redirect()
                ->route('admin.settings.index')
                ->withErrors(['publish' => $exception->getMessage()]);
        }

        return redirect()
            ->route('admin.settings.index')
            ->with('success', 'Nouvelle version de paramètres publiée avec succès.');
    }

    public function history(): View
    {
        return view('admin.settings.history', [
            'revisions' => $this->platformSettingsService->getHistory(),
            'published' => $this->platformSettingsService->getPublishedRevision(),
        ]);
    }

    public function compare(Request $request): View
    {
        $validated = $request->validate([
            'from' => ['required', 'integer', 'different:to', 'exists:platform_setting_revisions,id'],
            'to' => ['required', 'integer', 'different:from', 'exists:platform_setting_revisions,id'],
        ]);

        $fromRevision = PlatformSettingRevision::query()
            ->with(['creator', 'tester', 'publisher'])
            ->findOrFail((int) $validated['from']);
        $toRevision = PlatformSettingRevision::query()
            ->with(['creator', 'tester', 'publisher'])
            ->findOrFail((int) $validated['to']);

        return view('admin.settings.compare', [
            'fromRevision' => $fromRevision,
            'toRevision' => $toRevision,
            'comparison' => $this->platformSettingsService->compareRevisions($fromRevision, $toRevision),
        ]);
    }

    public function restoreDraft(Request $request, PlatformSettingRevision $revision): RedirectResponse
    {
        $this->platformSettingsService->restoreRevisionToDraft($revision, $request->user());

        return redirect()
            ->route('admin.settings.index')
            ->with('success', 'Brouillon restauré depuis la révision #'.$revision->id.'.');
    }

    private function mapSectionPayload(string $section, array $validated): array
    {
        return match ($section) {
            PlatformSettingsService::SECTION_GENERAL => [$validated, []],
            PlatformSettingsService::SECTION_BRANDING => [$validated, []],
            PlatformSettingsService::SECTION_PRICING => $this->mapPricingSectionPayload($validated),
            PlatformSettingsService::SECTION_SLA => [$validated, []],
            PlatformSettingsService::SECTION_NOTIFICATIONS => [$validated, []],
            PlatformSettingsService::SECTION_LEGAL => [$validated, []],
            PlatformSettingsService::SECTION_PAYMENT => $this->mapPaymentSectionPayload($validated),
            default => throw new RuntimeException('Section de paramètres inconnue.'),
        };
    }

    private function mapPaymentSectionPayload(array $validated): array
    {
        $payload = [
            'fedapay' => [
                'enabled' => (bool) $validated['enabled'],
                'environment' => (string) $validated['environment'],
                'base_url' => (string) $validated['base_url'],
                'currency' => strtoupper((string) $validated['currency']),
                'callback_url' => (string) ($validated['callback_url'] ?? ''),
                'webhook_tolerance' => (int) $validated['webhook_tolerance'],
            ],
        ];

        $secretPayload = ['fedapay' => []];
        if (isset($validated['secret_key']) && trim((string) $validated['secret_key']) !== '') {
            $secretPayload['fedapay']['secret_key'] = trim((string) $validated['secret_key']);
        }
        if (isset($validated['webhook_secret']) && trim((string) $validated['webhook_secret']) !== '') {
            $secretPayload['fedapay']['webhook_secret'] = trim((string) $validated['webhook_secret']);
        }

        if ($secretPayload['fedapay'] === []) {
            $secretPayload = [];
        }

        return [$payload, $secretPayload];
    }

    private function mapPricingSectionPayload(array $validated): array
    {
        return [[
            'currency_label' => strtoupper(trim((string) $validated['currency_label'])),
            'section_title' => trim((string) $validated['section_title']),
            'section_description' => trim((string) $validated['section_description']),
            'custom_note' => trim((string) ($validated['custom_note'] ?? '')),
            'standard' => [
                'name' => trim((string) $validated['standard_name']),
                'price' => (int) $validated['standard_price'],
                'billing_label' => trim((string) $validated['standard_billing_label']),
                'cta_label' => trim((string) $validated['standard_cta_label']),
                'features' => $this->parseMultilineList($validated['standard_features_raw'] ?? ''),
            ],
            'premium' => [
                'badge_label' => trim((string) ($validated['premium_badge_label'] ?? '')),
                'name' => trim((string) $validated['premium_name']),
                'price' => (int) $validated['premium_price'],
                'billing_label' => trim((string) $validated['premium_billing_label']),
                'cta_label' => trim((string) $validated['premium_cta_label']),
                'features' => $this->parseMultilineList($validated['premium_features_raw'] ?? ''),
            ],
        ], []];
    }

    private function parseMultilineList(string $raw): array
    {
        $lines = preg_split('/\r\n|\r|\n/', $raw) ?: [];

        return array_values(array_filter(array_map(
            static fn (string $line): string => trim($line),
            $lines
        )));
    }
}
