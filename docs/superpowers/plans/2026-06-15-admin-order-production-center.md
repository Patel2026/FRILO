# Admin Order Production Center Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the admin order detail page into a production cockpit for assignment, client material checks, production checks, quality checks, delivered-site information, and client reminders.

**Architecture:** Keep the existing `Order` aggregate and status workflow intact. Add production metadata to `orders`, update it through dedicated admin FormRequests and an `OrderProductionService`, and keep status transitions exclusively in `OrderService::updateStatus()`. The Blade admin page remains the primary interface; no separate production board is introduced in this V1.

**Tech Stack:** Laravel 12, PHP 8.2, MySQL 8, Blade admin, PHPUnit/Pest via `composer qa`, Docker Compose.

---

## File Structure

### Create

- `backend/database/migrations/2026_06_15_000001_add_production_fields_to_orders_table.php`  
  Adds production, material, quality, delivery, and reminder fields to `orders`.

- `backend/app/Http/Requests/Admin/UpdateOrderAssignmentRequest.php`  
  Validates production owner assignment.

- `backend/app/Http/Requests/Admin/UpdateOrderMaterialRequest.php`  
  Validates client material checklist and missing-material note.

- `backend/app/Http/Requests/Admin/UpdateOrderProductionRequest.php`  
  Validates internal production checklist and preview sent date.

- `backend/app/Http/Requests/Admin/UpdateOrderQualityRequest.php`  
  Validates quality checklist.

- `backend/app/Http/Requests/Admin/UpdateOrderDeliveryRequest.php`  
  Validates delivered-site fields and post-publication checks.

- `backend/app/Http/Requests/Admin/RecordOrderReminderRequest.php`  
  Validates client reminder reason and follow-up note.

- `backend/app/Services/OrderProductionService.php`  
  Owns all production metadata updates and audit logging.

- `backend/tests/Feature/Admin/OrderProductionCenterTest.php`  
  Covers admin page display, update routes, reminder increment, client rejection, and completed-warning behavior.

### Modify

- `backend/app/Models/Order.php`  
  Add fillable and casts for production fields. Add helper methods for completeness, missing quality checks, and SLA label.

- `backend/app/Http/Controllers/Admin/OrderController.php`  
  Inject `OrderProductionService`, authorize early, add focused update actions, replace inline site update with service-backed request.

- `backend/app/Policies/OrderPolicy.php`  
  Keep `update()` for super admins and add explicit `updateProduction()` alias for clarity.

- `backend/routes/web.php`  
  Add PATCH routes for assignment, material, production, quality, reminder, and keep site route.

- `backend/resources/views/admin/orders/show.blade.php`  
  Reorganize the order detail into an operational summary plus production blocks.

- `backend/tests/Feature/Admin/OrderSiteInfoTest.php`  
  Adjust expectations if `setSiteInfo()` moves from inline controller validation to service-backed FormRequest.

---

## Task 1: Database And Order Model

**Files:**
- Create: `backend/database/migrations/2026_06_15_000001_add_production_fields_to_orders_table.php`
- Modify: `backend/app/Models/Order.php`
- Test: `backend/tests/Feature/Admin/OrderProductionCenterTest.php`

- [ ] **Step 1: Write the failing model/defaults test**

Create `backend/tests/Feature/Admin/OrderProductionCenterTest.php` with this initial content:

```php
<?php

namespace Tests\Feature\Admin;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\Sector;
use App\Models\Template;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderProductionCenterTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware(\App\Http\Middleware\VerifyCsrfToken::class);
    }

    private function superAdmin(): User
    {
        return User::factory()->create(['role' => 'super_admin']);
    }

    private function client(): User
    {
        return User::factory()->create(['role' => 'client', 'is_active' => true]);
    }

    private function createOrder(array $attributes = []): Order
    {
        $sector = Sector::create([
            'name' => 'Commerce',
            'slug' => 'commerce-'.uniqid(),
            'description' => 'Secteur test',
            'icon' => 'ShoppingBag',
            'gradient' => 'from-blue-400 to-indigo-500',
            'is_active' => true,
        ]);

        $template = Template::create([
            'sector_id' => $sector->id,
            'name' => 'Template Test',
            'slug' => 'template-test-'.uniqid(),
            'description' => 'Description test',
            'price' => 50000,
            'features' => ['Accueil', 'Contact'],
            'is_active' => true,
        ]);

        return Order::create(array_merge([
            'user_id' => $this->client()->id,
            'template_id' => $template->id,
            'status' => OrderStatus::Pending,
            'payment_status' => PaymentStatus::Paid,
            'price' => 50000,
        ], $attributes));
    }

    public function test_new_orders_have_production_defaults(): void
    {
        $order = $this->createOrder();

        $this->assertFalse($order->material_activity_received);
        $this->assertFalse($order->material_logo_received);
        $this->assertFalse($order->production_template_adapted);
        $this->assertFalse($order->quality_mobile_checked);
        $this->assertFalse($order->delivery_ssl_checked);
        $this->assertSame(0, $order->client_reminder_count);
        $this->assertSame('A completer', $order->productionCompletenessLabel());
    }
}
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
docker compose exec backend php artisan test tests/Feature/Admin/OrderProductionCenterTest.php
```

Expected: FAIL because production columns and helper methods do not exist.

- [ ] **Step 3: Add the migration**

