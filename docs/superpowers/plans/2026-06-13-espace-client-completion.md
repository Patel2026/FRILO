# Espace Client — Complétion Phase 1

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Compléter l'espace client à 100% pour la Phase 1 : lien de prévisualisation + retours client, changement de mot de passe, notifications accessibles depuis la sidebar.

**Architecture:** Trois sous-systèmes indépendants. Feature 1 (prévisualisation) touche le backend (migration, model, API, admin) et le frontend (service + page détail commande). Feature 2 (mot de passe) est backend + frontend profil. Feature 3 (sidebar notifications) est frontend uniquement.

**Tech Stack:** Laravel 12 / PHP 8.3 / MySQL 8 — Next.js 15 / TypeScript / Tailwind CSS / Zod / Axios

---

## Carte des fichiers

### Feature 1 — Prévisualisation & retours client
| Action | Fichier |
|---|---|
| Créer | `backend/database/migrations/2026_06_14_000001_add_preview_fields_to_orders_table.php` |
| Modifier | `backend/app/Models/Order.php` |
| Modifier | `backend/app/Http/Controllers/Api/OrderController.php` |
| Créer | `backend/app/Http/Requests/Api/SubmitOrderFeedbackRequest.php` |
| Modifier | `backend/routes/web.php` (groupe admin) |
| Modifier | `backend/app/Http/Controllers/Admin/OrderController.php` |
| Modifier | `backend/resources/views/admin/orders/show.blade.php` |
| Modifier | `frontend/services/business.service.ts` |
| Modifier | `frontend/app/dashboard/orders/[id]/page.tsx` |

### Feature 2 — Changement de mot de passe
| Action | Fichier |
|---|---|
| Créer | `backend/app/Http/Requests/Api/UpdatePasswordRequest.php` |
| Modifier | `backend/app/Http/Controllers/Api/AuthController.php` |
| Modifier | `backend/routes/api.php` |
| Modifier | `frontend/services/auth.service.ts` |
| Modifier | `frontend/app/dashboard/profile/page.tsx` |

### Feature 3 — Notifications dans la sidebar
| Action | Fichier |
|---|---|
| Modifier | `frontend/components/dashboard/Sidebar.tsx` |

---

## Feature 1 — Prévisualisation & retours client

### Task 1 : Migration — champs prévisualisation sur `orders`

**Files:**
- Créer : `backend/database/migrations/2026_06_14_000001_add_preview_fields_to_orders_table.php`

- [ ] **Step 1 : Écrire la migration**

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
            $table->string('preview_url', 500)->nullable()->after('price');
            $table->text('client_feedback')->nullable()->after('preview_url');
            $table->timestamp('feedback_submitted_at')->nullable()->after('client_feedback');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['preview_url', 'client_feedback', 'feedback_submitted_at']);
        });
    }
};
```

- [ ] **Step 2 : Exécuter la migration**

```bash
cd backend && php artisan migrate
```

Expected output : `Running migrations... 2026_06_14_000001_add_preview_fields_to_orders_table ........ DONE`

- [ ] **Step 3 : Vérifier le rollback**

```bash
php artisan migrate:rollback --step=1
php artisan migrate
```

Expected : aucune erreur dans les deux sens.

- [ ] **Step 4 : Commit**

```bash
git add backend/database/migrations/2026_06_14_000001_add_preview_fields_to_orders_table.php
git commit -m "feat(db): add preview_url, client_feedback, feedback_submitted_at to orders"
```

---

### Task 2 : Model + API — exposer les nouveaux champs

**Files:**
- Modifier : `backend/app/Models/Order.php`
- Modifier : `backend/app/Http/Controllers/Api/OrderController.php`

- [ ] **Step 1 : Écrire le test unitaire (OrderController feature test)**

Dans `backend/tests/Feature/Api/OrderPreviewTest.php` (créer le fichier) :

```php
<?php

namespace Tests\Feature\Api;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\Template;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderPreviewTest extends TestCase
{
    use RefreshDatabase;

