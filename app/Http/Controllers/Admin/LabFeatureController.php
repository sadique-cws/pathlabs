<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateLabPermissionsRequest;
use App\Http\Requests\UpdateUserRolesRequest;
use App\Models\Lab;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class LabFeatureController extends Controller
{
    public function index(): Response
    {
        $permissions = Permission::query()
            ->orderBy('group')
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'group'])
            ->groupBy('group')
            ->map(fn ($items): array => $items->map(fn (Permission $permission): array => [
                'id' => $permission->id,
                'name' => $permission->name,
                'slug' => $permission->slug,
            ])->values()->all())
            ->all();

        $roles = Role::query()
            ->orderBy('name')
            ->get(['id', 'name', 'slug'])
            ->map(fn (Role $role): array => [
                'id' => $role->id,
                'name' => $role->name,
                'slug' => $role->slug,
            ])
            ->values()
            ->all();

        $labs = Lab::query()
            ->with([
                'permissions' => fn ($query) => $query->select('permissions.id', 'permissions.slug'),
                'users.roles' => fn ($query) => $query->select('roles.id', 'roles.slug'),
            ])
            ->orderBy('name')
            ->get()
            ->map(function (Lab $lab): array {
                return [
                    'id' => $lab->id,
                    'name' => $lab->name,
                    'code' => $lab->code,
                    'permissions' => $lab->permissions
                        ->filter(fn (Permission $permission): bool => (bool) $permission->pivot?->is_enabled)
                        ->pluck('slug')
                        ->values()
                        ->all(),
                    'users' => $lab->users->map(fn (User $user): array => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'roles' => $user->roles->pluck('slug')->values()->all(),
                    ])->values()->all(),
                ];
            })
            ->values()
            ->all();

        return Inertia::render('admin/lab-features', [
            'labs' => $labs,
            'permissionGroups' => $permissions,
            'roles' => $roles,
        ]);
    }

    public function updateLabPermissions(UpdateLabPermissionsRequest $request, Lab $lab): RedirectResponse
    {
        $permissionSlugs = $request->validated('permission_slugs');
        $permissions = Permission::query()
            ->whereIn('slug', $permissionSlugs)
            ->get(['id']);

        $syncData = [];
        foreach ($permissions as $permission) {
            $syncData[$permission->id] = ['is_enabled' => true];
        }

        $lab->permissions()->sync($syncData);

        return back()->with('success', "Updated feature access for {$lab->name}.");
    }

    public function updateUserRoles(UpdateUserRolesRequest $request, User $user): RedirectResponse
    {
        $roleSlugs = $request->validated('role_slugs');
        $roleIds = Role::query()->whereIn('slug', $roleSlugs)->pluck('id');
        $user->roles()->sync($roleIds);

        return back()->with('success', "Updated roles for {$user->name}.");
    }
}
