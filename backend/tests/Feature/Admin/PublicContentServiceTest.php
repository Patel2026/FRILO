<?php

namespace Tests\Feature\Admin;

use App\Models\ContentBlock;
use App\Models\ContentRevision;
use App\Models\PublicPage;
use App\Models\PublicSection;
use App\Models\User;
use App\Services\ContentRevisionService;
use App\Services\PublicContentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use InvalidArgumentException;
use Tests\TestCase;

class PublicContentServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_section_update_snapshots_previous_state_and_forgets_public_cache(): void
    {
        $actor = User::factory()->create(['role' => 'super_admin']);
        $page = $this->homePage();
        $section = PublicSection::factory()->for($page, 'page')->create([
            'key' => 'home.hero',
            'content' => $this->sectionDefaults('home.hero'),
        ]);
        Cache::put('public_content.page.home', ['stale' => true], 600);

        app(PublicContentService::class)->updateSection($section, [
            'content' => [
                ...$section->content,
                'headline' => 'Un titre clair pour FRILO',
            ],
        ], $actor);

        $revision = ContentRevision::query()->whereMorphedTo('revisionable', $section)->firstOrFail();

        $this->assertSame('public_section.updated', $revision->event);
        $this->assertSame($this->sectionDefaults('home.hero')['headline'], $revision->snapshot['attributes']['content']['headline']);
        $this->assertSame('Un titre clair pour FRILO', $section->fresh()->content['headline']);
        $this->assertFalse(Cache::has('public_content.page.home'));
    }

    public function test_block_creation_sanitizes_content_and_rejects_invalid_layout_or_anchor(): void
    {
        $actor = User::factory()->create(['role' => 'super_admin']);
        $page = $this->homePage();
        PublicSection::factory()->for($page, 'page')->create([
            'key' => 'home.hero',
            'content' => $this->sectionDefaults('home.hero'),
        ]);

        $block = app(PublicContentService::class)->createBlock($page, [
            'layout' => ContentBlock::LAYOUT_FULL_WIDTH,
            'anchor_section_key' => 'home.hero',
            'content' => [
                'body' => [
                    'type' => 'doc',
                    'content' => [
                        4 => [
                            'type' => 'paragraph',
                            'content' => [
                                ['type' => 'text', 'text' => 'Texte propre'],
                            ],
                        ],
                    ],
                ],
            ],
            'settings' => ['accent' => 'red', 'empty' => null],
        ], $actor);

        $this->assertSame([0], array_keys($block->content['body']['content']));
        $this->assertSame('Texte propre', $block->content['body']['content'][0]['content'][0]['text']);
        $this->assertSame(['accent' => 'red'], $block->settings);
        $this->assertDatabaseHas('content_revisions', [
            'revisionable_type' => ContentBlock::class,
            'revisionable_id' => $block->id,
            'event' => 'content_block.created',
        ]);

        $this->expectException(InvalidArgumentException::class);
        app(PublicContentService::class)->createBlock($page, [
            'layout' => 'gallery',
            'content' => ['body' => $this->richDoc('Refuse')],
        ], $actor);
    }

    public function test_block_update_accepts_position_and_visibility_without_requiring_content_changes(): void
    {
        $actor = User::factory()->create(['role' => 'super_admin']);
        $page = $this->homePage();
        $block = ContentBlock::factory()->for($page, 'page')->create([
            'position' => 10,
            'is_visible' => true,
            'layout' => ContentBlock::LAYOUT_FULL_WIDTH,
            'content' => ['body' => $this->richDoc('Visible')],
        ]);

        app(PublicContentService::class)->updateBlock($block, [
            'position' => 40,
            'is_visible' => false,
        ], $actor);

        $this->assertSame(40, $block->fresh()->position);
        $this->assertFalse($block->fresh()->is_visible);
        $this->assertDatabaseHas('content_revisions', [
            'revisionable_type' => ContentBlock::class,
            'revisionable_id' => $block->id,
            'event' => 'content_block.updated',
        ]);
    }

    public function test_block_creation_rejects_anchor_from_unknown_or_other_page_section(): void
    {
        $actor = User::factory()->create(['role' => 'super_admin']);
        $page = $this->homePage();

        $this->expectException(InvalidArgumentException::class);

        app(PublicContentService::class)->createBlock($page, [
            'layout' => ContentBlock::LAYOUT_FULL_WIDTH,
            'anchor_section_key' => 'home.unknown',
            'content' => ['body' => $this->richDoc('Refuse')],
        ], $actor);
    }

    public function test_block_reorder_is_transactional_and_rejects_foreign_ids(): void
    {
        $actor = User::factory()->create(['role' => 'super_admin']);
        $page = $this->homePage();
        $otherPage = PublicPage::factory()->create(['key' => 'other', 'route_pattern' => '/other']);
        $first = ContentBlock::factory()->for($page, 'page')->create(['position' => 10]);
        $second = ContentBlock::factory()->for($page, 'page')->create(['position' => 20]);
        $foreign = ContentBlock::factory()->for($otherPage, 'page')->create(['position' => 30]);

        try {
            app(PublicContentService::class)->reorderBlocks($page, [$second->id, $foreign->id, $first->id], $actor);
            $this->fail('Foreign block ids must be rejected.');
        } catch (InvalidArgumentException $exception) {
            $this->assertSame(10, $first->fresh()->position);
            $this->assertSame(20, $second->fresh()->position);
            $this->assertDatabaseCount('content_revisions', 0);
        }
    }

    public function test_restore_snapshots_current_state_before_applying_history(): void
    {
        $actor = User::factory()->create(['role' => 'super_admin']);
        $page = $this->homePage();
        $section = PublicSection::factory()->for($page, 'page')->create([
            'key' => 'home.hero',
            'content' => [
                ...$this->sectionDefaults('home.hero'),
                'headline' => 'Ancien titre',
            ],
        ]);
        $history = $section->revisions()->create([
            'event' => 'public_section.updated',
            'snapshot' => [
                'class' => PublicSection::class,
                'id' => $section->id,
                'attributes' => $section->getAttributes(),
            ],
            'created_by' => $actor->id,
        ]);
        $section->update([
            'content' => [
                ...$section->content,
                'headline' => 'Titre courant',
            ],
        ]);
        Cache::put('public_content.page.home', ['stale' => true], 600);

        app(ContentRevisionService::class)->restore($history, $actor);

        $this->assertSame('Ancien titre', $section->fresh()->content['headline']);
        $this->assertFalse(Cache::has('public_content.page.home'));
        $this->assertDatabaseHas('content_revisions', [
            'revisionable_type' => PublicSection::class,
            'revisionable_id' => $section->id,
            'event' => 'public_section.restored',
        ]);
        $restoreSnapshot = ContentRevision::query()->where('event', 'public_section.restored')->firstOrFail();
        $this->assertSame('Titre courant', $restoreSnapshot->snapshot['attributes']['content']['headline']);
    }

    public function test_public_page_assembly_excludes_hidden_and_unknown_content(): void
    {
        $page = $this->homePage(['seo_title' => 'FRILO accueil']);
        $visibleSection = PublicSection::factory()->for($page, 'page')->create([
            'key' => 'home.hero',
            'position' => 20,
            'is_visible' => true,
            'content' => $this->sectionDefaults('home.hero'),
        ]);
        PublicSection::factory()->for($page, 'page')->create([
            'key' => 'home.benefits',
            'position' => 10,
            'is_visible' => false,
            'content' => $this->sectionDefaults('home.benefits'),
        ]);
        PublicSection::factory()->for($page, 'page')->create([
            'key' => 'home.unknown',
            'position' => 30,
            'is_visible' => true,
            'content' => ['headline' => 'Invisible'],
        ]);
        $visibleBlock = ContentBlock::factory()->for($page, 'page')->create([
            'position' => 10,
            'is_visible' => true,
            'layout' => ContentBlock::LAYOUT_FULL_WIDTH,
            'content' => ['body' => $this->richDoc('Bloc visible')],
        ]);
        ContentBlock::factory()->for($page, 'page')->create([
            'position' => 20,
            'is_visible' => false,
            'layout' => ContentBlock::LAYOUT_FULL_WIDTH,
            'content' => ['body' => $this->richDoc('Bloc masque')],
        ]);
        ContentBlock::factory()->for($page, 'page')->create([
            'position' => 30,
            'is_visible' => true,
            'anchor_section_key' => 'home.unknown',
            'layout' => ContentBlock::LAYOUT_FULL_WIDTH,
            'content' => ['body' => $this->richDoc('Bloc orphelin')],
        ]);

        $assembled = app(PublicContentService::class)->publicPage('home');

        $this->assertSame('home', $assembled['page']['key']);
        $this->assertSame('FRILO accueil', $assembled['page']['seo']['title']);
        $this->assertSame([$visibleSection->key], array_column($assembled['sections'], 'key'));
        $this->assertSame([$visibleBlock->id], array_column($assembled['blocks'], 'id'));
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

    private function sectionDefaults(string $key): array
    {
        return config('public-content.sections')[$key]['defaults'];
    }
}