Create `backend/database/migrations/2026_06_15_000001_add_production_fields_to_orders_table.php`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('production_owner_name')->nullable()->after('hosting_expires_at');
            $table->dateTime('production_assigned_at')->nullable()->after('production_owner_name');

            $table->boolean('material_activity_received')->default(false)->after('production_assigned_at');
            $table->boolean('material_logo_received')->default(false)->after('material_activity_received');
            $table->boolean('material_photos_received')->default(false)->after('material_logo_received');
            $table->boolean('material_texts_received')->default(false)->after('material_photos_received');
            $table->boolean('material_contacts_received')->default(false)->after('material_texts_received');
            $table->boolean('material_colors_received')->default(false)->after('material_contacts_received');
            $table->text('material_missing_note')->nullable()->after('material_colors_received');

            $table->boolean('production_template_adapted')->default(false)->after('material_missing_note');
            $table->boolean('production_content_integrated')->default(false)->after('production_template_adapted');
            $table->boolean('production_preview_prepared')->default(false)->after('production_content_integrated');
            $table->dateTime('production_preview_sent_at')->nullable()->after('production_preview_prepared');
            $table->boolean('production_feedback_received')->default(false)->after('production_preview_sent_at');
            $table->boolean('production_corrections_completed')->default(false)->after('production_feedback_received');

            $table->boolean('quality_mobile_checked')->default(false)->after('production_corrections_completed');
            $table->boolean('quality_form_checked')->default(false)->after('quality_mobile_checked');
            $table->boolean('quality_links_checked')->default(false)->after('quality_form_checked');
            $table->boolean('quality_spelling_checked')->default(false)->after('quality_links_checked');
            $table->boolean('quality_business_info_checked')->default(false)->after('quality_spelling_checked');
            $table->boolean('quality_final_preview_validated')->default(false)->after('quality_business_info_checked');

            $table->boolean('delivery_ssl_checked')->default(false)->after('quality_final_preview_validated');
            $table->boolean('delivery_form_checked')->default(false)->after('delivery_ssl_checked');
            $table->boolean('delivery_mobile_checked')->default(false)->after('delivery_form_checked');
            $table->text('delivery_note')->nullable()->after('delivery_mobile_checked');

            $table->dateTime('last_client_reminder_at')->nullable()->after('delivery_note');
            $table->unsignedInteger('client_reminder_count')->default(0)->after('last_client_reminder_at');
            $table->string('last_client_reminder_reason')->nullable()->after('client_reminder_count');
            $table->text('internal_follow_up_note')->nullable()->after('last_client_reminder_reason');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'production_owner_name',
                'production_assigned_at',
                'material_activity_received',
                'material_logo_received',
                'material_photos_received',
                'material_texts_received',
                'material_contacts_received',
                'material_colors_received',
                'material_missing_note',
                'production_template_adapted',
                'production_content_integrated',
                'production_preview_prepared',
                'production_preview_sent_at',
                'production_feedback_received',
                'production_corrections_completed',
                'quality_mobile_checked',
                'quality_form_checked',
                'quality_links_checked',
                'quality_spelling_checked',
                'quality_business_info_checked',
                'quality_final_preview_validated',
                'delivery_ssl_checked',
                'delivery_form_checked',
                'delivery_mobile_checked',
                'delivery_note',
                'last_client_reminder_at',
                'client_reminder_count',
                'last_client_reminder_reason',
                'internal_follow_up_note',
            ]);
        });
    }
};
```

- [ ] **Step 4: Update `Order` fillable, casts, and helpers**

Modify `backend/app/Models/Order.php` by adding these fields to `$fillable` after `hosting_expires_at`:

```php
'production_owner_name',
'production_assigned_at',
'material_activity_received',
'material_logo_received',
'material_photos_received',
'material_texts_received',
'material_contacts_received',
'material_colors_received',
'material_missing_note',
'production_template_adapted',
'production_content_integrated',
'production_preview_prepared',
'production_preview_sent_at',
'production_feedback_received',
'production_corrections_completed',
'quality_mobile_checked',
'quality_form_checked',
'quality_links_checked',
'quality_spelling_checked',
'quality_business_info_checked',
'quality_final_preview_validated',
'delivery_ssl_checked',
'delivery_form_checked',
'delivery_mobile_checked',
'delivery_note',
'last_client_reminder_at',
'client_reminder_count',
'last_client_reminder_reason',
'internal_follow_up_note',
```

Add these casts after `hosting_expires_at`:

```php
'production_assigned_at' => 'datetime',
'material_activity_received' => 'boolean',
'material_logo_received' => 'boolean',
'material_photos_received' => 'boolean',
'material_texts_received' => 'boolean',
'material_contacts_received' => 'boolean',
'material_colors_received' => 'boolean',
'production_template_adapted' => 'boolean',
'production_content_integrated' => 'boolean',
'production_preview_prepared' => 'boolean',
'production_preview_sent_at' => 'datetime',
'production_feedback_received' => 'boolean',
'production_corrections_completed' => 'boolean',
'quality_mobile_checked' => 'boolean',
'quality_form_checked' => 'boolean',
'quality_links_checked' => 'boolean',
'quality_spelling_checked' => 'boolean',
'quality_business_info_checked' => 'boolean',
'quality_final_preview_validated' => 'boolean',
'delivery_ssl_checked' => 'boolean',
'delivery_form_checked' => 'boolean',
'delivery_mobile_checked' => 'boolean',
'last_client_reminder_at' => 'datetime',
'client_reminder_count' => 'integer',
```

Add these helper methods before `scopeForUser()`:

```php
public function productionCompletenessLabel(): string
{
    return $this->hasCompleteClientMaterial() ? 'Complet' : 'A completer';
}

public function hasCompleteClientMaterial(): bool
{
    return $this->material_activity_received
        && $this->material_logo_received
        && $this->material_photos_received
        && $this->material_texts_received
        && $this->material_contacts_received
        && $this->material_colors_received;
}

public function missingQualityChecks(): array
{
    $checks = [
        'quality_mobile_checked' => 'Mobile responsive',
        'quality_form_checked' => 'Formulaire de contact',
        'quality_links_checked' => 'Liens importants',
        'quality_spelling_checked' => 'Orthographe',
        'quality_business_info_checked' => 'Informations client',
        'quality_final_preview_validated' => 'Preview finale',
    ];

    return collect($checks)
        ->filter(fn (string $label, string $field) => ! $this->{$field})
        ->values()
        ->all();
}

