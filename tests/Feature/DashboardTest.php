<?php

use App\Models\Role;
use App\Models\User;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated lab users are redirected to lab dashboard url', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('lab.dashboard', absolute: false));
});

test('admin users are redirected to admin dashboard url', function () {
    $user = User::factory()->create();
    $adminRole = Role::query()->create([
        'name' => 'Admin',
        'slug' => 'admin',
        'is_system' => true,
    ]);
    $user->roles()->sync([$adminRole->id]);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertRedirect(route('admin.dashboard', absolute: false));
});

test('doctor users are redirected to doctor dashboard url', function () {
    $user = User::factory()->create();
    $doctorRole = Role::query()->create([
        'name' => 'Doctor',
        'slug' => 'doctor',
        'is_system' => true,
    ]);
    $user->roles()->sync([$doctorRole->id]);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertRedirect(route('doctor.dashboard', absolute: false));
});
