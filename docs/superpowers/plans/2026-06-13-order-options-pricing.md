# Order Options Pricing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep FRILO’s standard 50 000 FCFA entry price, then let clients add persona-specific paid options in the order tunnel with a backend-calculated final price.

**Architecture:** Add an `OrderOption` catalogue managed by the backend, expose active options publicly, let the frontend send only selected option ids, and snapshot selected option names/prices on each order. `OrderService::createOrder()` remains the only place where order price is calculated, preserving the “no price from client” rule.

**Tech Stack:** Laravel 12, MySQL 8, Sanctum API, Next.js 16, React 19, TypeScript, Tailwind CSS 4.

---

## Files

- Create: `backend/database/migrations/2026_06_13_000001_create_order_options_table.php`
- Create: `backend/database/migrations/2026_06_13_000002_create_order_order_option_table.php`
- Create: `backend/app/Models/OrderOption.php`
- Create: `backend/app/Http/Controllers/Api/OrderOptionController.php`
- Create: `backend/database/seeders/OrderOptionSeeder.php`
- Modify: `backend/database/seeders/DatabaseSeeder.php`
- Modify: `backend/routes/api.php`
- Modify: `backend/app/Models/Order.php`
- Modify: `backend/app/Services/OrderService.php`
- Modify: `backend/app/Http/Requests/Api/CreateOrderRequest.php`
- Modify: `backend/app/Http/Controllers/Api/OrderController.php`
- Test: `backend/tests/Feature/Api/OrderOptionsApiTest.php`
- Test: `backend/tests/Feature/Api/CreateOrderWithOptionsTest.php`
- Modify: `frontend/services/business.service.ts`
- Modify: `frontend/app/commande/page.tsx`
- Modify: `frontend/app/dashboard/orders/[id]/page.tsx`
- Optional later: admin CRUD for options. This plan seeds options first to keep the first vertical slice small.

---

### Task 1: Backend Data Model

**Files:**
- Create: `backend/database/migrations/2026_06_13_000001_create_order_options_table.php`
- Create: `backend/database/migrations/2026_06_13_000002_create_order_order_option_table.php`
- Create: `backend/app/Models/OrderOption.php`
- Create: `backend/database/factories/OrderOptionFactory.php`
- Modify: `backend/app/Models/Order.php`

- [ ] **Step 1: Create failing relationship tests**

Create `backend/tests/Feature/Api/OrderOptionsApiTest.php`.

Important local pattern: this repo currently only has `UserFactory`; create an `OrderOptionFactory`, but create `Template` and `Order` records directly in the test like `OrderApiTest` does instead of introducing unrelated factories.

```php
<?php

namespace Tests\Feature\Api;

use App\Models\Order;
use App\Models\OrderOption;
use App\Models\Template;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderOptionsApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_order_option_has_active_scope_and_price_cast(): void
    {
        OrderOption::factory()->create([
            'name' => 'Galerie photos',
            'slug' => 'galerie-photos',
            'price' => 10000,
            'is_active' => true,
        ]);
        OrderOption::factory()->create([
            'name' => 'Ancienne option',
            'slug' => 'ancienne-option',
            'price' => 5000,
            'is_active' => false,
        ]);

        $active = OrderOption::active()->get();

        $this->assertCount(1, $active);
        $this->assertSame('Galerie photos', $active->first()->name);
        $this->assertSame(10000, $active->first()->price);
    }

    public function test_order_can_snapshot_selected_options(): void
    {
        $user = User::factory()->create(['role' => 'client']);
        $template = Template::factory()->create(['price' => 50000, 'is_active' => true]);
        $option = OrderOption::factory()->create(['price' => 15000, 'is_active' => true]);

        $order = Order::factory()->create([
            'user_id' => $user->id,
            'template_id' => $template->id,
            'price' => 65000,
        ]);

        $order->options()->attach($option->id, [
            'name_snapshot' => $option->name,
            'price_snapshot' => $option->price,
        ]);

        $order->load('options');

        $this->assertSame($option->name, $order->options->first()->pivot->name_snapshot);
        $this->assertSame(15000, $order->options->first()->pivot->price_snapshot);
    }
}
```

- [ ] **Step 2: Run tests and verify they fail**

Run:

```bash
docker compose exec backend php artisan test --filter=OrderOptionsApiTest
```

Expected: FAIL because `OrderOption` and `Order::options()` do not exist.

