<?php

namespace Database\Factories;

use App\Models\Lab;
use App\Models\TestPackage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TestPackage>
 */
class TestPackageFactory extends Factory
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
            'name' => fake()->words(2, true).' Package',
            'code' => strtoupper(fake()->bothify('PKG###')),
            'price' => fake()->numberBetween(500, 5000),
            'is_active' => true,
        ];
    }
}