public function productionSlaLabel(): string
{
    if ($this->status === \App\Enums\OrderStatus::Completed) {
        return 'Livre';
    }

    if ($this->status === \App\Enums\OrderStatus::Cancelled) {
        return 'Annule';
    }

    $hours = $this->created_at?->diffInHours(now()) ?? 0;

    if ($hours >= 48) {
        return 'En retard';
    }

    if ($hours >= 36) {
        return 'Attention';
    }

    return 'Dans les temps';
}
```

- [ ] **Step 5: Run the focused test**

Run:

```bash
docker compose exec backend php artisan test tests/Feature/Admin/OrderProductionCenterTest.php
```

Expected: PASS for `test_new_orders_have_production_defaults`.

- [ ] **Step 6: Commit**

Run:

```bash
git add backend/database/migrations/2026_06_15_000001_add_production_fields_to_orders_table.php backend/app/Models/Order.php backend/tests/Feature/Admin/OrderProductionCenterTest.php
git commit -m "feat(admin): add order production metadata"
```

---

## Task 2: Service, Requests, Routes, And Controller Actions

**Files:**
- Create: `backend/app/Services/OrderProductionService.php`
- Create: `backend/app/Http/Requests/Admin/UpdateOrderAssignmentRequest.php`
- Create: `backend/app/Http/Requests/Admin/UpdateOrderMaterialRequest.php`
- Create: `backend/app/Http/Requests/Admin/UpdateOrderProductionRequest.php`
- Create: `backend/app/Http/Requests/Admin/UpdateOrderQualityRequest.php`
- Create: `backend/app/Http/Requests/Admin/UpdateOrderDeliveryRequest.php`
- Create: `backend/app/Http/Requests/Admin/RecordOrderReminderRequest.php`
- Modify: `backend/app/Http/Controllers/Admin/OrderController.php`
- Modify: `backend/app/Policies/OrderPolicy.php`
- Modify: `backend/routes/web.php`
- Test: `backend/tests/Feature/Admin/OrderProductionCenterTest.php`

- [ ] **Step 1: Add failing route/service tests**

Append these tests to `backend/tests/Feature/Admin/OrderProductionCenterTest.php`:

```php
public function test_super_admin_can_update_assignment(): void
{
    $admin = $this->superAdmin();
    $order = $this->createOrder();

    $this->actingAs($admin)
        ->patch(route('admin.orders.assignment', $order), [
            'production_owner_name' => 'Awa Production',
            'production_assigned_at' => '2026-06-15 10:30',
        ])
        ->assertRedirect(route('admin.orders.show', $order));

    $this->assertDatabaseHas('orders', [
        'id' => $order->id,
        'production_owner_name' => 'Awa Production',
    ]);

    $this->assertDatabaseHas('admin_audit_logs', [
        'event' => 'order.production.assignment.updated',
        'actor_id' => $admin->id,
        'target_type' => 'order',
        'target_id' => (string) $order->id,
    ]);
}

public function test_super_admin_can_update_material_checks(): void
{
    $admin = $this->superAdmin();
    $order = $this->createOrder();

    $this->actingAs($admin)
        ->patch(route('admin.orders.material', $order), [
            'material_activity_received' => '1',
            'material_logo_received' => '1',
            'material_photos_received' => '0',
            'material_texts_received' => '1',
            'material_contacts_received' => '1',
            'material_colors_received' => '0',
            'material_missing_note' => 'Photos et couleurs a confirmer.',
        ])
        ->assertRedirect(route('admin.orders.show', $order));

    $this->assertDatabaseHas('orders', [
        'id' => $order->id,
        'material_activity_received' => true,
        'material_logo_received' => true,
        'material_photos_received' => false,
        'material_texts_received' => true,
        'material_contacts_received' => true,
        'material_colors_received' => false,
        'material_missing_note' => 'Photos et couleurs a confirmer.',
    ]);
}

public function test_super_admin_can_update_production_and_quality_checks(): void
{
    $admin = $this->superAdmin();
    $order = $this->createOrder();

    $this->actingAs($admin)
        ->patch(route('admin.orders.production', $order), [
            'production_template_adapted' => '1',
            'production_content_integrated' => '1',
            'production_preview_prepared' => '1',
            'production_preview_sent_at' => '2026-06-15 12:00',
            'production_feedback_received' => '0',
            'production_corrections_completed' => '0',
        ])
        ->assertRedirect(route('admin.orders.show', $order));

    $this->actingAs($admin)
        ->patch(route('admin.orders.quality', $order), [
            'quality_mobile_checked' => '1',
            'quality_form_checked' => '1',
            'quality_links_checked' => '1',
            'quality_spelling_checked' => '1',
            'quality_business_info_checked' => '1',
            'quality_final_preview_validated' => '1',
        ])
        ->assertRedirect(route('admin.orders.show', $order));

    $this->assertDatabaseHas('orders', [
        'id' => $order->id,
        'production_template_adapted' => true,
        'production_content_integrated' => true,
        'production_preview_prepared' => true,
        'quality_mobile_checked' => true,
        'quality_form_checked' => true,
        'quality_links_checked' => true,
        'quality_spelling_checked' => true,
        'quality_business_info_checked' => true,
        'quality_final_preview_validated' => true,
    ]);
}

public function test_super_admin_can_record_client_reminder(): void
{
    $admin = $this->superAdmin();
    $order = $this->createOrder(['client_reminder_count' => 1]);

    $this->actingAs($admin)
        ->patch(route('admin.orders.reminder', $order), [
            'last_client_reminder_reason' => 'Logo manquant',
            'internal_follow_up_note' => 'Relance WhatsApp envoyee au client.',
        ])
        ->assertRedirect(route('admin.orders.show', $order));

    $order->refresh();

    $this->assertSame(2, $order->client_reminder_count);
    $this->assertSame('Logo manquant', $order->last_client_reminder_reason);
    $this->assertNotNull($order->last_client_reminder_at);
}

