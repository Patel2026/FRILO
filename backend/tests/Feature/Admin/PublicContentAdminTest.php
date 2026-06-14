<?php

namespace Tests\Feature\Admin;

use App\Models\ContentBlock;
use App\Models\ContentRevision;
use App\Models\PublicPage;
use App\Models\PublicSection;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicContentAdminTest extends TestCase
{
    use RefreshDatabase;

    public function test_editorial_content_persists_ordered_relations_json_and_revision_actors(): void
    {
        $actor = User::factory()->create(['role' => 'super_admin']);
        $page = PublicPage::factory()->create([
            'is_indexable' => false,
        ]);

        $laterSection = PublicSection::factory()->for($page, 'page')->create([
            'position' => 20,
            'content' => ['title' => 'Plus tard'],
        ]);
        $firstSection = PublicSection::factory()->for($page, 'page')->create([
            'position' => 10,
            'content' => ['title' => 'Premiere'],
        ]);
        $secondSection = PublicSection::factory()->for($page, 'page')->create([
            'position' => 10,
            'content' => ['title' => 'Deuxieme'],
        ]);

        $laterBlock = ContentBlock::factory()->for($page, 'page')->create([
            'position' => 30,
            'content' => ['heading' => 'Bloc plus tard'],
            'settings' => ['theme' => 'dark'],
        ]);
        $firstBlock = ContentBlock::factory()->for($page, 'page')->create([
            'position' => 5,
            'content' => ['heading' => 'Premier bloc'],
            'settings' => ['theme' => 'light'],
        ]);
        $secondBlock = ContentBlock::factory()->for($page, 'page')->create([
            'position' => 5,
            'content' => ['heading' => 'Deuxieme bloc'],
            'settings' => null,
        ]);

        $pageRevision = $page->revisions()->create([
            'event' => 'created',
            'snapshot' => ['name' => $page->name],
            'created_by' => $actor->id,
        ]);
        $sectionRevision = $firstSection->revisions()->create([
            'event' => 'updated',
            'snapshot' => ['content' => $firstSection->content],
            'created_by' => $actor->id,
        ]);
        $blockRevision = $firstBlock->revisions()->create([
            'event' => 'updated',
            'snapshot' => ['content' => $firstBlock->content],
            'created_by' => $actor->id,
        ]);

        $this->assertSame(
            [$firstSection->id, $secondSection->id, $laterSection->id],
            $page->sections()->pluck('id')->all(),
        );
        $this->assertSame(
            [$firstBlock->id, $secondBlock->id, $laterBlock->id],
            $page->blocks()->pluck('id')->all(),
        );

        $this->assertFalse($page->is_indexable);
        $this->assertSame(['title' => 'Premiere'], $firstSection->content);
        $this->assertSame(['heading' => 'Premier bloc'], $firstBlock->content);
        $this->assertSame(['theme' => 'light'], $firstBlock->settings);
        $this->assertNull($secondBlock->settings);

        $this->assertTrue($page->is($firstSection->page));
        $this->assertTrue($page->is($firstBlock->page));
        $this->assertTrue($page->is($pageRevision->revisionable));
        $this->assertTrue($firstSection->is($sectionRevision->revisionable));
        $this->assertTrue($firstBlock->is($blockRevision->revisionable));
        $this->assertTrue($actor->is($pageRevision->actor));
        $this->assertSame(['name' => $page->name], $pageRevision->snapshot);
    }

    public function test_client_cannot_mutate_public_content_admin_resources(): void
    {
        $client = User::factory()->create(['role' => 'client']);
        $page = $this->homePage();
        $section = $this->homeHeroSection($page);

        $this->actingAs($client)
            ->patch(route('admin.content.pages.update', $page), ['name' => 'Accueil client'])
            ->assertForbidden();

        $this->actingAs($client)
            ->patch(route('admin.content.sections.update', $section), ['content' => $section->content])
            ->assertForbidden();

        $this->actingAs($client)
            ->post(route('admin.content.pages.blocks.store', $page), [
                'layout' => ContentBlock::LAYOUT_FULL_WIDTH,
                'content' => ['body' => $this->richDoc('Bloc refuse')],
            ])
            ->assertForbidden();
    }

    public function test_super_admin_can_update_page_section_and_create_block(): void
    {
        $admin = User::factory()->create(['role' => 'super_admin']);
        $page = $this->homePage();
        $section = $this->homeHeroSection($page);

        $this->actingAs($admin)
            ->patch(route('admin.content.pages.update', $page), [
                'name' => 'Accueil FRILO',
                'seo_title' => 'FRILO - site web pret a livrer',
                'seo_description' => 'Un site clair pour presenter son activite.',
                'is_indexable' => true,
            ])
            ->assertRedirect(route('admin.content.pages.edit', $page));

        $this->assertSame('Accueil FRILO', $page->fresh()->name);

        $content = [
            ...$section->content,
            'headline' => 'Un site clair pour votre activite',
        ];

        $this->actingAs($admin)
            ->patch(route('admin.content.sections.update', $section), [
                'name' => 'Hero accueil',
                'position' => 15,
                'is_visible' => true,
                'content' => $content,
            ])
            ->assertRedirect(route('admin.content.pages.edit', $page));

        $this->assertSame('Un site clair pour votre activite', $section->fresh()->content['headline']);

        $this->actingAs($admin)
            ->post(route('admin.content.pages.blocks.store', $page), [
                'layout' => ContentBlock::LAYOUT_FULL_WIDTH,
                'anchor_section_key' => 'home.hero',
                'content' => ['body' => $this->richDoc('Un bloc editorial clair')],
                'settings' => ['tone' => 'calm'],
                'is_visible' => true,
            ])
            ->assertRedirect(route('admin.content.pages.edit', $page));

        $block = ContentBlock::query()->where('public_page_id', $page->id)->firstOrFail();
        $this->assertSame(ContentBlock::LAYOUT_FULL_WIDTH, $block->layout);
        $this->assertSame('Un bloc editorial clair', $block->content['body']['content'][0]['content'][0]['text']);
    }

    public function test_section_update_rejects_unknown_fields(): void
    {
        $admin = User::factory()->create(['role' => 'super_admin']);
        $page = $this->homePage();
        $section = $this->homeHeroSection($page);

        $this->actingAs($admin)
            ->from(route('admin.content.pages.edit', $page))
            ->patch(route('admin.content.sections.update', $section), [
                'content' => [
                    ...$section->content,
                    'unknown_field' => 'Ne doit pas passer',
                ],
            ])
            ->assertRedirect(route('admin.content.pages.edit', $page))
            ->assertSessionHasErrors('content');
    }

    public function test_block_requests_reject_invalid_layout_and_unsafe_rich_content(): void
    {
        $admin = User::factory()->create(['role' => 'super_admin']);
        $page = $this->homePage();
        $this->homeHeroSection($page);

        $this->actingAs($admin)
            ->from(route('admin.content.pages.edit', $page))
            ->post(route('admin.content.pages.blocks.store', $page), [
                'layout' => 'gallery',
                'content' => ['body' => $this->richDoc('Bloc')],
            ])
            ->assertRedirect(route('admin.content.pages.edit', $page))
            ->assertSessionHasErrors('layout');

        $this->actingAs($admin)
            ->from(route('admin.content.pages.edit', $page))
            ->post(route('admin.content.pages.blocks.store', $page), [
                'layout' => ContentBlock::LAYOUT_FULL_WIDTH,
                'content' => [
                    'body' => [
                        'type' => 'doc',
                        'content' => [
                            [
                                'type' => 'paragraph',
                                'content' => [
                                    ['type' => 'text', 'text' => '<script>alert(1)</script>'],
                                ],
                            ],
                        ],
                    ],
                ],
            ])
            ->assertRedirect(route('admin.content.pages.edit', $page))
            ->assertSessionHasErrors('content.body');
    }

    public function test_revision_restore_endpoint_restores_content_state(): void
    {
        $admin = User::factory()->create(['role' => 'super_admin']);
        $page = $this->homePage();
        $section = $this->homeHeroSection($page, [
            'headline' => 'Ancien titre',
        ]);
        $revision = $section->revisions()->create([
            'event' => 'public_section.updated',
            'snapshot' => [
                'class' => PublicSection::class,
                'id' => $section->id,
                'attributes' => $section->getAttributes(),
            ],
            'created_by' => $admin->id,
        ]);
        $section->update([
            'content' => [
                ...$section->content,
                'headline' => 'Titre courant',
            ],
        ]);

        $this->actingAs($admin)
            ->post(route('admin.content.history.restore', $revision))
            ->assertRedirect(route('admin.content.pages.edit', $page));

        $this->assertSame('Ancien titre', $section->fresh()->content['headline']);
        $this->assertDatabaseHas('content_revisions', [
            'revisionable_type' => PublicSection::class,
            'revisionable_id' => $section->id,
            'event' => 'public_section.restored',
        ]);
    }

    public function test_super_admin_can_render_public_content_admin_screens(): void
    {
        $admin = User::factory()->create(['role' => 'super_admin']);
        $page = $this->homePage([
            'seo_title' => 'Accueil FRILO',
            'seo_description' => 'Site pret a partager.',
        ]);
        $section = $this->homeHeroSection($page);
        $block = ContentBlock::factory()->for($page, 'page')->create([
            'layout' => ContentBlock::LAYOUT_FULL_WIDTH,
            'anchor_section_key' => 'home.hero',
            'content' => ['body' => $this->richDoc('Bloc rendu')],
            'settings' => ['tone' => 'simple'],
            'is_visible' => true,
        ]);
        $section->revisions()->create([
            'event' => 'public_section.updated',
            'snapshot' => [
                'class' => PublicSection::class,
                'id' => $section->id,
                'attributes' => $section->getAttributes(),
            ],
            'created_by' => $admin->id,
        ]);

        $this->actingAs($admin)
            ->get(route('admin.content.pages.index'))
            ->assertOk()
            ->assertSee('Contenu du site')
            ->assertSee('Accueil')
            ->assertSee('Modifier');

        $this->actingAs($admin)
            ->get(route('admin.content.pages.edit', $page))
            ->assertOk()
            ->assertSee('Prévisualiser la page publique')
            ->assertSee('Sections protégées')
            ->assertSee('Hero')
            ->assertSee('Champs attendus')
            ->assertSee('Layout du bloc')
            ->assertSee('Pleine largeur')
            ->assertSee('Deux colonnes')
            ->assertSee('Média + texte')
            ->assertSee('Bloc #'.$block->id);

        $this->actingAs($admin)
            ->get(route('admin.content.history.index'))
            ->assertOk()
            ->assertSee('Historique du contenu')
            ->assertSee('public_section.updated')
            ->assertSee('Restaurer');
    }

    public function test_section_form_accepts_content_json_and_rejects_invalid_json(): void
    {
        $admin = User::factory()->create(['role' => 'super_admin']);
        $page = $this->homePage();
        $section = $this->homeHeroSection($page);

        $content = [
            ...$section->content,
            'headline' => 'Un contenu simple depuis JSON',
        ];

        $this->actingAs($admin)
            ->from(route('admin.content.pages.edit', $page))
            ->patch(route('admin.content.sections.update', $section), [
                'name' => 'Hero',
                'position' => 10,
                'is_visible' => true,
                'content_json' => json_encode($content, JSON_THROW_ON_ERROR),
            ])
            ->assertRedirect(route('admin.content.pages.edit', $page))
            ->assertSessionHasNoErrors();

        $this->assertSame('Un contenu simple depuis JSON', $section->fresh()->content['headline']);

        $this->actingAs($admin)
            ->from(route('admin.content.pages.edit', $page))
            ->patch(route('admin.content.sections.update', $section), [
                'content_json' => '{"headline": ',
            ])
            ->assertRedirect(route('admin.content.pages.edit', $page))
            ->assertSessionHasErrors('content_json');
    }

    public function test_block_form_accepts_content_and_settings_json(): void
    {
        $admin = User::factory()->create(['role' => 'super_admin']);
        $page = $this->homePage();
        $this->homeHeroSection($page);

        $this->actingAs($admin)
            ->from(route('admin.content.pages.edit', $page))
            ->post(route('admin.content.pages.blocks.store', $page), [
                'layout' => ContentBlock::LAYOUT_FULL_WIDTH,
                'anchor_section_key' => 'home.hero',
                'is_visible' => true,
                'content_json' => json_encode(['body' => $this->richDoc('Bloc depuis JSON')], JSON_THROW_ON_ERROR),
                'settings_json' => json_encode(['tone' => 'terrain'], JSON_THROW_ON_ERROR),
            ])
            ->assertRedirect(route('admin.content.pages.edit', $page))
            ->assertSessionHasNoErrors();

        $block = ContentBlock::query()->where('public_page_id', $page->id)->firstOrFail();

        $this->assertSame('Bloc depuis JSON', $block->content['body']['content'][0]['content'][0]['text']);
        $this->assertSame(['tone' => 'terrain'], $block->settings);
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

    private function homeHeroSection(PublicPage $page, array $contentOverrides = []): PublicSection
    {
        return PublicSection::factory()->for($page, 'page')->create([
            'key' => 'home.hero',
            'name' => 'Hero',
            'position' => 10,
            'is_visible' => true,
            'content' => [
                ...$this->sectionDefaults('home.hero'),
                ...$contentOverrides,
            ],
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
