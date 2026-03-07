<?php

namespace Database\Factories;

use App\Models\Bill;
use App\Models\Doctor;
use App\Models\DoctorCommission;
use App\Models\Lab;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DoctorCommission>
 */
class DoctorCommissionFactory extends Factory
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
            'doctor_id' => Doctor::factory(),
            'bill_id' => Bill::factory(),
            'amount' => 120,
            'status' => 'credited',
            'credited_at' => now(),
        ];
    }
}
