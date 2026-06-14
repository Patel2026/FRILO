# Dashboard Business Modules — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter 4 modules de gestion business dans l'espace client FRILO : Mon Site, Mes Clients (CRM léger), Ma Caisse (journal de caisse), Mes Échéances (rappels fiscaux).

**Architecture:** Chaque module suit le flux Controller → FormRequest → Policy → Model côté backend, et Page → Service → api.ts côté frontend. Les modules sont indépendants du workflow commande existant et n'interfèrent pas avec OrderService.

**Tech Stack:** Laravel 12 / PHP 8.3 / MySQL 8 / Next.js 15 / TypeScript / Tailwind CSS 4 / Sanctum Bearer

**Persona cible :** Entrepreneur béninois, mobile-first, peu digitalisé, seul ou avec 1-2 personnes. Interfaces à 3 champs max par action, résultat immédiat, langue française.

---

## File Map

### Backend — nouveaux fichiers
| Fichier | Rôle |
|---------|------|
| `database/migrations/xxxx_add_site_fields_to_orders_table.php` | site_url, domain, hosting_expires_at |
| `database/migrations/xxxx_create_client_contacts_table.php` | carnet clients |
| `database/migrations/xxxx_create_cash_entries_table.php` | journal de caisse |
| `database/migrations/xxxx_create_deadlines_table.php` | échéances système + perso |
| `app/Enums/CashEntryType.php` | income / expense |
| `app/Models/ClientContact.php` | |
| `app/Models/CashEntry.php` | |
| `app/Models/Deadline.php` | |
| `app/Policies/ClientContactPolicy.php` | |
| `app/Policies/CashEntryPolicy.php` | |
| `app/Policies/DeadlinePolicy.php` | |
| `app/Http/Requests/Api/StoreClientContactRequest.php` | |
| `app/Http/Requests/Api/UpdateClientContactRequest.php` | |
| `app/Http/Requests/Api/StoreCashEntryRequest.php` | |
| `app/Http/Requests/Api/UpdateCashEntryRequest.php` | |
| `app/Http/Requests/Api/StoreDeadlineRequest.php` | |
| `app/Http/Requests/Api/UpdateDeadlineRequest.php` | |
| `app/Http/Controllers/Api/ClientContactController.php` | |
| `app/Http/Controllers/Api/CashEntryController.php` | index, summary, store, update, destroy |
| `app/Http/Controllers/Api/DeadlineController.php` | liste système+perso, CRUD perso |
| `app/Http/Controllers/Admin/DeadlineController.php` | CRUD échéances système |
| `resources/views/admin/deadlines/index.blade.php` | |
| `resources/views/admin/deadlines/create.blade.php` | |
| `resources/views/admin/deadlines/edit.blade.php` | |
| `database/factories/ClientContactFactory.php` | |
| `database/factories/CashEntryFactory.php` | |
| `database/factories/DeadlineFactory.php` | |
| `tests/Feature/Api/OrderSiteFieldsTest.php` | |
| `tests/Feature/Api/ClientContactTest.php` | |
| `tests/Feature/Api/CashEntryTest.php` | |
| `tests/Feature/Api/DeadlineTest.php` | |

### Backend — fichiers modifiés
| Fichier | Modification |
|---------|-------------|
| `app/Models/Order.php` | site_url, domain, hosting_expires_at dans $fillable + $casts |
| `app/Models/User.php` | relations hasMany ClientContact, CashEntry, Deadline |
| `app/Http/Controllers/Api/OrderController.php` | exposer site fields dans transformOrder() |
| `app/Http/Controllers/Admin/OrderController.php` | ajouter setSiteInfo() |
| `resources/views/admin/orders/show.blade.php` | formulaire champs site |
| `routes/api.php` | nouvelles routes contacts, cash, deadlines |
| `routes/web.php` | routes admin deadlines + order site |

### Frontend — nouveaux fichiers
| Fichier | Rôle |
|---------|------|
| `frontend/services/contacts.service.ts` | |
| `frontend/services/cash.service.ts` | |
| `frontend/services/deadlines.service.ts` | |
| `frontend/app/dashboard/mon-site/page.tsx` | |
| `frontend/app/dashboard/contacts/page.tsx` | |
| `frontend/app/dashboard/caisse/page.tsx` | |
| `frontend/app/dashboard/echeances/page.tsx` | |

### Frontend — fichiers modifiés
| Fichier | Modification |
|---------|-------------|
| `frontend/services/business.service.ts` | étendre Order avec site_url, domain, hosting_expires_at |
| `frontend/components/dashboard/Sidebar.tsx` | 4 nouveaux items + badge échéances |

---

## Task 1 — Backend : Mon Site (champs site sur orders)

**Files:**
- Create: `database/migrations/xxxx_add_site_fields_to_orders_table.php`
- Modify: `app/Models/Order.php`
- Modify: `app/Http/Controllers/Admin/OrderController.php`
- Modify: `resources/views/admin/orders/show.blade.php`
- Modify: `app/Http/Controllers/Api/OrderController.php`
- Modify: `routes/web.php`
- Create: `tests/Feature/Api/OrderSiteFieldsTest.php`

- [ ] **Étape 1 : Écrire le test**

```php
// tests/Feature/Api/OrderSiteFieldsTest.php
<?php

namespace Tests\Feature\Api;

use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderSiteFieldsTest extends TestCase
{
    use RefreshDatabase;

    public function test_order_response_includes_site_fields(): void
    {
        $user = User::factory()->create(['role' => 'client']);
        $order = Order::factory()->for($user)->create([
            'site_url' => 'https://monboutique.com',
            'domain' => 'monboutique.com',
            'hosting_expires_at' => '2027-06-01',
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson("/api/orders/{$order->id}");

        $response->assertOk()
            ->assertJsonPath('site_url', 'https://monboutique.com')
            ->assertJsonPath('domain', 'monboutique.com')
            ->assertJsonPath('hosting_expires_at', '2027-06-01');
    }

    public function test_order_response_site_fields_null_by_default(): void
    {
        $user = User::factory()->create(['role' => 'client']);
        $order = Order::factory()->for($user)->create();

        $response = $this->actingAs($user, 'sanctum')
            ->getJson("/api/orders/{$order->id}");

        $response->assertOk()
            ->assertJsonPath('site_url', null)
            ->assertJsonPath('domain', null)
            ->assertJsonPath('hosting_expires_at', null);
    }
}
```

- [ ] **Étape 2 : Lancer le test pour vérifier l'échec**

```bash
cd backend && php artisan test tests/Feature/Api/OrderSiteFieldsTest.php
```
Expected: FAIL — colonnes absentes.

- [ ] **Étape 3 : Créer la migration**

```php
<?php
// database/migrations/xxxx_add_site_fields_to_orders_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('site_url')->nullable()->after('feedback_submitted_at');
            $table->string('domain')->nullable()->after('site_url');
            $table->date('hosting_expires_at')->nullable()->after('domain');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['site_url', 'domain', 'hosting_expires_at']);
        });
    }
};
```

- [ ] **Étape 4 : Mettre à jour Order.php**

Ajouter dans `$fillable` (après `feedback_submitted_at`) :
```php
'site_url',
'domain',
'hosting_expires_at',
```

Ajouter dans `$casts` :
```php
'hosting_expires_at' => 'date',
```

- [ ] **Étape 5 : Exposer les champs dans transformOrder()**

Dans `app/Http/Controllers/Api/OrderController.php`, ajouter dans le tableau retourné par `transformOrder()` :
```php
'site_url' => $order->site_url,
'domain' => $order->domain,
'hosting_expires_at' => $order->hosting_expires_at?->toDateString(),
```

- [ ] **Étape 6 : Ajouter setSiteInfo() dans Admin/OrderController.php**

```php
public function setSiteInfo(Request $request, Order $order): \Illuminate\Http\RedirectResponse
{
    $validated = $request->validate([
        'site_url'           => ['nullable', 'url', 'max:255'],
        'domain'             => ['nullable', 'string', 'max:255'],
        'hosting_expires_at' => ['nullable', 'date'],
    ]);

    $order->update($validated);

    $this->auditLogger->record('order.site_info.updated', [
        'order_id' => $order->id,
        'admin_id' => auth()->id(),
    ]);

    return redirect()->route('admin.orders.show', $order)
        ->with('success', 'Informations du site mises à jour.');
}
```

- [ ] **Étape 7 : Ajouter la route admin**

Dans `routes/web.php`, dans le groupe admin après la route `orders.preview` :
```php
Route::patch('orders/{order}/site', [AdminOrderController::class, 'setSiteInfo'])->name('orders.site');
```

- [ ] **Étape 8 : Ajouter le formulaire dans la vue admin**

Dans `resources/views/admin/orders/show.blade.php`, ajouter une nouvelle card après celle du preview_url :

