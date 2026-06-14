<?php

namespace Tests\Feature\Api;

use App\Models\ContentBlock;
use App\Models\PublicPage;
use App\Models\PublicSection;
use App\Models\User;
use App\Services\PublicContentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicContentApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_home_content_endpoint_returns_visible_sanitized_public_content(): void
    {
        $page = $this->homePage([
            'seo_title' => 'FRILO - sites prêts pour les pros',
            'seo_description' => 'Un site clair pour présenter votre activité.',
            'is_indexable' => true,
        ]);
        $hero = PublicSection::factory()->for($page, 'page')->create([
            'key' => 'home.hero',
            'name' => 'Hero',
            'position' => 10,
            'is_visible' => true,
            'content' => $this->sectionDefaults('home.hero'),
        ]);
        PublicSection::factory()->for($page, 'page')->create([
            'key' => 'home.benefits',
            'name' => 'Avantages',
            'position' => 20,
            'is_visible' => false,
            'content' => $this->sectionDefaults('home.benefits'),
        ]);
        $visibleBlock = app(PublicContentService::class)->createBlock($page, [
            'anchor_section_key' => 'home.hero',
            'position' => 10,
            'layout' => ContentBlock::LAYOUT_FULL_WIDTH,
            'is_visible' => true,
            'content' => [
                'body' => [
                    'type' => 'doc',
                    'content' => [
                        3 => [
                            'type' => 'paragraph',
                            'content' => [
                                [
                                    'type' => 'text',
                                    'text' => 'Votre activité devient plus facile à présenter.',
                                ],
                            ],
                        ],
                    ],
                ],
            ],
            'settings' => ['tone' => 'simple'],
        ], User::factory()->create(['role' => 'super_admin']));
        ContentBlock::factory()->for($page, 'page')->create([
            'anchor_section_key' => 'home.hero',
            'position' => 20,
            'layout' => ContentBlock::LAYOUT_FULL_WIDTH,
            'is_visible' => false,
            'content' => ['body' => $this->richDoc('Bloc cache')],
        ]);

        $response = $this->getJson('/api/public/content/home');

        $response->assertOk()
            ->assertJsonPath('page.key', 'home')
            ->assertJsonPath('page.seo.title', 'FRILO - sites prêts pour les pros')
            ->assertJsonPath('page.seo.description', 'Un site clair pour présenter votre activité.')
            ->assertJsonPath('page.seo.is_indexable', true)
            ->assertJsonPath('sections.0.key', $hero->key)
            ->assertJsonPath('sections.0.renderer', 'home.hero')
            ->assertJsonPath('blocks.0.id', $visibleBlock->id)
            ->assertJsonPath('blocks.0.content.body.content.0.content.0.text', 'Votre activité devient plus facile à présenter.');

        $this->assertSame(['home.hero'], array_column($response->json('sections'), 'key'));
        $this->assertSame([$visibleBlock->id], array_column($response->json('blocks'), 'id'));
        $this->assertSame([0], array_keys($response->json('blocks.0.content.body.content')));
    }

    public function test_hidden_sections_and_blocks_are_absent(): void
    {
        $page = $this->homePage();
        PublicSection::factory()->for($page, 'page')->create([
            'key' => 'home.hero',
            'position' => 10,
            'is_visible' => true,
            'content' => $this->sectionDefaults('home.hero'),
        ]);
        PublicSection::factory()->for($page, 'page')->create([
            'key' => 'home.process',
            'position' => 20,
            'is_visible' => false,
            'content' => $this->sectionDefaults('home.process'),
        ]);
        ContentBlock::factory()->for($page, 'page')->create([
            'position' => 10,
            'layout' => ContentBlock::LAYOUT_FULL_WIDTH,
            'is_visible' => true,
            'content' => ['body' => $this->richDoc('Visible')],
        ]);
        ContentBlock::factory()->for($page, 'page')->create([
            'position' => 20,
            'layout' => ContentBlock::LAYOUT_FULL_WIDTH,
            'is_visible' => false,
            'content' => ['body' => $this->richDoc('Cache')],
        ]);

        $response = $this->getJson('/api/public/content/home');

        $response->assertOk();
        $this->assertSame(['home.hero'], array_column($response->json('sections'), 'key'));
        $this->assertCount(1, $response->json('blocks'));
        $this->assertSame('Visible', $response->json('blocks.0.content.body.content.0.content.0.text'));
    }

    public function test_unknown_page_key_returns_json_404(): void
    {
        $this->getJson('/api/public/content/page-inconnue')
            ->assertNotFound()
            ->assertJsonPath('message', 'Contenu public introuvable.');
    }

    public function test_block_with_unknown_anchor_section_is_not_exposed(): void
    {
        $page = $this->homePage();
        PublicSection::factory()->for($page, 'page')->create([
            'key' => 'home.hero',
            'position' => 10,
            'is_visible' => true,
            'content' => $this->sectionDefaults('home.hero'),
        ]);
        $visibleBlock = ContentBlock::factory()->for($page, 'page')->create([
            'anchor_section_key' => 'home.hero',
            'position' => 10,
            'layout' => ContentBlock::LAYOUT_FULL_WIDTH,
            'is_visible' => true,
            'content' => ['body' => $this->richDoc('Ancre valide')],
        ]);
        ContentBlock::factory()->for($page, 'page')->create([
            'anchor_section_key' => 'home.section-inconnue',
            'position' => 20,
            'layout' => ContentBlock::LAYOUT_FULL_WIDTH,
            'is_visible' => true,
            'content' => ['body' => $this->richDoc('Ancre inconnue')],
        ]);

        $response = $this->getJson('/api/public/content/home');

        $response->assertOk();
        $this->assertSame([$visibleBlock->id], array_column($response->json('blocks'), 'id'));
    }

    private function homePage(array $overrides = []): PublicPage
    {
        return PublicPage::factory()->create([
            'key' => 'home',
            'route_pattern' => '/',
            'name' => 'Accueil',
            ...$overrides,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function richDoc(string $text): array
    {
        return [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'paragraph',
                    'content' => [
                        ['type' => 'text', 'text' => $text],
                    ],
                ],
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function sectionDefaults(string $key): array
    {
        return config('public-content.sections')[$key]['defaults'];
    }
}
