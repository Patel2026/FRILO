<?php

namespace Tests\Feature\Admin;

use App\Models\Sector;
use App\Models\Template;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class TemplateMediaTest extends TestCase
{
    use RefreshDatabase;

    private function payload(): array
    {
        $sector = Sector::create(['name' => 'Media', 'slug' => 'media', 'is_active' => true]);

        return [
            'sector_id' => $sector->id,
            'name' => 'External Demo',
            'normal_price' => 50000,
            'preview_source' => 'external',
            'preview_mode' => 'external',
            'preview_url' => 'https://demo.example.com/index.html?theme=food#home',
            'is_active' => 1,
        ];
    }

    public function test_thumbnail_url_uses_public_disk_even_when_default_disk_is_private(): void
    {
        config(['filesystems.default' => 'local']);
        config(['filesystems.disks.public.url' => 'https://frilo.example/storage']);
        Storage::fake('public', ['url' => 'https://frilo.example/storage']);
        Storage::disk('public')->put('templates/test.png', 'image');
        $template = new Template(['thumbnail' => 'templates/test.png']);

        $this->assertSame('https://frilo.example/storage/templates/test.png', $template->full_thumbnail_url);
    }

    public function test_external_template_mode_and_thumbnail_survive_edit_and_are_exposed_by_api(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create(['role' => 'super_admin']);
        $payload = $this->payload();
        $this->actingAs($admin)->post('/admin/templates', $payload + [
            'thumbnail' => UploadedFile::fake()->image('demo.png'),
        ])->assertSessionHasNoErrors()->assertRedirect('/admin/templates');
        $template = Template::firstOrFail();
        $oldThumbnail = $template->thumbnail;
        $this->assertSame('external', $template->preview_mode);
        $this->getJson('/api/templates/'.$template->id)->assertOk()
            ->assertJsonPath('preview_mode', 'external')
            ->assertJsonPath('preview_url', $payload['preview_url']);
        $this->put('/admin/templates/'.$template->id, $payload)->assertSessionHasNoErrors();
        $this->assertSame($oldThumbnail, $template->fresh()->thumbnail);
        Storage::disk('public')->assertExists($oldThumbnail);
        $this->put('/admin/templates/'.$template->id, $payload + [
            // Real WebP fixture: the production GD build can read WebP without encoding it.
            'thumbnail' => UploadedFile::fake()->createWithContent('replacement.webp', base64_decode('UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoCAAIAAUAmJaQAA3AA/v02aAA=')),
        ])->assertSessionHasNoErrors();
        Storage::disk('public')->assertMissing($oldThumbnail);
        Storage::disk('public')->assertExists($template->fresh()->thumbnail);
    }

    public function test_invalid_preview_urls_and_modes_are_rejected(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'super_admin']));
        $payload = $this->payload();
        foreach (['ftp://example.com/demo', '//example.com/demo', '/\\example.com', 'javascript:alert(1)'] as $url) {
            $this->post('/admin/templates', array_replace($payload, ['preview_url' => $url]))
                ->assertSessionHasErrors('preview_url');
        }
        $this->post('/admin/templates', array_replace($payload, ['preview_mode' => 'invalid']))
            ->assertSessionHasErrors('preview_mode');
    }

    public function test_invalid_thumbnail_reports_error_and_preserves_existing_file(): void
    {
        Storage::fake('public');
        $this->actingAs(User::factory()->create(['role' => 'super_admin']));
        $payload = $this->payload();
        $this->post('/admin/templates', $payload + ['thumbnail' => UploadedFile::fake()->image('ok.jpg')]);
        $template = Template::firstOrFail();
        $this->put('/admin/templates/'.$template->id, $payload + [
            'thumbnail' => UploadedFile::fake()->create('bad.txt', 1, 'text/plain'),
        ])->assertSessionHasErrors('thumbnail');
        Storage::disk('public')->assertExists($template->thumbnail);
    }

    public function test_form_explains_external_demos_and_displays_thumbnail_errors(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'super_admin']))
            ->withSession(['errors' => (new \Illuminate\Support\ViewErrorBag)->put('default', new \Illuminate\Support\MessageBag(['thumbnail' => 'Image trop volumineuse.']))])
            ->get('/admin/templates/create')->assertOk()
            ->assertSee('name="preview_mode"', false)
            ->assertSee('ThemeForest')
            ->assertSee('Image trop volumineuse.');
    }

    public function test_failed_upload_preserves_existing_thumbnail(): void
    {
        Storage::fake('public');
        $service = app(\App\Services\TemplateService::class);
        $payload = $this->payload();
        $template = $service->create($payload, UploadedFile::fake()->image('old.jpg'));
        $original = $template->thumbnail;
        $failedUpload = \Mockery::mock(UploadedFile::class);
        $failedUpload->shouldReceive('store')->with('templates', 'public')->once()->andReturn(false);

        try {
            $service->update($template, $payload, $failedUpload);
            $this->fail('A failed upload must produce a validation error.');
        } catch (\Illuminate\Validation\ValidationException $exception) {
            $this->assertArrayHasKey('thumbnail', $exception->errors());
        }

        $this->assertSame($original, $template->fresh()->thumbnail);
        Storage::disk('public')->assertExists($original);
    }
}
