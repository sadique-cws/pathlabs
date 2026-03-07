<?php

namespace Database\Factories;

use App\Models\Bill;
use App\Models\BillItem;
use App\Models\Lab;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BillItem>
 */
class BillItemFactory extends Factory
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
            'billable_type' => 'test',
            'billable_id' => 1,
            'name' => fake()->words(2, true),
            'quantity' => 1,
            'unit_price' => 500,
            'total_price' => 500,
        ];
    }
}
