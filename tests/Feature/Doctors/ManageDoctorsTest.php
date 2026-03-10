<?php

use App\Models\Doctor;
use App\Models\DoctorCommission;
use App\Models\Lab;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('loads doctor list with gift totals for current lab', function () {
    $lab = Lab::factory()->create();
    $user = User::factory()->create(['lab_id' => $lab->id]);
    $doctor = Doctor::factory()->create(['lab_id' => $lab->id, 'name' => 'Dr. Gift', 'doctor_type' => 'lab_doctor']);

    DoctorCommission::query()->create([
        'lab_id' => $lab->id,
        'doctor_id' => $doctor->id,
        'bill_id' => \App\Models\Bill::factory()->create(['lab_id' => $lab->id, 'patient_id' => \App\Models\Patient::factory()->create(['lab_id' => $lab->id])->id])->id,
        'amount' => 120,
        'status' => 'credited',
        'credited_at' => now(),
    ]);

    $this->actingAs($user)
        ->get('/lab/doctors/manage')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('doctors/manage')
            ->has('doctors', 1)
            ->where('doctors.0.name', 'Dr. Gift')
            ->where('doctors.0.gift_total', 120));
});

it('searches existing doctor on add page and creates only if not exists', function () {
    $lab = Lab::factory()->create();
    $user = User::factory()->create(['lab_id' => $lab->id]);
    $existing = Doctor::factory()->create(['lab_id' => $lab->id, 'name' => 'Dr. Existing', 'phone' => '9000011111', 'doctor_type' => 'lab_doctor']);

    $this->actingAs($user)
        ->post('/lab/doctors', [
            'name' => 'Dr. Existing',
            'phone' => '9000011111',
            'email' => 'exist@example.com',
            'commission_type' => 'percent',
            'commission_value' => 10,
            'is_active' => true,
        ])
        ->assertRedirect("/lab/doctors/{$existing->id}/edit");

    $this->actingAs($user)
        ->post('/lab/doctors', [
            'name' => 'Dr. New',
            'phone' => '9000022222',
            'email' => 'new@example.com',
            'commission_type' => 'percent',
            'commission_value' => 12,
            'is_active' => true,
        ])
        ->assertRedirect('/lab/doctors/manage');

    expect(Doctor::query()->where('lab_id', $lab->id)->count())->toBe(2);
});

it('updates doctor created by the same lab', function () {
    $lab = Lab::factory()->create();
    $user = User::factory()->create(['lab_id' => $lab->id]);
    $doctor = Doctor::factory()->create(['lab_id' => $lab->id, 'name' => 'Dr. Old', 'doctor_type' => 'lab_doctor']);

    $this->actingAs($user)
        ->put("/lab/doctors/{$doctor->id}", [
            'name' => 'Dr. Updated',
            'phone' => '9000033333',
            'email' => 'updated@example.com',
            'commission_type' => 'fixed',
            'commission_value' => 100,
            'is_active' => true,
        ])
        ->assertRedirect('/lab/doctors/manage');

    $doctor->refresh();
    expect($doctor->name)->toBe('Dr. Updated')
        ->and((string) $doctor->commission_type)->toBe('fixed');
});