```blade
{{-- Informations du site livré --}}
<div class="card mt-3">
    <div class="card-header"><h5 class="card-title mb-0">Site livré</h5></div>
    <div class="card-body">
        @if($order->site_url)
            <p class="mb-1"><strong>URL :</strong> <a href="{{ $order->site_url }}" target="_blank">{{ $order->site_url }}</a></p>
        @endif
        @if($order->domain)
            <p class="mb-1"><strong>Domaine :</strong> {{ $order->domain }}</p>
        @endif
        @if($order->hosting_expires_at)
            <p class="mb-3"><strong>Hébergement expire le :</strong> {{ $order->hosting_expires_at->format('d/m/Y') }}</p>
        @endif
        <hr>
        <form action="{{ route('admin.orders.site', $order) }}" method="POST">
            @csrf
            @method('PATCH')
            <div class="mb-2">
                <label class="form-label">URL du site</label>
                <input type="url" name="site_url" class="form-control form-control-sm"
                    value="{{ old('site_url', $order->site_url) }}" placeholder="https://...">
            </div>
            <div class="mb-2">
                <label class="form-label">Nom de domaine</label>
                <input type="text" name="domain" class="form-control form-control-sm"
                    value="{{ old('domain', $order->domain) }}" placeholder="monsite.com">
            </div>
            <div class="mb-3">
                <label class="form-label">Expiration hébergement</label>
                <input type="date" name="hosting_expires_at" class="form-control form-control-sm"
                    value="{{ old('hosting_expires_at', $order->hosting_expires_at?->format('Y-m-d')) }}">
            </div>
            <button type="submit" class="btn btn-soft-primary btn-sm w-100">Enregistrer</button>
        </form>
    </div>
</div>
```

- [ ] **Étape 9 : Lancer la migration et les tests**

```bash
cd backend && php artisan migrate && php artisan test tests/Feature/Api/OrderSiteFieldsTest.php
```
Expected: 2 tests PASS.

- [ ] **Étape 10 : Commit**

```bash
git add database/migrations/ app/Models/Order.php \
    app/Http/Controllers/Api/OrderController.php \
    app/Http/Controllers/Admin/OrderController.php \
    resources/views/admin/orders/show.blade.php \
    routes/web.php \
    tests/Feature/Api/OrderSiteFieldsTest.php
git commit -m "feat(orders): champs site_url, domain, hosting_expires_at + admin + API"
```

---

## Task 2 — Backend : Mes Clients (CRUD contacts)

**Files:**
- Create: `database/migrations/xxxx_create_client_contacts_table.php`
- Create: `app/Models/ClientContact.php`
- Create: `app/Policies/ClientContactPolicy.php`
- Create: `app/Http/Requests/Api/StoreClientContactRequest.php`
- Create: `app/Http/Requests/Api/UpdateClientContactRequest.php`
- Create: `app/Http/Controllers/Api/ClientContactController.php`
- Create: `database/factories/ClientContactFactory.php`
- Create: `tests/Feature/Api/ClientContactTest.php`
- Modify: `app/Models/User.php` (relation)
- Modify: `routes/api.php`

- [ ] **Étape 1 : Écrire les tests**

```php
<?php
// tests/Feature/Api/ClientContactTest.php

namespace Tests\Feature\Api;

use App\Models\ClientContact;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClientContactTest extends TestCase
{
    use RefreshDatabase;

    public function test_client_can_list_own_contacts(): void
    {
        $user = User::factory()->create(['role' => 'client']);
        ClientContact::factory(3)->create(['user_id' => $user->id]);
        $other = User::factory()->create(['role' => 'client']);
        ClientContact::factory(2)->create(['user_id' => $other->id]);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/contacts')
            ->assertOk()
            ->assertJsonPath('meta.total', 3);
    }

    public function test_client_can_create_contact(): void
    {
        $user = User::factory()->create(['role' => 'client']);

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/contacts', [
                'name'    => 'Koffi Martin',
                'phone'   => '+22996000001',
                'company' => 'Boutique Koffi',
            ])
            ->assertCreated()
            ->assertJsonPath('name', 'Koffi Martin');
    }

    public function test_client_cannot_view_other_users_contact(): void
    {
        $user  = User::factory()->create(['role' => 'client']);
        $other = User::factory()->create(['role' => 'client']);
        $contact = ClientContact::factory()->create(['user_id' => $other->id]);

        $this->actingAs($user, 'sanctum')
            ->getJson("/api/contacts/{$contact->id}")
            ->assertForbidden();
    }

    public function test_client_can_update_own_contact(): void
    {
        $user    = User::factory()->create(['role' => 'client']);
        $contact = ClientContact::factory()->create(['user_id' => $user->id, 'name' => 'Avant']);

        $this->actingAs($user, 'sanctum')
            ->putJson("/api/contacts/{$contact->id}", ['name' => 'Après'])
            ->assertOk()
            ->assertJsonPath('name', 'Après');
    }

    public function test_client_can_delete_own_contact(): void
    {
        $user    = User::factory()->create(['role' => 'client']);
        $contact = ClientContact::factory()->create(['user_id' => $user->id]);

        $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/contacts/{$contact->id}")
            ->assertNoContent();
    }

    public function test_unauthenticated_cannot_access_contacts(): void
    {
        $this->getJson('/api/contacts')->assertUnauthorized();
    }

    public function test_name_is_required(): void
    {
        $user = User::factory()->create(['role' => 'client']);

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/contacts', ['phone' => '+22996000001'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name']);
    }
}
```

- [ ] **Étape 2 : Lancer pour confirmer l'échec**

```bash
cd backend && php artisan test tests/Feature/Api/ClientContactTest.php
```
Expected: FAIL.

- [ ] **Étape 3 : Créer la migration**

```php
<?php
// database/migrations/xxxx_create_client_contacts_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('client_contacts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name', 150);
            $table->string('company', 150)->nullable();
            $table->string('phone', 30)->nullable();
            $table->string('whatsapp', 30)->nullable();
            $table->string('email', 150)->nullable();
            $table->text('notes')->nullable();
            $table->date('acquired_at')->nullable();
            $table->timestamps();

            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('client_contacts');
    }
};
```

- [ ] **Étape 4 : Créer le modèle**

```php
<?php
// app/Models/ClientContact.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClientContact extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'name', 'company', 'phone', 'whatsapp',
        'email', 'notes', 'acquired_at',
    ];

    protected $casts = [
        'acquired_at' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
```

- [ ] **Étape 5 : Créer la factory**

```php
<?php
// database/factories/ClientContactFactory.php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ClientContactFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id'     => User::factory(),
            'name'        => $this->faker->name(),
            'company'     => $this->faker->optional()->company(),
            'phone'       => $this->faker->optional()->phoneNumber(),
            'whatsapp'    => null,
            'email'       => $this->faker->optional()->safeEmail(),
            'notes'       => null,
            'acquired_at' => $this->faker->optional()->date(),
        ];
    }
}
```

- [ ] **Étape 6 : Créer la Policy**

```php
<?php
// app/Policies/ClientContactPolicy.php

namespace App\Policies;

use App\Models\ClientContact;
use App\Models\User;

class ClientContactPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, ClientContact $contact): bool
    {
        return $contact->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, ClientContact $contact): bool
    {
        return $contact->user_id === $user->id;
    }

    public function delete(User $user, ClientContact $contact): bool
    {
        return $contact->user_id === $user->id;
    }
}
```

- [ ] **Étape 7 : Créer les FormRequests**

```php
<?php
// app/Http/Requests/Api/StoreClientContactRequest.php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class StoreClientContactRequest extends FormRequest
{
    public function authorize(): bool { return $this->user() !== null; }

    public function rules(): array
    {
        return [
            'name'        => ['required', 'string', 'max:150'],
            'company'     => ['nullable', 'string', 'max:150'],
            'phone'       => ['nullable', 'string', 'max:30'],
            'whatsapp'    => ['nullable', 'string', 'max:30'],
            'email'       => ['nullable', 'email', 'max:150'],
            'notes'       => ['nullable', 'string', 'max:1000'],
            'acquired_at' => ['nullable', 'date'],
        ];
    }
}
```

```php
<?php
// app/Http/Requests/Api/UpdateClientContactRequest.php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class UpdateClientContactRequest extends FormRequest
{
    public function authorize(): bool { return $this->user() !== null; }

    public function rules(): array
    {
        return [
            'name'        => ['required', 'string', 'max:150'],
            'company'     => ['nullable', 'string', 'max:150'],
            'phone'       => ['nullable', 'string', 'max:30'],
            'whatsapp'    => ['nullable', 'string', 'max:30'],
            'email'       => ['nullable', 'email', 'max:150'],
            'notes'       => ['nullable', 'string', 'max:1000'],
            'acquired_at' => ['nullable', 'date'],
        ];
    }
}
```

- [ ] **Étape 8 : Créer le controller**