    public function test_order_show_includes_preview_url(): void
    {
        $user = User::factory()->create(['role' => 'client', 'is_active' => true]);
        $template = Template::factory()->create(['is_active' => true, 'price' => 50000]);
        $order = Order::factory()->create([
            'user_id' => $user->id,
            'template_id' => $template->id,
            'status' => OrderStatus::Processing,
            'payment_status' => PaymentStatus::Paid,
            'price' => 50000,
            'preview_url' => 'https://preview.frilo.bj/orders/42',
        ]);

        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withToken($token)->getJson("/api/orders/{$order->id}");

        $response->assertOk();
        $response->assertJsonPath('preview_url', 'https://preview.frilo.bj/orders/42');
        $response->assertJsonPath('client_feedback', null);
        $response->assertJsonPath('feedback_submitted_at', null);
    }
}
```

- [ ] **Step 2 : Vérifier que le test échoue**

```bash
cd backend && php artisan test tests/Feature/Api/OrderPreviewTest.php --filter=test_order_show_includes_preview_url
```

Expected : FAIL — `preview_url` absent de la réponse.

- [ ] **Step 3 : Mettre à jour le Model Order**

Dans `backend/app/Models/Order.php`, modifier `$fillable` et `$casts` :

```php
protected $fillable = [
    'user_id',
    'template_id',
    'status',
    'payment_status',
    'price',
    'paid_at',
    'preview_url',
    'client_feedback',
    'feedback_submitted_at',
];

protected $casts = [
    'status' => OrderStatus::class,
    'payment_status' => PaymentStatus::class,
    'price' => 'integer',
    'paid_at' => 'datetime',
    'feedback_submitted_at' => 'datetime',
];
```

- [ ] **Step 4 : Mettre à jour `transformOrder` dans `OrderController`**

Dans `backend/app/Http/Controllers/Api/OrderController.php`, dans la méthode `transformOrder()`, ajouter après `'payment' => ...` :

```php
'preview_url' => $order->preview_url,
'client_feedback' => $order->client_feedback,
'feedback_submitted_at' => optional($order->feedback_submitted_at)?->toISOString(),
```

- [ ] **Step 5 : Faire passer le test**

```bash
php artisan test tests/Feature/Api/OrderPreviewTest.php
```

Expected : PASS

- [ ] **Step 6 : Commit**

```bash
git add backend/app/Models/Order.php backend/app/Http/Controllers/Api/OrderController.php backend/tests/Feature/Api/OrderPreviewTest.php
git commit -m "feat(api): expose preview_url, client_feedback, feedback_submitted_at on order response"
```

---

### Task 3 : Backend API — route de retours client

**Files:**
- Créer : `backend/app/Http/Requests/Api/SubmitOrderFeedbackRequest.php`
- Modifier : `backend/app/Http/Controllers/Api/OrderController.php`
- Modifier : `backend/routes/api.php`

- [ ] **Step 1 : Écrire le test**

Ajouter dans `backend/tests/Feature/Api/OrderPreviewTest.php` :

```php
public function test_client_can_submit_feedback_when_preview_url_set(): void
{
    $user = User::factory()->create(['role' => 'client', 'is_active' => true]);
    $template = Template::factory()->create(['is_active' => true, 'price' => 50000]);
    $order = Order::factory()->create([
        'user_id' => $user->id,
        'template_id' => $template->id,
        'status' => OrderStatus::Processing,
        'payment_status' => PaymentStatus::Paid,
        'price' => 50000,
        'preview_url' => 'https://preview.frilo.bj/orders/42',
    ]);

    $token = $user->createToken('test')->plainTextToken;

    $response = $this->withToken($token)->postJson("/api/orders/{$order->id}/feedback", [
        'feedback' => 'Changer le logo et la couleur du header.',
    ]);

    $response->assertOk();
    $response->assertJsonPath('client_feedback', 'Changer le logo et la couleur du header.');
    $this->assertNotNull($order->fresh()->feedback_submitted_at);
}

public function test_client_cannot_submit_feedback_without_preview_url(): void
{
    $user = User::factory()->create(['role' => 'client', 'is_active' => true]);
    $template = Template::factory()->create(['is_active' => true, 'price' => 50000]);
    $order = Order::factory()->create([
        'user_id' => $user->id,
        'template_id' => $template->id,
        'status' => OrderStatus::Pending,
        'payment_status' => PaymentStatus::AwaitingPayment,
        'price' => 50000,
        'preview_url' => null,
    ]);

    $token = $user->createToken('test')->plainTextToken;

    $response = $this->withToken($token)->postJson("/api/orders/{$order->id}/feedback", [
        'feedback' => 'Retour sans prévisualisation.',
    ]);

    $response->assertStatus(422);
}