public function test_client_cannot_update_order_production_data(): void
{
    $client = $this->client();
    $order = $this->createOrder();

    $this->actingAs($client)
        ->patch(route('admin.orders.material', $order), [
            'material_activity_received' => '1',
        ])
        ->assertForbidden();
}
```

- [ ] **Step 2: Run the tests to verify they fail**

Run:

```bash
docker compose exec backend php artisan test tests/Feature/Admin/OrderProductionCenterTest.php
```

Expected: FAIL because routes, requests, and service do not exist.

- [ ] **Step 3: Add FormRequests**

Create `backend/app/Http/Requests/Admin/UpdateOrderAssignmentRequest.php`:

```php
<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOrderAssignmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'production_owner_name' => ['nullable', 'string', 'max:120'],
            'production_assigned_at' => ['nullable', 'date'],
        ];
    }
}
```

Create `backend/app/Http/Requests/Admin/UpdateOrderMaterialRequest.php`:

```php
<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOrderMaterialRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'material_activity_received' => ['sometimes', 'boolean'],
            'material_logo_received' => ['sometimes', 'boolean'],
            'material_photos_received' => ['sometimes', 'boolean'],
            'material_texts_received' => ['sometimes', 'boolean'],
            'material_contacts_received' => ['sometimes', 'boolean'],
            'material_colors_received' => ['sometimes', 'boolean'],
            'material_missing_note' => ['nullable', 'string', 'max:2000'],
        ];
    }

    public function productionData(): array
    {
        return [
            'material_activity_received' => $this->boolean('material_activity_received'),
            'material_logo_received' => $this->boolean('material_logo_received'),
            'material_photos_received' => $this->boolean('material_photos_received'),
            'material_texts_received' => $this->boolean('material_texts_received'),
            'material_contacts_received' => $this->boolean('material_contacts_received'),
            'material_colors_received' => $this->boolean('material_colors_received'),
            'material_missing_note' => $this->validated('material_missing_note'),
        ];
    }
}
```

Create `backend/app/Http/Requests/Admin/UpdateOrderProductionRequest.php`:

```php
<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOrderProductionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'production_template_adapted' => ['sometimes', 'boolean'],
            'production_content_integrated' => ['sometimes', 'boolean'],
            'production_preview_prepared' => ['sometimes', 'boolean'],
            'production_preview_sent_at' => ['nullable', 'date'],
            'production_feedback_received' => ['sometimes', 'boolean'],
            'production_corrections_completed' => ['sometimes', 'boolean'],
        ];
    }

    public function productionData(): array
    {
        return [
            'production_template_adapted' => $this->boolean('production_template_adapted'),
            'production_content_integrated' => $this->boolean('production_content_integrated'),
            'production_preview_prepared' => $this->boolean('production_preview_prepared'),
            'production_preview_sent_at' => $this->validated('production_preview_sent_at'),
            'production_feedback_received' => $this->boolean('production_feedback_received'),
            'production_corrections_completed' => $this->boolean('production_corrections_completed'),
        ];
    }
}
```

Create `backend/app/Http/Requests/Admin/UpdateOrderQualityRequest.php`:

```php
<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOrderQualityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'quality_mobile_checked' => ['sometimes', 'boolean'],
            'quality_form_checked' => ['sometimes', 'boolean'],
            'quality_links_checked' => ['sometimes', 'boolean'],
            'quality_spelling_checked' => ['sometimes', 'boolean'],
            'quality_business_info_checked' => ['sometimes', 'boolean'],
            'quality_final_preview_validated' => ['sometimes', 'boolean'],
        ];
    }

    public function productionData(): array
    {
        return [
            'quality_mobile_checked' => $this->boolean('quality_mobile_checked'),
            'quality_form_checked' => $this->boolean('quality_form_checked'),
            'quality_links_checked' => $this->boolean('quality_links_checked'),
            'quality_spelling_checked' => $this->boolean('quality_spelling_checked'),
            'quality_business_info_checked' => $this->boolean('quality_business_info_checked'),
            'quality_final_preview_validated' => $this->boolean('quality_final_preview_validated'),
        ];
    }
}
```

Create `backend/app/Http/Requests/Admin/RecordOrderReminderRequest.php`:

```php
<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class RecordOrderReminderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'last_client_reminder_reason' => ['required', 'string', 'max:180'],
            'internal_follow_up_note' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
```

- [ ] **Step 4: Add the delivery FormRequest**

Create `backend/app/Http/Requests/Admin/UpdateOrderDeliveryRequest.php`:

```php
<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOrderDeliveryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'site_url' => ['nullable', 'url', 'max:255', 'regex:/^https?:\/\//i'],
            'domain' => ['nullable', 'string', 'max:255'],
            'hosting_expires_at' => ['nullable', 'date'],
            'delivery_ssl_checked' => ['sometimes', 'boolean'],
            'delivery_form_checked' => ['sometimes', 'boolean'],
            'delivery_mobile_checked' => ['sometimes', 'boolean'],
            'delivery_note' => ['nullable', 'string', 'max:2000'],
        ];
    }

    public function productionData(): array
    {
        return [
            'site_url' => $this->validated('site_url'),
            'domain' => $this->validated('domain'),
            'hosting_expires_at' => $this->validated('hosting_expires_at'),
            'delivery_ssl_checked' => $this->boolean('delivery_ssl_checked'),
            'delivery_form_checked' => $this->boolean('delivery_form_checked'),
            'delivery_mobile_checked' => $this->boolean('delivery_mobile_checked'),
            'delivery_note' => $this->validated('delivery_note'),
        ];
    }
}
```

- [ ] **Step 5: Add the service**

Create `backend/app/Services/OrderProductionService.php`:

```php
<?php

namespace App\Services;

use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;

class OrderProductionService
{
    public function __construct(private readonly AdminAuditLogger $auditLogger) {}

    public function updateAssignment(Order $order, array $data, User $actor, ?Request $request = null): Order
    {
        $order->update([
            'production_owner_name' => $data['production_owner_name'] ?? null,
            'production_assigned_at' => $data['production_assigned_at'] ?? null,
        ]);

        $this->audit('order.production.assignment.updated', $order, $actor, $request, [
            'production_owner_name' => $order->production_owner_name,
            'production_assigned_at' => $order->production_assigned_at?->toDateTimeString(),
        ]);

        return $order->fresh();
    }

