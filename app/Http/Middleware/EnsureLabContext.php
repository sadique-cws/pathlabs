<?php

namespace App\Http\Middleware;

use App\Models\Lab;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureLabContext
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (($user?->hasRole('admin') || $user?->hasRole('super_admin') || $user?->hasRole('bde')) && $request->is('admin/*')) {
            $request->attributes->set('lab_id', (int) (session('switched_lab_id') ?? $user->lab_id ?? 0));

            return $next($request);
        }

        $labId = (int) (session('switched_lab_id') ?? $user?->lab_id ?? 0);

        if (
            (int) $labId <= 0 &&
            ($user?->hasRole('admin') || $user?->hasRole('super_admin') || $user?->hasRole('bde'))
        ) {
            $labId = (int) Lab::query()->value('id');
        }

        if ((int) $labId <= 0) {
            abort(422, 'Lab context is required.');
        }

        $request->attributes->set('lab_id', (int) $labId);

        return $next($request);
    }
}
