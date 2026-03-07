<?php

namespace Database\Factories;

use App\Models\Lab;
use App\Models\Wallet;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Wallet>
 */
class WalletFactory extends Factory
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
            'walletable_type' => \App\Models\Lab::class,
            'walletable_id' => Lab::factory(),
            'balance' => 1000,
            'currency' => 'INR',
        ];
    }
}
