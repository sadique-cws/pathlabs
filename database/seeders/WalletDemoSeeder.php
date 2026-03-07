<?php

namespace Database\Seeders;

use App\Models\Lab;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use Illuminate\Database\Seeder;

class WalletDemoSeeder extends Seeder
{
    public function run(): void
    {
        $labs = Lab::all();

        foreach ($labs as $lab) {
            $wallet = Wallet::firstOrCreate(
                [
                    'lab_id' => $lab->id,
                    'walletable_type' => Lab::class,
                    'walletable_id' => $lab->id,
                ],
                [
                    'balance' => 0,
                    'currency' => 'INR',
                ]
            );

            // Add some dummy transactions
            if ($wallet->transactions()->count() === 0) {
                // Initial Top-up
                $amount1 = 5000;
                $balanceBefore1 = 0;
                $wallet->increment('balance', $amount1);

                WalletTransaction::create([
                    'lab_id' => $lab->id,
                    'wallet_id' => $wallet->id,
                    'direction' => 'in',
                    'amount' => $amount1,
                    'balance_before' => $balanceBefore1,
                    'balance_after' => $amount1,
                    'reference_type' => 'razorpay',
                    'reference_id' => 'pay_DEMO' . rand(1000, 9999),
                    'description' => 'Initial Wallet Top-up',
                    'created_at' => now()->subDays(5),
                ]);

                // A test payment
                $amount2 = 150.50;
                $balanceBefore2 = $wallet->balance;
                $wallet->decrement('balance', $amount2);

                WalletTransaction::create([
                    'lab_id' => $lab->id,
                    'wallet_id' => $wallet->id,
                    'direction' => 'out',
                    'amount' => $amount2,
                    'balance_before' => $balanceBefore2,
                    'balance_after' => $wallet->balance,
                    'reference_type' => 'billing',
                    'reference_id' => 'BILL-' . rand(100, 999),
                    'description' => 'Test Report Process Fee',
                    'created_at' => now()->subDays(2),
                ]);
            }
        }
    }
}
