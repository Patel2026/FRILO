# Admin Template Pricing Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add normal/promo template pricing, separate "Pense pour" from "Inclus", and refactor admin template writes through FormRequest -> Policy -> Service -> Model.

**Architecture:** Keep `templates.price` as the effective order price for backward compatibility and snapshot safety. Add `normal_price`, `promo_price`, `target_audience`, and `included_features`; synchronize `price` as `promo_price ?? normal_price` in `TemplateService`. Admin write paths move out of `Admin\TemplateController` into dedicated FormRequests and `TemplateService`, while public API/templates prefer the new fields and fall back to legacy `features`.

**Tech Stack:** Laravel 12, PHP 8.2, MySQL 8, PHPUnit/Pest via `php artisan test`, Blade admin.

---

## File Structure

- Create: `backend/database/migrations/2026_06_17_000001_add_pricing_and_content_fields_to_templates_table.php`
  - Adds and backfills pricing/content fields.
- Create: `backend/app/Services/TemplateService.php`
  - Owns admin template create/update/delete, parsing, preview resolution, thumbnail storage, effective price sync.
- Create: `backend/app/Http/Requests/Admin/StoreTemplateRequest.php`
  - Validates admin template creation input.
- Create: `backend/app/Http/Requests/Admin/UpdateTemplateRequest.php`
  - Validates admin template update input.
- Modify: `backend/app/Models/Template.php`
  - Adds fillable/casts/accessor for effective pricing and content fields.
- Modify: `backend/app/Http/Controllers/Admin/TemplateController.php`
  - Uses `authorize()`, FormRequests, and `TemplateService`.
- Modify: `backend/resources/views/admin/templates/_form.blade.php`
  - Adds normal/promo pricing and separates target audience/included features.
- Modify: `backend/resources/views/admin/templates/index.blade.php`
  - Shows normal/promo/effective pricing.
- Modify: `backend/app/Http/Controllers/Api/TemplateController.php`
  - Returns new fields with fallback.
- Modify: `frontend/services/business.service.ts`
  - Adds optional `normal_price`, `promo_price`, `target_audience`, `included_features` fields to `Template`.
- Modify: `frontend/app/templates/[id]/page.tsx`
  - Uses `target_audience` for "Pense pour" and `included_features` for "Inclus".
- Test: `backend/tests/Feature/Admin/TemplateAdminTest.php`
  - New admin tests for pricing/content/refactor behavior.
- Modify Test: `backend/tests/Feature/Api/TemplateApiTest.php`
  - Adds API assertions for new fields and fallback.

---

### Task 1: Migration And Model Fields

**Files:**
- Create: `backend/database/migrations/2026_06_17_000001_add_pricing_and_content_fields_to_templates_table.php`
- Modify: `backend/app/Models/Template.php`
- Test: `backend/tests/Feature/Admin/TemplateAdminTest.php`

- [ ] **Step 1: Write failing model/migration test**

Create `backend/tests/Feature/Admin/TemplateAdminTest.php` with this initial test:

```php
<?php

namespace Tests\Feature\Admin;

use App\Models\Sector;
use App\Models\Template;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TemplateAdminTest extends TestCase
{
    use RefreshDatabase;

    public function test_template_pricing_fields_are_cast_and_effective_price_prefers_promo(): void
    {
        $sector = Sector::create([
            'name' => 'Services',
            'slug' => 'services',
            'description' => 'Secteur test',
            'icon' => 'Briefcase',
            'gradient' => 'from-blue-500 to-purple-600',
            'is_active' => true,
        ]);

        $template = Template::create([
            'sector_id' => $sector->id,
            'name' => 'Service Pro',
            'slug' => 'service-pro',
            'description' => 'Template test',
            'price' => 35000,
            'normal_price' => 50000,
            'promo_price' => 35000,
            'features' => ['Ancienne feature'],
            'target_audience' => ['Commerçants', 'Indépendants'],
            'included_features' => ['Site 5 pages', 'Hébergement 1 an'],
            'is_active' => true,
        ]);

        $this->assertSame(50000, $template->normal_price);
        $this->assertSame(35000, $template->promo_price);
        $this->assertSame(35000, $template->effective_price);
        $this->assertSame(['Commerçants', 'Indépendants'], $template->target_audience);
        $this->assertSame(['Site 5 pages', 'Hébergement 1 an'], $template->included_features);
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
cd backend && php artisan test --filter=TemplateAdminTest::test_template_pricing_fields_are_cast_and_effective_price_prefers_promo
```

