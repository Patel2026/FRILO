# Admin Client Auth Separation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Separate the public client login from the admin login and reduce admin exposure with a configurable private entry path plus production-ready Nginx protections.

**Architecture:** The client space remains Next.js + Sanctum bearer token on public routes such as `/login`, `/register`, and `/dashboard`. The admin space remains Laravel Blade + session auth behind `/admin/*`, but the login entry is no longer `/login` or `/admin/login`; it is configured by `FRILO_ADMIN_ENTRY_PATH` and defaults to `/frilo-console`. Production Nginx protects both the private admin entry and `/admin/*` with Basic Auth, and includes an allowlist file that currently permits all IPs but can later be tightened to fixed admin IPs without application code changes.

**Tech Stack:** Laravel 12, Blade admin, session guard, Sanctum API, Next.js 16 client, Nginx 1.27 Docker production gateway.

---

## Root Cause

`backend/routes/web.php` currently calls `Auth::routes(['register' => false])`, which creates Laravel web auth routes at `/login`, `/logout`, password reset URLs, and route names like `login` and `logout`.

`backend/app/Http/Middleware/Authenticate.php` redirects unauthenticated web requests to `route('login')`.

Because `/admin` is protected by Laravel `auth`, a guest request to `/admin` redirects to `/login`. In production `/login` is visually and functionally the client Next.js login page, so admin and client spaces are mixed.

The additional security issue is that a conventional `/admin/login` endpoint is too predictable. Hiding the path is not sufficient security, but it reduces opportunistic noise when combined with Basic Auth, strict rate limiting, role checks, and a prepared IP allowlist.

## Desired Behavior

- `GET /login` remains a public/client Next.js route and is not owned by Laravel web auth.
- `GET /admin` as guest redirects to the configured admin entry path, default `/frilo-console`.
- `GET /frilo-console` displays the Laravel Blade admin login.
- `POST /frilo-console` authenticates only active `super_admin` users.
- `GET /admin/login` does not display a login form and returns `404`.
- `POST /admin/logout` logs out the Laravel admin session.
- Authenticated admin users visiting the configured admin entry path redirect to `/admin/dashboard`.
- Authenticated non-admin web users must not enter `/admin`; the login controller rejects them and clears the session.
- Production Nginx requires Basic Auth before users can access `/frilo-console` or `/admin/*`.
- Production Nginx includes an admin allowlist file that currently uses `allow all;`, ready to be replaced later by fixed IPs plus `deny all;`.

## Files

- Create: `backend/config/frilo.php`
- Modify: `backend/routes/web.php`
- Modify: `backend/app/Http/Controllers/Auth/LoginController.php`
- Modify: `backend/app/Http/Middleware/Authenticate.php`
- Modify: `backend/app/Http/Middleware/RedirectIfAuthenticated.php`
- Modify: `backend/app/Providers/RouteServiceProvider.php`
- Modify: `backend/resources/views/auth/login.blade.php`
- Modify: `backend/resources/views/layouts/topbar.blade.php`
- Modify: `backend/tests/Feature/ExampleTest.php`
- Create: `backend/tests/Feature/Admin/AdminAuthRoutingTest.php`
- Modify: `.env.prod.example`
- Modify: `docker-compose.prod.yml`
- Modify: `docker/nginx/prod.conf`
- Create: `docker/nginx/admin-allowlist.conf`
- Create: `docker/nginx/admin.htpasswd.example`

---

### Task 1: Lock The Admin Routing Contract With Tests

**Files:**
- Create: `backend/tests/Feature/Admin/AdminAuthRoutingTest.php`
- Modify: `backend/tests/Feature/ExampleTest.php`

- [ ] **Step 1: Create failing admin auth routing tests**

