<?php

namespace Database\Factories;

use App\Models\Bill;
use App\Models\Lab;
use App\Models\LabTest;
use App\Models\Sample;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Sample>
 */
class SampleFactory extends Factory
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
            'bill_id' => Bill::factory(),
            'test_id' => LabTest::factory(),
            'barcode' => fake()->unique()->bothify('1-1-###'),
            'status' => 'pending',
        ];
    }
}