```php
<?php
// app/Http/Controllers/Api/ClientContactController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreClientContactRequest;
use App\Http\Requests\Api\UpdateClientContactRequest;
use App\Models\ClientContact;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClientContactController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', ClientContact::class);

        $contacts = ClientContact::where('user_id', $request->user()->id)
            ->orderBy('name')
            ->paginate(20);

        return response()->json([
            'data' => $contacts->getCollection()
                ->map(fn (ClientContact $c) => $this->transform($c))
                ->values(),
            'meta' => [
                'current_page' => $contacts->currentPage(),
                'last_page'    => $contacts->lastPage(),
                'per_page'     => $contacts->perPage(),
                'total'        => $contacts->total(),
            ],
        ]);
    }

    public function store(StoreClientContactRequest $request): JsonResponse
    {
        $contact = ClientContact::create([
            ...$request->validated(),
            'user_id' => $request->user()->id,
        ]);

        return response()->json($this->transform($contact), 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $contact = ClientContact::findOrFail($id);
        $this->authorize('view', $contact);

        return response()->json($this->transform($contact));
    }

    public function update(UpdateClientContactRequest $request, int $id): JsonResponse
    {
        $contact = ClientContact::findOrFail($id);
        $this->authorize('update', $contact);

        $contact->update($request->validated());

        return response()->json($this->transform($contact->fresh()));
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $contact = ClientContact::findOrFail($id);
        $this->authorize('delete', $contact);

        $contact->delete();

        return response()->json(null, 204);
    }

    private function transform(ClientContact $contact): array
    {
        return [
            'id'          => $contact->id,
            'name'        => $contact->name,
            'company'     => $contact->company,
            'phone'       => $contact->phone,
            'whatsapp'    => $contact->whatsapp,
            'email'       => $contact->email,
            'notes'       => $contact->notes,
            'acquired_at' => $contact->acquired_at?->toDateString(),
        ];
    }
}
```

- [ ] **Étape 9 : Ajouter les routes API**

Dans `routes/api.php`, dans le groupe auth:sanctum, ajouter :
```php
Route::apiResource('contacts', ClientContactController::class);
```

Et l'import en haut du fichier :
```php
use App\Http\Controllers\Api\ClientContactController;
```

- [ ] **Étape 10 : Ajouter la relation dans User.php**

```php
public function clientContacts(): HasMany
{
    return $this->hasMany(ClientContact::class);
}
```

- [ ] **Étape 11 : Migrer et tester**

```bash
cd backend && php artisan migrate && php artisan test tests/Feature/Api/ClientContactTest.php
```
Expected: 7 tests PASS.

- [ ] **Étape 12 : Commit**

```bash
git add database/migrations/ app/Models/ClientContact.php app/Models/User.php \
    app/Policies/ClientContactPolicy.php \
    app/Http/Requests/Api/StoreClientContactRequest.php \
    app/Http/Requests/Api/UpdateClientContactRequest.php \
    app/Http/Controllers/Api/ClientContactController.php \
    database/factories/ClientContactFactory.php \
    routes/api.php tests/Feature/Api/ClientContactTest.php
git commit -m "feat(api): CRUD contacts clients (Mes Clients)"
```

---

## Task 3 — Backend : Ma Caisse (journal de caisse)

**Files:**
- Create: `app/Enums/CashEntryType.php`
- Create: `database/migrations/xxxx_create_cash_entries_table.php`
- Create: `app/Models/CashEntry.php`
- Create: `app/Policies/CashEntryPolicy.php`
- Create: `app/Http/Requests/Api/StoreCashEntryRequest.php`
- Create: `app/Http/Requests/Api/UpdateCashEntryRequest.php`
- Create: `app/Http/Controllers/Api/CashEntryController.php`
- Create: `database/factories/CashEntryFactory.php`
- Create: `tests/Feature/Api/CashEntryTest.php`
- Modify: `app/Models/User.php` (relation)
- Modify: `routes/api.php`

- [ ] **Étape 1 : Écrire les tests**

```php
<?php
// tests/Feature/Api/CashEntryTest.php

namespace Tests\Feature\Api;

use App\Models\CashEntry;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CashEntryTest extends TestCase
{
    use RefreshDatabase;

    public function test_client_can_list_entries_by_month(): void
    {
        $user = User::factory()->create(['role' => 'client']);
        CashEntry::factory(3)->create(['user_id' => $user->id, 'entry_date' => '2026-06-10']);
        CashEntry::factory(2)->create(['user_id' => $user->id, 'entry_date' => '2026-05-10']);
        $other = User::factory()->create(['role' => 'client']);
        CashEntry::factory()->create(['user_id' => $other->id, 'entry_date' => '2026-06-10']);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/cash?month=2026-06')
            ->assertOk()
            ->assertJsonPath('meta.total', 3);
    }

    public function test_summary_returns_correct_totals(): void
    {
        $user = User::factory()->create(['role' => 'client']);
        CashEntry::factory()->create(['user_id' => $user->id, 'type' => 'income',  'amount' => 50000, 'entry_date' => '2026-06-01']);
        CashEntry::factory()->create(['user_id' => $user->id, 'type' => 'income',  'amount' => 30000, 'entry_date' => '2026-06-15']);
        CashEntry::factory()->create(['user_id' => $user->id, 'type' => 'expense', 'amount' => 20000, 'entry_date' => '2026-06-10']);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/cash/summary?month=2026-06')
            ->assertOk()
            ->assertJsonPath('income',   80000)
            ->assertJsonPath('expenses', 20000)
            ->assertJsonPath('balance',  60000);
    }

    public function test_client_can_create_entry(): void
    {
        $user = User::factory()->create(['role' => 'client']);

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/cash', [
                'type'       => 'income',
                'amount'     => 15000,
                'label'      => 'Vente chemise',
                'entry_date' => '2026-06-14',
            ])
            ->assertCreated()
            ->assertJsonPath('amount', 15000)
            ->assertJsonPath('type', 'income');
    }

    public function test_client_cannot_update_other_users_entry(): void
    {
        $user  = User::factory()->create(['role' => 'client']);
        $other = User::factory()->create(['role' => 'client']);
        $entry = CashEntry::factory()->create(['user_id' => $other->id]);

        $this->actingAs($user, 'sanctum')
            ->putJson("/api/cash/{$entry->id}", ['label' => 'Hack', 'type' => 'income', 'amount' => 1, 'entry_date' => '2026-06-01'])
            ->assertForbidden();
    }

    public function test_client_can_delete_own_entry(): void
    {
        $user  = User::factory()->create(['role' => 'client']);
        $entry = CashEntry::factory()->create(['user_id' => $user->id]);

        $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/cash/{$entry->id}")
            ->assertNoContent();
    }

    public function test_amount_must_be_positive_integer(): void
    {
        $user = User::factory()->create(['role' => 'client']);

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/cash', [
                'type'       => 'income',
                'amount'     => -500,
                'label'      => 'Test',
                'entry_date' => '2026-06-14',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['amount']);
    }
}
```

- [ ] **Étape 2 : Lancer pour confirmer l'échec**

```bash
cd backend && php artisan test tests/Feature/Api/CashEntryTest.php
```
Expected: FAIL.

- [ ] **Étape 3 : Créer l'Enum**

```php
<?php
// app/Enums/CashEntryType.php

namespace App\Enums;

enum CashEntryType: string
{
    case Income  = 'income';
    case Expense = 'expense';
}
```

- [ ] **Étape 4 : Créer la migration**

```php
<?php
// database/migrations/xxxx_create_cash_entries_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cash_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type', 20);
            $table->unsignedInteger('amount');
            $table->string('label', 200);
            $table->date('entry_date');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'entry_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cash_entries');
    }
};
```

- [ ] **Étape 5 : Créer le modèle**

```php
<?php
// app/Models/CashEntry.php

namespace App\Models;

use App\Enums\CashEntryType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CashEntry extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'type', 'amount', 'label', 'entry_date', 'notes',
    ];

    protected $casts = [
        'type'       => CashEntryType::class,
        'amount'     => 'integer',
        'entry_date' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
```

- [ ] **Étape 6 : Créer la factory**

```php
<?php
// database/factories/CashEntryFactory.php

namespace Database\Factories;

use App\Enums\CashEntryType;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CashEntryFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id'    => User::factory(),
            'type'       => $this->faker->randomElement(CashEntryType::cases())->value,
            'amount'     => $this->faker->numberBetween(1000, 200000),
            'label'      => $this->faker->sentence(3),
            'entry_date' => $this->faker->dateThisMonth(),
            'notes'      => null,
        ];
    }
}
```

- [ ] **Étape 7 : Créer la Policy**

```php
<?php
// app/Policies/CashEntryPolicy.php

namespace App\Policies;

use App\Models\CashEntry;
use App\Models\User;

class CashEntryPolicy
{
    public function viewAny(User $user): bool { return true; }
    public function create(User $user): bool  { return true; }

    public function update(User $user, CashEntry $entry): bool
    {
        return $entry->user_id === $user->id;
    }

    public function delete(User $user, CashEntry $entry): bool
    {
        return $entry->user_id === $user->id;
    }
}
```

- [ ] **Étape 8 : Créer les FormRequests**

```php
<?php
// app/Http/Requests/Api/StoreCashEntryRequest.php

namespace App\Http\Requests\Api;

use App\Enums\CashEntryType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCashEntryRequest extends FormRequest
{
    public function authorize(): bool { return $this->user() !== null; }

    public function rules(): array
    {
        return [
            'type'       => ['required', Rule::enum(CashEntryType::class)],
            'amount'     => ['required', 'integer', 'min:1'],
            'label'      => ['required', 'string', 'max:200'],
            'entry_date' => ['required', 'date'],
            'notes'      => ['nullable', 'string', 'max:500'],
        ];
    }
}
```

