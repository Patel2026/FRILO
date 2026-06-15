<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = auth()->user();

        if (! $user || ! $user->isActive() || ! $user->isAdmin()) {
            abort(403, 'Accès réservé à l’administration FRILO.');
        }

        if ($roles !== [] && ! $user->hasAnyAdminRole($roles)) {
            abort(403, 'Accès réservé à un rôle administrateur autorisé.');
        }

        return $next($request);
    }
}