    public function updateMaterial(Order $order, array $data, User $actor, ?Request $request = null): Order
    {
        $order->update($data);

        $this->audit('order.production.material.updated', $order, $actor, $request, $data);

        return $order->fresh();
    }

    public function updateProduction(Order $order, array $data, User $actor, ?Request $request = null): Order
    {
        $order->update($data);

        $this->audit('order.production.checklist.updated', $order, $actor, $request, $data);

        return $order->fresh();
    }

    public function updateQuality(Order $order, array $data, User $actor, ?Request $request = null): Order
    {
        $order->update($data);

        $this->audit('order.production.quality.updated', $order, $actor, $request, $data);

        return $order->fresh();
    }

    public function updateDelivery(Order $order, array $data, User $actor, ?Request $request = null): Order
    {
        $order->update($data);

        $this->audit('order.production.delivery.updated', $order, $actor, $request, [
            'site_url' => $order->site_url,
            'domain' => $order->domain,
            'hosting_expires_at' => $order->hosting_expires_at?->toDateString(),
            'delivery_ssl_checked' => $order->delivery_ssl_checked,
            'delivery_form_checked' => $order->delivery_form_checked,
            'delivery_mobile_checked' => $order->delivery_mobile_checked,
        ]);

        return $order->fresh();
    }

    public function recordReminder(Order $order, array $data, User $actor, ?Request $request = null): Order
    {
        $order->update([
            'last_client_reminder_at' => now(),
            'client_reminder_count' => (int) $order->client_reminder_count + 1,
            'last_client_reminder_reason' => $data['last_client_reminder_reason'],
            'internal_follow_up_note' => $data['internal_follow_up_note'] ?? null,
        ]);

        $this->audit('order.production.client_reminder.recorded', $order, $actor, $request, [
            'client_reminder_count' => $order->client_reminder_count,
            'last_client_reminder_reason' => $order->last_client_reminder_reason,
        ]);

        return $order->fresh();
    }

    private function audit(string $event, Order $order, User $actor, ?Request $request, array $payload): void
    {
        $this->auditLogger->record(
            event: $event,
            payload: ['order_id' => $order->id] + $payload,
            actor: $actor,
            message: 'Mise a jour production commande depuis backoffice',
            targetType: 'order',
            targetId: (string) $order->id,
            request: $request
        );
    }
}
```

- [ ] **Step 6: Add policy method**

Modify `backend/app/Policies/OrderPolicy.php` and add:

```php
public function updateProduction(User $user, Order $order): bool
{
    return $this->update($user, $order);
}
```

- [ ] **Step 7: Update controller imports, constructor, and methods**

Modify `backend/app/Http/Controllers/Admin/OrderController.php`.

Add imports:

```php
use App\Http\Requests\Admin\RecordOrderReminderRequest;
use App\Http\Requests\Admin\UpdateOrderAssignmentRequest;
use App\Http\Requests\Admin\UpdateOrderMaterialRequest;
use App\Http\Requests\Admin\UpdateOrderProductionRequest;
use App\Http\Requests\Admin\UpdateOrderQualityRequest;
use App\Http\Requests\Admin\UpdateOrderDeliveryRequest;
use App\Services\OrderProductionService;
```

Update constructor:

```php
public function __construct(
    private readonly OrderService $orderService,
    private readonly OrderProductionService $orderProductionService,
    private readonly AdminAuditLogger $auditLogger
) {}
```

At the top of `show()`, `updateStatus()`, `setPreviewUrl()`, and `setSiteInfo()`, authorize the order:

```php
$this->authorize('update', $order);
```

Add these methods before the closing class brace:

```php
public function updateAssignment(UpdateOrderAssignmentRequest $request, Order $order): \Illuminate\Http\RedirectResponse
{
    $this->authorize('updateProduction', $order);

    $this->orderProductionService->updateAssignment(
        $order,
        $request->validated(),
        $request->user(),
        $request
    );

    return redirect()
        ->route('admin.orders.show', $order)
        ->with('success', 'Assignation de production mise a jour.');
}

public function updateMaterial(UpdateOrderMaterialRequest $request, Order $order): \Illuminate\Http\RedirectResponse
{
    $this->authorize('updateProduction', $order);

    $this->orderProductionService->updateMaterial(
        $order,
        $request->productionData(),
        $request->user(),
        $request
    );

    return redirect()
        ->route('admin.orders.show', $order)
        ->with('success', 'Elements client mis a jour.');
}

public function updateProduction(UpdateOrderProductionRequest $request, Order $order): \Illuminate\Http\RedirectResponse
{
    $this->authorize('updateProduction', $order);

    $this->orderProductionService->updateProduction(
        $order,
        $request->productionData(),
        $request->user(),
        $request
    );

    return redirect()
        ->route('admin.orders.show', $order)
        ->with('success', 'Suivi de production mis a jour.');
}

public function updateQuality(UpdateOrderQualityRequest $request, Order $order): \Illuminate\Http\RedirectResponse
{
    $this->authorize('updateProduction', $order);

    $this->orderProductionService->updateQuality(
        $order,
        $request->productionData(),
        $request->user(),
        $request
    );

    return redirect()
        ->route('admin.orders.show', $order)
        ->with('success', 'Controle qualite mis a jour.');
}