```php
<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminAuthRoutingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config(['frilo.admin_entry_path' => 'frilo-console']);

        $this->withoutMiddleware(\App\Http\Middleware\VerifyCsrfToken::class);
    }

    public function test_guest_admin_redirects_to_private_admin_entry(): void
    {
        $this->get('/admin')
            ->assertRedirect('/frilo-console');
    }

    public function test_private_admin_entry_displays_laravel_admin_login(): void
    {
        $this->get('/frilo-console')
            ->assertOk()
            ->assertSee('FRILO — Administration')
            ->assertSee('Connectez-vous pour accéder à l\'administration.');
    }

    public function test_public_login_is_not_laravel_admin_login(): void
    {
        $this->get('/login')
            ->assertNotFound();
    }

    public function test_predictable_admin_login_path_is_not_available(): void
    {
        $this->get('/admin/login')
            ->assertNotFound();
    }

    public function test_super_admin_can_login_from_private_admin_entry(): void
    {
        $admin = User::factory()->create([
            'role' => 'super_admin',
            'email' => 'admin@frilo.test',
            'password' => bcrypt('password'),
            'is_active' => true,
        ]);

        $this->post('/frilo-console', [
            'email' => $admin->email,
            'password' => 'password',
        ])->assertRedirect('/admin/dashboard');

        $this->assertAuthenticatedAs($admin);
    }

    public function test_client_cannot_login_to_admin_surface(): void
    {
        $client = User::factory()->create([
            'role' => 'client',
            'email' => 'client@frilo.test',
            'password' => bcrypt('password'),
            'is_active' => true,
        ]);

        $this->post('/frilo-console', [
            'email' => $client->email,
            'password' => 'password',
        ])->assertSessionHasErrors('email');

        $this->assertGuest();
    }

    public function test_inactive_super_admin_cannot_login_to_admin_surface(): void
    {
        $admin = User::factory()->create([
            'role' => 'super_admin',
            'email' => 'inactive-admin@frilo.test',
            'password' => bcrypt('password'),
            'is_active' => false,
        ]);

        $this->post('/frilo-console', [
            'email' => $admin->email,
            'password' => 'password',
        ])->assertSessionHasErrors('email');

        $this->assertGuest();
    }
}
```

- [ ] **Step 2: Update root redirect expectation**

Change `backend/tests/Feature/ExampleTest.php` to:

```php
public function test_example_root_redirects_to_private_admin_entry(): void
{
    config(['frilo.admin_entry_path' => 'frilo-console']);

    $this->get('/')
        ->assertRedirect('/frilo-console');
}
```

- [ ] **Step 3: Run tests and verify they fail**

Run:

```bash
docker compose exec backend php artisan test --filter=AdminAuthRoutingTest
docker compose exec backend php artisan test --filter=ExampleTest
```

Expected before implementation:
- `/admin` redirects to `/login`, not `/frilo-console`.
- `/frilo-console` is missing.
- `/login` returns the Laravel admin login page instead of being absent from Laravel.

---

### Task 2: Add FRILO Admin Configuration

**Files:**
- Create: `backend/config/frilo.php`
- Modify: `.env.prod.example`
- Modify: `docker-compose.prod.yml`

- [ ] **Step 1: Create FRILO config**

Create `backend/config/frilo.php`:

```php
<?php

return [
    'admin_entry_path' => trim((string) env('FRILO_ADMIN_ENTRY_PATH', 'frilo-console'), '/'),
];
```

- [ ] **Step 2: Document production admin entry path**

Add to `.env.prod.example`:

```env
FRILO_ADMIN_ENTRY_PATH=frilo-console
```

- [ ] **Step 3: Pass admin entry path to the backend container**

Add to the `backend.environment` block in `docker-compose.prod.yml`:

```yaml
      FRILO_ADMIN_ENTRY_PATH: ${FRILO_ADMIN_ENTRY_PATH:-frilo-console}
```

---

### Task 3: Move Laravel Web Auth To The Private Admin Entry

**Files:**
- Modify: `backend/routes/web.php`
- Modify: `backend/resources/views/auth/login.blade.php`
- Modify: `backend/resources/views/layouts/topbar.blade.php`

- [ ] **Step 1: Replace global `Auth::routes()`**

In `backend/routes/web.php`, remove:

```php
use Illuminate\Support\Facades\Auth;
```

and:

```php
Auth::routes(['register' => false]);
```

Add:

```php
use App\Http\Controllers\Auth\LoginController;
use Illuminate\Support\Facades\Route;
```

