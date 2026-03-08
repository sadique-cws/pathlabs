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
        ]);
    }

    public function subscribe(Request $request): RedirectResponse
    {
        $labId = (int) $request->attributes->get('lab_id');
        $validated = $request->validate([
            'subscription_plan_id' => 'required|exists:subscription_plans,id',
        ]);

        $plan = SubscriptionPlan::findOrFail($validated['subscription_plan_id']);
        $lab = Lab::findOrFail($labId);

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

        return back()->with('success', "Successfully subscribed to '{$plan->name}'.");
    }
}