public function recordReminder(RecordOrderReminderRequest $request, Order $order): \Illuminate\Http\RedirectResponse
{
    $this->authorize('updateProduction', $order);

    $this->orderProductionService->recordReminder(
        $order,
        $request->validated(),
        $request->user(),
        $request
    );

    return redirect()
        ->route('admin.orders.show', $order)
        ->with('success', 'Relance client enregistree.');
}
```

Replace `setSiteInfo()` with this FormRequest-backed method:

```php
public function setSiteInfo(UpdateOrderDeliveryRequest $request, Order $order): \Illuminate\Http\RedirectResponse
{
    $this->authorize('updateProduction', $order);

    $this->orderProductionService->updateDelivery(
        $order,
        $request->productionData(),
        $request->user(),
        $request
    );

    return redirect()
        ->route('admin.orders.show', $order)
        ->with('success', 'Informations du site mises a jour.');
}
```

- [ ] **Step 8: Add routes**

Modify `backend/routes/web.php` under the existing command routes:

```php
Route::patch('orders/{order}/assignment', [AdminOrderController::class, 'updateAssignment'])->name('orders.assignment');
Route::patch('orders/{order}/material', [AdminOrderController::class, 'updateMaterial'])->name('orders.material');
Route::patch('orders/{order}/production', [AdminOrderController::class, 'updateProduction'])->name('orders.production');
Route::patch('orders/{order}/quality', [AdminOrderController::class, 'updateQuality'])->name('orders.quality');
Route::patch('orders/{order}/reminder', [AdminOrderController::class, 'recordReminder'])->name('orders.reminder');
```

- [ ] **Step 9: Run focused tests**

Run:

```bash
docker compose exec backend php artisan test tests/Feature/Admin/OrderProductionCenterTest.php tests/Feature/Admin/OrderSiteInfoTest.php
```

Expected: PASS.

- [ ] **Step 10: Commit**

Run:

```bash
git add backend/app/Http/Requests/Admin/UpdateOrderAssignmentRequest.php backend/app/Http/Requests/Admin/UpdateOrderMaterialRequest.php backend/app/Http/Requests/Admin/UpdateOrderProductionRequest.php backend/app/Http/Requests/Admin/UpdateOrderQualityRequest.php backend/app/Http/Requests/Admin/UpdateOrderDeliveryRequest.php backend/app/Http/Requests/Admin/RecordOrderReminderRequest.php backend/app/Services/OrderProductionService.php backend/app/Http/Controllers/Admin/OrderController.php backend/app/Policies/OrderPolicy.php backend/routes/web.php backend/tests/Feature/Admin/OrderProductionCenterTest.php backend/tests/Feature/Admin/OrderSiteInfoTest.php
git commit -m "feat(admin): manage order production workflow"
```

---

## Task 3: Admin Order Detail Production UI

**Files:**
- Modify: `backend/resources/views/admin/orders/show.blade.php`
- Test: `backend/tests/Feature/Admin/OrderProductionCenterTest.php`

- [ ] **Step 1: Add failing view test**

Append this test to `backend/tests/Feature/Admin/OrderProductionCenterTest.php`:

```php
public function test_order_detail_displays_production_center_sections(): void
{
    $admin = $this->superAdmin();
    $order = $this->createOrder([
        'production_owner_name' => 'Awa Production',
        'material_activity_received' => true,
        'material_logo_received' => true,
        'quality_mobile_checked' => false,
        'quality_form_checked' => true,
        'client_reminder_count' => 2,
        'last_client_reminder_reason' => 'Photos manquantes',
    ]);

    $this->actingAs($admin)
        ->get(route('admin.orders.show', $order))
        ->assertOk()
        ->assertSee('Centre de production', false)
        ->assertSee('Awa Production')
        ->assertSee('Elements client', false)
        ->assertSee('Production interne')
        ->assertSee('Qualite avant livraison')
        ->assertSee('Relances client')
        ->assertSee('Photos manquantes')
        ->assertSee('A completer');
}
```

- [ ] **Step 2: Run the view test to verify it fails**

Run:

```bash
docker compose exec backend php artisan test tests/Feature/Admin/OrderProductionCenterTest.php --filter=production_center_sections
```

Expected: FAIL because the new sections are not rendered.

- [ ] **Step 3: Add top operational summary**

In `backend/resources/views/admin/orders/show.blade.php`, after the success alert and before the main `.row`, add:

```blade
@php
    $qualityMissing = $order->missingQualityChecks();
    $completenessLabel = $order->productionCompletenessLabel();
    $slaLabel = $order->productionSlaLabel();
    $slaBadge = match($slaLabel) {
        'En retard' => 'danger',
        'Attention' => 'warning',
        'Livre' => 'success',
        'Annule' => 'secondary',
        default => 'success',
    };
@endphp

<div class="card border-0 shadow-sm mb-3">
    <div class="card-body">
        <div class="d-flex flex-column flex-xl-row justify-content-between gap-3">
            <div>
                <p class="text-muted text-uppercase fw-semibold mb-1">Centre de production</p>
                <h5 class="mb-2">Commande #{{ str_pad($order->id, 5, '0', STR_PAD_LEFT) }}</h5>
                <div class="d-flex flex-wrap gap-2">
                    <span class="badge badge-soft-{{ match($order->status->value) {
                        'pending' => 'warning',
                        'processing' => 'info',
                        'completed' => 'success',
                        'cancelled' => 'danger',
                        default => 'secondary'
                    } }}">{{ $order->status->label() }}</span>
                    <span class="badge badge-soft-{{ $completenessLabel === 'Complet' ? 'success' : 'warning' }}">{{ $completenessLabel }}</span>
                    <span class="badge badge-soft-{{ $slaBadge }}">{{ $slaLabel }}</span>
                </div>
            </div>
            <div class="row g-3 flex-grow-1">
                <div class="col-sm-4">
                    <p class="text-muted mb-1">Responsable</p>
                    <p class="fw-semibold mb-0">{{ $order->production_owner_name ?: 'Non assigne' }}</p>
                </div>
                <div class="col-sm-4">
                    <p class="text-muted mb-1">Template</p>
                    <p class="fw-semibold mb-0">{{ $order->template->name ?? '—' }}</p>
                </div>
                <div class="col-sm-4">
                    <p class="text-muted mb-1">Total</p>
                    <p class="fw-semibold mb-0">{{ number_format($order->price, 0, ',', ' ') }} FCFA</p>
                </div>
            </div>
        </div>
    </div>