```php
<?php
// app/Http/Requests/Api/UpdateCashEntryRequest.php

namespace App\Http\Requests\Api;

use App\Enums\CashEntryType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCashEntryRequest extends FormRequest
{
    public function authorize(): bool { return $this->user() !== null; }

    public function rules(): array
    {
        return [
            'type'       => ['required', Rule::enum(CashEntryType::class)],
            'amount'     => ['required', 'integer', 'min:1'],
            'label'      => ['required', 'string', 'max:200'],
            'entry_date' => ['required', 'date'],
            'notes'      => ['nullable', 'string', 'max:500'],
        ];
    }
}
```

- [ ] **Étape 9 : Créer le controller**

```php
<?php
// app/Http/Controllers/Api/CashEntryController.php

namespace App\Http\Controllers\Api;

use App\Enums\CashEntryType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreCashEntryRequest;
use App\Http\Requests\Api\UpdateCashEntryRequest;
use App\Models\CashEntry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CashEntryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', CashEntry::class);

        $month  = $request->get('month', now()->format('Y-m'));
        [$year, $m] = explode('-', $month);

        $entries = CashEntry::where('user_id', $request->user()->id)
            ->whereYear('entry_date', (int) $year)
            ->whereMonth('entry_date', (int) $m)
            ->orderBy('entry_date', 'desc')
            ->paginate(50);

        return response()->json([
            'data' => $entries->getCollection()
                ->map(fn (CashEntry $e) => $this->transform($e))
                ->values(),
            'meta' => [
                'current_page' => $entries->currentPage(),
                'last_page'    => $entries->lastPage(),
                'per_page'     => $entries->perPage(),
                'total'        => $entries->total(),
            ],
        ]);
    }

    public function summary(Request $request): JsonResponse
    {
        $this->authorize('viewAny', CashEntry::class);

        $month  = $request->get('month', now()->format('Y-m'));
        [$year, $m] = explode('-', $month);

        $rows = CashEntry::where('user_id', $request->user()->id)
            ->whereYear('entry_date', (int) $year)
            ->whereMonth('entry_date', (int) $m)
            ->selectRaw('type, SUM(amount) as total')
            ->groupBy('type')
            ->pluck('total', 'type');

        $income   = (int) ($rows[CashEntryType::Income->value]  ?? 0);
        $expenses = (int) ($rows[CashEntryType::Expense->value] ?? 0);

        return response()->json([
            'month'    => $month,
            'income'   => $income,
            'expenses' => $expenses,
            'balance'  => $income - $expenses,
        ]);
    }

    public function store(StoreCashEntryRequest $request): JsonResponse
    {
        $entry = CashEntry::create([
            ...$request->validated(),
            'user_id' => $request->user()->id,
        ]);

        return response()->json($this->transform($entry), 201);
    }

    public function update(UpdateCashEntryRequest $request, int $id): JsonResponse
    {
        $entry = CashEntry::findOrFail($id);
        $this->authorize('update', $entry);

        $entry->update($request->validated());

        return response()->json($this->transform($entry->fresh()));
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $entry = CashEntry::findOrFail($id);
        $this->authorize('delete', $entry);

        $entry->delete();

        return response()->json(null, 204);
    }

    private function transform(CashEntry $entry): array
    {
        return [
            'id'         => $entry->id,
            'type'       => $entry->type->value,
            'amount'     => $entry->amount,
            'label'      => $entry->label,
            'entry_date' => $entry->entry_date->toDateString(),
            'notes'      => $entry->notes,
        ];
    }
}
```

- [ ] **Étape 10 : Ajouter les routes API**

Dans `routes/api.php`, dans le groupe auth:sanctum :
```php
// Ma Caisse — summary doit être avant apiResource pour ne pas être capturée par {cash}
Route::get('cash/summary', [CashEntryController::class, 'summary']);
Route::apiResource('cash', CashEntryController::class)->except(['show']);
```

Imports à ajouter :
```php
use App\Http\Controllers\Api\CashEntryController;
```

- [ ] **Étape 11 : Ajouter la relation dans User.php**

```php
public function cashEntries(): HasMany
{
    return $this->hasMany(CashEntry::class);
}
```

- [ ] **Étape 12 : Migrer et tester**

```bash
cd backend && php artisan migrate && php artisan test tests/Feature/Api/CashEntryTest.php
```
Expected: 6 tests PASS.

- [ ] **Étape 13 : Commit**

```bash
git add database/migrations/ app/Enums/CashEntryType.php app/Models/CashEntry.php \
    app/Models/User.php app/Policies/CashEntryPolicy.php \
    app/Http/Requests/Api/StoreCashEntryRequest.php \
    app/Http/Requests/Api/UpdateCashEntryRequest.php \
    app/Http/Controllers/Api/CashEntryController.php \
    database/factories/CashEntryFactory.php \
    routes/api.php tests/Feature/Api/CashEntryTest.php
git commit -m "feat(api): journal de caisse simplifié (Ma Caisse)"
```

---

## Task 4 — Backend : Mes Échéances (deadlines système + perso)

**Files:**
- Create: `database/migrations/xxxx_create_deadlines_table.php`
- Create: `app/Models/Deadline.php`
- Create: `app/Policies/DeadlinePolicy.php`
- Create: `app/Http/Requests/Api/StoreDeadlineRequest.php`
- Create: `app/Http/Requests/Api/UpdateDeadlineRequest.php`
- Create: `app/Http/Controllers/Api/DeadlineController.php`
- Create: `app/Http/Controllers/Admin/DeadlineController.php`
- Create: `resources/views/admin/deadlines/index.blade.php`
- Create: `resources/views/admin/deadlines/create.blade.php`
- Create: `resources/views/admin/deadlines/edit.blade.php`
- Create: `database/factories/DeadlineFactory.php`
- Create: `tests/Feature/Api/DeadlineTest.php`
- Modify: `app/Models/User.php`
- Modify: `routes/api.php`
- Modify: `routes/web.php`

- [ ] **Étape 1 : Écrire les tests**

```php
<?php
// tests/Feature/Api/DeadlineTest.php

namespace Tests\Feature\Api;

use App\Models\Deadline;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DeadlineTest extends TestCase
{
    use RefreshDatabase;

    public function test_client_sees_system_deadlines_and_own_personal(): void
    {
        $user  = User::factory()->create(['role' => 'client']);
        $other = User::factory()->create(['role' => 'client']);

        Deadline::factory()->create(['is_system' => true,  'user_id' => null]);
        Deadline::factory()->create(['is_system' => false, 'user_id' => $user->id]);
        Deadline::factory()->create(['is_system' => false, 'user_id' => $other->id]);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/deadlines')
            ->assertOk()
            ->assertJsonCount(2);
    }

    public function test_client_can_create_personal_deadline(): void
    {
        $user = User::factory()->create(['role' => 'client']);

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/deadlines', [
                'title'    => 'Déclaration TVA',
                'due_date' => '2026-07-15',
            ])
            ->assertCreated()
            ->assertJsonPath('title', 'Déclaration TVA')
            ->assertJsonPath('is_system', false);
    }

    public function test_client_cannot_update_system_deadline(): void
    {
        $user     = User::factory()->create(['role' => 'client']);
        $deadline = Deadline::factory()->create(['is_system' => true, 'user_id' => null]);

        $this->actingAs($user, 'sanctum')
            ->putJson("/api/deadlines/{$deadline->id}", [
                'title'    => 'Hacked',
                'due_date' => '2026-01-01',
            ])
            ->assertForbidden();
    }

    public function test_client_cannot_delete_system_deadline(): void
    {
        $user     = User::factory()->create(['role' => 'client']);
        $deadline = Deadline::factory()->create(['is_system' => true, 'user_id' => null]);

        $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/deadlines/{$deadline->id}")
            ->assertForbidden();
    }

    public function test_client_can_delete_own_personal_deadline(): void
    {
        $user     = User::factory()->create(['role' => 'client']);
        $deadline = Deadline::factory()->create(['is_system' => false, 'user_id' => $user->id]);

        $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/deadlines/{$deadline->id}")
            ->assertNoContent();
    }

    public function test_deadline_includes_days_remaining(): void
    {
        $user = User::factory()->create(['role' => 'client']);
        Deadline::factory()->create([
            'is_system' => true,
            'user_id'   => null,
            'due_date'  => now()->addDays(5)->toDateString(),
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/deadlines')
            ->assertOk();

        $this->assertArrayHasKey('days_remaining', $response->json()[0]);
    }
}
```

- [ ] **Étape 2 : Lancer pour confirmer l'échec**

```bash
cd backend && php artisan test tests/Feature/Api/DeadlineTest.php
```
Expected: FAIL.

- [ ] **Étape 3 : Créer la migration**

```php
<?php
// database/migrations/xxxx_create_deadlines_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('deadlines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title', 200);
            $table->text('description')->nullable();
            $table->date('due_date');
            $table->boolean('is_system')->default(false);
            $table->timestamps();

            $table->index('due_date');
            $table->index(['user_id', 'due_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deadlines');
    }
};
```

- [ ] **Étape 4 : Créer le modèle**

