<?php

namespace Database\Factories;

use App\Models\Doctor;
use App\Models\Lab;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Doctor>
 */
class DoctorFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'lab_id' => Lab::factory(),
            'name' => 'Dr. '.fake()->name(),
            'phone' => fake()->numerify('9#########'),
            'email' => fake()->safeEmail(),
            'doctor_type' => 'specialist',
            'specialization' => fake()->randomElement(['General Physician', 'Cardiologist', 'Pathologist', 'Radiologist']),
            'can_approve_reports' => false,
            'consultation_fee' => fake()->randomElement([300, 400, 500, 700, 900]),
            'commission_type' => 'percent',
            'commission_value' => 10,
            'is_active' => true,
        ];
    }
}
