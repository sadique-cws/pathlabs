<?php

use App\Models\Doctor;
use App\Models\Role;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function createAdminUser(): User
{
    $user = User::factory()->create();
    $role = Role::query()->create([
        'name' => 'Admin',
        'slug' => 'admin',
        'is_system' => true,
    ]);
    $user->roles()->sync([$role->id]);

    return $user;
}

it('allows admin to view all doctors and edit doctor details', function () {
    $admin = createAdminUser();
    $doctor = Doctor::factory()->create([
        'doctor_type' => 'specialist',
        'specialization' => 'Cardiologist',
    ]);

    $this->actingAs($admin)
        ->get('/admin/doctors')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/doctors/manage')
            ->has('doctors', 1));

    $this->actingAs($admin)
        ->put("/admin/doctors/{$doctor->id}", [
            'name' => 'Dr. Updated Admin',
            'phone' => '9000000123',
            'email' => 'admin-updated@doctor.test',
            'specialization' => 'Neurologist',
            'doctor_type' => 'lab_doctor',
            'consultation_fee' => 750,
            'can_approve_reports' => true,
            'is_active' => true,
            'commission_type' => 'percent',
            'commission_value' => 12,
        ])
        ->assertRedirect('/admin/doctors');

    $doctor->refresh();
    expect($doctor->name)->toBe('Dr. Updated Admin')
        ->and($doctor->doctor_type)->toBe('lab_doctor')
        ->and((float) $doctor->consultation_fee)->toBe(750.0);
});