- [ ] **Step 3: Add migrations**

Create `backend/database/migrations/2026_06_13_000001_create_order_options_table.php`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_options', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('persona_hint')->nullable();
            $table->unsignedInteger('price');
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_options');
    }
};
```

Create `backend/database/migrations/2026_06_13_000002_create_order_order_option_table.php`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_order_option', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('order_option_id')->nullable()->constrained('order_options')->nullOnDelete();
            $table->string('name_snapshot');
            $table->unsignedInteger('price_snapshot');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_order_option');
    }
};
```

- [ ] **Step 4: Add models and relationships**

Create `backend/app/Models/OrderOption.php`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class OrderOption extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'persona_hint',
        'price',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'price' => 'integer',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function orders(): BelongsToMany
    {
        return $this->belongsToMany(Order::class, 'order_order_option')
            ->withPivot(['name_snapshot', 'price_snapshot'])
            ->withTimestamps();
    }
}
```

Modify `backend/app/Models/Order.php`:

```php
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
```

Add:

```php
public function options(): BelongsToMany
{
    return $this->belongsToMany(OrderOption::class, 'order_order_option')
        ->withPivot(['name_snapshot', 'price_snapshot'])
        ->withTimestamps();
}
```

- [ ] **Step 5: Run tests**

Run:

```bash
docker compose exec backend php artisan test --filter=OrderOptionsApiTest
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add backend/database/migrations backend/app/Models backend/tests/Feature/Api/OrderOptionsApiTest.php
git commit -m "Add order option model"
```

---

### Task 2: Public Options API And Seed Data

**Files:**
- Create: `backend/app/Http/Controllers/Api/OrderOptionController.php`
- Create: `backend/database/seeders/OrderOptionSeeder.php`
- Modify: `backend/database/seeders/DatabaseSeeder.php`
- Modify: `backend/routes/api.php`
- Test: `backend/tests/Feature/Api/OrderOptionsApiTest.php`

- [ ] **Step 1: Extend API test**

Append to `OrderOptionsApiTest`:

```php
public function test_public_options_endpoint_returns_active_options_sorted(): void
{
    OrderOption::factory()->create([
        'name' => 'Inactive',
        'slug' => 'inactive',
        'price' => 1,
        'is_active' => false,
        'sort_order' => 0,
    ]);
    OrderOption::factory()->create([
        'name' => 'Catalogue organisé',
        'slug' => 'catalogue-organise',
        'description' => 'Présenter plusieurs produits, biens ou programmes.',
        'persona_hint' => 'Immobilier, école, commerce',
        'price' => 25000,
        'is_active' => true,
        'sort_order' => 2,
    ]);
    OrderOption::factory()->create([
        'name' => 'Galerie photos',
        'slug' => 'galerie-photos',
        'description' => 'Montrer vos plats, chantiers ou réalisations.',
        'persona_hint' => 'Restaurant, BTP, commerce',
        'price' => 10000,
        'is_active' => true,
        'sort_order' => 1,
    ]);

    $response = $this->getJson('/api/order-options');

    $response->assertOk()
        ->assertJsonCount(2)
        ->assertJsonPath('0.slug', 'galerie-photos')
        ->assertJsonPath('0.price', 10000)
        ->assertJsonPath('1.slug', 'catalogue-organise');
}
```

- [ ] **Step 2: Run and verify failure**

```bash
docker compose exec backend php artisan test --filter=OrderOptionsApiTest
```

Expected: FAIL with 404 for `/api/order-options`.

- [ ] **Step 3: Add controller**

Create `backend/app/Http/Controllers/Api/OrderOptionController.php`:

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OrderOption;
use Illuminate\Http\JsonResponse;

class OrderOptionController extends Controller
{
    public function index(): JsonResponse
    {
        $options = OrderOption::query()
            ->active()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(fn (OrderOption $option) => [
                'id' => $option->id,
                'name' => $option->name,
                'slug' => $option->slug,
                'description' => $option->description,
                'persona_hint' => $option->persona_hint,
                'price' => (int) $option->price,
            ])
            ->values();

        return response()->json($options);
    }
}
```

- [ ] **Step 4: Add route**

Modify `backend/routes/api.php`:

```php
use App\Http\Controllers\Api\OrderOptionController;
```

Add with public catalogue routes:

```php
Route::get('/order-options', [OrderOptionController::class, 'index']);
```