Then add explicit admin auth routes before the protected admin group:

```php
$adminEntryPath = (string) config('frilo.admin_entry_path', 'frilo-console');

Route::prefix($adminEntryPath)->name('admin.')->group(function () {
    Route::middleware('guest')->group(function () {
        Route::get('/', [LoginController::class, 'showLoginForm'])->name('login');
        Route::post('/', [LoginController::class, 'login'])
            ->middleware('throttle:admin-login')
            ->name('login.submit');
    });
});

Route::get('/admin/login', function () {
    abort(404);
});

Route::post('/admin/logout', [LoginController::class, 'logout'])
    ->middleware('auth')
    ->name('admin.logout');
```

- [ ] **Step 2: Keep protected admin routes under `/admin`**

Keep the protected admin group as:

```php
Route::prefix('admin')->name('admin.')->middleware(['auth', 'super_admin'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::redirect('/', '/admin/dashboard');
    // existing admin resources stay here
});
```

- [ ] **Step 3: Update admin login form action**

In `backend/resources/views/auth/login.blade.php`, change:

```blade
<form action="{{ route('login') }}" method="POST">
```

to:

```blade
<form action="{{ route('admin.login.submit') }}" method="POST">
```

- [ ] **Step 4: Update admin logout form**

In `backend/resources/views/layouts/topbar.blade.php`, change:

```blade
<form method="POST" action="{{ route('logout') }}">
```

to:

```blade
<form method="POST" action="{{ route('admin.logout') }}">
```

- [ ] **Step 5: Update root redirect**

In `backend/routes/web.php`, change the root route body to:

```php
return auth()->check() ? redirect()->route('admin.dashboard') : redirect()->route('admin.login');
```

---

### Task 4: Make Admin Login Role-Aware And Rate-Limited

**Files:**
- Modify: `backend/app/Http/Controllers/Auth/LoginController.php`
- Modify: `backend/app/Providers/RouteServiceProvider.php`
- Modify: `backend/app/Http/Middleware/RedirectIfAuthenticated.php`

- [ ] **Step 1: Redirect authenticated admins to dashboard**

In `backend/app/Providers/RouteServiceProvider.php`, change:

```php
public const HOME = '/';
```

to:

```php
public const HOME = '/admin/dashboard';
```

- [ ] **Step 2: Add strict admin login rate limiter**

In `configureRateLimiting()` in `backend/app/Providers/RouteServiceProvider.php`, add:

```php
RateLimiter::for('admin-login', function (Request $request) {
    $email = (string) $request->input('email', '');
    $key = sprintf('admin-login|%s|%s', $request->ip(), strtolower($email));

    return Limit::perMinute(5)->by($key);
});
```

- [ ] **Step 3: Make `LoginController` admin-only**

In `backend/app/Http/Controllers/Auth/LoginController.php`, add:

```php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
```

Set:

```php
protected $redirectTo = '/admin/dashboard';
```

Add:

```php
public function showLoginForm()
{
    return view('auth.login');
}

protected function authenticated(Request $request, $user)
{
    if (! $user->isSuperAdmin() || ! $user->is_active) {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        throw ValidationException::withMessages([
            $this->username() => 'Ces identifiants ne donnent pas accès à l’administration FRILO.',
        ]);
    }

    $request->session()->regenerate();

    return redirect()->intended($this->redirectPath());
}
```

- [ ] **Step 4: Keep authenticated-user redirects on the admin dashboard**

In `backend/app/Http/Middleware/RedirectIfAuthenticated.php`, keep redirecting authenticated users to `RouteServiceProvider::HOME`. With `HOME = '/admin/dashboard'`, authenticated admins visiting `/frilo-console` go to `/admin/dashboard`.

---

### Task 5: Redirect Unauthenticated Admin Requests Correctly

**Files:**
- Modify: `backend/app/Http/Middleware/Authenticate.php`

- [ ] **Step 1: Update guest redirect logic**

Replace:

```php
return route('login');
```

with:

```php
if ($request->is('admin') || $request->is('admin/*')) {
    return route('admin.login');
}

return null;
```