Expected: FAIL because `normal_price`, `promo_price`, `target_audience`, and `included_features` columns do not exist yet.

- [ ] **Step 3: Create migration**

Create `backend/database/migrations/2026_06_17_000001_add_pricing_and_content_fields_to_templates_table.php`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('templates', function (Blueprint $table) {
            $table->unsignedBigInteger('normal_price')->nullable()->after('price');
            $table->unsignedBigInteger('promo_price')->nullable()->after('normal_price');
            $table->json('target_audience')->nullable()->after('features');
            $table->json('included_features')->nullable()->after('target_audience');
        });

        DB::table('templates')
            ->whereNull('normal_price')
            ->update([
                'normal_price' => DB::raw('price'),
                'included_features' => DB::raw('features'),
            ]);
    }

    public function down(): void
    {
        Schema::table('templates', function (Blueprint $table) {
            $table->dropColumn([
                'normal_price',
                'promo_price',
                'target_audience',
                'included_features',
            ]);
        });
    }
};
```

- [ ] **Step 4: Update Template model**

Modify `backend/app/Models/Template.php`:

```php
protected $fillable = [
    'sector_id',
    'name',
    'slug',
    'description',
    'price',
    'normal_price',
    'promo_price',
    'features',
    'target_audience',
    'included_features',
    'thumbnail',
    'preview_url',
    'preview_pages',
    'preview_gallery',
    'is_active',
];

protected $casts = [
    'features' => 'array',
    'target_audience' => 'array',
    'included_features' => 'array',
    'preview_pages' => 'array',
    'preview_gallery' => 'array',
    'is_active' => 'boolean',
    'price' => 'integer',
    'normal_price' => 'integer',
    'promo_price' => 'integer',
];

protected $appends = ['full_thumbnail_url', 'effective_price'];

public function getEffectivePriceAttribute(): int
{
    return (int) ($this->promo_price ?? $this->normal_price ?? $this->price);
}
```

- [ ] **Step 5: Run model test to verify it passes**

Run:

```bash
cd backend && php artisan test --filter=TemplateAdminTest::test_template_pricing_fields_are_cast_and_effective_price_prefers_promo
```

Expected: PASS.

---

### Task 2: Admin Template Service And FormRequests

**Files:**
- Create: `backend/app/Services/TemplateService.php`
- Create: `backend/app/Http/Requests/Admin/StoreTemplateRequest.php`
- Create: `backend/app/Http/Requests/Admin/UpdateTemplateRequest.php`
- Modify: `backend/app/Http/Controllers/Admin/TemplateController.php`
- Test: `backend/tests/Feature/Admin/TemplateAdminTest.php`

- [ ] **Step 1: Add failing admin create/update tests**

Append these tests to `TemplateAdminTest`:

```php
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

protected function setUp(): void
{
    parent::setUp();

    $this->withoutMiddleware(\App\Http\Middleware\VerifyCsrfToken::class);
}

public function test_super_admin_can_create_template_with_normal_and_promo_price(): void
{
    Storage::fake('public');
    $admin = User::factory()->create(['role' => 'super_admin']);
    $sector = Sector::create([
        'name' => 'Restaurants',
        'slug' => 'restaurants',
        'description' => 'Secteur test',
        'icon' => 'Utensils',
        'gradient' => 'from-orange-400 to-red-500',
        'is_active' => true,
    ]);

    $this->actingAs($admin)
        ->post('/admin/templates', [
            'sector_id' => $sector->id,
            'name' => 'Restaurant Promo',
            'description' => 'Template restaurant',
            'normal_price' => 50000,
            'promo_price' => 35000,
            'target_audience_raw' => "Restaurants\nMaquis\nSnacks",
            'included_features_raw' => "Site 5 pages\nHébergement 1 an\nSSL sécurisé",
            'features_raw' => "Legacy feature",
            'preview_source' => 'external',
            'preview_url' => 'https://demo.example.com',
            'preview_pages_raw' => "Accueil|/\nMenu|/menu",
            'preview_gallery_raw' => "https://images.example.com/home.jpg",
            'is_active' => 1,
            'thumbnail' => UploadedFile::fake()->image('restaurant.jpg'),
        ])
        ->assertRedirect('/admin/templates');

    $template = Template::query()->where('slug', 'restaurant-promo')->firstOrFail();

    $this->assertSame(50000, $template->normal_price);
    $this->assertSame(35000, $template->promo_price);
    $this->assertSame(35000, $template->price);
    $this->assertSame(['Restaurants', 'Maquis', 'Snacks'], $template->target_audience);
    $this->assertSame(['Site 5 pages', 'Hébergement 1 an', 'SSL sécurisé'], $template->included_features);
    $this->assertNotNull($template->thumbnail);
    Storage::disk('public')->assertExists($template->thumbnail);
}

