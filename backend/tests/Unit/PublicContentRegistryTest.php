<?php

namespace Tests\Unit;

use App\Content\PublicContentRegistry;
use App\Models\PublicPage;
use App\Models\PublicSection;
use Database\Seeders\PublicContentSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use InvalidArgumentException;
use Tests\TestCase;

class PublicContentRegistryTest extends TestCase
{
    use RefreshDatabase;

    public function test_home_hero_exposes_its_registered_page_and_defaults(): void
    {
        $definition = app(PublicContentRegistry::class)->section('home.hero');

        $this->assertSame('home', $definition['page']);
        $this->assertArrayHasKey('headline', $definition['defaults']);
    }

    public function test_it_validates_only_registered_section_fields(): void
    {
        $registry = app(PublicContentRegistry::class);
        $content = $registry->section('home.hero')['defaults'];

        $this->assertSame($content, $registry->validateSectionContent('home.hero', $content));

        $this->expectException(ValidationException::class);

        $registry->validateSectionContent('home.hero', [
            ...$content,
            'unregistered_field' => 'Must be rejected.',
        ]);
    }

    public function test_it_accepts_only_safe_internal_cta_urls(): void
    {
        $registry = app(PublicContentRegistry::class);
        $content = $registry->section('home.hero')['defaults'];

        foreach (['/templates', '/#how-it-works'] as $safeUrl) {
            $content['primary_cta']['url'] = $safeUrl;

            $this->assertSame(
                $safeUrl,
                $registry->validateSectionContent('home.hero', $content)['primary_cta']['url'],
            );
        }

        foreach (['javascript:alert(1)', 'data:text/html,unsafe', '//evil.example'] as $unsafeUrl) {
            $content['primary_cta']['url'] = $unsafeUrl;

            try {
                $registry->validateSectionContent('home.hero', $content);
                $this->fail("Unsafe URL [{$unsafeUrl}] was accepted.");
            } catch (ValidationException) {
                $this->addToAssertionCount(1);
            }
        }
    }

    public function test_home_visual_sections_accept_only_safe_image_urls(): void
    {
        $registry = app(PublicContentRegistry::class);

        foreach (['home.hero', 'home.benefits'] as $sectionKey) {
            $content = $registry->section($sectionKey)['defaults'];
            $content['image'] = [
                'url' => '/image/client-satisfait-frilo.jpg',
                'alt' => 'Client FRILO consultant son site.',
            ];

            $validated = $registry->validateSectionContent($sectionKey, $content);

            $this->assertSame('/image/client-satisfait-frilo.jpg', $validated['image']['url']);
            $this->assertSame('Client FRILO consultant son site.', $validated['image']['alt']);

            foreach (['javascript:alert(1)', 'data:text/html,unsafe', '//evil.example'] as $unsafeUrl) {
                $content['image']['url'] = $unsafeUrl;

                try {
                    $registry->validateSectionContent($sectionKey, $content);
                    $this->fail("Unsafe image URL [{$unsafeUrl}] was accepted for [{$sectionKey}].");
                } catch (ValidationException) {
                    $this->addToAssertionCount(1);
                }
            }
        }
    }

    public function test_it_rejects_an_unknown_section_key(): void
    {
        $this->expectException(InvalidArgumentException::class);

        app(PublicContentRegistry::class)->section('unknown.section');
    }

    public function test_it_returns_registered_sections_for_a_page_in_position_order(): void
    {
        $sections = app(PublicContentRegistry::class)->sectionsForPage('home');

        $this->assertSame([
            'home.hero',
            'home.models_intro',
            'home.benefits',
            'home.process',
            'home.pricing',
            'home.testimonials_intro',
            'home.sectors_intro',
            'home.faq_intro',
            'home.closing_cta',
        ], array_keys($sections));
    }

    public function test_all_registered_defaults_reference_a_page_and_pass_validation(): void
    {
        $registry = app(PublicContentRegistry::class);
        $pages = $registry->pages();

        foreach ($pages as $pageKey => $definition) {
            $this->assertArrayHasKey('route_pattern', $definition);
            $this->assertArrayHasKey('name', $definition);
            $this->assertSame($definition, $registry->page($pageKey));
        }

        foreach (config('public-content.sections') as $sectionKey => $definition) {
            $this->assertArrayHasKey($definition['page'], $pages);
            $this->assertSame(
                $definition['defaults'],
                $registry->validateSectionContent($sectionKey, $definition['defaults']),
            );
        }

        $registry->assertValidConfiguration();
    }