- [ ] **Step 5: Seed persona options**

Create `backend/database/seeders/OrderOptionSeeder.php`:

```php
<?php

namespace Database\Seeders;

use App\Models\OrderOption;
use Illuminate\Database\Seeder;

class OrderOptionSeeder extends Seeder
{
    public function run(): void
    {
        $options = [
            ['Galerie photos / réalisations', 'galerie-photos', 'Montrer vos plats, chantiers, produits ou événements.', 'Restaurant, BTP, commerce, école', 10000, 10],
            ['Page supplémentaire', 'page-supplementaire', 'Ajouter une page dédiée à un service, une équipe ou une information importante.', 'Cabinet, école, institution, service pro', 10000, 20],
            ['Catalogue organisé', 'catalogue-organise', 'Présenter plusieurs biens, produits, programmes ou offres avec une structure claire.', 'Immobilier, école, commerce', 25000, 30],
            ['Formulaire avancé', 'formulaire-avance', 'Collecter des demandes plus précises que nom, téléphone et message.', 'BTP, immobilier, école, cabinet', 15000, 40],
            ['Réservation ou devis structuré', 'reservation-devis', 'Orienter les demandes vers réservation, devis ou rendez-vous.', 'Restaurant, BTP, coach, santé', 15000, 50],
            ['Multilingue FR/EN', 'multilingue-fr-en', 'Afficher les contenus principaux en français et en anglais.', 'Institution, tourisme, cabinet, école', 20000, 60],
            ['SEO local de départ', 'seo-local', 'Préparer les titres et textes pour mieux décrire votre activité et votre zone.', 'Tous secteurs', 15000, 70],
            ['Aide rédaction contenu', 'aide-redaction', 'Transformer vos notes en textes simples pour vos pages.', 'Entrepreneur sans contenus prêts', 20000, 80],
        ];

        foreach ($options as [$name, $slug, $description, $personaHint, $price, $sortOrder]) {
            OrderOption::updateOrCreate(
                ['slug' => $slug],
                [
                    'name' => $name,
                    'description' => $description,
                    'persona_hint' => $personaHint,
                    'price' => $price,
                    'is_active' => true,
                    'sort_order' => $sortOrder,
                ]
            );
        }
    }
}
```

Modify `backend/database/seeders/DatabaseSeeder.php`:

```php
$this->call(OrderOptionSeeder::class);
```

- [ ] **Step 6: Run tests**

```bash
docker compose exec backend php artisan test --filter=OrderOptionsApiTest
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add backend/app/Http/Controllers/Api/OrderOptionController.php backend/routes/api.php backend/database/seeders backend/tests/Feature/Api/OrderOptionsApiTest.php
git commit -m "Expose order options catalogue"
```

---

### Task 3: Price Calculation And Order Snapshot

**Files:**
- Modify: `backend/app/Http/Requests/Api/CreateOrderRequest.php`
- Modify: `backend/app/Services/OrderService.php`
- Modify: `backend/app/Http/Controllers/Api/OrderController.php`
- Test: `backend/tests/Feature/Api/CreateOrderWithOptionsTest.php`

- [ ] **Step 1: Write create-order tests**

Create `backend/tests/Feature/Api/CreateOrderWithOptionsTest.php`:

