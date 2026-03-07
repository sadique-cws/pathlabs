<?php

namespace Database\Factories;

use App\Models\Bill;
use App\Models\Lab;
use App\Models\Patient;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Bill>
 */
class BillFactory extends Factory
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
            'patient_id' => Patient::factory(),
            'bill_number' => 'LAB1-'.fake()->numerify('##########').'-'.fake()->numerify('####'),
            'billing_at' => now(),
            'test_total' => 0,
            'package_total' => 0,
            'gross_total' => 0,
            'discount_amount' => 0,
            'service_charge' => 15,
            'net_total' => 15,
            'status' => 'generated',
        ];
    }
}