public function test_super_admin_can_update_template_and_effective_price_falls_back_to_normal_price(): void
{
    $admin = User::factory()->create(['role' => 'super_admin']);
    $sector = Sector::create([
        'name' => 'BTP',
        'slug' => 'btp',
        'description' => 'Secteur test',
        'icon' => 'HardHat',
        'gradient' => 'from-slate-500 to-slate-700',
        'is_active' => true,
    ]);
    $template = Template::create([
        'sector_id' => $sector->id,
        'name' => 'BTP Old',
        'slug' => 'btp-old',
        'description' => 'Ancien',
        'price' => 35000,
        'normal_price' => 50000,
        'promo_price' => 35000,
        'features' => ['Legacy'],
        'is_active' => true,
    ]);

    $this->actingAs($admin)
        ->put('/admin/templates/'.$template->id, [
            'sector_id' => $sector->id,
            'name' => 'BTP Standard',
            'description' => 'Mis à jour',
            'normal_price' => 50000,
            'promo_price' => null,
            'target_audience_raw' => "Artisans\nEntreprises BTP",
            'included_features_raw' => "Site 5 pages\nFormulaire de contact",
            'features_raw' => "Legacy",
            'preview_source' => 'external',
            'preview_url' => null,
            'preview_pages_raw' => '',
            'preview_gallery_raw' => '',
            'is_active' => 1,
        ])
        ->assertRedirect('/admin/templates');

    $template->refresh();

    $this->assertSame('BTP Standard', $template->name);
    $this->assertSame(50000, $template->normal_price);
    $this->assertNull($template->promo_price);
    $this->assertSame(50000, $template->price);
    $this->assertSame(['Artisans', 'Entreprises BTP'], $template->target_audience);
    $this->assertSame(['Site 5 pages', 'Formulaire de contact'], $template->included_features);
}
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
cd backend && php artisan test --filter=TemplateAdminTest
```

Expected: FAIL because admin controller still expects `price`, not `normal_price` / `promo_price`, and service/FormRequests do not exist.

- [ ] **Step 3: Create StoreTemplateRequest**

Create `backend/app/Http/Requests/Admin/StoreTemplateRequest.php`:

```php
<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreTemplateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'sector_id' => ['required', 'exists:sectors,id'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'normal_price' => ['required', 'integer', 'min:0'],
            'promo_price' => ['nullable', 'integer', 'min:0'],
            'features_raw' => ['nullable', 'string'],
            'target_audience_raw' => ['nullable', 'string'],
            'included_features_raw' => ['nullable', 'string'],
            'thumbnail' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'preview_source' => ['required', 'in:external,local'],
            'local_preview_template' => ['nullable', 'string', 'max:255'],
            'preview_url' => ['nullable', 'string', 'max:500'],
            'preview_pages_raw' => ['nullable', 'string'],
            'preview_gallery_raw' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ];
    }
}
```

- [ ] **Step 4: Create UpdateTemplateRequest**

Create `backend/app/Http/Requests/Admin/UpdateTemplateRequest.php`:

```php
<?php

namespace App\Http\Requests\Admin;

class UpdateTemplateRequest extends StoreTemplateRequest
{
}
```

- [ ] **Step 5: Create TemplateService**

Create `backend/app/Services/TemplateService.php` by moving the current parsing/preview logic out of the controller and adding effective price sync:

```php
<?php

namespace App\Services;

