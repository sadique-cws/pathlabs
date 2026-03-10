<?php

use App\Models\Doctor;
use App\Models\Lab;
use Inertia\Testing\AssertableInertia as Assert;

it('shows public doctor list for appointment booking', function () {
    Doctor::factory()->count(3)->create(['is_active' => true]);

    $this->get('/public/doctors')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/appointments/doctors')
            ->has('doctors'));
});

it('books public appointment successfully and allows cancellation', function () {
    $lab = Lab::factory()->create();
    $doctor = Doctor::factory()->create([
        'lab_id' => $lab->id,
        'is_active' => true,
        'consultation_fee' => 900,
    ]);

    $this->post('/public/appointments', [
        'doctor_id' => $doctor->id,
        'appointment_date' => now()->addDay()->toDateString(),
        'slot_time' => '10:00 AM',
        'patient_name' => 'Public Patient',
        'patient_phone' => '9000000011',
        'patient_email' => 'public@patient.test',
        'patient_gender' => 'male',
        'patient_age' => 28,
        'patient_address' => 'Main Road',
        'payment_method' => 'upi',
        'payment_status' => 'success',
    ])->assertRedirect();

    $appointment = \App\Models\DoctorAppointment::query()->latest('id')->firstOrFail();

    expect($appointment->status)->toBe('scheduled')
        ->and($appointment->payment_status)->toBe('success')
        ->and($appointment->receipt_barcode)->not->toBeNull();

    $this->get("/public/appointments/{$appointment->public_token}/receipt")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/appointments/receipt')
            ->where('appointment.appointment_code', $appointment->appointment_code));

    $this->post("/public/appointments/{$appointment->public_token}/cancel", [
        'patient_phone' => '9999999999',
    ])->assertSessionHasErrors(['patient_phone']);

    $this->post("/public/appointments/{$appointment->public_token}/cancel", [
        'patient_phone' => '9000000011',
        'cancel_reason' => 'Need reschedule',
    ])->assertRedirect();

    $appointment->refresh();
    expect($appointment->status)->toBe('cancelled')
        ->and($appointment->cancel_reason)->toBe('Need reschedule');
});

it('shows failed appointment status page on payment failure', function () {
    $lab = Lab::factory()->create();
    $doctor = Doctor::factory()->create([
        'lab_id' => $lab->id,
        'is_active' => true,
    ]);

    $this->post('/public/appointments', [
        'doctor_id' => $doctor->id,
        'appointment_date' => now()->addDay()->toDateString(),
        'slot_time' => '11:00 AM',
        'patient_name' => 'Failed Patient',
        'patient_phone' => '9000000012',
        'payment_method' => 'card',
        'payment_status' => 'failed',
    ])->assertRedirect();

    $appointment = \App\Models\DoctorAppointment::query()->latest('id')->firstOrFail();

    $this->get("/public/appointments/{$appointment->public_token}/failed")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/appointments/status')
            ->where('mode', 'failed'));

    expect($appointment->status)->toBe('cancelled')
        ->and($appointment->payment_status)->toBe('failed');
});
