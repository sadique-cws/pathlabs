<?php

namespace Database\Factories;

use App\Models\Lab;
use App\Models\LabTest;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LabTest>
 */
class LabTestFactory extends Factory
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
            'name' => fake()->words(3, true),
            'code' => strtoupper(fake()->bothify('TST###')),
            'sample_type' => fake()->randomElement(['blood', 'urine', 'serum']),
            'price' => fake()->numberBetween(150, 3000),
            'referral_commission_value' => 10,
            'referral_commission_type' => 'percent',
            'collection_center_commission_value' => 5,
            'collection_center_commission_type' => 'percent',
            'is_active' => true,
        ];
    }
}