</div>
```

- [ ] **Step 4: Add assignment block**

Inside the `col-lg-8` column, before the existing Client card, add:

```blade
<div class="card">
    <div class="card-header"><h5 class="card-title mb-0">Assignation interne</h5></div>
    <div class="card-body">
        <form action="{{ route('admin.orders.assignment', $order) }}" method="POST">
            @csrf
            @method('PATCH')
            <div class="row g-3">
                <div class="col-md-7">
                    <label class="form-label">Responsable production</label>
                    <input type="text" name="production_owner_name" class="form-control @error('production_owner_name') is-invalid @enderror" value="{{ old('production_owner_name', $order->production_owner_name) }}" placeholder="Nom du responsable">
                    @error('production_owner_name')<div class="invalid-feedback">{{ $message }}</div>@enderror
                </div>
                <div class="col-md-5">
                    <label class="form-label">Date assignation</label>
                    <input type="datetime-local" name="production_assigned_at" class="form-control @error('production_assigned_at') is-invalid @enderror" value="{{ old('production_assigned_at', $order->production_assigned_at?->format('Y-m-d\TH:i')) }}">
                    @error('production_assigned_at')<div class="invalid-feedback">{{ $message }}</div>@enderror
                </div>
            </div>
            <button type="submit" class="btn btn-soft-primary btn-sm mt-3">Enregistrer l'assignation</button>
        </form>
    </div>
</div>
```

- [ ] **Step 5: Add material, production, quality, and reminder blocks**

Still inside the `col-lg-8` column, after the Instructions card and before the Site livré card, add:

```blade
<div class="card mt-3">
    <div class="card-header"><h5 class="card-title mb-0">Elements client</h5></div>
    <div class="card-body">
        <form action="{{ route('admin.orders.material', $order) }}" method="POST">
            @csrf
            @method('PATCH')
            <div class="row g-2">
                @foreach([
                    'material_activity_received' => 'Description activite',
                    'material_logo_received' => 'Logo',
                    'material_photos_received' => 'Photos / visuels',
                    'material_texts_received' => 'Textes',
                    'material_contacts_received' => 'Contacts',
                    'material_colors_received' => 'Couleurs',
                ] as $field => $label)
                    <div class="col-md-6">
                        <div class="form-check form-switch">
                            <input type="hidden" name="{{ $field }}" value="0">
                            <input class="form-check-input" type="checkbox" role="switch" id="{{ $field }}" name="{{ $field }}" value="1" @checked(old($field, $order->{$field}))>
                            <label class="form-check-label" for="{{ $field }}">{{ $label }}</label>
                        </div>
                    </div>
                @endforeach
            </div>
            <div class="mt-3">
                <label class="form-label">Note sur les elements manquants</label>
                <textarea name="material_missing_note" rows="3" class="form-control @error('material_missing_note') is-invalid @enderror">{{ old('material_missing_note', $order->material_missing_note) }}</textarea>
                @error('material_missing_note')<div class="invalid-feedback">{{ $message }}</div>@enderror
            </div>
            <button type="submit" class="btn btn-soft-primary btn-sm mt-3">Enregistrer les elements</button>
        </form>
    </div>
</div>

<div class="card mt-3">
    <div class="card-header"><h5 class="card-title mb-0">Production interne</h5></div>
    <div class="card-body">
        <form action="{{ route('admin.orders.production', $order) }}" method="POST">
            @csrf
            @method('PATCH')
            <div class="row g-2">
                @foreach([
                    'production_template_adapted' => 'Template adapte',
                    'production_content_integrated' => 'Contenu integre',
                    'production_preview_prepared' => 'Preview preparee',
                    'production_feedback_received' => 'Retours client recus',
                    'production_corrections_completed' => 'Corrections terminees',
                ] as $field => $label)
                    <div class="col-md-6">
                        <div class="form-check form-switch">
                            <input type="hidden" name="{{ $field }}" value="0">
                            <input class="form-check-input" type="checkbox" role="switch" id="{{ $field }}" name="{{ $field }}" value="1" @checked(old($field, $order->{$field}))>
                            <label class="form-check-label" for="{{ $field }}">{{ $label }}</label>
                        </div>
                    </div>
                @endforeach
                <div class="col-md-6">
                    <label class="form-label">Preview envoyee le</label>
                    <input type="datetime-local" name="production_preview_sent_at" class="form-control @error('production_preview_sent_at') is-invalid @enderror" value="{{ old('production_preview_sent_at', $order->production_preview_sent_at?->format('Y-m-d\TH:i')) }}">
                    @error('production_preview_sent_at')<div class="invalid-feedback">{{ $message }}</div>@enderror
                </div>
            </div>
            <button type="submit" class="btn btn-soft-primary btn-sm mt-3">Enregistrer la production</button>
        </form>
    </div>
</div>

<div class="card mt-3">
    <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="card-title mb-0">Qualite avant livraison</h5>
        @if(count($qualityMissing))
            <span class="badge badge-soft-warning">{{ count($qualityMissing) }} point(s) restant(s)</span>
        @else
            <span class="badge badge-soft-success">Pret a livrer</span>
        @endif
    </div>
    <div class="card-body">
        <form action="{{ route('admin.orders.quality', $order) }}" method="POST">
            @csrf
            @method('PATCH')
            <div class="row g-2">
                @foreach([
                    'quality_mobile_checked' => 'Mobile responsive',
                    'quality_form_checked' => 'Formulaire teste',
                    'quality_links_checked' => 'Liens verifies',
                    'quality_spelling_checked' => 'Orthographe relue',
                    'quality_business_info_checked' => 'Infos client validees',
                    'quality_final_preview_validated' => 'Preview finale validee',
                ] as $field => $label)
                    <div class="col-md-6">
                        <div class="form-check form-switch">
                            <input type="hidden" name="{{ $field }}" value="0">
                            <input class="form-check-input" type="checkbox" role="switch" id="{{ $field }}" name="{{ $field }}" value="1" @checked(old($field, $order->{$field}))>
                            <label class="form-check-label" for="{{ $field }}">{{ $label }}</label>
                        </div>
                    </div>
                @endforeach
            </div>
            <button type="submit" class="btn btn-soft-primary btn-sm mt-3">Enregistrer la qualite</button>
        </form>
    </div>
