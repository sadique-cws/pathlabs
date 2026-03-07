<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureFeaturePermission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $permissionSlug): Response
    {
        $user = $request->user();
        $labId = (int) ($request->attributes->get('lab_id') ?? $user?->lab_id ?? 0);

        if ($user === null || ! $user->canAccessFeature($permissionSlug, $labId)) {
            abort(403, 'Permission denied for this feature.');
        }

        return $next($request);
    }
}
