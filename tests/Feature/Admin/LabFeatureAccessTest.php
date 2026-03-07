<?php

use App\Models\Lab;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\PanelDemoSeeder;

it('allows admin to view lab feature control panel', function () {
    $lab = Lab::factory()->create();
    $adminRole = Role::query()->create([
        'name' => 'Admin',
        'slug' => 'admin',
        'is_system' => true,
    ]);

    Permission::query()->create(['name' => 'Admin Lab Features', 'slug' => 'admin.labs.features', 'group' => 'admin']);

    $admin = User::factory()->create(['lab_id' => $lab->id]);
    $admin->roles()->attach($adminRole);

    $this->actingAs($admin)
        ->get('/admin/labs/features')
        ->assertOk();
});

it('blocks non admin from lab feature control panel', function () {
    $lab = Lab::factory()->create();
    Permission::query()->create(['name' => 'Admin Lab Features', 'slug' => 'admin.labs.features', 'group' => 'admin']);
    $user = User::factory()->create(['lab_id' => $lab->id]);

    $this->actingAs($user)
        ->get('/admin/labs/features')
        ->assertForbidden();
});

it('updates lab permissions and user roles from admin panel', function () {
    $lab = Lab::factory()->create();
    $permission = Permission::query()->create(['name' => 'Billing Create', 'slug' => 'billing.create', 'group' => 'billing']);
    $role = Role::query()->create(['name' => 'Front Desk', 'slug' => 'front_desk', 'is_system' => true]);
    $adminRole = Role::query()->create(['name' => 'Admin', 'slug' => 'admin', 'is_system' => true]);
    Permission::query()->create(['name' => 'Admin Lab Features', 'slug' => 'admin.labs.features', 'group' => 'admin']);

    $admin = User::factory()->create(['lab_id' => $lab->id]);
    $admin->roles()->attach($adminRole);

    $targetUser = User::factory()->create(['lab_id' => $lab->id]);

    $this->actingAs($admin)
        ->put("/admin/labs/{$lab->id}/features", [
            'permission_slugs' => [$permission->slug],
        ])
        ->assertRedirect();

    $this->actingAs($admin)
        ->put("/admin/users/{$targetUser->id}/roles", [
            'role_slugs' => [$role->slug],
        ])
        ->assertRedirect();

    $lab->refresh();
    $targetUser->refresh();

    expect($lab->permissions()->where('permissions.slug', $permission->slug)->exists())->toBeTrue();
    expect($targetUser->roles()->where('roles.slug', $role->slug)->exists())->toBeTrue();
});

it('updates role permissions from admin panel', function () {
    $lab = Lab::factory()->create();
    $adminRole = Role::query()->create(['name' => 'Admin', 'slug' => 'admin', 'is_system' => true]);
    $role = Role::query()->create(['name' => 'Front Desk', 'slug' => 'front_desk', 'is_system' => true]);
    $permission = Permission::query()->create(['name' => 'Add Patient', 'slug' => 'patients.add', 'group' => 'front_desk']);
    Permission::query()->create(['name' => 'Admin Lab Features', 'slug' => 'admin.labs.features', 'group' => 'admin']);

    $admin = User::factory()->create(['lab_id' => $lab->id]);
    $admin->roles()->attach($adminRole);

    $this->actingAs($admin)
        ->put("/admin/roles/{$role->id}/permissions", [
            'permission_slugs' => [$permission->slug],
        ])
        ->assertRedirect();

    $role->refresh();

    expect($role->permissions()->where('permissions.slug', $permission->slug)->exists())->toBeTrue();
});

it('enforces feature permission middleware on billing route', function () {
    $lab = Lab::factory()->create();
    $frontDeskRole = Role::query()->create([
        'name' => 'Front Desk',
        'slug' => 'front_desk',
        'is_system' => true,
    ]);
    $permission = Permission::query()->create([
        'name' => 'Create Bill',
        'slug' => 'billing.create',
        'group' => 'billing',
    ]);
    $frontDeskRole->permissions()->attach($permission);
    $lab->permissions()->attach($permission, ['is_enabled' => true]);

    $user = User::factory()->create(['lab_id' => $lab->id]);
    $user->roles()->attach($frontDeskRole);

    $this->actingAs($user)
        ->get('/lab/billing/create')
        ->assertOk();

    $this->actingAs($user)
        ->get('/lab/billing/manage')
        ->assertForbidden();
});

it('seeds front desk permission group and access permission', function () {
    $this->seed(PanelDemoSeeder::class);

    $frontDeskPermission = Permission::query()->where('slug', 'front_desk.access')->first();
    expect($frontDeskPermission)->not->toBeNull();
    expect($frontDeskPermission?->group)->toBe('front_desk');

    $frontDeskUser = User::query()->where('email', 'frontdesk@pathlabs.test')->first();
    expect($frontDeskUser)->not->toBeNull();
    expect($frontDeskUser?->permissionSlugs($frontDeskUser?->lab_id))->toContain('front_desk.access');
});