use App\Models\Template;
use App\Support\LocalTemplatePreviewCatalog;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class TemplateService
{
    public function __construct(private readonly LocalTemplatePreviewCatalog $localTemplatePreviewCatalog)
    {
    }

    public function create(array $data, ?UploadedFile $thumbnail = null): Template
    {
        $payload = $this->normalizePayload($data);

        if ($thumbnail !== null) {
            $payload['thumbnail'] = $thumbnail->store('templates', 'public');
        }

        return Template::create($payload);
    }

    public function update(Template $template, array $data, ?UploadedFile $thumbnail = null): Template
    {
        $payload = $this->normalizePayload($data, $template);

        if ($thumbnail !== null) {
            if ($template->thumbnail) {
                Storage::disk('public')->delete($template->thumbnail);
            }
            $payload['thumbnail'] = $thumbnail->store('templates', 'public');
        }

        $template->update($payload);

        return $template->fresh();
    }

    public function delete(Template $template): void
    {
        $template->delete();
    }

    private function normalizePayload(array $data, ?Template $template = null): array
    {
        $normalPrice = (int) $data['normal_price'];
        $promoPrice = isset($data['promo_price']) && $data['promo_price'] !== '' && $data['promo_price'] !== null
            ? (int) $data['promo_price']
            : null;

        [$previewUrl, $previewPages, $previewGallery] = $this->resolvePreviewConfiguration(
            $data['preview_source'],
            $data['local_preview_template'] ?? null,
            $data['preview_url'] ?? null,
            $data['preview_pages_raw'] ?? null,
            $data['preview_gallery_raw'] ?? null
        );

        return [
            'sector_id' => (int) $data['sector_id'],
            'name' => $data['name'],
            'slug' => $template?->slug ?? Str::slug($data['name']),
            'description' => $data['description'] ?? null,
            'price' => $promoPrice ?? $normalPrice,
            'normal_price' => $normalPrice,
            'promo_price' => $promoPrice,
            'features' => $this->parseMultiline($data['features_raw'] ?? ''),
            'target_audience' => $this->parseMultiline($data['target_audience_raw'] ?? ''),
            'included_features' => $this->parseMultiline($data['included_features_raw'] ?? ''),
            'preview_url' => $previewUrl,
            'preview_pages' => $previewPages,
            'preview_gallery' => $previewGallery,
            'is_active' => (bool) ($data['is_active'] ?? false),
        ];
    }

    private function parseMultiline(?string $raw): array
    {
        $raw ??= '';

        return array_values(array_filter(
            array_map('trim', preg_split('/\r\n|\r|\n/', $raw) ?: [])
        ));
    }

    private function parsePreviewPages(?string $raw): array
    {
        $rows = preg_split('/\r\n|\r|\n/', $raw ?? '') ?: [];
        $pages = [];

        foreach ($rows as $row) {
            $line = trim($row);
            if ($line === '') {
                continue;
            }

            [$label, $path] = array_pad(array_map('trim', explode('|', $line, 2)), 2, '');
            if ($label === '') {
                continue;
            }

            $pages[] = [
                'label' => Str::limit($label, 60, ''),
                'path' => $path !== '' ? Str::limit($path, 255, '') : '/',
            ];
        }

        return $pages;
    }

    private function parsePreviewGallery(?string $raw): array
    {
        $rows = preg_split('/\r\n|\r|\n/', $raw ?? '') ?: [];
        $urls = [];

        foreach ($rows as $row) {
            $url = trim($row);
            if ($url === '') {
                continue;
            }

            if (Str::startsWith($url, '/') || filter_var($url, FILTER_VALIDATE_URL)) {
                $urls[] = Str::limit($url, 500, '');
            }
        }

        return $urls;
    }

    private function validatePreviewUrl(?string $previewUrl): void
    {
        if ($previewUrl === null || trim($previewUrl) === '') {
            return;
        }

        $value = trim($previewUrl);

        if (Str::startsWith($value, '/') || filter_var($value, FILTER_VALIDATE_URL)) {
            return;
        }

        throw ValidationException::withMessages([
            'preview_url' => 'La prévisualisation doit être une URL http(s) ou un chemin interne commençant par /.',
        ]);
    }

    private function resolvePreviewConfiguration(
        string $previewSource,
        ?string $localPreviewTemplate,
        ?string $previewUrl,
        ?string $previewPagesRaw,
        ?string $previewGalleryRaw
    ): array {
        if ($previewSource === 'local') {
            $folder = trim((string) $localPreviewTemplate);
            $match = $folder !== '' ? $this->localTemplatePreviewCatalog->find($folder) : null;

            if ($match === null) {
                throw ValidationException::withMessages([
                    'local_preview_template' => 'Selectionne un template HTML local precharge valide.',
                ]);
            }

            return [
                $match['preview_url'],
                $match['pages'],
                [],
            ];
        }

        $this->validatePreviewUrl($previewUrl);

        return [
            $previewUrl !== null ? trim($previewUrl) : null,
            $this->parsePreviewPages($previewPagesRaw),
            $this->parsePreviewGallery($previewGalleryRaw),
        ];
    }
}
```

- [ ] **Step 6: Refactor Admin TemplateController**

Update `backend/app/Http/Controllers/Admin/TemplateController.php` so it imports and uses:

```php
use App\Http\Requests\Admin\StoreTemplateRequest;
use App\Http\Requests\Admin\UpdateTemplateRequest;
use App\Services\TemplateService;
```

Constructor:

```php
public function __construct(
    private readonly LocalTemplatePreviewCatalog $localTemplatePreviewCatalog,
    private readonly TemplateService $templateService
) {
}
```

Methods:

```php
public function index()
{
    $this->authorize('viewAny', Template::class);

    $templates = Template::with('sector')
        ->withCount('orders')
        ->latest()
        ->paginate(20);

    return view('admin.templates.index', compact('templates'));
}

