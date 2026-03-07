<?php

namespace Database\Factories;

use App\Models\Lab;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Lab>
 */
class LabFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->company().' Diagnostics',
            'code' => strtoupper(fake()->unique()->bothify('LAB###')),
            'phone' => fake()->phoneNumber(),
            'is_active' => true,
        ];
    }
}
