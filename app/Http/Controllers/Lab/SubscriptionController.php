<?php

namespace App\Http\Controllers\Lab;

use App\Http\Controllers\Controller;
use App\Models\Lab;
use App\Models\LabSubscription;
use App\Models\SubscriptionPlan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionController extends Controller
{
    public function index(Request $request): Response
    {
        $labId = (int) $request->attributes->get('lab_id');
        $lab = Lab::with(['currentSubscription.plan', 'subscriptions.plan' => fn($q) => $q->latest()])->findOrFail($labId);

        return Inertia::render('lab/subscription/index', [
            'currentSubscription' => $lab->currentSubscription,
            'availablePlans' => SubscriptionPlan::where('is_active', true)->get(),
            'history' => $lab->subscriptions,
            'razorpayKey' => config('services.razorpay.key_id'),
        ]);
    }

    public function subscribe(Request $request): RedirectResponse
    {
        $labId = (int) $request->attributes->get('lab_id');
        $validated = $request->validate([
            'subscription_plan_id' => 'required|exists:subscription_plans,id',
            'payment_method' => 'required|in:wallet,online',
            'razorpay_payment_id' => 'required_if:payment_method,online|string|nullable',
        ]);

        $plan = SubscriptionPlan::findOrFail($validated['subscription_plan_id']);
        $lab = Lab::findOrFail($labId);

        if ($validated['payment_method'] === 'wallet') {
            $user = $request->user();
            $wallet = \App\Models\Wallet::where('lab_id', $labId)
                ->where('walletable_id', $user->id)
                ->firstOrFail();

            if ($wallet->balance < $plan->price) {
                return back()->withErrors(['payment_method' => 'Insufficient wallet balance.']);
            }

            \Illuminate\Support\Facades\DB::transaction(function () use ($wallet, $plan, $lab) {
                $balanceBefore = $wallet->balance;
                $wallet->decrement('balance', (float) $plan->price);

                \App\Models\WalletTransaction::create([
                    'lab_id' => $lab->id,
                    'wallet_id' => $wallet->id,
                    'direction' => 'out',
                    'amount' => $plan->price,
                    'balance_before' => $balanceBefore,
                    'balance_after' => $wallet->balance,
                    'reference_type' => 'subscription',
                    'reference_id' => $plan->id,
                    'description' => "Subscription upgrade to '{$plan->name}'",
                ]);

                $this->completeSubscription($lab, $plan);
            });
        } else {
            // Placeholder for Razorpay verification logic
            $this->completeSubscription($lab, $plan);
        }

        return back()->with('success', "Successfully subscribed to '{$plan->name}'.");
    }

    protected function completeSubscription(Lab $lab, SubscriptionPlan $plan): void
    {
        // Deactivate old current subscription
        $lab->subscriptions()->update(['is_current' => false]);

        // Create new subscription
        LabSubscription::create([
            'lab_id' => $lab->id,
            'subscription_plan_id' => $plan->id,
            'status' => 'active',
            'starts_at' => now(),
            'ends_at' => $plan->duration_months ? now()->addMonths($plan->duration_months) : null,
            'bill_limit' => $plan->bill_limit,
            'bills_used' => 0,
            'is_current' => true,
        ]);
    }
}
