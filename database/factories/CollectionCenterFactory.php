<?php

namespace Database\Factories;

use App\Models\CollectionCenter;
use App\Models\Lab;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CollectionCenter>
 */
class CollectionCenterFactory extends Factory
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
            'name' => fake()->company().' Collection Center',
            'phone' => fake()->numerify('9#########'),
            'address' => fake()->address(),
            'commission_type' => 'percent',
            'commission_value' => 5,
            'is_active' => true,
        ];
    }
}
