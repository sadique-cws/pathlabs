<?php

namespace Database\Factories;

use App\Models\Lab;
use App\Models\Patient;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Patient>
 */
class PatientFactory extends Factory
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
            'name' => fake()->name(),
            'phone' => fake()->numerify('9#########'),
            'gender' => fake()->randomElement(['male', 'female', 'other']),
            'age_years' => fake()->numberBetween(1, 85),
            'age_months' => fake()->numberBetween(0, 11),
            'age_days' => fake()->numberBetween(0, 30),
            'address' => fake()->address(),
            'city' => fake()->city(),
            'state' => fake()->state(),
            'pin_code' => fake()->postcode(),
        ];
    }
}
