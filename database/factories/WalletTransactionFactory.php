<?php

namespace Database\Factories;

use App\Models\Lab;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<WalletTransaction>
 */
class WalletTransactionFactory extends Factory
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
            'wallet_id' => Wallet::factory(),
            'direction' => 'debit',
            'amount' => 15,
            'balance_before' => 100,
            'balance_after' => 85,
            'description' => 'Service charge deducted',
        ];
    }
}