```php
<?php
// app/Models/Deadline.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Deadline extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'title', 'description', 'due_date', 'is_system'];

    protected $casts = [
        'due_date'  => 'date',
        'is_system' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getDaysRemainingAttribute(): int
    {
        return (int) now()->startOfDay()->diffInDays(
            $this->due_date->copy()->startOfDay(),
            false
        );
    }
}
```

- [ ] **Étape 5 : Créer la factory**

```php
<?php
// database/factories/DeadlineFactory.php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class DeadlineFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id'     => null,
            'title'       => $this->faker->sentence(3),
            'description' => $this->faker->optional()->sentence(),
            'due_date'    => $this->faker->dateTimeBetween('now', '+6 months')->format('Y-m-d'),
            'is_system'   => false,
        ];
    }
}
```

- [ ] **Étape 6 : Créer la Policy**

```php
<?php
// app/Policies/DeadlinePolicy.php

namespace App\Policies;

use App\Models\Deadline;
use App\Models\User;

class DeadlinePolicy
{
    public function viewAny(User $user): bool { return true; }
    public function create(User $user): bool  { return true; }

    public function update(User $user, Deadline $deadline): bool
    {
        return ! $deadline->is_system && $deadline->user_id === $user->id;
    }

    public function delete(User $user, Deadline $deadline): bool
    {
        return ! $deadline->is_system && $deadline->user_id === $user->id;
    }
}
```

- [ ] **Étape 7 : Créer les FormRequests**

```php
<?php
// app/Http/Requests/Api/StoreDeadlineRequest.php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class StoreDeadlineRequest extends FormRequest
{
    public function authorize(): bool { return $this->user() !== null; }

    public function rules(): array
    {
        return [
            'title'       => ['required', 'string', 'max:200'],
            'description' => ['nullable', 'string', 'max:1000'],
            'due_date'    => ['required', 'date'],
        ];
    }
}
```

```php
<?php
// app/Http/Requests/Api/UpdateDeadlineRequest.php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDeadlineRequest extends FormRequest
{
    public function authorize(): bool { return $this->user() !== null; }

    public function rules(): array
    {
        return [
            'title'       => ['required', 'string', 'max:200'],
            'description' => ['nullable', 'string', 'max:1000'],
            'due_date'    => ['required', 'date'],
        ];
    }
}
```

- [ ] **Étape 8 : Créer le controller API**

```php
<?php
// app/Http/Controllers/Api/DeadlineController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreDeadlineRequest;
use App\Http\Requests\Api\UpdateDeadlineRequest;
use App\Models\Deadline;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeadlineController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Deadline::class);

        $deadlines = Deadline::where(function ($q) use ($request) {
            $q->where('is_system', true)
              ->orWhere('user_id', $request->user()->id);
        })
        ->orderBy('due_date')
        ->get();

        return response()->json(
            $deadlines->map(fn (Deadline $d) => $this->transform($d))->values()
        );
    }

    public function store(StoreDeadlineRequest $request): JsonResponse
    {
        $deadline = Deadline::create([
            ...$request->validated(),
            'user_id'   => $request->user()->id,
            'is_system' => false,
        ]);

        return response()->json($this->transform($deadline), 201);
    }

    public function update(UpdateDeadlineRequest $request, int $id): JsonResponse
    {
        $deadline = Deadline::findOrFail($id);
        $this->authorize('update', $deadline);

        $deadline->update($request->validated());

        return response()->json($this->transform($deadline->fresh()));
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $deadline = Deadline::findOrFail($id);
        $this->authorize('delete', $deadline);

        $deadline->delete();

        return response()->json(null, 204);
    }

    private function transform(Deadline $deadline): array
    {
        return [
            'id'             => $deadline->id,
            'title'          => $deadline->title,
            'description'    => $deadline->description,
            'due_date'       => $deadline->due_date->toDateString(),
            'is_system'      => $deadline->is_system,
            'days_remaining' => $deadline->days_remaining,
        ];
    }
}
```

- [ ] **Étape 9 : Créer le controller Admin**

```php
<?php
// app/Http/Controllers/Admin/DeadlineController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Deadline;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class DeadlineController extends Controller
{
    public function index(): View
    {
        $deadlines = Deadline::where('is_system', true)
            ->orderBy('due_date')
            ->get();

        return view('admin.deadlines.index', compact('deadlines'));
    }

    public function create(): View
    {
        return view('admin.deadlines.create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title'       => ['required', 'string', 'max:200'],
            'description' => ['nullable', 'string', 'max:1000'],
            'due_date'    => ['required', 'date'],
        ]);

        Deadline::create([...$validated, 'is_system' => true, 'user_id' => null]);

        return redirect()->route('admin.deadlines.index')
            ->with('success', 'Échéance créée.');
    }

    public function edit(Deadline $deadline): View
    {
        abort_unless($deadline->is_system, 404);

        return view('admin.deadlines.edit', compact('deadline'));
    }

    public function update(Request $request, Deadline $deadline): RedirectResponse
    {
        abort_unless($deadline->is_system, 403);

        $validated = $request->validate([
            'title'       => ['required', 'string', 'max:200'],
            'description' => ['nullable', 'string', 'max:1000'],
            'due_date'    => ['required', 'date'],
        ]);

        $deadline->update($validated);

        return redirect()->route('admin.deadlines.index')
            ->with('success', 'Échéance mise à jour.');
    }

    public function destroy(Deadline $deadline): RedirectResponse
    {
        abort_unless($deadline->is_system, 403);

        $deadline->delete();

        return redirect()->route('admin.deadlines.index')
            ->with('success', 'Échéance supprimée.');
    }
}
```

- [ ] **Étape 10 : Créer les vues admin**

```blade
{{-- resources/views/admin/deadlines/index.blade.php --}}
@extends('layouts.master')
@section('title') Échéances système @endsection
@section('content')
<div class="row">
    <div class="col-12">
        <div class="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 class="mb-sm-0">Échéances système</h4>
            <a href="{{ route('admin.deadlines.create') }}" class="btn btn-primary btn-sm">
                <i class="ri-add-line me-1"></i> Nouvelle échéance
            </a>
        </div>
    </div>
</div>
@if(session('success'))
    <div class="alert alert-success alert-dismissible fade show">
        {{ session('success') }}<button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
@endif
<div class="card">
    <div class="card-body p-0">
        <table class="table table-hover mb-0">
            <thead class="table-light">
                <tr><th>Titre</th><th>Échéance</th><th>Actions</th></tr>
            </thead>
            <tbody>
                @forelse($deadlines as $d)
                <tr>
                    <td>{{ $d->title }}</td>
                    <td>{{ $d->due_date->format('d/m/Y') }}</td>
                    <td>
                        <a href="{{ route('admin.deadlines.edit', $d) }}" class="btn btn-soft-secondary btn-xs me-1">Modifier</a>
                        <form action="{{ route('admin.deadlines.destroy', $d) }}" method="POST" class="d-inline"
                              onsubmit="return confirm('Supprimer cette échéance ?')">
                            @csrf @method('DELETE')
                            <button class="btn btn-soft-danger btn-xs">Supprimer</button>
                        </form>
                    </td>
                </tr>
                @empty
                <tr><td colspan="3" class="text-center text-muted py-4">Aucune échéance système.</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>
@endsection
```

```blade
{{-- resources/views/admin/deadlines/create.blade.php --}}
@extends('layouts.master')
@section('title') Nouvelle échéance @endsection
@section('content')
<div class="row justify-content-center">
    <div class="col-lg-6">
        <div class="card">
            <div class="card-header"><h5 class="card-title mb-0">Nouvelle échéance système</h5></div>
            <div class="card-body">
                <form action="{{ route('admin.deadlines.store') }}" method="POST">
                    @csrf
                    <div class="mb-3">
                        <label class="form-label">Titre <span class="text-danger">*</span></label>
                        <input type="text" name="title" class="form-control @error('title') is-invalid @enderror"
                            value="{{ old('title') }}" required>
                        @error('title')<div class="invalid-feedback">{{ $message }}</div>@enderror
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Description</label>
                        <textarea name="description" class="form-control" rows="3">{{ old('description') }}</textarea>
                    </div>
                    <div class="mb-4">
                        <label class="form-label">Date d'échéance <span class="text-danger">*</span></label>
                        <input type="date" name="due_date" class="form-control @error('due_date') is-invalid @enderror"
                            value="{{ old('due_date') }}" required>
                        @error('due_date')<div class="invalid-feedback">{{ $message }}</div>@enderror
                    </div>
                    <div class="d-flex gap-2">
                        <button type="submit" class="btn btn-primary">Créer</button>
                        <a href="{{ route('admin.deadlines.index') }}" class="btn btn-soft-secondary">Annuler</a>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection
```