public function create()
{
    $this->authorize('create', Template::class);

    $sectors = Sector::active()->orderBy('name')->get();
    $localPreviewTemplates = $this->localTemplatePreviewCatalog->all();

    return view('admin.templates.create', compact('sectors', 'localPreviewTemplates'));
}

public function store(StoreTemplateRequest $request)
{
    $this->authorize('create', Template::class);

    $this->templateService->create(
        $request->validated(),
        $request->file('thumbnail')
    );

    return redirect()->route('admin.templates.index')->with('success', 'Template créé.');
}

public function edit(Template $template)
{
    $this->authorize('update', $template);

    $sectors = Sector::active()->orderBy('name')->get();
    $localPreviewTemplates = $this->localTemplatePreviewCatalog->all();

    return view('admin.templates.edit', compact('template', 'sectors', 'localPreviewTemplates'));
}

public function update(UpdateTemplateRequest $request, Template $template)
{
    $this->authorize('update', $template);

    $this->templateService->update(
        $template,
        $request->validated(),
        $request->file('thumbnail')
    );

    return redirect()->route('admin.templates.index')->with('success', 'Template mis à jour.');
}

public function destroy(Template $template)
{
    $this->authorize('delete', $template);

    $this->templateService->delete($template);

    return redirect()->route('admin.templates.index')->with('success', 'Template désactivé.');
}
```

Remove private parsing/preview helper methods from the controller after moving them to `TemplateService`.

- [ ] **Step 7: Run admin tests**

Run:

```bash
cd backend && php artisan test --filter=TemplateAdminTest
```

Expected: PASS.

---

### Task 3: Admin Views

**Files:**
- Modify: `backend/resources/views/admin/templates/_form.blade.php`
- Modify: `backend/resources/views/admin/templates/index.blade.php`
- Test: `backend/tests/Feature/Admin/TemplateAdminTest.php`

- [ ] **Step 1: Add failing view assertion test**

Append to `TemplateAdminTest`:

```php
public function test_template_form_exposes_pricing_and_content_sections(): void
{
    $admin = User::factory()->create(['role' => 'super_admin']);

    $this->actingAs($admin)
        ->get('/admin/templates/create')
        ->assertOk()
        ->assertSee('Prix normal')
        ->assertSee('Prix promo')
        ->assertSee('Pensé pour')
        ->assertSee('Inclus dans l\\'offre')
        ->assertSee('Thumbnail')
        ->assertSee('Mode de prévisualisation');
}
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
cd backend && php artisan test --filter=TemplateAdminTest::test_template_form_exposes_pricing_and_content_sections
```

Expected: FAIL because the form still shows only `Prix (FCFA)` and `Fonctionnalités incluses`.

- [ ] **Step 3: Update form pricing/content fields**

In `backend/resources/views/admin/templates/_form.blade.php`, replace the current `Prix (FCFA)` block with:

```blade
<div class="row">
    <div class="col-md-6 mb-3">
        <label class="form-label">Prix normal (FCFA) <span class="text-danger">*</span></label>
        <input type="number" name="normal_price" class="form-control @error('normal_price') is-invalid @enderror"
               value="{{ old('normal_price', $template?->normal_price ?? $template?->price) }}" min="0" required>
        @error('normal_price')<div class="invalid-feedback">{{ $message }}</div>@enderror
    </div>
    <div class="col-md-6 mb-3">
        <label class="form-label">Prix promo (FCFA)</label>
        <input type="number" name="promo_price" class="form-control @error('promo_price') is-invalid @enderror"
               value="{{ old('promo_price', $template?->promo_price) }}" min="0">
        @error('promo_price')<div class="invalid-feedback">{{ $message }}</div>@enderror
        <div class="form-text">Le prix commande utilise le prix promo s'il est renseigné, sinon le prix normal.</div>
    </div>
</div>
```

Replace the current `Fonctionnalités incluses` block with:

```blade
<div class="row">
    <div class="col-md-6 mb-3">
        <label class="form-label">Pensé pour</label>
        <textarea name="target_audience_raw" class="form-control" rows="4"
                  placeholder="Restaurants&#10;Maquis&#10;Snacks">{{ old('target_audience_raw', implode("\n", $template?->target_audience ?? [])) }}</textarea>
        <div class="form-text">Chaque ligne apparaît dans la section publique "Pensé pour".</div>
    </div>
    <div class="col-md-6 mb-3">
        <label class="form-label">Inclus dans l'offre</label>
        <textarea name="included_features_raw" class="form-control" rows="4"
                  placeholder="Site 5 pages&#10;Hébergement 1 an&#10;SSL sécurisé">{{ old('included_features_raw', implode("\n", $template?->included_features ?? $template?->features ?? [])) }}</textarea>
        <div class="form-text">Chaque ligne apparaît dans la section publique "Inclus".</div>
    </div>
</div>

<div class="mb-3">
    <label class="form-label">Fonctionnalités legacy / mots-clés internes</label>
    <textarea name="features_raw" class="form-control" rows="3"
              placeholder="Mots-clés internes ou compatibilité ancienne fiche">{{ old('features_raw', implode("\n", $template?->features ?? [])) }}</textarea>
    <div class="form-text">Champ conservé pour compatibilité. Préférer les champs "Pensé pour" et "Inclus".</div>
</div>
```

- [ ] **Step 4: Update index pricing display**

In `backend/resources/views/admin/templates/index.blade.php`, replace price column body:

```blade
<td>
    <div class="fw-semibold">{{ number_format($template->effective_price, 0, ',', ' ') }} FCFA</div>
    <div class="text-muted small">Normal : {{ number_format($template->normal_price ?? $template->price, 0, ',', ' ') }} FCFA</div>
    @if($template->promo_price)
        <span class="badge badge-soft-success">Promo : {{ number_format($template->promo_price, 0, ',', ' ') }} FCFA</span>
    @endif
</td>
```

- [ ] **Step 5: Run view test**

Run:

```bash
cd backend && php artisan test --filter=TemplateAdminTest::test_template_form_exposes_pricing_and_content_sections
```

Expected: PASS.

---

### Task 4: Public API And Frontend Template Detail

**Files:**
- Modify: `backend/app/Http/Controllers/Api/TemplateController.php`
- Modify: `frontend/services/business.service.ts`
- Modify: `frontend/app/templates/[id]/page.tsx`
- Modify Test: `backend/tests/Feature/Api/TemplateApiTest.php`

- [ ] **Step 1: Add failing API test for new fields**

Append to `TemplateApiTest`:

```php
public function test_template_show_returns_pricing_and_separated_public_content_fields(): void
{
    $sector = Sector::create([
        'name' => 'Restaurants',
        'slug' => 'restaurants',
        'description' => 'Secteur test',
        'icon' => 'Utensils',
        'gradient' => 'from-orange-400 to-red-500',
        'is_active' => true,
    ]);

    $template = Template::create([
        'sector_id' => $sector->id,
        'name' => 'Restaurant Pro',
        'slug' => 'restaurant-pro',
        'description' => 'Visible',
        'price' => 35000,
        'normal_price' => 50000,
        'promo_price' => 35000,
        'features' => ['Legacy'],
        'target_audience' => ['Restaurants', 'Maquis'],
        'included_features' => ['Site 5 pages', 'Hébergement 1 an'],
        'is_active' => true,
    ]);

    $this->getJson('/api/templates/'.$template->id)
        ->assertOk()
        ->assertJsonPath('price', 35000)
        ->assertJsonPath('normal_price', 50000)
        ->assertJsonPath('promo_price', 35000)
        ->assertJsonPath('target_audience.0', 'Restaurants')
        ->assertJsonPath('included_features.1', 'Hébergement 1 an');
}
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
cd backend && php artisan test --filter=TemplateApiTest::test_template_show_returns_pricing_and_separated_public_content_fields
```

Expected: FAIL because the API does not yet expose the new fields.

- [ ] **Step 3: Update API transform**

Modify `backend/app/Http/Controllers/Api/TemplateController.php` transform/response method so every template payload includes:

```php
'price' => (int) $template->effective_price,
'normal_price' => (int) ($template->normal_price ?? $template->price),
'promo_price' => $template->promo_price !== null ? (int) $template->promo_price : null,
'features' => $template->features ?? [],
'target_audience' => $template->target_audience ?? [],
'included_features' => $template->included_features ?? ($template->features ?? []),
```

Preserve all existing fields (`preview_url`, `preview_pages`, `preview_gallery`, `sector`, thumbnail fields).

- [ ] **Step 4: Run API test**

Run:

```bash
cd backend && php artisan test --filter=TemplateApiTest
```

Expected: PASS.

- [ ] **Step 5: Update frontend Template type**

Modify `frontend/services/business.service.ts` `Template` type/interface to add:

```ts
normal_price?: number | string | null;
promo_price?: number | string | null;
target_audience?: string[];
included_features?: string[];
```

- [ ] **Step 6: Update template detail page rendering**

Modify `frontend/app/templates/[id]/page.tsx` where `features`, `includedItems`, `visibleFeatures`, and `includedPreview` are derived:

```ts
const legacyFeatures = parseFeatures(template.features);
const targetAudience = Array.isArray(template.target_audience) && template.target_audience.length > 0
  ? template.target_audience
  : legacyFeatures.slice(0, 4);
const includedItems = Array.isArray(template.included_features) && template.included_features.length > 0
  ? template.included_features
  : [...legacyFeatures, 'Hébergement inclus', 'Responsive mobile', 'Support 30 jours'];
const visibleFeatures = targetAudience.slice(0, 4);
const includedPreview = includedItems.slice(0, 6);
```

Keep the JSX sections labeled "Pensé pour" and "Inclus" but ensure "Pensé pour" maps `visibleFeatures` from `targetAudience`, and "Inclus" maps `includedPreview`.

- [ ] **Step 7: Run frontend typecheck**

Run:

```bash
cd frontend && npm run typecheck
```

Expected: PASS.

---

### Task 5: Lot 1 Regression QA

**Files:**
- All files touched in Tasks 1-4.

- [ ] **Step 1: Run focused backend tests**

Run:

```bash
cd backend && php artisan test --filter=TemplateAdminTest
cd backend && php artisan test --filter=TemplateApiTest
cd backend && php artisan test --filter=CreateOrderWithOptionsTest
```

Expected: PASS. `CreateOrderWithOptionsTest` confirms order price snapshot behavior still works.

- [ ] **Step 2: Run backend QA**

Run:

```bash
cd backend && composer qa
```

Expected: PASS.

- [ ] **Step 3: Run frontend QA**

Run:

```bash
cd frontend && npm run qa
```

Expected: PASS or only documented pre-existing warnings.

- [ ] **Step 4: Inspect git diff**

Run:

```bash
git diff --stat
git diff -- backend/app/Http/Controllers/Admin/TemplateController.php backend/app/Services/TemplateService.php backend/resources/views/admin/templates/_form.blade.php
```

Expected: diff only includes Lot 1 files and no unrelated rewrites.

---

## Self-Review

Spec coverage:

- Normal/promo pricing: Tasks 1-3.
- Effective price rule `promo_price ?? normal_price`: Tasks 1-2.
- Admin refactor to FormRequest/Policy/Service/Model: Task 2.
- Thumbnail guidance and replacement: Tasks 2-3.
- Preview handling preserved and centralized: Task 2.
- Separate "Pense pour" and "Inclus": Tasks 1, 3, 4.
- Public API/frontend update: Task 4.
- QA gates: Task 5.

Placeholder scan: no placeholder implementation steps are intentionally left open.

Type consistency:

- Backend field names: `normal_price`, `promo_price`, `target_audience`, `included_features`.
- Admin raw fields: `target_audience_raw`, `included_features_raw`, `features_raw`.
- Frontend fields match API payload names.

## Execution Options

1. Subagent-Driven (recommended): dispatch a fresh subagent per task, review between tasks.
2. Inline Execution: execute tasks in this session using executing-plans, with checkpoints.
