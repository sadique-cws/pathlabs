<?php

namespace Database\Factories;

use App\Models\Doctor;
use App\Models\DoctorAppointment;
use App\Models\Lab;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DoctorAppointment>
 */
class DoctorAppointmentFactory extends Factory
{
    protected $model = DoctorAppointment::class;

    public function definition(): array
    {
        return [
            'lab_id' => Lab::factory(),
            'doctor_id' => Doctor::factory(),
            'appointment_code' => 'APT'.fake()->numerify('######'),
            'public_token' => fake()->uuid(),
            'patient_name' => fake()->name(),
            'patient_phone' => fake()->numerify('9#########'),
            'patient_email' => fake()->safeEmail(),
            'patient_gender' => fake()->randomElement(['male', 'female']),
            'patient_age' => fake()->numberBetween(18, 75),
            'patient_address' => fake()->streetAddress(),
            'appointment_date' => now()->addDay()->toDateString(),
            'slot_time' => '10:00 AM',
            'appointment_at' => now()->addDay(),
            'status' => 'scheduled',
            'consultation_fee' => 500,
            'payment_status' => 'success',
            'payment_method' => 'upi',
            'payment_reference' => 'TXN'.fake()->numerify('######'),
            'receipt_barcode' => 'APT-1-1',
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