public function test_client_cannot_submit_feedback_on_other_users_order(): void
{
    $user = User::factory()->create(['role' => 'client', 'is_active' => true]);
    $otherUser = User::factory()->create(['role' => 'client', 'is_active' => true]);
    $template = Template::factory()->create(['is_active' => true, 'price' => 50000]);
    $order = Order::factory()->create([
        'user_id' => $otherUser->id,
        'template_id' => $template->id,
        'status' => OrderStatus::Processing,
        'payment_status' => PaymentStatus::Paid,
        'price' => 50000,
        'preview_url' => 'https://preview.frilo.bj/orders/99',
    ]);

    $token = $user->createToken('test')->plainTextToken;

    $response = $this->withToken($token)->postJson("/api/orders/{$order->id}/feedback", [
        'feedback' => 'Retour non autorisé.',
    ]);

    $response->assertForbidden();
}
```

- [ ] **Step 2 : Vérifier que les tests échouent**

```bash
php artisan test tests/Feature/Api/OrderPreviewTest.php
```

Expected : FAIL (route inexistante → 404).

- [ ] **Step 3 : Créer `SubmitOrderFeedbackRequest`**

```php
<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class SubmitOrderFeedbackRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'feedback' => ['required', 'string', 'min:5', 'max:5000'],
        ];
    }
}
```

Sauvegarder dans `backend/app/Http/Requests/Api/SubmitOrderFeedbackRequest.php`.

- [ ] **Step 4 : Ajouter `submitFeedback` dans `OrderController`**

Ajouter l'import en haut du fichier `OrderController.php` si absent :

```php
use App\Http\Requests\Api\SubmitOrderFeedbackRequest;
```

Ajouter la méthode dans la classe :

```php
public function submitFeedback(SubmitOrderFeedbackRequest $request, int $id): JsonResponse
{
    $order = Order::findOrFail($id);

    $this->authorize('view', $order);

    if (! $order->preview_url) {
        return response()->json([
            'message' => 'Aucun lien de prévisualisation disponible pour cette commande.',
        ], 422);
    }

    $order->client_feedback = $request->validated()['feedback'];
    $order->feedback_submitted_at = now();
    $order->save();

    \Log::info('order.feedback.submitted', [
        'order_id' => $order->id,
        'user_id' => $request->user()->id,
    ]);

    return response()->json($this->transformOrder($order));
}
```

- [ ] **Step 5 : Ajouter la route dans `routes/api.php`**

Dans le groupe protégé (après la route `payment-link`) :

```php
Route::post('/orders/{id}/feedback', [OrderController::class, 'submitFeedback']);
```

- [ ] **Step 6 : Faire passer les tests**

```bash
php artisan test tests/Feature/Api/OrderPreviewTest.php
```

Expected : 4 tests PASS

- [ ] **Step 7 : Commit**

```bash
git add backend/app/Http/Requests/Api/SubmitOrderFeedbackRequest.php \
        backend/app/Http/Controllers/Api/OrderController.php \
        backend/routes/api.php \
        backend/tests/Feature/Api/OrderPreviewTest.php
git commit -m "feat(api): POST /orders/{id}/feedback — retours client sur prévisualisation"
```

---

### Task 4 : Admin — définir l'URL de prévisualisation

**Files:**
- Modifier : `backend/routes/web.php`
- Modifier : `backend/app/Http/Controllers/Admin/OrderController.php`
- Modifier : `backend/resources/views/admin/orders/show.blade.php`

- [ ] **Step 1 : Ajouter la route admin**

Dans `backend/routes/web.php`, dans le groupe admin (après `orders.status`) :

```php
Route::patch('orders/{order}/preview', [AdminOrderController::class, 'setPreviewUrl'])->name('orders.preview');
```

- [ ] **Step 2 : Ajouter `setPreviewUrl` dans l'admin `OrderController`**

```php
public function setPreviewUrl(Request $request, Order $order)
{
    $request->validate([
        'preview_url' => ['nullable', 'string', 'max:500', 'regex:/^(https?:\/\/|\/).*/'],
    ]);

    $order->preview_url = $request->preview_url ?: null;
    $order->save();

    $this->auditLogger->record(
        event: 'order.preview_url.set',
        payload: [
            'order_id' => $order->id,
            'preview_url' => $order->preview_url,
        ],
        actor: $request->user(),
        message: 'Lien de prévisualisation défini depuis le backoffice',
        targetType: 'order',
        targetId: (string) $order->id,
        request: $request
    );

    return redirect()
        ->route('admin.orders.show', $order)
        ->with('success', 'Lien de prévisualisation mis à jour.');
}
```

S'assurer que `use App\Models\Order;` est présent en haut du fichier Admin/OrderController.

- [ ] **Step 3 : Ajouter le formulaire dans la vue Blade**

Dans `backend/resources/views/admin/orders/show.blade.php`, ajouter un bloc après le bloc statut (avant la fermeture `</div>` principale) :

```blade
{{-- Prévisualisation --}}
<div class="card mb-4">
    <div class="card-header">
        <h5 class="card-title mb-0">Lien de prévisualisation</h5>
    </div>
    <div class="card-body">
        @if($order->preview_url)
            <p class="mb-2">
                <a href="{{ $order->preview_url }}" target="_blank" class="text-primary">
                    {{ $order->preview_url }}
                </a>
            </p>
        @else
            <p class="text-muted mb-2">Aucun lien défini.</p>
        @endif

        @if($order->client_feedback)
            <div class="alert alert-info mt-3">
                <strong>Retours client :</strong><br>
                {{ $order->client_feedback }}<br>
                <small class="text-muted">
                    Soumis le {{ $order->feedback_submitted_at?->format('d/m/Y H:i') }}
                </small>
            </div>
        @endif

        <form action="{{ route('admin.orders.preview', $order) }}" method="POST" class="mt-3">
            @csrf
            @method('PATCH')
            <div class="mb-3">
                <label for="preview_url" class="form-label">URL de prévisualisation</label>
                <input type="text"
                       id="preview_url"
                       name="preview_url"
                       class="form-control @error('preview_url') is-invalid @enderror"
                       value="{{ old('preview_url', $order->preview_url) }}"
                       placeholder="https://preview.frilo.bj/orders/{{ $order->id }}">
                @error('preview_url')
                    <div class="invalid-feedback">{{ $message }}</div>
                @enderror
            </div>
            <button type="submit" class="btn btn-primary btn-sm">Enregistrer le lien</button>
        </form>
    </div>
