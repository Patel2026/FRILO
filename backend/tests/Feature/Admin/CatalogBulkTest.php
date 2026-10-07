<?php

namespace Tests\Feature\Admin;

use App\Models\FaqItem;
use App\Models\Sector;
use App\Models\Template;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CatalogBulkTest extends TestCase
{
    use RefreshDatabase;

    private function records(): array
    {
        $sector = Sector::create(['name' => 'Services', 'slug' => 'services', 'is_active' => true]);
        $template = Template::create(['name' => 'Modèle QA', 'slug' => 'modele-qa', 'sector_id' => $sector->id, 'price' => 50000, 'is_active' => true]);
        $faq = FaqItem::create(['question' => 'Question QA', 'answer' => 'Réponse QA', 'is_published' => true, 'sort_order' => 10]);

        return ['templates' => $template, 'faqs' => $faq];
    }

    public function test_stale_faq_update_cannot_change_trashed_content(): void
    {
        $faq = $this->records()['faqs'];
        $actor = User::factory()->create(['role' => 'super_admin']);
        app(\App\Services\CatalogSelectionService::class)->apply(FaqItem::class, [$faq->id], 'delete', $actor);
        $this->expectException(\Illuminate\Database\Eloquent\ModelNotFoundException::class);
        app(\App\Services\FaqItemService::class)->update($faq, ['question' => 'Modifiée', 'answer' => 'Modifiée', 'is_published' => false], $actor);
    }

    public function test_sector_batch_preserves_templates_and_can_be_reactivated(): void
    {
        $template = $this->records()['templates'];
        $this->actingAs(User::factory()->create(['role' => 'content_admin']));
        $this->patchJson('/admin/sectors/bulk/visibility', ['ids' => [$template->sector_id, 99999], 'active' => false])->assertUnprocessable();
        $this->assertTrue($template->sector->fresh()->is_active);
        foreach ([false, true] as $active) {
            $this->patch('/admin/sectors/bulk/visibility', ['ids' => [$template->sector_id], 'active' => $active])->assertRedirect();
            $this->assertSame($active, $template->sector->fresh()->is_active);
            $this->assertNotNull($template->fresh());
        }
        $this->get('/admin/sectors')->assertOk()->assertSee('Appliquer à la sélection');
        $this->actingAs(User::factory()->create(['role' => 'ops_admin']))
            ->patchJson('/admin/sectors/bulk/visibility', ['ids' => [$template->sector_id], 'active' => false])->assertForbidden();
    }

    public function test_template_trash_preserves_order_snapshot_and_thumbnail(): void
    {
        $template = $this->records()['templates'];
        \Illuminate\Support\Facades\Storage::fake('public');
        \Illuminate\Support\Facades\Storage::disk('public')->put('templates/qa.png', 'fixture');
        $template->update(['thumbnail' => 'templates/qa.png']);
        $order = \App\Models\Order::create(['user_id' => User::factory()->create()->id, 'template_id' => $template->id, 'price' => 50000, 'status' => 'pending']);
        $this->actingAs(User::factory()->create(['role' => 'super_admin']))
            ->delete('/admin/templates/bulk', ['ids' => [$template->id]])->assertRedirect();
        $this->assertSame($template->id, $order->fresh()->template->id);
        $this->assertEquals(50000, $order->fresh()->price);
        \Illuminate\Support\Facades\Storage::disk('public')->assertExists('templates/qa.png');
    }

    public function test_content_admin_can_move_catalog_items_to_trash_and_restore(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'content_admin']));
        foreach ($this->records() as $resource => $record) {
            $this->delete('/admin/'.$resource.'/bulk', ['ids' => [$record->id]])->assertRedirect();
            $this->assertSoftDeleted($record);
            $this->get('/admin/'.$resource.'?trashed=1')->assertOk()->assertSee('Restaurer la sélection');
            $this->post('/admin/'.$resource.'/bulk/restore', ['ids' => [$record->id]])->assertRedirect();
            $this->assertNotSoftDeleted($record);
        }
    }

    public function test_invalid_batch_has_no_partial_deletion(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'super_admin']));
        foreach ($this->records() as $resource => $record) {
            foreach ([[], [$record->id, 99999], [$record->id, $record->id]] as $ids) {
                $this->deleteJson('/admin/'.$resource.'/bulk', ['ids' => $ids])->assertUnprocessable();
                $this->assertTrue($record->fresh()->exists);
            }
        }
    }

    public function test_operations_and_finance_cannot_delete_catalog_items(): void
    {
        $records = $this->records();
        foreach (['ops_admin', 'finance_admin', 'client'] as $role) {
            $this->actingAs(User::factory()->create(['role' => $role]));
            foreach ($records as $resource => $record) {
                $this->deleteJson('/admin/'.$resource.'/bulk', ['ids' => [$record->id]])->assertForbidden();
                $this->postJson('/admin/'.$resource.'/bulk/restore', ['ids' => [$record->id]])->assertForbidden();
            }
        }
    }

    public function test_trashed_faq_disappears_from_public_list_and_restoration_preserves_visibility(): void
    {
        $faq = $this->records()['faqs'];
        $this->actingAs(User::factory()->create(['role' => 'super_admin']));
        $this->delete('/admin/faqs/bulk', ['ids' => [$faq->id]])->assertRedirect();
        $this->assertCount(0, app(\App\Services\FaqItemService::class)->publishedFaqs());
        $this->post('/admin/faqs/bulk/restore', ['ids' => [$faq->id]])->assertRedirect();
        $this->assertTrue($faq->fresh()->is_published);
        $this->assertCount(1, app(\App\Services\FaqItemService::class)->publishedFaqs());
    }
}
