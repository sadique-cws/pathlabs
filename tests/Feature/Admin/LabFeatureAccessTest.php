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

it('allows admin to view manage users page', function () {
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
        ->get('/admin/users/manage')
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

it('blocks non admin from manage users page', function () {
    $lab = Lab::factory()->create();
    $user = User::factory()->create(['lab_id' => $lab->id]);

    $this->actingAs($user)
        ->get('/admin/users/manage')
        ->assertForbidden();
});

it('updates lab permissions and user roles from admin panel', function () {
    $lab = Lab::factory()->create();
    $permission = Permission::query()->create(['name' => 'Billing Create', 'slug' => 'billing.create', 'group' => 'billing']);
    $directPermission = Permission::query()->create(['name' => 'Edit Bill', 'slug' => 'billing.edit', 'group' => 'billing']);
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

    $this->actingAs($admin)
        ->put("/admin/users/{$targetUser->id}/permissions", [
            'permission_slugs' => [$directPermission->slug],
        ])
        ->assertRedirect();

    $lab->refresh();
    $targetUser->refresh();

    expect($lab->permissions()->where('permissions.slug', $permission->slug)->exists())->toBeTrue();
    expect($targetUser->roles()->where('roles.slug', $role->slug)->exists())->toBeTrue();
    expect($targetUser->permissions()->where('permissions.slug', $directPermission->slug)->exists())->toBeTrue();
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

it('denies feature routes to role-less users even when lab has enabled permissions', function () {
    $lab = Lab::factory()->create();
    $permission = Permission::query()->create([
        'name' => 'Create Bill',
        'slug' => 'billing.create',
        'group' => 'billing',
    ]);
    $lab->permissions()->attach($permission, ['is_enabled' => true]);

    $user = User::factory()->create(['lab_id' => $lab->id]);

    $this->actingAs($user)
        ->get('/lab/billing/create')
        ->assertForbidden();
});

it('requires explicit staff.manage permission for lab staff routes', function () {
    $lab = Lab::factory()->create();
    $staffPermission = Permission::query()->firstOrCreate(
        ['slug' => 'staff.manage'],
        ['name' => 'Manage Staff', 'group' => 'front_desk'],
    );
    $role = Role::query()->create([
        'name' => 'Manager',
        'slug' => 'manager',
        'is_system' => false,
    ]);
    $role->permissions()->attach($staffPermission->id);
    $lab->permissions()->attach($staffPermission->id, ['is_enabled' => true]);

    $deniedUser = User::factory()->create(['lab_id' => $lab->id]);
    $targetUser = User::factory()->create(['lab_id' => $lab->id]);

    $this->actingAs($deniedUser)
        ->get('/lab/staff')
        ->assertForbidden();

    $allowedUser = User::factory()->create(['lab_id' => $lab->id]);
    $allowedUser->roles()->attach($role->id);

    $this->actingAs($allowedUser)
        ->get('/lab/staff')
        ->assertOk();

    $this->actingAs($allowedUser)
        ->post("/lab/staff/{$targetUser->id}", [
            'is_approver' => true,
            'qualification' => 'DMLT',
        ])
        ->assertRedirect();
});

it('does not allow lab context spoofing from request query when user has no lab id', function () {
    $permission = Permission::query()->create([
        'name' => 'Create Bill',
        'slug' => 'billing.create',
        'group' => 'billing',
    ]);
    $lab = Lab::factory()->create();
    $role = Role::query()->create([
        'name' => 'Front Desk',
        'slug' => 'front_desk_temp',
        'is_system' => false,
    ]);
    $role->permissions()->attach($permission->id);
    $lab->permissions()->attach($permission->id, ['is_enabled' => true]);

    $user = User::factory()->create(['lab_id' => null]);
    $user->roles()->attach($role->id);

    $this->actingAs($user)
        ->get("/lab/billing/create?lab_id={$lab->id}")
        ->assertStatus(422);
});

it('allows direct user permission without a role when lab feature is enabled', function () {
    $lab = Lab::factory()->create();
    $permission = Permission::query()->create([
        'name' => 'Manage Patients',
        'slug' => 'patients.manage',
        'group' => 'front_desk',
    ]);
    $lab->permissions()->attach($permission->id, ['is_enabled' => true]);

    $user = User::factory()->create(['lab_id' => $lab->id]);
    $user->permissions()->attach($permission->id);

    $this->actingAs($user)
        ->get('/lab/patients/manage')
        ->assertOk();
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
