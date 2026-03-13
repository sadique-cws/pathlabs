<?php

use App\Models\Lab;
use App\Models\LabTest;
use App\Models\Permission;
use App\Models\Role;
use App\Models\TestGroup;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('lab clinical master tests page loads with test group relation', function () {
    $lab = Lab::factory()->create();
    $role = Role::query()->create([
        'name' => 'Lab Manager',
        'slug' => 'lab_manager',
        'is_system' => false,
    ]);
    $permission = Permission::query()->create([
        'name' => 'Manage Clinical Tests',
        'slug' => 'clinical_master.manage_tests',
        'group' => 'front_desk',
    ]);

    $role->permissions()->attach($permission->id);
    $lab->permissions()->attach($permission->id, ['is_enabled' => true]);

    $user = User::factory()->create(['lab_id' => $lab->id]);
    $user->roles()->attach($role->id);

    $group = TestGroup::query()->create([
        'lab_id' => $lab->id,
        'name' => 'Biochemistry',
        'is_active' => true,
        'is_system' => false,
    ]);

    LabTest::factory()->create([
        'lab_id' => $lab->id,
        'name' => 'Serum Glucose',
        'test_group_id' => $group->id,
        'department' => 'Pathology',
    ]);

    $this->actingAs($user)
        ->get('/lab/clinical-master/tests')
        ->assertOk()
        ->assertSee('Serum Glucose')
        ->assertSee('Biochemistry');
});
