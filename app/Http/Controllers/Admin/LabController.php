<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Lab;
use App\Models\LabSubscription;
use App\Models\SubscriptionPlan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LabController extends Controller
{
    public function index(): Response
    {
        $labs = Lab::query()
            ->with(['currentSubscription.plan'])
            ->withCount(['users', 'tests'])
            ->orderBy('name')
            ->get()
            ->map(function (Lab $lab) {
                return [
                    'id' => $lab->id,
                    'name' => $lab->name,
                    'code' => $lab->code,
                    'phone' => $lab->phone,
                    'is_active' => $lab->is_active,
                    'users_count' => $lab->users_count,
                    'tests_count' => $lab->tests_count,
                    'current_plan' => $lab->currentSubscription?->plan?->name ?? 'No active plan',
                    'subscription_status' => $lab->currentSubscription?->status ?? 'none',
                    'bills_used' => $lab->currentSubscription?->bills_used ?? 0,
                    'bill_limit' => $lab->currentSubscription?->bill_limit ?? 0,
                    'created_at' => $lab->created_at->format('d/m/Y'),
                ];
            });

        return Inertia::render('admin/labs/manage', [
            'labs' => $labs,
            'plans' => SubscriptionPlan::where('is_active', true)->get(),
        ]);
    }

    public function show(Lab $lab): RedirectResponse
    {
        return $this->switchContext($lab);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:20|unique:labs,code',
            'phone' => 'nullable|string|max:20',
            'is_active' => 'required|boolean',
        ]);

        Lab::create($validated);

        return back()->with('success', 'Laboratory created successfully.');
    }

    public function update(Request $request, Lab $lab): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:20|unique:labs,code,' . $lab->id,
            'phone' => 'nullable|string|max:20',
            'is_active' => 'required|boolean',
        ]);

        $lab->update($validated);

        return back()->with('success', 'Laboratory updated successfully.');
    }

    public function assignPlan(Request $request, Lab $lab): RedirectResponse
    {
        $validated = $request->validate([
            'subscription_plan_id' => 'required|exists:subscription_plans,id',
        ]);

        $plan = SubscriptionPlan::findOrFail($validated['subscription_plan_id']);

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

        return back()->with('success', "Assigned plan '{$plan->name}' to {$lab->name}.");
    }

    public function switchContext(Lab $lab): RedirectResponse
    {
        session(['switched_lab_id' => $lab->id]);
        return to_route('dashboard')->with('success', "Now viewing as '{$lab->name}'");
    }

    public function backToAdmin(): RedirectResponse
    {
        session()->forget('switched_lab_id');
        return to_route('admin.labs.index')->with('success', 'Back to admin mode');
    }

    public function destroy(Lab $lab): RedirectResponse
    {
        $lab->delete();
        return back()->with('success', 'Laboratory deleted successfully.');
    }
}