```php
<?php

namespace Tests\Feature\Api;

use App\Models\OrderOption;
use App\Models\Template;
use App\Models\User;
use Laravel\Sanctum\Sanctum;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CreateOrderWithOptionsTest extends TestCase
{
    use RefreshDatabase;

    public function test_order_without_options_uses_template_price(): void
    {
        $user = User::factory()->create(['role' => 'client']);
        Sanctum::actingAs($user);
        $template = Template::factory()->create(['price' => 50000, 'is_active' => true]);

        $response = $this->postJson('/api/orders', [
            'template_id' => $template->id,
            'enterprise_name' => 'ABC SARL',
        ]);

        $response->assertCreated()
            ->assertJsonPath('price', 50000)
            ->assertJsonPath('selected_options', []);
    }

    public function test_order_with_active_options_snapshots_total_price(): void
    {
        $user = User::factory()->create(['role' => 'client']);
        Sanctum::actingAs($user);
        $template = Template::factory()->create(['price' => 50000, 'is_active' => true]);
        $gallery = OrderOption::factory()->create(['name' => 'Galerie photos', 'price' => 10000, 'is_active' => true]);
        $catalogue = OrderOption::factory()->create(['name' => 'Catalogue organisé', 'price' => 25000, 'is_active' => true]);

        $response = $this->postJson('/api/orders', [
            'template_id' => $template->id,
            'enterprise_name' => 'ABC SARL',
            'option_ids' => [$gallery->id, $catalogue->id],
            'price' => 1,
        ]);

        $response->assertCreated()
            ->assertJsonPath('price', 85000)
            ->assertJsonPath('selected_options.0.name', 'Galerie photos')
            ->assertJsonPath('selected_options.0.price', 10000)
            ->assertJsonPath('selected_options.1.name', 'Catalogue organisé')
            ->assertJsonPath('selected_options.1.price', 25000);

        $this->assertDatabaseHas('orders', ['price' => 85000]);
        $this->assertDatabaseHas('order_order_option', [
            'name_snapshot' => 'Galerie photos',
            'price_snapshot' => 10000,
        ]);
    }

    public function test_inactive_option_is_rejected(): void
    {
        $user = User::factory()->create(['role' => 'client']);
        Sanctum::actingAs($user);
        $template = Template::factory()->create(['price' => 50000, 'is_active' => true]);
        $inactive = OrderOption::factory()->create(['is_active' => false]);

        $response = $this->postJson('/api/orders', [
            'template_id' => $template->id,
            'option_ids' => [$inactive->id],
        ]);

        $response->assertStatus(422);
    }
}
```

- [ ] **Step 2: Run and verify failure**

```bash
docker compose exec backend php artisan test --filter=CreateOrderWithOptionsTest
```

Expected: FAIL because `option_ids` validation and selected option output do not exist.

- [ ] **Step 3: Accept option ids in FormRequest**

Modify `backend/app/Http/Requests/Api/CreateOrderRequest.php` rules:

```php
'option_ids' => ['nullable', 'array', 'max:20'],
'option_ids.*' => [
    'integer',
    Rule::exists('order_options', 'id')->where(fn ($query) => $query->where('is_active', true)),
],
```

Keep the comment:

```php
// Note : user_id, price et status ne sont JAMAIS acceptés du client.
```

- [ ] **Step 4: Calculate total in OrderService**

Modify `backend/app/Services/OrderService.php`:

```php
use App\Models\OrderOption;
```

Inside `createOrder()` before the transaction:

```php
$optionIds = collect($data['option_ids'] ?? [])
    ->map(fn ($id) => (int) $id)
    ->unique()
    ->values();

$options = $optionIds->isEmpty()
    ? collect()
    : OrderOption::query()
        ->active()
        ->whereIn('id', $optionIds)
        ->orderBy('sort_order')
        ->orderBy('name')
        ->get();

$totalPrice = (int) $template->price + (int) $options->sum('price');
```

Change order creation:

```php
'price' => $totalPrice,
```

After instruction creation, attach snapshots:

```php
foreach ($options as $option) {
    $order->options()->attach($option->id, [
        'name_snapshot' => $option->name,
        'price_snapshot' => (int) $option->price,
    ]);
}
```

Return:

```php
return $order->load(['template.sector', 'instruction', 'options']);
```

Log:

```php
'base_price' => (int) $template->price,
'options_total' => (int) $options->sum('price'),
'price' => $order->price,
```

- [ ] **Step 5: Transform selected options**

Modify `backend/app/Http/Controllers/Api/OrderController.php`:

In `index()` and `show()`, include:

```php
'options'
```

In `transformOrder()` add:

```php
$selectedOptions = $order->relationLoaded('options')
    ? $order->options->map(fn ($option) => [
        'id' => $option->id,
        'name' => $option->pivot->name_snapshot,
        'price' => (int) $option->pivot->price_snapshot,
    ])->values()->all()
    : [];
```

Add to response:

```php
'selected_options' => $selectedOptions,
```

- [ ] **Step 6: Run tests**

```bash
docker compose exec backend php artisan test --filter=CreateOrderWithOptionsTest
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add backend/app/Http/Requests/Api/CreateOrderRequest.php backend/app/Services/OrderService.php backend/app/Http/Controllers/Api/OrderController.php backend/tests/Feature/Api/CreateOrderWithOptionsTest.php
git commit -m "Calculate order totals from selected options"
```

---

### Task 4: Frontend API Types

**Files:**
- Modify: `frontend/services/business.service.ts`

