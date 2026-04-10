<?php

namespace Tests\Feature\Admin;

use App\Models\PlatformSettingRevision;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class PlatformSettingsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware(\App\Http\Middleware\VerifyCsrfToken::class);
    }

    public function test_client_cannot_access_admin_settings(): void
    {
        $client = User::factory()->create(['role' => 'client']);

        $this->actingAs($client)
            ->get('/admin/settings')
            ->assertForbidden();
    }

    public function test_super_admin_can_update_general_and_store_encrypted_secret_payload(): void
    {
        $superAdmin = User::factory()->create(['role' => 'super_admin']);

        $this->actingAs($superAdmin)->get('/admin/settings')->assertOk();

        $this->actingAs($superAdmin)
            ->patch('/admin/settings/general', [
                'platform_name' => 'FRILO Suite',
                'tagline' => 'Pilotage unifié',
                'support_email' => 'support@frilo.com',
                'support_phone' => '+22990000000',
                'timezone' => 'Africa/Porto-Novo',
                'default_currency' => 'XOF',
            ])->assertRedirect('/admin/settings');

        $this->actingAs($superAdmin)
            ->patch('/admin/settings/payment', [
                'enabled' => 1,
                'environment' => 'sandbox',
                'base_url' => 'https://sandbox-api.fedapay.com/v1',
                'currency' => 'XOF',
                'callback_url' => 'http://localhost:3000/commande/paiement/retour',
                'webhook_tolerance' => 300,
                'secret_key' => 'sk_live_super_secret_key',
                'webhook_secret' => 'whsec_super_secret',
            ])->assertRedirect('/admin/settings');

        $draft = PlatformSettingRevision::query()
            ->where('status', PlatformSettingRevision::STATUS_DRAFT)
            ->latest('id')
            ->first();

        $this->assertNotNull($draft);
        $this->assertSame('FRILO Suite', data_get($draft->payload, 'general.platform_name'));

        $rawSecretPayload = (string) DB::table('platform_setting_revisions')
            ->where('id', $draft->id)
            ->value('secret_payload');
        $this->assertStringNotContainsString('sk_live_super_secret_key', $rawSecretPayload);
        $this->assertStringNotContainsString('whsec_super_secret', $rawSecretPayload);
    }

    public function test_super_admin_can_update_pricing_section(): void
    {
        $superAdmin = User::factory()->create(['role' => 'super_admin']);

        $this->actingAs($superAdmin)->get('/admin/settings')->assertOk();

        $this->actingAs($superAdmin)
            ->patch('/admin/settings/pricing', [
                'currency_label' => 'FCFA',
                'section_title' => 'Des tarifs ajustés à votre ambition.',
                'section_description' => 'Choisissez le niveau d’accompagnement adapté à votre activité.',
                'custom_note' => 'Besoin d’un devis sur mesure ?',
                'standard_name' => 'Essentiel',
                'standard_price' => 60000,
                'standard_billing_label' => 'Paiement unique',
                'standard_cta_label' => 'Choisir Essentiel',
                'standard_features_raw' => "Site vitrine\nResponsive\nSupport 30 jours",
                'premium_badge_label' => 'Recommandé',
                'premium_name' => 'Business',
                'premium_price' => 90000,
                'premium_billing_label' => 'Paiement unique',
                'premium_cta_label' => 'Choisir Business',
                'premium_features_raw' => "Tout dans Essentiel\n2 revisions\nSEO initial",
            ])
            ->assertRedirect('/admin/settings');

        $draft = PlatformSettingRevision::query()
            ->where('status', PlatformSettingRevision::STATUS_DRAFT)
            ->latest('id')
            ->first();

        $this->assertNotNull($draft);
        $this->assertSame('Des tarifs ajustés à votre ambition.', data_get($draft->payload, 'pricing.section_title'));
        $this->assertSame(60000, data_get($draft->payload, 'pricing.standard.price'));
        $this->assertSame('Business', data_get($draft->payload, 'pricing.premium.name'));
        $this->assertSame(
            ['Site vitrine', 'Responsive', 'Support 30 jours'],
            data_get($draft->payload, 'pricing.standard.features')
        );
    }

    public function test_publish_creates_single_published_revision_and_fresh_draft(): void
    {
        $superAdmin = User::factory()->create(['role' => 'super_admin']);

        $this->actingAs($superAdmin)->get('/admin/settings')->assertOk();

        $this->actingAs($superAdmin)
            ->patch('/admin/settings/payment', [
                'enabled' => 1,
                'environment' => 'sandbox',
                'base_url' => 'https://sandbox-api.fedapay.com/v1',
                'currency' => 'XOF',
                'callback_url' => 'http://localhost:3000/commande/paiement/retour',
                'webhook_tolerance' => 300,
                'secret_key' => 'sk_publish_secret_key',
                'webhook_secret' => 'whsec_publish_secret',
            ])->assertRedirect('/admin/settings');

        $draftBeforePublish = PlatformSettingRevision::query()
            ->where('status', PlatformSettingRevision::STATUS_DRAFT)
            ->latest('id')
            ->first();

        $this->actingAs($superAdmin)
            ->post('/admin/settings/publish', [
                'change_note' => 'Publication initiale des paramètres V1.',
            ])->assertRedirect('/admin/settings');

        $published = PlatformSettingRevision::query()
            ->where('status', PlatformSettingRevision::STATUS_PUBLISHED)
            ->latest('id')
            ->first();
        $newDraft = PlatformSettingRevision::query()
            ->where('status', PlatformSettingRevision::STATUS_DRAFT)
            ->latest('id')
            ->first();

        $this->assertNotNull($published);
        $this->assertNotNull($newDraft);
        $this->assertNotSame($draftBeforePublish?->id, $newDraft->id);
        $this->assertEquals(1, PlatformSettingRevision::query()->where('status', PlatformSettingRevision::STATUS_PUBLISHED)->count());
        $this->assertEquals(1, PlatformSettingRevision::query()->where('status', PlatformSettingRevision::STATUS_DRAFT)->count());
    }

    public function test_restore_revision_creates_new_draft_from_history(): void
    {
        $superAdmin = User::factory()->create(['role' => 'super_admin']);

        $this->actingAs($superAdmin)->get('/admin/settings')->assertOk();
        $this->actingAs($superAdmin)
            ->patch('/admin/settings/general', [
                'platform_name' => 'FRILO Published',
                'tagline' => 'Version publiée',
                'support_email' => 'support@frilo.com',
                'support_phone' => '+22990000000',
                'timezone' => 'Africa/Porto-Novo',
                'default_currency' => 'XOF',
            ]);
        $this->actingAs($superAdmin)
            ->patch('/admin/settings/payment', [
                'enabled' => 1,
                'environment' => 'sandbox',
                'base_url' => 'https://sandbox-api.fedapay.com/v1',
                'currency' => 'XOF',
                'callback_url' => 'http://localhost:3000/commande/paiement/retour',
                'webhook_tolerance' => 300,
                'secret_key' => 'sk_restore_secret_key',
                'webhook_secret' => 'whsec_restore_secret',
            ]);
        $this->actingAs($superAdmin)->post('/admin/settings/publish');

        $published = PlatformSettingRevision::query()
            ->where('status', PlatformSettingRevision::STATUS_PUBLISHED)
            ->latest('id')
            ->first();
        $this->assertNotNull($published);

        $this->actingAs($superAdmin)
            ->patch('/admin/settings/general', [
                'platform_name' => 'FRILO Draft Changed',
                'tagline' => 'Brouillon modifié',
                'support_email' => 'support@frilo.com',
                'support_phone' => '+22991111111',
                'timezone' => 'Africa/Porto-Novo',
                'default_currency' => 'XOF',
            ])->assertRedirect('/admin/settings');

        $this->actingAs($superAdmin)
            ->post('/admin/settings/history/'.$published->id.'/restore-draft')
            ->assertRedirect('/admin/settings');

        $draft = PlatformSettingRevision::query()
            ->where('status', PlatformSettingRevision::STATUS_DRAFT)
            ->latest('id')
            ->first();

        $this->assertNotNull($draft);
        $this->assertSame('FRILO Published', data_get($draft->payload, 'general.platform_name'));
    }

    public function test_payment_test_endpoint_reports_success_when_connection_works(): void
    {
        Http::fake([
            'https://sandbox-api.fedapay.com/v1/transactions*' => Http::response(['data' => []], 200),
        ]);

        $superAdmin = User::factory()->create(['role' => 'super_admin']);
        $this->actingAs($superAdmin)->get('/admin/settings');

        $this->actingAs($superAdmin)
            ->patch('/admin/settings/payment', [
                'enabled' => 1,
                'environment' => 'sandbox',
                'base_url' => 'https://sandbox-api.fedapay.com/v1',
                'currency' => 'XOF',
                'callback_url' => 'http://localhost:3000/commande/paiement/retour',
                'webhook_tolerance' => 300,
                'secret_key' => 'sk_test_endpoint_secret',
                'webhook_secret' => 'whsec_test_endpoint_secret',
            ]);

        $this->actingAs($superAdmin)
            ->post('/admin/settings/payment/test')
            ->assertRedirect('/admin/settings');

        $this->assertDatabaseHas('platform_setting_revisions', [
            'status' => PlatformSettingRevision::STATUS_DRAFT,
            'tested_by' => $superAdmin->id,
        ]);
    }

    public function test_super_admin_can_compare_two_revisions_from_history(): void
    {
        $superAdmin = User::factory()->create(['role' => 'super_admin']);

        $fromRevision = PlatformSettingRevision::create([
            'status' => PlatformSettingRevision::STATUS_ARCHIVED,
            'payload' => [
                'general' => ['platform_name' => 'FRILO A'],
                'payment' => ['fedapay' => ['enabled' => true]],
            ],
            'secret_payload' => [
                'payment' => ['fedapay' => ['secret_key' => 'sk_from_secret']],
            ],
            'created_by' => $superAdmin->id,
            'change_note' => 'Baseline',
        ]);

        $toRevision = PlatformSettingRevision::create([
            'status' => PlatformSettingRevision::STATUS_PUBLISHED,
            'payload' => [
                'general' => ['platform_name' => 'FRILO B'],
                'payment' => ['fedapay' => ['enabled' => false]],
            ],
            'secret_payload' => [
                'payment' => ['fedapay' => ['secret_key' => 'sk_to_secret']],
            ],
            'created_by' => $superAdmin->id,
            'published_by' => $superAdmin->id,
            'published_at' => now(),
            'change_note' => 'Nouvelle version',
        ]);

        $response = $this->actingAs($superAdmin)
            ->get('/admin/settings/history/compare?from='.$fromRevision->id.'&to='.$toRevision->id);

        $response->assertOk();
        $response->assertSee('Comparaison révisions paramètres');
        $response->assertSee('general.platform_name');
        $response->assertSee('payment.fedapay.enabled');
        $response->assertViewHas('comparison', function (array $comparison): bool {
            return isset($comparison['summary']['changed_sections'])
                && in_array('general', $comparison['summary']['changed_sections'], true)
                && $comparison['summary']['payload_change_count'] >= 1;
        });
    }

    public function test_compare_requires_different_revisions(): void
    {
        $superAdmin = User::factory()->create(['role' => 'super_admin']);

        $revision = PlatformSettingRevision::create([
            'status' => PlatformSettingRevision::STATUS_DRAFT,
            'payload' => [
                'general' => ['platform_name' => 'FRILO Unique'],
            ],
            'secret_payload' => [],
            'created_by' => $superAdmin->id,
        ]);

        $this->actingAs($superAdmin)
            ->from('/admin/settings/history')
            ->get('/admin/settings/history/compare?from='.$revision->id.'&to='.$revision->id)
            ->assertRedirect('/admin/settings/history')
            ->assertSessionHasErrors(['from', 'to']);
    }
}