Rationale:
- `/admin/*` guests go to the private admin entry path via `route('admin.login')`.
- Non-admin web routes do not claim `/login`; the public Next.js app owns it.
- JSON/API behavior remains unchanged.

---

### Task 6: Add Production Nginx Admin Protection

**Files:**
- Modify: `docker/nginx/prod.conf`
- Modify: `docker-compose.prod.yml`
- Create: `docker/nginx/admin-allowlist.conf`
- Create: `docker/nginx/admin.htpasswd.example`

- [ ] **Step 1: Add default allowlist file**

Create `docker/nginx/admin-allowlist.conf`:

```nginx
# Default: do not restrict admin access by IP until fixed admin IPs are collected.
# When fixed IPs are ready, replace "allow all;" with explicit allow rules and "deny all;".
allow all;
```

- [ ] **Step 2: Add htpasswd example file**

Create `docker/nginx/admin.htpasswd.example`:

```text
# Do not use this file in production.
# On the server, create .deploy/nginx/admin.htpasswd with:
# docker run --rm httpd:2.4-alpine htpasswd -nbB frilo-admin 'change-this-password'
```

- [ ] **Step 3: Mount production Nginx auth files**

Add to the `nginx.volumes` list in `docker-compose.prod.yml`:

```yaml
      - ./docker/nginx/admin-allowlist.conf:/etc/nginx/admin-allowlist.conf:ro
      - ./.deploy/nginx/admin.htpasswd:/etc/nginx/admin.htpasswd:ro
```

- [ ] **Step 4: Protect the private admin entry and admin area in Nginx**

In `docker/nginx/prod.conf`, add these locations before the generic Laravel backend location:

```nginx
    location = /frilo-console {
        include /etc/nginx/admin-allowlist.conf;
        auth_basic "FRILO administration";
        auth_basic_user_file /etc/nginx/admin.htpasswd;

        try_files $uri /index.php?$query_string;
    }

    location ^~ /frilo-console/ {
        include /etc/nginx/admin-allowlist.conf;
        auth_basic "FRILO administration";
        auth_basic_user_file /etc/nginx/admin.htpasswd;

        try_files $uri /index.php?$query_string;
    }

    location = /admin {
        include /etc/nginx/admin-allowlist.conf;
        auth_basic "FRILO administration";
        auth_basic_user_file /etc/nginx/admin.htpasswd;

        try_files $uri /index.php?$query_string;
    }

    location ^~ /admin/ {
        include /etc/nginx/admin-allowlist.conf;
        auth_basic "FRILO administration";
        auth_basic_user_file /etc/nginx/admin.htpasswd;

        try_files $uri /index.php?$query_string;
    }
```

Keep the existing Laravel backend location for API and Sanctum:

```nginx
    location ~ ^/(api|sanctum)(/|$) {
        try_files $uri /index.php?$query_string;
    }
```

Do not keep `admin` in the generic regex after adding the dedicated `/admin/` location.

If `FRILO_ADMIN_ENTRY_PATH` is changed from `frilo-console`, update the two `/frilo-console` Nginx locations to the same path in the same deployment.

- [ ] **Step 5: Add production deployment note for Basic Auth file**

Before deploying on the server, create the mounted htpasswd file:

```bash
mkdir -p .deploy/nginx
docker run --rm httpd:2.4-alpine htpasswd -nbB frilo-admin 'replace-with-a-strong-password' > .deploy/nginx/admin.htpasswd
```

Expected:
- `.deploy/nginx/admin.htpasswd` exists only on the server.
- It is not committed to git.

---

### Task 7: Verify Locally And In CI

**Files:**
- No new files unless tests reveal a missing assertion.

- [ ] **Step 1: Run targeted backend tests**

```bash
docker compose exec backend php artisan test --filter=AdminAuthRoutingTest
docker compose exec backend php artisan test --filter=ExampleTest
```

Expected:
- All targeted tests pass.

- [ ] **Step 2: Run backend QA**

```bash
docker compose exec backend composer qa
```

Expected:
- Backend test suite passes.

- [ ] **Step 3: Run frontend QA**

```bash
docker compose exec frontend npm run qa
```

Expected:
- Frontend lint/typecheck/build pass.

