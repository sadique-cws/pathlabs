<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionPlan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionPlanController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/plans/index', [
            'plans' => SubscriptionPlan::latest()->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:pay_as_you_go,subscription',
            'price' => 'required|numeric|min:0',
            'duration_months' => 'nullable|integer|min:0',
            'bill_limit' => 'nullable|integer|min:0',
            'description' => 'nullable|string',
            'is_active' => 'required|boolean',
        ]);

        SubscriptionPlan::create($validated);

        return back()->with('success', 'Subscription plan created successfully.');
    }

    public function update(Request $request, SubscriptionPlan $plan): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:pay_as_you_go,subscription',
            'price' => 'required|numeric|min:0',
            'duration_months' => 'nullable|integer|min:0',
            'bill_limit' => 'nullable|integer|min:0',
            'description' => 'nullable|string',
            'is_active' => 'required|boolean',
        ]);

        $plan->update($validated);

        return back()->with('success', 'Subscription plan updated successfully.');
    }

    public function destroy(SubscriptionPlan $plan): RedirectResponse
    {
        // Check if plan is being used by any active lab subscription
        if ($plan->is_active && \App\Models\LabSubscription::where('subscription_plan_id', $plan->id)->where('status', 'active')->exists()) {
            return back()->with('error', 'Cannot delete a plan that is currently active for some labs.');
        }

        $plan->delete();

        return back()->with('success', 'Subscription plan deleted successfully.');
    }
}
