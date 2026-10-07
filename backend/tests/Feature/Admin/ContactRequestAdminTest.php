<?php

namespace Tests\Feature\Admin;

use App\Models\ContactRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ContactRequestAdminTest extends TestCase
{
    use RefreshDatabase;

    private function contact(string $subject = 'Demande test'): ContactRequest
    {
        return ContactRequest::create(['name' => 'Contact test', 'email' => 'contact@example.test', 'subject' => $subject, 'message' => 'Message de test.', 'status' => 'new']);
    }

    public function test_operations_admin_can_delete_only_selected_contacts_and_restore_them(): void
    {
        $admin = User::factory()->create(['role' => 'ops_admin']);
        $first = $this->contact('Premier contact');
        $second = $this->contact('Second contact');
        $kept = $this->contact('Contact conservé');
        $this->actingAs($admin)->delete('/admin/contact-requests/bulk', ['ids' => [$first->id, $second->id]])->assertRedirect();
        $this->assertSoftDeleted($first);
        $this->assertSoftDeleted($second);
        $this->assertNotSoftDeleted($kept);
        $this->get('/admin/contact-requests')->assertOk()->assertDontSee('Premier contact')->assertSee('Contact conservé');
        $this->get('/admin/contact-requests?trashed=1')->assertOk()->assertSee('Premier contact')->assertDontSee('Contact conservé');
        $this->post('/admin/contact-requests/bulk/restore', ['ids' => [$first->id, $second->id]])->assertRedirect();
        $this->assertNotSoftDeleted($first);
        $this->assertNotSoftDeleted($second);
    }

    public function test_invalid_selection_never_deletes_part_of_the_batch(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'super_admin']));
        $contact = $this->contact();
        foreach ([[], [$contact->id, $contact->id], [$contact->id, 999999], ['invalid'], range(1, 101)] as $ids) {
            $this->deleteJson('/admin/contact-requests/bulk', ['ids' => $ids])->assertUnprocessable();
            $this->assertDatabaseHas('contact_requests', ['id' => $contact->id]);
        }
        $this->assertSame(1, ContactRequest::query()->count());
    }

    public function test_other_roles_cannot_delete_or_restore_contacts(): void
    {
        $contact = $this->contact();
        foreach (['client', 'content_admin', 'finance_admin'] as $role) {
            $this->actingAs(User::factory()->create(['role' => $role]));
            $this->deleteJson('/admin/contact-requests/bulk', ['ids' => [$contact->id]])->assertForbidden();
            $this->postJson('/admin/contact-requests/bulk/restore', ['ids' => [$contact->id]])->assertForbidden();
        }
        $this->assertSame(1, ContactRequest::query()->count());
    }

    public function test_stale_status_update_cannot_change_a_contact_in_the_trash(): void
    {
        $contact = $this->contact();
        $service = app(\App\Services\ContactRequestService::class);
        $service->moveSelection([$contact->id], false);
        $this->expectException(\Illuminate\Database\Eloquent\ModelNotFoundException::class);
        $service->updateStatus($contact, 'done');
    }

    public function test_guest_cannot_delete_contacts(): void
    {
        $this->deleteJson('/admin/contact-requests/bulk', ['ids' => [$this->contact()->id]])->assertUnauthorized();
    }

    public function test_restore_rejects_active_contacts_and_status_update_rejects_deleted_contacts(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'super_admin']));
        $contact = $this->contact();
        $this->postJson('/admin/contact-requests/bulk/restore', ['ids' => [$contact->id]])->assertUnprocessable();
        $this->patch('/admin/contact-requests/'.$contact->id.'/status', ['status' => 'done'])->assertRedirect();
        $this->assertNotNull($contact->fresh()->processed_at);
        $this->delete('/admin/contact-requests/bulk', ['ids' => [$contact->id]])->assertRedirect();
        $this->patchJson('/admin/contact-requests/'.$contact->id.'/status', ['status' => 'new'])->assertNotFound();
    }

    public function test_list_contains_selection_controls_and_preserves_filters_in_pagination(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'super_admin']));
        for ($i = 0; $i < 21; $i++) {
            $this->contact();
        }
        $this->get('/admin/contact-requests?status=new')->assertOk()
            ->assertSee('Sélectionner toute la page')->assertSee('Supprimer la sélection')->assertSee('Corbeille')->assertSee('status=new', false);
    }
}