    public function test_seeding_is_idempotent_and_preserves_admin_editorial_changes(): void
    {
        $this->seed(PublicContentSeeder::class);

        $page = PublicPage::query()->where('key', 'home')->firstOrFail();
        $hero = PublicSection::query()->where('key', 'home.hero')->firstOrFail();

        $page->update([
            'route_pattern' => '/outdated-home-route',
            'name' => 'Outdated page name',
            'seo_title' => 'Titre SEO admin',
            'seo_description' => 'Description SEO admin',
            'is_indexable' => false,
        ]);
        $hero->update([
            'name' => 'Outdated section name',
            'position' => 999,
            'is_visible' => false,
            'content' => [
                ...$hero->content,
                'headline' => 'Titre modifie par un administrateur',
            ],
        ]);

        $this->seed(PublicContentSeeder::class);

        $this->assertDatabaseCount('public_pages', 1);
        $this->assertDatabaseCount('public_sections', 9);
        $this->assertDatabaseHas('public_pages', [
            'key' => 'home',
            'route_pattern' => '/',
            'name' => 'Accueil',
            'seo_title' => 'Titre SEO admin',
            'seo_description' => 'Description SEO admin',
            'is_indexable' => false,
        ]);
        $this->assertDatabaseHas('public_sections', [
            'key' => 'home.hero',
            'name' => 'Hero',
            'position' => 10,
            'is_visible' => false,
        ]);
        $this->assertSame(
            'Titre modifie par un administrateur',
            PublicSection::query()->where('key', 'home.hero')->firstOrFail()->content['headline'],
        );
    }

    public function test_seeding_reconciles_content_schema_and_hides_removed_sections(): void
    {
        $this->seed(PublicContentSeeder::class);

        $page = PublicPage::query()->where('key', 'home')->firstOrFail();
        $benefits = PublicSection::query()->where('key', 'home.benefits')->firstOrFail();
        $adminItems = [
            [
                'title' => 'Avantage administrateur',
                'description' => 'Description administrateur.',
            ],
        ];

        $benefits->update([
            'content' => [
                ...$benefits->content,
                'headline' => 'Titre administrateur',
                'items' => $adminItems,
                'old_field' => 'Retired top-level field',
                'cta' => [
                    ...$benefits->content['cta'],
                    'label' => 'CTA administrateur',
                    'old_nested_field' => 'Retired nested field',
                ],
            ],
        ]);

        $removedSection = PublicSection::query()->create([
            'public_page_id' => $page->id,
            'key' => 'home.removed_section',
            'name' => 'Removed section',
            'position' => 999,
            'is_visible' => true,
            'content' => ['headline' => 'Legacy'],
        ]);

        $definition = config('public-content.sections')['home.benefits'];
        unset($definition['defaults']['closing_copy'], $definition['rules']['closing_copy']);
        $definition['defaults']['new_copy'] = 'Nouveau texte par défaut';
        $definition['defaults']['cta']['tracking_label'] = 'cta-default';
        $definition['defaults']['items'] = array_map(
            static fn (array $item): array => [...$item, 'badge' => 'Badge par défaut'],
            $definition['defaults']['items'],
        );
        $definition['rules']['new_copy'] = ['required', 'string', 'max:200'];
        $definition['rules']['cta'] = ['required', 'array:label,url,tracking_label'];
        $definition['rules']['cta.tracking_label'] = ['required', 'string', 'max:80'];
        $definition['rules']['items.*'] = ['required', 'array:title,description,badge'];
        $definition['rules']['items.*.badge'] = ['required', 'string', 'max:80'];
        config(['public-content.sections' => [
            ...config('public-content.sections'),
            'home.benefits' => $definition,
        ]]);

        $this->seed(PublicContentSeeder::class);

        $content = $benefits->fresh()->content;

        $this->assertSame('Titre administrateur', $content['headline']);
        $this->assertSame('CTA administrateur', $content['cta']['label']);
        $this->assertSame('cta-default', $content['cta']['tracking_label']);
        $this->assertSame('Nouveau texte par défaut', $content['new_copy']);
        $this->assertSame([
            [
                ...$adminItems[0],
                'badge' => 'Badge par défaut',
            ],
        ], $content['items']);
        $this->assertArrayNotHasKey('closing_copy', $content);
        $this->assertArrayNotHasKey('old_field', $content);
        $this->assertArrayNotHasKey('old_nested_field', $content['cta']);
        $this->assertFalse($removedSection->fresh()->is_visible);
    }