- [ ] **Step 1: Extend service types**

Add:

```ts
export interface OrderOption {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    persona_hint: string | null;
    price: number;
}

export interface SelectedOrderOption {
    id: number | null;
    name: string;
    price: number;
}
```

Extend `Order`:

```ts
selected_options?: SelectedOrderOption[];
```

Extend `CreateOrderPayload`:

```ts
option_ids?: number[];
```

Add service method:

```ts
async getOrderOptions(): Promise<OrderOption[]> {
    const response = await api.get('/order-options');
    return Array.isArray(response.data) ? response.data as OrderOption[] : [];
},
```

- [ ] **Step 2: Typecheck**

Run:

```bash
docker compose exec frontend npm run typecheck
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add frontend/services/business.service.ts
git commit -m "Add order option API types"
```

---

### Task 5: Order Tunnel Options Step

**Files:**
- Modify: `frontend/app/commande/page.tsx`

- [ ] **Step 1: Add an Options step and state**

Update steps:

```ts
const STEPS = [
  { id: 1, name: 'Récapitulatif' },
  { id: 2, name: 'Connexion' },
  { id: 3, name: 'Détails' },
  { id: 4, name: 'Options' },
  { id: 5, name: 'Paiement' },
  { id: 6, name: 'Confirmation' },
];
```

Add state:

```ts
const [orderOptions, setOrderOptions] = useState<OrderOption[]>([]);
const [selectedOptionIds, setSelectedOptionIds] = useState<number[]>([]);
```

Load options:

```ts
useEffect(() => {
  businessService.getOrderOptions()
    .then(setOrderOptions)
    .catch(() => setOrderOptions([]));
}, []);
```

Compute totals:

```ts
const selectedOptions = orderOptions.filter(option => selectedOptionIds.includes(option.id));
const optionsTotal = selectedOptions.reduce((sum, option) => sum + option.price, 0);
const finalPrice = price + optionsTotal;
const formattedFinalPrice = finalPrice.toLocaleString('fr-FR').replace(/\u202f/g, ' ');
```

- [ ] **Step 2: Persist selected options in draft**

Extend `OrderDraft`:

```ts
optionIds?: number[];
```

Restore:

```ts
if (Array.isArray(draft.optionIds)) {
  setSelectedOptionIds(draft.optionIds.filter((id): id is number => typeof id === 'number'));
}
```

Save:

```ts
optionIds: selectedOptionIds,
```

Add `selectedOptionIds` to the draft `useEffect` dependency list.

- [ ] **Step 3: Send option ids when creating order**

Modify `businessService.createOrder()` payload in `handlePayment()`:

```ts
option_ids: selectedOptionIds,
```

Set amount from backend:

```ts
orderAmount = order.price;
```

- [ ] **Step 4: Add options UI**

Insert before current payment section and shift payment step from `currentStep === 4` to `currentStep === 5`.

```tsx
{currentStep === 4 && (
  <div className="grid h-full gap-10 lg:grid-cols-[minmax(0,0.9fr)_520px] lg:items-start">
    <div className="max-w-xl lg:pt-12">
      <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-[oklch(57%_0.24_29)]">Options utiles</p>
      <h1 className="text-4xl font-black leading-none tracking-tight text-slate-950 md:text-6xl">
        Ajoutez seulement ce qui sert votre activité.
      </h1>
      <p className="mt-5 text-base leading-7 text-slate-500">
        Le prix se met à jour avant paiement. Vous pouvez continuer sans option.
      </p>
      <div className="mt-8 divide-y divide-slate-100 border-y border-slate-100 text-sm">
        <div className="flex items-center justify-between gap-5 py-4">
          <span className="text-slate-500">Base FRILO</span>
          <span className="text-right font-black text-slate-950">{formattedPrice} FCFA</span>
        </div>
        <div className="flex items-center justify-between gap-5 py-4">
          <span className="text-slate-500">Options choisies</span>
          <span className="text-right font-black text-slate-950">{optionsTotal.toLocaleString('fr-FR').replace(/\u202f/g, ' ')} FCFA</span>
        </div>
        <div className="flex items-center justify-between gap-5 py-4">
          <span className="text-slate-500">Total estimé</span>
          <span className="text-right font-black text-slate-950">{formattedFinalPrice} FCFA</span>
        </div>
      </div>
    </div>

    <div className="lg:rounded-[2rem] lg:border lg:border-slate-100 lg:bg-white lg:p-6 lg:shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
      <div className="grid gap-3">
        {orderOptions.map((option) => {
          const selected = selectedOptionIds.includes(option.id);
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                setSelectedOptionIds((current) =>
                  current.includes(option.id)
                    ? current.filter((id) => id !== option.id)
                    : [...current, option.id]
                );
              }}
              className={cn(
                'rounded-2xl border p-4 text-left transition-colors',
                selected ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-200 bg-white text-slate-950 hover:border-slate-950'
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-base font-black">{option.name}</p>
                  {option.description && (
                    <p className={cn('mt-1 text-sm leading-6', selected ? 'text-white/70' : 'text-slate-500')}>{option.description}</p>
                  )}
                  {option.persona_hint && (
                    <p className={cn('mt-2 text-xs font-bold', selected ? 'text-white/55' : 'text-slate-400')}>Utile pour : {option.persona_hint}</p>
                  )}
                </div>
                <span className="shrink-0 text-sm font-black">
                  +{option.price.toLocaleString('fr-FR').replace(/\u202f/g, ' ')} FCFA
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={nextStep}
        className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-7 py-4 text-sm font-black text-white transition-colors hover:bg-black"
      >
        Continuer vers le paiement
      </button>
    </div>
  </div>
)}
```