</div>

<div class="card mt-3">
    <div class="card-header"><h5 class="card-title mb-0">Relances client</h5></div>
    <div class="card-body">
        <p class="text-muted mb-2">
            Derniere relance :
            <strong>{{ $order->last_client_reminder_at?->format('d/m/Y H:i') ?? '—' }}</strong>
            · Total : <strong>{{ $order->client_reminder_count }}</strong>
        </p>
        @if($order->last_client_reminder_reason)
            <p class="mb-3"><strong>Dernier motif :</strong> {{ $order->last_client_reminder_reason }}</p>
        @endif
        <form action="{{ route('admin.orders.reminder', $order) }}" method="POST">
            @csrf
            @method('PATCH')
            <div class="mb-2">
                <label class="form-label">Motif de relance</label>
                <input type="text" name="last_client_reminder_reason" class="form-control @error('last_client_reminder_reason') is-invalid @enderror" value="{{ old('last_client_reminder_reason') }}" placeholder="Logo manquant, photos a envoyer...">
                @error('last_client_reminder_reason')<div class="invalid-feedback">{{ $message }}</div>@enderror
            </div>
            <div class="mb-3">
                <label class="form-label">Note interne</label>
                <textarea name="internal_follow_up_note" rows="3" class="form-control @error('internal_follow_up_note') is-invalid @enderror">{{ old('internal_follow_up_note', $order->internal_follow_up_note) }}</textarea>
                @error('internal_follow_up_note')<div class="invalid-feedback">{{ $message }}</div>@enderror
            </div>
            <button type="submit" class="btn btn-soft-primary btn-sm">Enregistrer une relance</button>
        </form>
    </div>
</div>
```

- [ ] **Step 6: Extend the Site livré form with delivery checks**

Inside the existing Site livré form, after `hosting_expires_at`, add:

```blade
<div class="row g-2 mb-3">
    @foreach([
        'delivery_ssl_checked' => 'SSL valide',
        'delivery_form_checked' => 'Formulaire teste apres mise en ligne',
        'delivery_mobile_checked' => 'Mobile teste apres mise en ligne',
    ] as $field => $label)
        <div class="col-md-12">
            <div class="form-check form-switch">
                <input type="hidden" name="{{ $field }}" value="0">
                <input class="form-check-input" type="checkbox" role="switch" id="{{ $field }}" name="{{ $field }}" value="1" @checked(old($field, $order->{$field}))>
                <label class="form-check-label" for="{{ $field }}">{{ $label }}</label>
            </div>
        </div>
    @endforeach
</div>
<div class="mb-3">
    <label class="form-label">Note de livraison</label>
    <textarea name="delivery_note" rows="3" class="form-control @error('delivery_note') is-invalid @enderror">{{ old('delivery_note', $order->delivery_note) }}</textarea>
    @error('delivery_note')<div class="invalid-feedback">{{ $message }}</div>@enderror
</div>
```

- [ ] **Step 7: Add completed-status warning**

In the status card, before rendering the transition button for `completed`, add:

```blade
@if($next->value === 'completed' && count($qualityMissing))
    <div class="alert alert-warning small mb-2">
        Qualite incomplete : {{ implode(', ', $qualityMissing) }}.
    </div>
@endif
```

Keep the button clickable. This V1 uses a strong warning, not a hard block.

- [ ] **Step 8: Run focused tests**

Run:

```bash
docker compose exec backend php artisan test tests/Feature/Admin/OrderProductionCenterTest.php
```

Expected: PASS.

- [ ] **Step 9: Commit**

Run:

```bash
git add backend/resources/views/admin/orders/show.blade.php backend/tests/Feature/Admin/OrderProductionCenterTest.php
git commit -m "feat(admin): show order production center"
```

---

## Task 4: Regression QA And Browser Verification

**Files:**
- Modify only if QA reveals a defect in files touched by Tasks 1-3.

- [ ] **Step 1: Run backend focused admin tests**

Run:

```bash
docker compose exec backend php artisan test tests/Feature/Admin/OrderProductionCenterTest.php tests/Feature/Admin/OrderSiteInfoTest.php tests/Feature/Admin/OrderOptionAdminTest.php
```

Expected: PASS.

- [ ] **Step 2: Run backend QA**

Run:

```bash
docker compose exec backend composer qa
```

Expected: PASS.

- [ ] **Step 3: Run frontend QA**

Run:

```bash
docker compose exec frontend npm run qa
```

Expected: PASS. Existing non-blocking image warnings may appear only if they already existed before this work.

- [ ] **Step 4: Rebuild local backend**

Run:

```bash
docker compose up -d --build --force-recreate backend
```

Expected: backend starts healthy and `curl -I http://localhost:8081/frilo-console` returns `200 OK`.

- [ ] **Step 5: Browser test in integrated browser**

Open:

```text
http://localhost:8081/frilo-console
```

Login:

```text
Email: admin@frilo.com
Password: password
```

Then open one order:

```text
http://localhost:8081/admin/orders/1
```

Verify:

- `Centre de production` summary is visible.
- `Elements client` block is visible.
- `Production interne` block is visible.
- `Qualite avant livraison` block is visible.
- `Relances client` block is visible.
- `Site livre` block includes delivery checks.
- Updating one checkbox saves and returns to the same order page.
- Recording a reminder increments the count.
- If a `completed` transition is available and quality checks are missing, the warning appears.

- [ ] **Step 6: Final commit for QA fixes if needed**

If QA required code changes, run:

```bash
git add backend/app backend/database backend/resources backend/routes backend/tests
git commit -m "fix(admin): stabilize order production center"
```

If no QA fixes were needed, do not create an empty commit.
