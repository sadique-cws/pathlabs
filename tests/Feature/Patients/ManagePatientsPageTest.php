<?php

use App\Models\Lab;
use App\Models\Patient;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('loads manage patients page and shows lab patients', function () {
    $lab = Lab::factory()->create();
    $user = User::factory()->create(['lab_id' => $lab->id]);

    Patient::factory()->create([
        'lab_id' => $lab->id,
        'name' => 'Test Patient',
        'phone' => '9999911111',
        'gender' => 'male',
        'age_years' => 32,
        'city' => 'Noida',
    ]);

    $this->actingAs($user)
        ->get('/lab/patients/manage')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('patients/manage')
            ->has('patients', 1)
            ->where('patients.0.name', 'Test Patient')
            ->where('patients.0.mobile', '9999911111'));
});

it('loads add patient page', function () {
    $lab = Lab::factory()->create();
    $user = User::factory()->create(['lab_id' => $lab->id]);

    $this->actingAs($user)
        ->get('/lab/patients/add')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('patients/add'));
});

it('creates patient from add patient page', function () {
    $lab = Lab::factory()->create();
    $user = User::factory()->create(['lab_id' => $lab->id]);

    $this->actingAs($user)
        ->post('/lab/patients', [
            'title' => 'Mr.',
            'name' => 'Added Patient',
            'phone' => '9000055555',
            'alternative_phone' => '9000066666',
            'gender' => 'male',
            'age_years' => 30,
            'address' => 'Patient Address',
            'pin_code' => '110011',
            'city' => 'Delhi',
            'landmark' => 'Local Area',
            'discount_package' => 'Gold Package',
            'discount_expiry_date' => '2026-12-31',
        ])
        ->assertRedirect('/lab/patients/manage');

    $patient = Patient::query()->where('lab_id', $lab->id)->where('name', 'Added Patient')->first();
    expect($patient)->not->toBeNull();
    expect($patient?->alternative_phone)->toBe('9000066666');
});

it('updates patient details from edit page', function () {
    $lab = Lab::factory()->create();
    $user = User::factory()->create(['lab_id' => $lab->id]);
    $patient = Patient::factory()->create([
        'lab_id' => $lab->id,
        'name' => 'Before Name',
        'phone' => '9000011111',
    ]);

    $this->actingAs($user)
        ->put("/lab/patients/{$patient->id}", [
            'title' => 'Mr.',
            'name' => 'After Name',
            'phone' => '9000099999',
            'gender' => 'male',
            'age_years' => 25,
            'age_months' => 1,
            'age_days' => 2,
            'city' => 'Pune',
            'address' => 'Updated Address',
            'state' => 'MH',
            'pin_code' => '411001',
        ])
        ->assertRedirect('/lab/patients/manage');

    $patient->refresh();

    expect($patient->name)->toBe('After Name')
        ->and($patient->phone)->toBe('9000099999')
        ->and($patient->city)->toBe('Pune');
});