- [ ] **Step 5: Shift payment and confirmation conditions**

Change:

```tsx
{currentStep === 4 && (...payment...)}
{currentStep === 5 && (...confirmation...)}
```

to:

```tsx
{currentStep === 5 && (...payment...)}
{currentStep === 6 && (...confirmation...)}
```

Update all payment displays from `formattedPrice` to `formattedFinalPrice` for client-side preview, while keeping backend response authoritative after create.

- [ ] **Step 6: Typecheck**

```bash
docker compose exec frontend npm run typecheck
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add frontend/app/commande/page.tsx
git commit -m "Add selectable order options step"
```

---

### Task 6: Display Options In Dashboard Order Detail

**Files:**
- Modify: `frontend/app/dashboard/orders/[id]/page.tsx`

- [ ] **Step 1: Add selected options summary**

Find the order price/payment summary. Add:

```tsx
{order.selected_options && order.selected_options.length > 0 && (
  <div className="mt-5 border-t border-neutral-200 pt-5">
    <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-neutral-400">Options choisies</p>
    <div className="space-y-2">
      {order.selected_options.map((option) => (
        <div key={`${option.name}-${option.price}`} className="flex items-center justify-between gap-4 text-sm">
          <span className="text-neutral-500">{option.name}</span>
          <span className="font-black text-neutral-950">{option.price.toLocaleString('fr-FR')} FCFA</span>
        </div>
      ))}
    </div>
  </div>
)}
```

- [ ] **Step 2: Typecheck**

```bash
docker compose exec frontend npm run typecheck
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add frontend/app/dashboard/orders/[id]/page.tsx
git commit -m "Show selected order options"
```

---

### Task 7: End-To-End Verification

**Files:**
- No code unless verification reveals a bug.

- [ ] **Step 1: Run backend focused tests**

```bash
docker compose exec backend php artisan test --filter=OrderOptionsApiTest
docker compose exec backend php artisan test --filter=CreateOrderWithOptionsTest
```

Expected: PASS.

- [ ] **Step 2: Run frontend typecheck**

```bash
docker compose exec frontend npm run typecheck
```

Expected: PASS.

- [ ] **Step 3: Manual browser flow**

In the browser:

1. Open `/templates`.
2. Select any active template.
3. Start order.
4. Fill details.
5. Select `Galerie photos / réalisations` and `Catalogue organisé`.
6. Verify preview total is base + 35 000 FCFA.
7. Continue to payment.
8. Verify backend-created order amount matches displayed total.

- [ ] **Step 4: Full QA before merge**

```bash
docker compose exec backend composer qa
docker compose exec frontend npm run qa
```

Expected: PASS.

---

## Self-Review

- Spec coverage: base 50 000 FCFA remains template price; options are public, selectable, backend-calculated, snapshotted, visible in dashboard.
- Security coverage: client never sends final price; `CreateOrderRequest` accepts only `option_ids`; inactive options rejected.
- UX coverage: options step appears before payment, shows persona hints and live total.
- Testing coverage: public options API, order price calculation, inactive option rejection, frontend typecheck, manual checkout flow.
