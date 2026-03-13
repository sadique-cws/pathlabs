<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserPanelAccess
{
    public function handle(Request $request, Closure $next, string $panel): Response
    {
        $user = $request->user();

        if ($user === null) {
            abort(401);
        }

        if ($panel === 'lab' && ((int) ($user->collection_center_id ?? 0) > 0 || $user->hasRole('collection_center'))) {
            abort(403);
        }

        if ($panel === 'cc' && (int) ($user->collection_center_id ?? 0) <= 0 && ! $user->hasRole('collection_center')) {
            abort(403);
        }

        return $next($request);
    }
}
