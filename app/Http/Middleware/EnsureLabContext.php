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
        // Check session first (for impersonation)
        $switchedLabId = session('switched_lab_id');

        $labId = $switchedLabId ?? $request->user()?->lab_id;

        if ($labId === null || (int) $labId <= 0) {
            $labId = $request->integer('lab_id');
        }

        if ((int) $labId <= 0) {
            $labId = (int) $request->header('X-Lab-Id', 0);
        }

        if ((int) $labId <= 0 && $request->user()?->hasRole('admin')) {
            $labId = (int) Lab::query()->value('id');
        }

        if ((int) $labId <= 0) {
            abort(422, 'Lab context is required.');
        }

        $request->attributes->set('lab_id', (int) $labId);

        return $next($request);
    }
}
