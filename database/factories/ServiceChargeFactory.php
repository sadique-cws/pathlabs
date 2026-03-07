<?php

namespace Database\Factories;

use App\Models\Lab;
use App\Models\ServiceCharge;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ServiceCharge>
 */
class ServiceChargeFactory extends Factory
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
            'name' => fake()->words(2, true),
            'amount' => fake()->numberBetween(10, 200),
            'is_active' => true,
        ];
    }
}
