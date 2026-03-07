<?php

namespace Database\Factories;

use App\Models\Lab;
use App\Models\SampleCollectionSource;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SampleCollectionSource>
 */
class SampleCollectionSourceFactory extends Factory
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
            'name' => fake()->randomElement(['Labs', 'Home', 'Collection Center']),
            'is_active' => true,
        ];
    }
}