- [ ] **Step 4: Commit**

```bash
git add backend/config/frilo.php \
  backend/routes/web.php \
  backend/app/Http/Controllers/Auth/LoginController.php \
  backend/app/Http/Middleware/Authenticate.php \
  backend/app/Http/Middleware/RedirectIfAuthenticated.php \
  backend/app/Providers/RouteServiceProvider.php \
  backend/resources/views/auth/login.blade.php \
  backend/resources/views/layouts/topbar.blade.php \
  backend/tests/Feature/ExampleTest.php \
  backend/tests/Feature/Admin/AdminAuthRoutingTest.php \
  .env.prod.example \
  docker-compose.prod.yml \
  docker/nginx/prod.conf \
  docker/nginx/admin-allowlist.conf \
  docker/nginx/admin.htpasswd.example

git commit -m "fix(auth): harden admin login surface"
```

---

### Task 8: Production Verification

**Files:**
- No code changes.

- [ ] **Step 1: Prepare server environment**

On server:

```bash
grep -q '^FRILO_ADMIN_ENTRY_PATH=' .env.prod || printf '\nFRILO_ADMIN_ENTRY_PATH=frilo-console\n' >> .env.prod
mkdir -p .deploy/nginx
docker run --rm httpd:2.4-alpine htpasswd -nbB frilo-admin 'replace-with-a-strong-password' > .deploy/nginx/admin.htpasswd
```

- [ ] **Step 2: Deploy**

On server:

```bash
git pull
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build --force-recreate backend nginx frontend
```

- [ ] **Step 3: Verify public/client routes**

```bash
curl -I http://161.97.79.213/login
curl -I http://161.97.79.213/dashboard
```

Expected:
- `/login` is served by Next.js.
- `/dashboard` remains a client app route.
- Neither route asks for Nginx Basic Auth.

- [ ] **Step 4: Verify admin protection without Basic Auth credentials**

```bash
curl -I http://161.97.79.213/frilo-console
curl -I http://161.97.79.213/admin
curl -I http://161.97.79.213/admin/login
```

Expected:
- `/frilo-console` returns `401 Unauthorized`.
- `/admin` returns `401 Unauthorized` or redirects only after Basic Auth succeeds.
- `/admin/login` does not expose the Laravel login form.

- [ ] **Step 5: Verify admin entry with Basic Auth credentials**

```bash
curl -I -u frilo-admin:'replace-with-a-strong-password' http://161.97.79.213/frilo-console
curl -I -u frilo-admin:'replace-with-a-strong-password' http://161.97.79.213/admin/login
```

Expected:
- `/frilo-console` returns `200 OK`.
- `/admin/login` returns `404 Not Found`.

- [ ] **Step 6: Browser check**

Open:

```text
http://161.97.79.213/frilo-console
```

Expected:
- Browser asks for the Nginx Basic Auth credentials first.
- After Basic Auth, the page says `FRILO — Administration`.
- It does not display the client login UI.

---

## Future IP Allowlist Activation

When the fixed admin IPs are known, update `docker/nginx/admin-allowlist.conf` on the server or in the repository:

```nginx
allow 203.0.113.10;
allow 198.51.100.25;
deny all;
```

Then reload Nginx:

```bash
docker compose --env-file .env.prod -f docker-compose.prod.yml exec nginx nginx -s reload
```

Expected:
- Only the listed IPs can reach `/frilo-console` and `/admin/*`.
- Basic Auth remains active even for allowed IPs.

---

## Self-Review

- Spec coverage: Separates client `/login` and admin login; avoids predictable `/admin/login`; preserves token client auth and session admin auth; adds Basic Auth and a prepared IP allowlist.
- Placeholder scan: No placeholder implementation steps; the only sample password text is explicitly a deploy-time value that must be replaced during server setup.
- Type/route consistency: Route names are `admin.login`, `admin.login.submit`, `admin.logout`, and `admin.dashboard`; default admin entry path is `/frilo-console`.
- Deployment consistency: Nginx protects `/frilo-console` and `/admin/*`; API and Sanctum routes remain unprotected by Basic Auth.