    public function test_seeding_rolls_back_all_reconciliation_when_existing_content_is_invalid(): void
    {
        $this->seed(PublicContentSeeder::class);

        $page = PublicPage::query()->where('key', 'home')->firstOrFail();
        $hero = PublicSection::query()->where('key', 'home.hero')->firstOrFail();

        $page->update(['route_pattern' => '/admin-route']);
        $hero->update([
            'content' => [
                ...$hero->content,
                'primary_cta' => [
                    ...$hero->content['primary_cta'],
                    'url' => 'javascript:alert(1)',
                ],
            ],
        ]);

        try {
            $this->seed(PublicContentSeeder::class);
            $this->fail('Invalid existing content was accepted.');
        } catch (ValidationException) {
            $this->assertSame('/admin-route', $page->fresh()->route_pattern);
        }
    }

    public function test_seeding_deindexes_removed_pages_and_hides_their_sections_without_losing_editorial_data(): void
    {
        $removedPage = PublicPage::query()->create([
            'key' => 'removed-page',
            'route_pattern' => '/removed',
            'name' => 'Removed page',
            'seo_title' => 'SEO title preserved',
            'seo_description' => 'SEO description preserved',
            'is_indexable' => true,
        ]);
        $removedSection = PublicSection::query()->create([
            'public_page_id' => $removedPage->id,
            'key' => 'removed-page.hero',
            'name' => 'Removed hero',
            'position' => 10,
            'is_visible' => true,
            'content' => ['headline' => 'Editorial content preserved'],
        ]);

        $this->seed(PublicContentSeeder::class);

        $this->assertFalse($removedPage->fresh()->is_indexable);
        $this->assertSame('SEO title preserved', $removedPage->fresh()->seo_title);
        $this->assertSame('SEO description preserved', $removedPage->fresh()->seo_description);
        $this->assertFalse($removedSection->fresh()->is_visible);
        $this->assertSame('Editorial content preserved', $removedSection->fresh()->content['headline']);
    }

    public function test_seeding_moves_registered_sections_between_pages_without_changing_admin_visibility(): void
    {
        $heroDefinition = config('public-content.sections')['home.hero'];
        $visibleDefinition = [
            ...$heroDefinition,
            'page' => 'page-a',
            'name' => 'Visible moved section',
            'position' => 10,
        ];
        $hiddenDefinition = [
            ...$heroDefinition,
            'page' => 'page-a',
            'name' => 'Hidden moved section',
            'position' => 20,
        ];

        config([
            'public-content.pages' => [
                'page-a' => ['route_pattern' => '/a', 'name' => 'Page A'],
                'page-b' => ['route_pattern' => '/b', 'name' => 'Page B'],
            ],
            'public-content.sections' => [
                'shared.visible' => $visibleDefinition,
                'shared.hidden' => $hiddenDefinition,
            ],
        ]);

        $this->seed(PublicContentSeeder::class);

        $visibleSection = PublicSection::query()->where('key', 'shared.visible')->firstOrFail();
        $hiddenSection = PublicSection::query()->where('key', 'shared.hidden')->firstOrFail();
        $hiddenSection->update(['is_visible' => false]);

        config(['public-content.sections' => [
            'shared.visible' => [...$visibleDefinition, 'page' => 'page-b'],
            'shared.hidden' => [...$hiddenDefinition, 'page' => 'page-b'],
        ]]);

        $this->seed(PublicContentSeeder::class);

        $pageB = PublicPage::query()->where('key', 'page-b')->firstOrFail();

        $this->assertSame($pageB->id, $visibleSection->fresh()->public_page_id);
        $this->assertTrue($visibleSection->fresh()->is_visible);
        $this->assertSame($pageB->id, $hiddenSection->fresh()->public_page_id);
        $this->assertFalse($hiddenSection->fresh()->is_visible);
    }
}
