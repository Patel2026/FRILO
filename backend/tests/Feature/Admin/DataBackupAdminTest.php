<?php

namespace Tests\Feature\Admin;

use App\Models\SystemBackup;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DataBackupAdminTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware(\App\Http\Middleware\VerifyCsrfToken::class);
        Storage::fake('local');
    }

    public function test_super_admin_can_create_database_backup(): void
    {
        $superAdmin = User::factory()->create(['role' => 'super_admin']);

        DB::table('sectors')->insert([
            'name' => 'Restauration Test',
            'slug' => 'restauration-test',
            'description' => 'desc',
            'icon' => 'home',
            'gradient' => 'from-blue to-cyan',
            'is_active' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->actingAs($superAdmin)
            ->post('/admin/backups', [
                'note' => 'Snapshot avant mise à jour',
            ])
            ->assertRedirect('/admin/backups');

        $backup = SystemBackup::query()->latest('id')->first();
        $this->assertNotNull($backup);
        $this->assertSame(SystemBackup::STATUS_READY, $backup->status);
        $this->assertSame($superAdmin->id, $backup->created_by);
        Storage::disk('local')->assertExists($backup->storage_path);
    }

    public function test_super_admin_can_restore_backup(): void
    {
        $superAdmin = User::factory()->create(['role' => 'super_admin']);

        DB::table('sectors')->insert([
            'name' => 'Secteur Original',
            'slug' => 'secteur-original',
            'description' => 'desc',
            'icon' => 'home',
            'gradient' => 'from-blue to-cyan',
            'is_active' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->actingAs($superAdmin)
            ->post('/admin/backups', [
                'note' => 'Backup original',
            ])
            ->assertRedirect('/admin/backups');

        $backup = SystemBackup::query()->latest('id')->firstOrFail();

        DB::table('sectors')
            ->where('slug', 'secteur-original')
            ->update([
                'name' => 'Secteur Modifié',
                'updated_at' => now(),
            ]);

        $this->assertDatabaseHas('sectors', [
            'slug' => 'secteur-original',
            'name' => 'Secteur Modifié',
        ]);

        $this->actingAs($superAdmin)
            ->post('/admin/backups/'.$backup->id.'/restore', [
                'confirm_restore' => 1,
            ])
            ->assertRedirect('/admin/backups');

        $this->assertDatabaseHas('sectors', [
            'slug' => 'secteur-original',
            'name' => 'Secteur Original',
        ]);
        $this->assertDatabaseHas('system_backups', [
            'id' => $backup->id,
            'status' => SystemBackup::STATUS_RESTORED,
            'last_restored_by' => $superAdmin->id,
        ]);
    }
}
