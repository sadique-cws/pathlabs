<?php

namespace Database\Seeders;

use App\Models\SubscriptionPlan;
use Illuminate\Database\Seeder;

class SubscriptionPlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        SubscriptionPlan::create([
            'name' => 'Pay As You Go',
            'type' => 'pay_as_you_go',
            'price' => 15.00,
            'description' => 'Pay ₹15 for every bill you generate. Deducts from your wallet balance.',
            'is_active' => true,
        ]);

        SubscriptionPlan::create([
            'name' => 'Basic Monthly',
            'type' => 'subscription',
            'price' => 999.00,
            'duration_months' => 1,
            'bill_limit' => 200,
            'description' => 'Process up to 200 bills per month.',
            'is_active' => true,
        ]);

        SubscriptionPlan::create([
            'name' => 'Professional (6 Months)',
            'type' => 'subscription',
            'price' => 4999.00,
            'duration_months' => 6,
            'bill_limit' => 1500,
            'description' => 'Our best value plan for growing labs.',
            'is_active' => true,
        ]);

        SubscriptionPlan::create([
            'name' => 'Enterprise Annual',
            'type' => 'subscription',
            'price' => 9999.00,
            'duration_months' => 12,
            'bill_limit' => 5000,
            'description' => 'Unlimited scaling for high-volume diagnostic centers.',
            'is_active' => true,
        ]);
    }
}