```blade
{{-- resources/views/admin/deadlines/edit.blade.php --}}
@extends('layouts.master')
@section('title') Modifier l'échéance @endsection
@section('content')
<div class="row justify-content-center">
    <div class="col-lg-6">
        <div class="card">
            <div class="card-header"><h5 class="card-title mb-0">Modifier l'échéance</h5></div>
            <div class="card-body">
                <form action="{{ route('admin.deadlines.update', $deadline) }}" method="POST">
                    @csrf @method('PUT')
                    <div class="mb-3">
                        <label class="form-label">Titre <span class="text-danger">*</span></label>
                        <input type="text" name="title" class="form-control @error('title') is-invalid @enderror"
                            value="{{ old('title', $deadline->title) }}" required>
                        @error('title')<div class="invalid-feedback">{{ $message }}</div>@enderror
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Description</label>
                        <textarea name="description" class="form-control" rows="3">{{ old('description', $deadline->description) }}</textarea>
                    </div>
                    <div class="mb-4">
                        <label class="form-label">Date d'échéance <span class="text-danger">*</span></label>
                        <input type="date" name="due_date" class="form-control @error('due_date') is-invalid @enderror"
                            value="{{ old('due_date', $deadline->due_date->format('Y-m-d')) }}" required>
                        @error('due_date')<div class="invalid-feedback">{{ $message }}</div>@enderror
                    </div>
                    <div class="d-flex gap-2">
                        <button type="submit" class="btn btn-primary">Enregistrer</button>
                        <a href="{{ route('admin.deadlines.index') }}" class="btn btn-soft-secondary">Annuler</a>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection
```

- [ ] **Étape 11 : Ajouter les routes**

Dans `routes/api.php`, groupe auth:sanctum :
```php
Route::apiResource('deadlines', DeadlineController::class)->except(['show']);
```

Import : `use App\Http\Controllers\Api\DeadlineController;`

Dans `routes/web.php`, groupe admin :
```php
Route::resource('deadlines', AdminDeadlineController::class)->except(['show']);
```

Import : `use App\Http\Controllers\Admin\DeadlineController as AdminDeadlineController;`

- [ ] **Étape 12 : Ajouter la relation dans User.php**

```php
public function deadlines(): HasMany
{
    return $this->hasMany(Deadline::class);
}
```

- [ ] **Étape 13 : Migrer et tester**

```bash
cd backend && php artisan migrate && php artisan test tests/Feature/Api/DeadlineTest.php
```
Expected: 6 tests PASS.

- [ ] **Étape 14 : Lancer la suite complète**

```bash
cd backend && php artisan test
```
Expected: tous les tests PASS (zéro régression).

- [ ] **Étape 15 : Commit**

```bash
git add database/migrations/ app/Models/Deadline.php app/Models/User.php \
    app/Policies/DeadlinePolicy.php \
    app/Http/Requests/Api/StoreDeadlineRequest.php \
    app/Http/Requests/Api/UpdateDeadlineRequest.php \
    app/Http/Controllers/Api/DeadlineController.php \
    app/Http/Controllers/Admin/DeadlineController.php \
    resources/views/admin/deadlines/ \
    database/factories/DeadlineFactory.php \
    routes/api.php routes/web.php \
    tests/Feature/Api/DeadlineTest.php
git commit -m "feat(api,admin): échéances système et personnelles (Mes Échéances)"
```

---

## Task 5 — Frontend : Services & Types

**Files:**
- Modify: `frontend/services/business.service.ts`
- Create: `frontend/services/contacts.service.ts`
- Create: `frontend/services/cash.service.ts`
- Create: `frontend/services/deadlines.service.ts`

- [ ] **Étape 1 : Étendre Order dans business.service.ts**

Dans l'interface `Order`, ajouter après `feedback_submitted_at` :
```typescript
site_url: string | null;
domain: string | null;
hosting_expires_at: string | null;
```

- [ ] **Étape 2 : Créer contacts.service.ts**

```typescript
// frontend/services/contacts.service.ts
import api from '@/services/api';

export interface ClientContact {
  id: number;
  name: string;
  company: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  notes: string | null;
  acquired_at: string | null;
}

export interface ContactsPayload {
  name: string;
  company?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  notes?: string;
  acquired_at?: string;
}

export interface ContactsResponse {
  data: ClientContact[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
}

export const contactsService = {
  async list(page = 1): Promise<ContactsResponse> {
    const { data } = await api.get<ContactsResponse>(`/contacts?page=${page}`);
    return data;
  },

  async create(payload: ContactsPayload): Promise<ClientContact> {
    const { data } = await api.post<ClientContact>('/contacts', payload);
    return data;
  },

  async update(id: number, payload: ContactsPayload): Promise<ClientContact> {
    const { data } = await api.put<ClientContact>(`/contacts/${id}`, payload);
    return data;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/contacts/${id}`);
  },
};
```

- [ ] **Étape 3 : Créer cash.service.ts**

```typescript
// frontend/services/cash.service.ts
import api from '@/services/api';

export interface CashEntry {
  id: number;
  type: 'income' | 'expense';
  amount: number;
  label: string;
  entry_date: string;
  notes: string | null;
}

export interface CashEntryPayload {
  type: 'income' | 'expense';
  amount: number;
  label: string;
  entry_date: string;
  notes?: string;
}

export interface CashSummary {
  month: string;
  income: number;
  expenses: number;
  balance: number;
}

export interface CashEntriesResponse {
  data: CashEntry[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
}

export const cashService = {
  async list(month: string, page = 1): Promise<CashEntriesResponse> {
    const { data } = await api.get<CashEntriesResponse>(`/cash?month=${month}&page=${page}`);
    return data;
  },

  async summary(month: string): Promise<CashSummary> {
    const { data } = await api.get<CashSummary>(`/cash/summary?month=${month}`);
    return data;
  },

  async create(payload: CashEntryPayload): Promise<CashEntry> {
    const { data } = await api.post<CashEntry>('/cash', payload);
    return data;
  },

  async update(id: number, payload: CashEntryPayload): Promise<CashEntry> {
    const { data } = await api.put<CashEntry>(`/cash/${id}`, payload);
    return data;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/cash/${id}`);
  },
};
```

- [ ] **Étape 4 : Créer deadlines.service.ts**

```typescript
// frontend/services/deadlines.service.ts
import api from '@/services/api';

export interface Deadline {
  id: number;
  title: string;
  description: string | null;
  due_date: string;
  is_system: boolean;
  days_remaining: number;
}

export interface DeadlinePayload {
  title: string;
  description?: string;
  due_date: string;
}

export const deadlinesService = {
  async list(): Promise<Deadline[]> {
    const { data } = await api.get<Deadline[]>('/deadlines');
    return data;
  },

  async create(payload: DeadlinePayload): Promise<Deadline> {
    const { data } = await api.post<Deadline>('/deadlines', payload);
    return data;
  },

  async update(id: number, payload: DeadlinePayload): Promise<Deadline> {
    const { data } = await api.put<Deadline>(`/deadlines/${id}`, payload);
    return data;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/deadlines/${id}`);
  },
};
```

- [ ] **Étape 5 : Vérifier la compilation TypeScript**

```bash
cd frontend && npm run build 2>&1 | head -30
```
Expected: aucune erreur de type.

- [ ] **Étape 6 : Commit**

```bash
git add frontend/services/business.service.ts \
    frontend/services/contacts.service.ts \
    frontend/services/cash.service.ts \
    frontend/services/deadlines.service.ts
git commit -m "feat(frontend): services contacts, caisse, échéances + types Order étendus"
```

---

## Task 6 — Frontend : Page Mon Site

**Files:**
- Create: `frontend/app/dashboard/mon-site/page.tsx`

La page affiche les commandes `completed` avec les infos site. Si aucune commande complète, afficher un message d'attente. Si plusieurs, les lister.

- [ ] **Étape 1 : Créer la page**

```tsx
// frontend/app/dashboard/mon-site/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { businessService, Order } from '@/services/business.service';

