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
        $currentSubscription = null;
        $subscriptionReminder = null;
        $panelKey = 'lab';
        $panelRoutePrefix = '/lab';
        $currentCollectionCenter = null;

        if ($user !== null) {
            $accessRoles = $user->roles()->pluck('slug')->all();
            $isAdmin = in_array('admin', $accessRoles, true) || in_array('super_admin', $accessRoles, true);
            $accessPermissions = $user->permissionSlugs($labId > 0 ? $labId : null);

            if ($request->routeIs('admin.*')) {
                $panelKey = 'admin';
                $panelRoutePrefix = '/admin';
            } elseif ($request->routeIs('doctor.*')) {
                $panelKey = 'doctor';
                $panelRoutePrefix = '/doctor';
            } elseif ($request->routeIs('cc.*') || (int) ($user->collection_center_id ?? 0) > 0) {
                $panelKey = 'collection_center';
                $panelRoutePrefix = '/cc';
                $currentCollectionCenter = $user->collectionCenter()
                    ->select(['id', 'name', 'phone', 'address', 'price_margin_type', 'price_margin_value'])
                    ->first();
            }

            if (in_array('wallet.view', $accessPermissions, true)) {
                if ($panelKey === 'collection_center' && (int) ($user->collection_center_id ?? 0) > 0) {
                    $walletBalance = Wallet::query()
                        ->where('lab_id', $labId)
                        ->where('walletable_type', \App\Models\CollectionCenter::class)
                        ->where('walletable_id', $user->collection_center_id)
                        ->value('balance') ?? 0;
                } else {
                    $walletBalance = $user->wallet()
                        ->when($labId > 0, fn ($q) => $q->where('lab_id', $labId))
                        ->value('balance') ?? 0;
                }
            }

            if ($labId > 0) {
                $lab = Lab::find($labId);
                if ($lab) {
                    $sub = $lab->getEffectiveSubscription();
                    if ($sub) {
                        $currentSubscription = [
                            'plan_name' => $sub->plan->name,
                            'plan_type' => $sub->plan->type,
                            'plan_price' => (float) $sub->plan->price,
                            'bills_used' => $sub->bills_used,
                            'bill_limit' => $sub->bill_limit,
                            'ends_at' => $sub->ends_at?->toIso8601String(),
                        ];
                    }
                    $subscriptionReminder = $lab->getSubscriptionReminder();
                }
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
            'currentCollectionCenter' => $currentCollectionCenter,
            'currentPanel' => [
                'key' => $panelKey,
                'route_prefix' => $panelRoutePrefix,
            ],
            'subscription' => $currentSubscription,
            'subscriptionReminder' => $subscriptionReminder,
            'flash' => [
                'success' => fn (): ?string => $request->session()->get('success'),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