</div>
```

- [ ] **Step 4 : Vérifier manuellement**

```bash
php artisan serve
```

Se connecter en admin (`/admin/orders/{id}`), saisir une URL et vérifier la redirection + message de succès.

- [ ] **Step 5 : Commit**

```bash
git add backend/routes/web.php \
        backend/app/Http/Controllers/Admin/OrderController.php \
        backend/resources/views/admin/orders/show.blade.php
git commit -m "feat(admin): setPreviewUrl sur commande — backoffice"
```

---

### Task 5 : Frontend — types + service + section prévisualisation

**Files:**
- Modifier : `frontend/services/business.service.ts`
- Modifier : `frontend/app/dashboard/orders/[id]/page.tsx`

- [ ] **Step 1 : Mettre à jour le type `Order` dans `business.service.ts`**

Localiser l'interface `Order` (chercher `export interface Order`) et ajouter les trois champs :

```typescript
export interface Order {
  // ... champs existants ...
  preview_url: string | null;
  client_feedback: string | null;
  feedback_submitted_at: string | null;
}
```

- [ ] **Step 2 : Ajouter `submitOrderFeedback` dans `businessService`**

À la fin de l'objet `businessService`, ajouter :

```typescript
async submitOrderFeedback(orderId: number, feedback: string): Promise<Order> {
  const response = await api.post(`/orders/${orderId}/feedback`, { feedback });
  return response.data as Order;
},
```

- [ ] **Step 3 : Vérifier le build TypeScript**

```bash
cd frontend && npm run build 2>&1 | grep -E "error|Error" | head -20
```

Expected : aucune erreur TypeScript.

- [ ] **Step 4 : Ajouter l'état local dans `OrderDetailPage`**

Dans `frontend/app/dashboard/orders/[id]/page.tsx`, après les imports existants, ajouter les variables d'état pour le feedback (dans la fonction composant, après les déclarations `useState` existantes) :

```typescript
const [feedbackText, setFeedbackText] = useState('');
const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
const [feedbackError, setFeedbackError] = useState<string | null>(null);
const [feedbackSuccess, setFeedbackSuccess] = useState(false);
```

- [ ] **Step 5 : Ajouter le handler de soumission**

Ajouter après `handleStartPayment` :

```typescript
const handleSubmitFeedback = async () => {
  if (!order || feedbackText.trim().length < 5) return;

  setFeedbackSubmitting(true);
  setFeedbackError(null);

  try {
    const updated = await businessService.submitOrderFeedback(order.id, feedbackText.trim());
    setOrder(updated);
    setFeedbackSuccess(true);
    setFeedbackText('');
  } catch {
    setFeedbackError('Impossible d\'envoyer vos retours pour le moment. Réessayez.');
  } finally {
    setFeedbackSubmitting(false);
  }
};
```

- [ ] **Step 6 : Ajouter la section prévisualisation dans le JSX**

Dans le rendu principal de la commande (après la section `<section>` des informations transmises et avant le lien "Donner mon avis"), ajouter :

```tsx
{order.preview_url && (
  <section className="rounded-2xl border border-neutral-200 bg-[oklch(99%_0.004_95)] p-5 md:p-6">
    <p className="mb-2 text-xs font-bold uppercase tracking-widest text-neutral-400">
      Prévisualisation
    </p>
    <h2 className="text-xl font-black tracking-tight text-neutral-950">
      Votre site est prêt à valider.
    </h2>
    <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
      FRILO a préparé une version de votre site. Consultez le lien ci-dessous et transmettez
      vos retours dans les 24 heures. Les modifications seront intégrées avant la mise en ligne définitive.
    </p>
    <a
      href={order.preview_url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-4 inline-flex items-center gap-2 rounded-full bg-neutral-950 px-5 py-3 text-sm font-black text-[oklch(99%_0.004_95)] transition-colors hover:bg-neutral-800"
    >
      Voir la prévisualisation
      <ArrowUpRight className="h-4 w-4" />
    </a>

    <div className="mt-6 border-t border-neutral-100 pt-6">
      {order.client_feedback ? (
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">
            Vos retours envoyés
          </p>
          <p className="text-sm text-neutral-700 leading-6 bg-neutral-50 rounded-xl p-4">
            {order.client_feedback}
          </p>
          {order.feedback_submitted_at && (
            <p className="mt-2 text-xs font-semibold text-neutral-400">
              Envoyé le {new Date(order.feedback_submitted_at).toLocaleDateString('fr-FR', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </p>
          )}
        </div>
      ) : (
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">
            Transmettre vos retours
          </p>
          {feedbackSuccess ? (
            <div className="rounded-xl bg-emerald-50 px-4 py-3 text-emerald-700">
              <p className="text-sm font-semibold">
                Retours reçus. FRILO les intègre dans les 24 heures.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={4}
                placeholder="Décrivez les modifications souhaitées (couleurs, textes, logo, mise en page…)"
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-950 outline-none transition-colors focus:border-neutral-950 resize-none"
              />
              {feedbackError && (
                <p className="text-xs font-semibold text-red-600">{feedbackError}</p>
              )}
              <button
                type="button"
                onClick={handleSubmitFeedback}
                disabled={feedbackSubmitting || feedbackText.trim().length < 5}
                className="inline-flex items-center justify-center rounded-full bg-[oklch(55%_0.23_29)] px-6 py-3 text-sm font-black text-[oklch(99%_0.004_95)] transition-colors hover:bg-[oklch(48%_0.22_29)] disabled:opacity-45 disabled:cursor-not-allowed"
              >
                {feedbackSubmitting ? 'Envoi…' : 'Envoyer mes retours'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  </section>
)}
```

- [ ] **Step 7 : Vérifier le build**

```bash
cd frontend && npm run build 2>&1 | tail -10
```

Expected : `✓ Compiled successfully`

- [ ] **Step 8 : Commit**

```bash
git add frontend/services/business.service.ts frontend/app/dashboard/orders/\[id\]/page.tsx
git commit -m "feat(frontend): section prévisualisation + retours client dans le détail commande"
```

---

## Feature 2 — Changement de mot de passe dans le profil

### Task 6 : Backend — route + FormRequest + contrôleur

**Files:**
- Créer : `backend/app/Http/Requests/Api/UpdatePasswordRequest.php`
- Modifier : `backend/app/Http/Controllers/Api/AuthController.php`
- Modifier : `backend/routes/api.php`

- [ ] **Step 1 : Écrire le test**

Créer `backend/tests/Feature/Api/UpdatePasswordTest.php` :

```php
<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class UpdatePasswordTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_change_password(): void
    {
        $user = User::factory()->create([
            'role' => 'client',
            'is_active' => true,
            'password' => Hash::make('OldPassword1!'),
        ]);

        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withToken($token)->putJson('/api/user/password', [
            'current_password' => 'OldPassword1!',
            'password' => 'NewPassword2@',
            'password_confirmation' => 'NewPassword2@',
        ]);

        $response->assertOk();
        $response->assertJson(['message' => 'Mot de passe mis à jour.']);
        $this->assertTrue(Hash::check('NewPassword2@', $user->fresh()->password));
    }

    public function test_wrong_current_password_returns_422(): void
    {
        $user = User::factory()->create([
            'role' => 'client',
            'is_active' => true,
            'password' => Hash::make('CorrectPassword1!'),
        ]);

        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withToken($token)->putJson('/api/user/password', [
            'current_password' => 'WrongPassword!',
            'password' => 'NewPassword2@',
            'password_confirmation' => 'NewPassword2@',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['current_password']);
    }

    public function test_password_confirmation_mismatch_returns_422(): void
    {
        $user = User::factory()->create([
            'role' => 'client',
            'is_active' => true,
            'password' => Hash::make('OldPassword1!'),
        ]);

        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withToken($token)->putJson('/api/user/password', [
            'current_password' => 'OldPassword1!',
            'password' => 'NewPassword2@',
            'password_confirmation' => 'DifferentPassword!',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['password']);
    }

    public function test_unauthenticated_user_cannot_change_password(): void
    {
        $response = $this->putJson('/api/user/password', [
            'current_password' => 'anything',
            'password' => 'NewPassword2@',
            'password_confirmation' => 'NewPassword2@',
        ]);

        $response->assertUnauthorized();
    }
}
```

- [ ] **Step 2 : Vérifier que les tests échouent**

```bash
cd backend && php artisan test tests/Feature/Api/UpdatePasswordTest.php
```

Expected : FAIL (route 404).

- [ ] **Step 3 : Créer `UpdatePasswordRequest`**

```php
<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class UpdatePasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', Password::min(8)->mixedCase(), 'confirmed'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if (! Hash::check($this->current_password, $this->user()->password)) {
                $validator->errors()->add('current_password', 'Le mot de passe actuel est incorrect.');
            }
        });
    }
}
```

Sauvegarder dans `backend/app/Http/Requests/Api/UpdatePasswordRequest.php`.

- [ ] **Step 4 : Ajouter `updatePassword` dans `AuthController`**

Ajouter l'import :

```php
use App\Http\Requests\Api\UpdatePasswordRequest;
use Illuminate\Support\Facades\Hash;
```

Ajouter la méthode (avant la méthode privée `transformUser`) :

```php
public function updatePassword(UpdatePasswordRequest $request): JsonResponse
{
    $user = $request->user();
    $user->password = Hash::make($request->validated()['password']);
    $user->save();

    // Révoquer tous les tokens sauf le courant pour forcer reconnexion sur autres appareils
    $currentTokenId = $request->user()->currentAccessToken()->id;
    $user->tokens()->where('id', '!=', $currentTokenId)->delete();

    Log::info('auth.password.updated', [
        'user_id' => $user->id,
        'ip' => $request->ip(),
    ]);

    return response()->json(['message' => 'Mot de passe mis à jour.']);
}
```

- [ ] **Step 5 : Ajouter la route dans `routes/api.php`**

Dans le groupe protégé (après `Route::put('/user', ...)`), ajouter :

```php
Route::put('/user/password', [AuthController::class, 'updatePassword']);
```

- [ ] **Step 6 : Faire passer les tests**

```bash
php artisan test tests/Feature/Api/UpdatePasswordTest.php
```

Expected : 4 tests PASS

- [ ] **Step 7 : Commit**

```bash
git add backend/app/Http/Requests/Api/UpdatePasswordRequest.php \
        backend/app/Http/Controllers/Api/AuthController.php \
        backend/routes/api.php \
        backend/tests/Feature/Api/UpdatePasswordTest.php
git commit -m "feat(api): PUT /user/password — changement de mot de passe authentifié"
```

---

### Task 7 : Frontend — section mot de passe dans le profil

**Files:**
- Modifier : `frontend/services/auth.service.ts`
- Modifier : `frontend/app/dashboard/profile/page.tsx`

- [ ] **Step 1 : Ajouter le schema et la méthode dans `auth.service.ts`**

Après `updateProfileSchema`, ajouter :

```typescript
export const updatePasswordSchema = z.object({
  current_password: z.string().min(1, 'Requis'),
  password: z.string().min(8, 'Au moins 8 caractères'),
  password_confirmation: z.string().min(8),
}).refine((data) => data.password === data.password_confirmation, {
  message: 'Les mots de passe ne correspondent pas.',
  path: ['password_confirmation'],
});

export type UpdatePasswordPayload = z.infer<typeof updatePasswordSchema>;
```

Dans l'objet `authService`, après `updateProfile` :

```typescript
async updatePassword(payload: UpdatePasswordPayload): Promise<string> {
  const validatedPayload = updatePasswordSchema.parse(payload);
  const response = await api.put('/user/password', validatedPayload);
  return (response.data?.message as string) || 'Mot de passe mis à jour.';
},
```

- [ ] **Step 2 : Ajouter les états locaux pour le mot de passe dans `profile/page.tsx`**

Dans la fonction `ProfilePage`, après les états existants (`saving`, `error`, `success`), ajouter :

```typescript
const [pwForm, setPwForm] = useState({ current_password: '', password: '', password_confirmation: '' });
const [pwFieldErrors, setPwFieldErrors] = useState<{ current_password?: string; password?: string; password_confirmation?: string }>({});
const [pwSaving, setPwSaving] = useState(false);
const [pwError, setPwError] = useState<string | null>(null);
const [pwSuccess, setPwSuccess] = useState<string | null>(null);
```

Ajouter l'import du schema :

```typescript
import { authService, AuthUser, updatePasswordSchema, UpdatePasswordPayload } from '@/services/auth.service';
```

- [ ] **Step 3 : Ajouter le handler de soumission du mot de passe**

Ajouter après `handleSubmit` (profil) :

```typescript
const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  setPwSaving(true);
  setPwError(null);
  setPwSuccess(null);
  setPwFieldErrors({});

  try {
    const message = await authService.updatePassword(pwForm as UpdatePasswordPayload);
    setPwSuccess(message);
    setPwForm({ current_password: '', password: '', password_confirmation: '' });
  } catch (err) {
    if (err instanceof ZodError) {
      const errs: typeof pwFieldErrors = {};
      for (const issue of err.issues) {
        const path = issue.path[0] as keyof typeof errs;
        if (path) errs[path] = issue.message;
      }
      setPwFieldErrors(errs);
      setPwError('Veuillez corriger les champs invalides.');
    } else if (axios.isAxiosError(err) && err.response?.status === 422) {
      const apiErrors = err.response.data?.errors ?? {};
      setPwFieldErrors({
        current_password: Array.isArray(apiErrors.current_password) ? apiErrors.current_password[0] : undefined,
        password: Array.isArray(apiErrors.password) ? apiErrors.password[0] : undefined,
        password_confirmation: Array.isArray(apiErrors.password_confirmation) ? apiErrors.password_confirmation[0] : undefined,
      });
      setPwError('Veuillez corriger les erreurs.');
    } else {
      setPwError('Impossible de mettre à jour le mot de passe. Réessayez.');
    }
  } finally {
    setPwSaving(false);
  }
};
```

- [ ] **Step 4 : Ajouter la section mot de passe dans le JSX**

Après le formulaire `<form onSubmit={handleSubmit} ...>` (fermeture `</form>`), ajouter le formulaire de changement de mot de passe. Il s'insère dans la colonne principale de la grille (`lg:grid-cols-[minmax(0,1fr)_320px]`), sous le premier formulaire :

```tsx
<form onSubmit={handlePasswordSubmit} className="rounded-2xl border border-neutral-200 bg-[oklch(99%_0.004_95)] px-5 md:px-6">
  <div className="py-5 border-b border-neutral-100">
    <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">Mot de passe</p>
    <p className="mt-2 text-sm text-neutral-500">Modifiez votre mot de passe de connexion.</p>
  </div>

  {[
    { id: 'pw-current', field: 'current_password' as const, label: 'Mot de passe actuel', placeholder: '••••••••' },
    { id: 'pw-new', field: 'password' as const, label: 'Nouveau mot de passe', placeholder: 'Min. 8 caractères' },
    { id: 'pw-confirm', field: 'password_confirmation' as const, label: 'Confirmer le nouveau', placeholder: '••••••••' },
  ].map(({ id, field, label, placeholder }) => (
    <div key={field} className="grid gap-5 border-b border-neutral-100 py-5 md:grid-cols-[220px_minmax(0,1fr)] md:items-start">
      <label htmlFor={id} className="text-xs font-bold uppercase tracking-widest text-neutral-400 pt-0.5">
        {label}
      </label>
      <div>
        <input
          id={id}
          type="password"
          value={pwForm[field]}
          onChange={(e) => {
            setPwForm((prev) => ({ ...prev, [field]: e.target.value }));
            setPwFieldErrors((prev) => ({ ...prev, [field]: undefined }));
            setPwError(null);
            setPwSuccess(null);
          }}
          placeholder={placeholder}
          autoComplete={field === 'current_password' ? 'current-password' : 'new-password'}
          className="w-full rounded-xl border border-neutral-200 bg-[oklch(99%_0.004_95)] px-3 py-3 text-sm font-medium text-neutral-950 outline-none transition-colors focus:border-neutral-950"
        />
        {pwFieldErrors[field] && (
          <p className="mt-2 text-xs font-semibold text-red-600">{pwFieldErrors[field]}</p>
        )}
      </div>
    </div>
  ))}

  {(pwError || pwSuccess) && (
    <div className="py-5">
      {pwError && (
        <div className="flex gap-3 rounded-xl bg-red-50 px-4 py-3 text-red-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <p className="text-sm font-semibold">{pwError}</p>
        </div>
      )}
      {pwSuccess && (
        <div className="flex gap-3 rounded-xl bg-emerald-50 px-4 py-3 text-emerald-700">
          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <p className="text-sm font-semibold">{pwSuccess}</p>
        </div>
      )}
    </div>
  )}

  <div className="py-5">
    <button
      type="submit"
      disabled={pwSaving || !pwForm.current_password || !pwForm.password || !pwForm.password_confirmation}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-neutral-950 px-6 py-3 text-sm font-black text-[oklch(99%_0.004_95)] transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-45"
    >
      <Save className="h-4 w-4" />
      {pwSaving ? 'Enregistrement…' : 'Changer le mot de passe'}
    </button>
  </div>
</form>
```

- [ ] **Step 5 : Vérifier le build TypeScript**

```bash
cd frontend && npm run build 2>&1 | grep -E "error|Error" | head -20
```

Expected : aucune erreur.

- [ ] **Step 6 : Commit**

```bash
git add frontend/services/auth.service.ts frontend/app/dashboard/profile/page.tsx
git commit -m "feat(frontend): changement de mot de passe dans le profil"
```

---

## Feature 3 — Notifications dans la sidebar

### Task 8 : Sidebar — accès notifications avec badge non-lues

**Files:**
- Modifier : `frontend/components/dashboard/Sidebar.tsx`

- [ ] **Step 1 : Ajouter les imports dans `Sidebar.tsx`**

Ajouter au début du fichier, avec les imports existants :

```typescript
import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { notificationsService, NOTIFICATIONS_UPDATED_EVENT } from '@/services/notifications.service';
```

Retirer `"use client"` si absent (il doit déjà y être), sinon vérifier qu'il est présent.

- [ ] **Step 2 : Ajouter l'état `unreadCount` dans le composant `Sidebar`**

Dans la fonction `Sidebar`, après les déclarations `const pathname` et `const router` :

```typescript
const [unreadCount, setUnreadCount] = useState(0);

useEffect(() => {
  let isMounted = true;

  notificationsService.getUnreadCount().then((count) => {
    if (isMounted) setUnreadCount(count);
  }).catch(() => {});

  const handleUpdate = () => {
    notificationsService.getUnreadCount().then((count) => {
      if (isMounted) setUnreadCount(count);
    }).catch(() => {});
  };

  window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, handleUpdate);

  return () => {
    isMounted = false;
    window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, handleUpdate);
  };
}, []);
```

- [ ] **Step 3 : Ajouter notifications dans `navItems` et son rendu**

La constante `navItems` n'est plus suffisante car les notifications ont un badge dynamique. Modifier le rendu des nav items pour ajouter une entrée spéciale pour les notifications.

Dans le JSX (`<div className="space-y-0.5">`), après la boucle `navItems.map(...)`, ajouter :

```tsx
{/* Notifications */}
{(() => {
  const active = pathname.startsWith('/dashboard/notifications');
  return (
    <Link
      href="/dashboard/notifications"
      onClick={handleClose}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
        active
          ? "bg-neutral-950 text-[oklch(99%_0.004_95)]"
          : "text-neutral-500 hover:bg-[oklch(99%_0.004_95)] hover:text-neutral-950"
      )}
    >
      <Bell className="w-4 h-4 flex-shrink-0" />
      Notifications
      {unreadCount > 0 && (
        <span className={cn(
          "ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-black",
          active ? "bg-[oklch(99%_0.004_95)] text-neutral-950" : "bg-[oklch(55%_0.23_29)] text-[oklch(99%_0.004_95)]"
        )}>
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  );
})()}
```

- [ ] **Step 4 : Vérifier le build**

```bash
cd frontend && npm run build 2>&1 | grep -E "error|Error" | head -20
```

Expected : aucune erreur.

- [ ] **Step 5 : Vérifier le lint**

```bash
cd frontend && npm run lint 2>&1 | tail -10
```

Expected : `✓ No ESLint warnings or errors`

- [ ] **Step 6 : Commit**

```bash
git add frontend/components/dashboard/Sidebar.tsx
git commit -m "feat(frontend): notifications dans la sidebar avec badge non-lues"
```

---

## Checklist finale

- [ ] `php artisan test` — tous les tests passent
- [ ] `npm run build` — build sans erreur
- [ ] `npm run lint` — lint sans avertissement
- [ ] Admin : saisir un `preview_url` sur une commande → visible dans le détail client
- [ ] Client : voir le lien de prévisualisation → soumettre des retours → confirmation affichée
- [ ] Client : changer le mot de passe → reconnexion OK avec le nouveau mot de passe
- [ ] Sidebar : badge notifications visible et mis à jour après lecture

---

## Périmètre Phase 1 après implémentation

| Fonctionnalité | Avant | Après |
|---|---|---|
| Tableau de bord | ✅ | ✅ |
| Liste commandes + filtres | ✅ | ✅ |
| Détail commande + paiement FedaPay | ✅ | ✅ |
| **Lien prévisualisation + retours client** | ❌ | ✅ |
| Profil (nom / email / secteur) | ✅ | ✅ |
| **Changement de mot de passe** | ❌ | ✅ |
| Centre de notifications | ✅ | ✅ |
| **Notifications dans la sidebar** | ❌ | ✅ |
| **Couverture Phase 1** | ~85% | **100%** |