export default function MonSitePage() {
  const [sites, setSites]     = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    businessService
      .getOrders({ status: 'completed' })
      .then((res) => setSites(res.data))
      .catch(() => setError('Impossible de charger les informations du site.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return <p className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</p>;
  }

  if (sites.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-lg font-medium text-gray-700">Votre site est en cours de préparation.</p>
        <p className="mt-1 text-sm text-gray-500">
          Vous retrouverez ici toutes les informations une fois la livraison effectuée.
        </p>
        <Link href="/dashboard/orders" className="mt-4 inline-block text-sm text-[var(--color-primary)] underline">
          Voir l'état de ma commande →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">Mon Site</h1>

      {sites.map((site) => (
        <div key={site.id} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">
              {site.template?.name ?? 'Template'} · {site.template?.sector?.name ?? ''}
            </span>
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
              Livré
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {site.site_url && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">URL du site</p>
                <a
                  href={site.site_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block truncate text-sm font-medium text-[var(--color-primary)] underline"
                >
                  {site.site_url}
                </a>
              </div>
            )}

            {site.domain && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Domaine</p>
                <p className="mt-1 text-sm font-medium text-gray-800">{site.domain}</p>
              </div>
            )}

            {site.hosting_expires_at && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Hébergement expire le</p>
                <p className="mt-1 text-sm font-medium text-gray-800">
                  {new Date(site.hosting_expires_at).toLocaleDateString('fr-FR', {
                    day: '2-digit', month: 'long', year: 'numeric',
                  })}
                </p>
              </div>
            )}

            {site.preview_url && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Prévisualisation</p>
                <a
                  href={site.preview_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block text-sm text-[var(--color-primary)] underline"
                >
                  Voir la maquette →
                </a>
              </div>
            )}
          </div>

          {!site.site_url && !site.domain && (
            <p className="mt-2 text-sm text-gray-400 italic">
              Les informations du site seront disponibles dès la mise en ligne.
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Étape 2 : Vérifier le build**

```bash
cd frontend && npm run build 2>&1 | grep -E "error|Error" | head -10
```
Expected: aucune erreur.

- [ ] **Étape 3 : Commit**

```bash
git add frontend/app/dashboard/mon-site/
git commit -m "feat(frontend): page Mon Site — infos site livré dans le dashboard"
```

---

## Task 7 — Frontend : Page Mes Clients

**Files:**
- Create: `frontend/app/dashboard/contacts/page.tsx`

Liste paginée + formulaire d'ajout/édition dans un modal léger (état local). Mobile-first.

- [ ] **Étape 1 : Créer la page**

```tsx
// frontend/app/dashboard/contacts/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { ClientContact, ContactsPayload, contactsService } from '@/services/contacts.service';

const emptyForm = (): ContactsPayload => ({
  name: '', company: '', phone: '', whatsapp: '', email: '', notes: '', acquired_at: '',
});

export default function ContactsPage() {
  const [contacts, setContacts]     = useState<ClientContact[]>([]);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(1);
  const [lastPage, setLastPage]     = useState(1);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [showForm, setShowForm]     = useState(false);
  const [editing, setEditing]       = useState<ClientContact | null>(null);
  const [form, setForm]             = useState<ContactsPayload>(emptyForm());
  const [saving, setSaving]         = useState(false);
  const [formError, setFormError]   = useState<string | null>(null);

  const load = (p = 1) => {
    setLoading(true);
    contactsService.list(p)
      .then((res) => {
        setContacts(res.data);
        setTotal(res.meta.total);
        setLastPage(res.meta.last_page);
        setPage(p);
      })
      .catch(() => setError('Impossible de charger les contacts.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setFormError(null);
    setShowForm(true);
  };

  const openEdit = (c: ClientContact) => {
    setEditing(c);
    setForm({
      name: c.name, company: c.company ?? '', phone: c.phone ?? '',
      whatsapp: c.whatsapp ?? '', email: c.email ?? '',
      notes: c.notes ?? '', acquired_at: c.acquired_at ?? '',
    });
    setFormError(null);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      if (editing) {
        await contactsService.update(editing.id, form);
      } else {
        await contactsService.create(form);
      }
      setShowForm(false);
      load(page);
    } catch {
      setFormError('Une erreur est survenue. Vérifiez les informations.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce contact ?')) return;
    await contactsService.remove(id);
    load(page);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Mes Clients <span className="ml-2 text-base font-normal text-gray-400">({total})</span></h1>
        <button onClick={openCreate} className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90">
          + Ajouter
        </button>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-gray-700">
            {editing ? 'Modifier le contact' : 'Nouveau contact'}
          </h2>
          {formError && <p className="mb-3 rounded bg-red-50 p-3 text-xs text-red-600">{formError}</p>}
          <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-gray-600">Nom *</label>
              <input required className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Entreprise</label>
              <input className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Téléphone</label>
              <input className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">WhatsApp</label>
              <input className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Email</label>
              <input type="email" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Client depuis</label>
              <input type="date" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={form.acquired_at} onChange={(e) => setForm({ ...form, acquired_at: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-gray-600">Notes</label>
              <textarea rows={2} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div className="flex gap-2 sm:col-span-2">
              <button type="submit" disabled={saving}
                className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600">
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent" />
        </div>
      ) : error ? (
        <p className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</p>
      ) : contacts.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-gray-500">Vous n'avez pas encore enregistré de clients.</p>
          <button onClick={openCreate} className="mt-3 text-sm text-[var(--color-primary)] underline">
            Ajouter votre premier client →
          </button>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white shadow-sm">
          {contacts.map((c) => (
            <div key={c.id} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="font-medium text-gray-800">{c.name}</p>
                <p className="text-xs text-gray-400">
                  {[c.company, c.phone].filter(Boolean).join(' · ')}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(c)}
                  className="text-xs text-gray-500 underline hover:text-gray-700">
                  Modifier
                </button>
                <button onClick={() => handleDelete(c.id)}
                  className="text-xs text-red-500 underline hover:text-red-700">
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {lastPage > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: lastPage }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => load(p)}
              className={`h-8 w-8 rounded text-sm ${page === p ? 'bg-[var(--color-primary)] text-white' : 'border border-gray-200 text-gray-600'}`}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Étape 2 : Build check**

```bash
cd frontend && npm run build 2>&1 | grep -E "error|Error" | head -10
```

- [ ] **Étape 3 : Commit**

```bash
git add frontend/app/dashboard/contacts/
git commit -m "feat(frontend): page Mes Clients — CRM léger dans le dashboard"
```

---

## Task 8 — Frontend : Page Ma Caisse

**Files:**
- Create: `frontend/app/dashboard/caisse/page.tsx`

Sélecteur de mois en haut, bandeau résumé (entrées / dépenses / solde), liste des mouvements, bouton "+" flottant pour ajouter.

- [ ] **Étape 1 : Créer la page**

```tsx
// frontend/app/dashboard/caisse/page.tsx
'use client';

import { useEffect, useState } from 'react';
import {
  CashEntry, CashEntryPayload, CashSummary, cashService,
} from '@/services/cash.service';

const currentMonth = () => new Date().toISOString().slice(0, 7);

const emptyForm = (): CashEntryPayload => ({
  type: 'income', amount: 0, label: '', entry_date: new Date().toISOString().slice(0, 10),
});

export default function CaissePage() {
  const [month, setMonth]         = useState(currentMonth());
  const [entries, setEntries]     = useState<CashEntry[]>([]);
  const [summary, setSummary]     = useState<CashSummary | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [showForm, setShowForm]   = useState(false);
  const [editing, setEditing]     = useState<CashEntry | null>(null);
  const [form, setForm]           = useState<CashEntryPayload>(emptyForm());
  const [saving, setSaving]       = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = (m: string) => {
    setLoading(true);
    setError(null);
    Promise.all([cashService.list(m), cashService.summary(m)])
      .then(([res, sum]) => {
        setEntries(res.data);
        setSummary(sum);
      })
      .catch(() => setError('Impossible de charger la caisse.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(month); }, [month]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setFormError(null);
    setShowForm(true);
  };

  const openEdit = (e: CashEntry) => {
    setEditing(e);
    setForm({ type: e.type, amount: e.amount, label: e.label, entry_date: e.entry_date, notes: e.notes ?? '' });
    setFormError(null);
    setShowForm(true);
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      if (editing) {
        await cashService.update(editing.id, form);
      } else {
        await cashService.create(form);
      }
      setShowForm(false);
      load(month);
    } catch {
      setFormError('Une erreur est survenue.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce mouvement ?')) return;
    await cashService.remove(id);
    load(month);
  };

  const fmt = (n: number) => n.toLocaleString('fr-FR') + ' FCFA';

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Ma Caisse</h1>
        <div className="flex items-center gap-3">
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm" />
          <button onClick={openCreate}
            className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90">
            + Ajouter
          </button>
        </div>
      </div>

      {/* Résumé */}
      {summary && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm">
            <p className="text-xs font-medium text-gray-400">Entrées</p>
            <p className="mt-1 text-lg font-bold text-green-600">{fmt(summary.income)}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm">
            <p className="text-xs font-medium text-gray-400">Dépenses</p>
            <p className="mt-1 text-lg font-bold text-red-500">{fmt(summary.expenses)}</p>
          </div>
          <div className={`rounded-xl border p-4 text-center shadow-sm ${
            summary.balance >= 0 ? 'border-green-100 bg-green-50' : 'border-red-100 bg-red-50'
          }`}>
            <p className="text-xs font-medium text-gray-400">Solde</p>
            <p className={`mt-1 text-lg font-bold ${summary.balance >= 0 ? 'text-green-700' : 'text-red-600'}`}>
              {fmt(summary.balance)}
            </p>
          </div>
        </div>
      )}

      {/* Formulaire */}
      {showForm && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-gray-700">
            {editing ? 'Modifier le mouvement' : 'Nouveau mouvement'}
          </h2>
          {formError && <p className="mb-3 rounded bg-red-50 p-3 text-xs text-red-600">{formError}</p>}
          <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Type *</label>
              <select required className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as 'income' | 'expense' })}>
                <option value="income">Entrée (vente)</option>
                <option value="expense">Dépense</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Montant (FCFA) *</label>
              <input required type="number" min={1} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={form.amount || ''} onChange={(e) => setForm({ ...form, amount: parseInt(e.target.value, 10) || 0 })} />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-gray-600">Description *</label>
              <input required className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                placeholder="ex: Vente de chemises, Loyer local..."
                value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Date *</label>
              <input required type="date" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={form.entry_date} onChange={(e) => setForm({ ...form, entry_date: e.target.value })} />
            </div>
            <div className="flex items-end gap-2">
              <button type="submit" disabled={saving}
                className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600">
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent" />
        </div>
      ) : error ? (
        <p className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</p>
      ) : entries.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-gray-500">Aucun mouvement ce mois-ci.</p>
          <button onClick={openCreate} className="mt-3 text-sm text-[var(--color-primary)] underline">
            Enregistrer votre premier mouvement →
          </button>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white shadow-sm">
          {entries.map((e) => (
            <div key={e.id} className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-3">
                <span className={`inline-block h-2 w-2 rounded-full ${e.type === 'income' ? 'bg-green-500' : 'bg-red-400'}`} />
                <div>
                  <p className="text-sm font-medium text-gray-800">{e.label}</p>
                  <p className="text-xs text-gray-400">{new Date(e.entry_date).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm font-semibold ${e.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                  {e.type === 'income' ? '+' : '-'} {e.amount.toLocaleString('fr-FR')} FCFA
                </span>
                <button onClick={() => openEdit(e)} className="text-xs text-gray-400 underline hover:text-gray-600">Modifier</button>
                <button onClick={() => handleDelete(e.id)} className="text-xs text-red-400 underline hover:text-red-600">Suppr.</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Étape 2 : Build check**

```bash
cd frontend && npm run build 2>&1 | grep -E "error|Error" | head -10
```

- [ ] **Étape 3 : Commit**

```bash
git add frontend/app/dashboard/caisse/
git commit -m "feat(frontend): page Ma Caisse — journal de caisse simplifié"
```

---

## Task 9 — Frontend : Page Mes Échéances

**Files:**
- Create: `frontend/app/dashboard/echeances/page.tsx`

Liste chronologique des échéances (système + perso), code couleur selon urgence, formulaire d'ajout d'échéance personnelle.

- [ ] **Étape 1 : Créer la page**

```tsx
// frontend/app/dashboard/echeances/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Deadline, DeadlinePayload, deadlinesService } from '@/services/deadlines.service';

const emptyForm = (): DeadlinePayload => ({
  title: '', description: '', due_date: '',
});

function urgencyClass(days: number): string {
  if (days < 0)   return 'border-gray-200 bg-gray-50 text-gray-400';
  if (days <= 7)  return 'border-red-200 bg-red-50';
  if (days <= 30) return 'border-orange-200 bg-orange-50';
  return 'border-gray-200 bg-white';
}

function urgencyBadge(days: number): { label: string; class: string } {
  if (days < 0)   return { label: 'Passée', class: 'bg-gray-100 text-gray-500' };
  if (days === 0) return { label: "Aujourd'hui", class: 'bg-red-100 text-red-700' };
  if (days <= 7)  return { label: `Dans ${days}j`, class: 'bg-red-100 text-red-700' };
  if (days <= 30) return { label: `Dans ${days}j`, class: 'bg-orange-100 text-orange-700' };
  return { label: `Dans ${days}j`, class: 'bg-gray-100 text-gray-600' };
}

export default function EcheancesPage() {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [showForm, setShowForm]   = useState(false);
  const [editing, setEditing]     = useState<Deadline | null>(null);
  const [form, setForm]           = useState<DeadlinePayload>(emptyForm());
  const [saving, setSaving]       = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    deadlinesService.list()
      .then(setDeadlines)
      .catch(() => setError('Impossible de charger les échéances.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setFormError(null);
    setShowForm(true);
  };

  const openEdit = (d: Deadline) => {
    setEditing(d);
    setForm({ title: d.title, description: d.description ?? '', due_date: d.due_date });
    setFormError(null);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      if (editing) {
        await deadlinesService.update(editing.id, form);
      } else {
        await deadlinesService.create(form);
      }
      setShowForm(false);
      load();
    } catch {
      setFormError('Une erreur est survenue.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette échéance ?')) return;
    await deadlinesService.remove(id);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Mes Échéances</h1>
        <button onClick={openCreate}
          className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90">
          + Ajouter
        </button>
      </div>

      {/* Formulaire ajout/édition personnel */}
      {showForm && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-gray-700">
            {editing ? 'Modifier l'échéance' : 'Nouvelle échéance personnelle'}
          </h2>
          {formError && <p className="mb-3 rounded bg-red-50 p-3 text-xs text-red-600">{formError}</p>}
          <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-gray-600">Titre *</label>
              <input required className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                placeholder="ex: Déclaration TVA, Renouvellement patente..."
                value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Date limite *</label>
              <input required type="date" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
            </div>
            <div className="flex items-end gap-2">
              <button type="submit" disabled={saving}
                className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600">
                Annuler
              </button>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-gray-600">Notes (optionnel)</label>
              <textarea rows={2} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </form>
        </div>
      )}

      {/* Liste */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent" />
        </div>
      ) : error ? (
        <p className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</p>
      ) : deadlines.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-gray-500">Aucune échéance pour le moment.</p>
          <button onClick={openCreate} className="mt-3 text-sm text-[var(--color-primary)] underline">
            Ajouter votre première échéance →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {deadlines.map((d) => {
            const badge = urgencyBadge(d.days_remaining);
            return (
              <div key={d.id}
                className={`rounded-xl border p-4 shadow-sm ${urgencyClass(d.days_remaining)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-800">{d.title}</p>
                      {d.is_system && (
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-600">FRILO</span>
                      )}
                    </div>
                    {d.description && (
                      <p className="mt-0.5 text-xs text-gray-500">{d.description}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-400">
                      {new Date(d.due_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 ml-4">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.class}`}>
                      {badge.label}
                    </span>
                    {!d.is_system && (
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(d)} className="text-xs text-gray-400 underline hover:text-gray-600">
                          Modifier
                        </button>
                        <button onClick={() => handleDelete(d.id)} className="text-xs text-red-400 underline hover:text-red-600">
                          Suppr.
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Étape 2 : Build check**

```bash
cd frontend && npm run build 2>&1 | grep -E "error|Error" | head -10
```

- [ ] **Étape 3 : Commit**

```bash
git add frontend/app/dashboard/echeances/
git commit -m "feat(frontend): page Mes Échéances — rappels fiscaux dans le dashboard"
```

---

## Task 10 — Frontend : Navigation Sidebar

**Files:**
- Modify: `frontend/components/dashboard/Sidebar.tsx`

Ajouter les 4 items de navigation + badge rouge sur Mes Échéances si une échéance arrive dans ≤ 7 jours.

- [ ] **Étape 1 : Ajouter les imports dans Sidebar.tsx**

En haut du fichier, ajouter :
```typescript
import { deadlinesService } from '@/services/deadlines.service';
```

- [ ] **Étape 2 : Ajouter l'état urgentCount**

Ajouter un state à côté des états existants :
```typescript
const [urgentCount, setUrgentCount] = useState(0);
```

- [ ] **Étape 3 : Charger le compte dans useEffect**

Dans le `useEffect` existant qui charge `unreadCount`, ajouter en parallèle :
```typescript
deadlinesService.list()
  .then((list) => setUrgentCount(list.filter((d) => d.days_remaining >= 0 && d.days_remaining <= 7).length))
  .catch(() => {});
```

- [ ] **Étape 4 : Ajouter les 4 items de navigation**

Localiser le tableau ou la liste des items de navigation existants (liens vers `/dashboard/orders`, `/dashboard/notifications`, etc.). Ajouter les 4 entrées suivantes dans le même format que les liens existants :

```tsx
{
  href: '/dashboard/mon-site',
  label: 'Mon Site',
  icon: <GlobeIcon />, // utiliser la même bibliothèque d'icônes que les autres items
},
{
  href: '/dashboard/contacts',
  label: 'Mes Clients',
  icon: <UsersIcon />,
},
{
  href: '/dashboard/caisse',
  label: 'Ma Caisse',
  icon: <WalletIcon />,
},
{
  href: '/dashboard/echeances',
  label: 'Mes Échéances',
  icon: <CalendarIcon />,
  badge: urgentCount > 0 ? urgentCount : undefined,
},
```

Le badge Mes Échéances suit le même rendu que le badge notifications (nombre cerclé en rouge), avec cap à 9+ si > 9.

- [ ] **Étape 5 : Build check et lint**

```bash
cd frontend && npm run build && npm run lint 2>&1 | grep -E "error|Error" | head -10
```

- [ ] **Étape 6 : Commit final**

```bash
git add frontend/components/dashboard/Sidebar.tsx
git commit -m "feat(frontend): navigation — Mon Site, Mes Clients, Ma Caisse, Mes Échéances"
```

---

## Checklist de finalisation

```
□ php artisan test — zéro régression
□ npm run build — aucune erreur TypeScript
□ npm run lint — aucune erreur ESLint
□ Flux nominaux testés manuellement : création, lecture, modification, suppression pour chaque module
□ Commande completed → Mon Site affiche les infos (vérifier avec une commande de test)
□ Échéances système créées en admin → visibles dans /dashboard/echeances
□ Badge urgences visible si échéance ≤ 7j
□ Aucun dd(), dump(), console.log() en commit
□ Aucun user_id, price, status accepté depuis le client
□ Migrations avec up() et down() propres
□ OrderService non modifié (aucune transition de statut touchée)
```
