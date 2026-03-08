<?php

namespace App\Http\Middleware;

use App\Models\Lab;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $walletBalance = null;
        $labId = (int) ($request->attributes->get('lab_id') ?? $user?->lab_id ?? 0);
        $accessPermissions = [];
        $accessRoles = [];
        $isAdmin = false;

        if ($user !== null) {
            $accessRoles = $user->roles()->pluck('slug')->all();
            $isAdmin = in_array('admin', $accessRoles, true) || in_array('super_admin', $accessRoles, true);
            $accessPermissions = $user->permissionSlugs($labId > 0 ? $labId : null);

            // Fetch balance via relationship if permission exists
            if (in_array('wallet.view', $accessPermissions, true)) {
                $walletBalance = $user->wallet()
                    ->when($labId > 0, fn($q) => $q->where('lab_id', $labId))
                    ->value('balance') ?? 0;
            }
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user,
            ],
            'wallet' => [
                'balance' => $walletBalance,
                'currency' => 'INR',
            ],
            'access' => [
                'permissions' => $accessPermissions,
                'roles' => $accessRoles,
                'is_admin' => $isAdmin,
                'is_impersonating' => $request->session()->has('switched_lab_id'),
            ],
            'currentLab' => [
                'id' => $labId,
                'name' => $labId > 0 ? Lab::where('id', $labId)->value('name') : null,
            ],
            'flash' => [
                'success' => fn(): ?string => $request->session()->get('success'),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
