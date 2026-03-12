<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Lab;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserManagementController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->string('search', ''));
        $labId = $request->integer('lab_id');
        $roleSlug = trim((string) $request->string('role_slug', ''));
        $permissionSlug = trim((string) $request->string('permission_slug', ''));

        $users = User::query()
            ->with([
                'lab:id,name,code',
                'roles:id,name,slug',
                'permissions:id,name,slug',
            ])
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($subQuery) use ($search): void {
                    $subQuery
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($labId > 0, fn ($query) => $query->where('lab_id', $labId))
            ->when($roleSlug !== '', function ($query) use ($roleSlug): void {
                $query->whereHas('roles', fn ($roleQuery) => $roleQuery->where('slug', $roleSlug));
            })
            ->when($permissionSlug !== '', function ($query) use ($permissionSlug): void {
                $query->where(function ($subQuery) use ($permissionSlug): void {
                    $subQuery
                        ->whereHas('roles.permissions', fn ($permissionQuery) => $permissionQuery->where('slug', $permissionSlug))
                        ->orWhereHas('permissions', fn ($permissionQuery) => $permissionQuery->where('slug', $permissionSlug));
                });
            })
            ->orderBy('name')
            ->limit(1000)
            ->get()
            ->map(fn (User $user): array => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'lab' => [
                    'id' => $user->lab?->id,
                    'name' => $user->lab?->name,
                    'code' => $user->lab?->code,
                ],
                'roles' => $user->roles->map(fn (Role $role): array => [
                    'slug' => $role->slug,
                    'name' => $role->name,
                ])->values()->all(),
                'direct_permissions' => $user->permissions->pluck('slug')->values()->all(),
            ])
            ->values()
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

        $permissionGroups = Permission::query()
            ->orderBy('group')
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'group'])
            ->groupBy('group')
            ->map(fn ($permissions): array => $permissions
                ->map(fn (Permission $permission): array => [
                    'id' => $permission->id,
                    'name' => $permission->name,
                    'slug' => $permission->slug,
                ])
                ->values()
                ->all())
            ->all();

        $labs = Lab::query()
            ->orderBy('name')
            ->get(['id', 'name', 'code'])
            ->map(fn (Lab $lab): array => [
                'id' => $lab->id,
                'name' => $lab->name,
                'code' => $lab->code,
            ])
            ->values()
            ->all();

        return Inertia::render('admin/users/manage', [
            'users' => $users,
            'roles' => $roles,
            'permissionGroups' => $permissionGroups,
            'labs' => $labs,
            'filters' => [
                'search' => $search,
                'lab_id' => $labId > 0 ? $labId : null,
                'role_slug' => $roleSlug !== '' ? $roleSlug : null,
                'permission_slug' => $permissionSlug !== '' ? $permissionSlug : null,
            ],
        ]);
    }
}
