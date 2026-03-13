<?php

namespace App\Http\Controllers;

use App\Models\Bill;
use App\Models\CollectionCenter;
use App\Models\Doctor;
use App\Models\LabTest;
use App\Models\Patient;
use App\Models\TestPackage;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CollectionCenterPortalController extends Controller
{
    public function dashboard(Request $request): Response
    {
        $collectionCenter = $this->currentCollectionCenter($request);

        $totals = [
            'bills' => Bill::query()->where('collection_center_id', $collectionCenter->id)->count(),
            'patients' => Patient::query()->where('collection_center_id', $collectionCenter->id)->count(),
            'doctors' => Doctor::query()->where('collection_center_id', $collectionCenter->id)->count(),
            'revenue' => round((float) Bill::query()->where('collection_center_id', $collectionCenter->id)->sum('net_total'), 2),
            'commission' => round((float) $collectionCenter->wallet()->value('balance'), 2),
        ];

        $recentBills = Bill::query()
            ->where('collection_center_id', $collectionCenter->id)
            ->with(['patient:id,name,phone', 'doctor:id,name'])
            ->latest('billing_at')
            ->limit(10)
            ->get()
            ->map(fn (Bill $bill): array => [
                'id' => $bill->id,
                'bill_number' => $bill->bill_number,
                'patient_name' => $bill->patient?->name ?? '-',
                'patient_phone' => $bill->patient?->phone ?? '-',
                'doctor_name' => $bill->doctor?->name ?? 'SELF',
                'amount' => round((float) $bill->net_total, 2),
                'paid_amount' => round((float) $bill->payment_amount, 2),
                'billing_at' => $bill->billing_at?->format('d M Y h:i A'),
                'status' => ucfirst($bill->status),
            ])
            ->values();

        return Inertia::render('cc/dashboard', [
            'collectionCenter' => [
                'id' => $collectionCenter->id,
                'name' => $collectionCenter->name,
                'margin_type' => $collectionCenter->price_margin_type,
                'margin_value' => (float) $collectionCenter->price_margin_value,
            ],
            'totals' => $totals,
            'recentBills' => $recentBills,
        ]);
    }

    public function priceList(Request $request): Response
    {
        $labId = (int) $request->attributes->get('lab_id');
        $collectionCenter = $this->currentCollectionCenter($request);

        $tests = LabTest::query()
            ->where('lab_id', $labId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(fn (LabTest $test): array => [
                'id' => $test->id,
                'name' => $test->name,
                'department' => $test->department,
                'sample_type' => $test->sample_type,
                'retail_price' => round((float) $test->price, 2),
                'b2b_price' => round((float) ($test->b2b_price ?? $test->price), 2),
                'selling_price' => $collectionCenter->sellingPrice((float) ($test->b2b_price ?? $test->price)),
            ])
            ->values();

        $packages = TestPackage::query()
            ->where('lab_id', $labId)
            ->where('is_active', true)
            ->orderBy('name')
            ->with('tests:id,name')
            ->get()
            ->map(fn (TestPackage $package): array => [
                'id' => $package->id,
                'name' => $package->name,
                'tests' => $package->tests->pluck('name')->values()->all(),
                'retail_price' => round((float) $package->price, 2),
                'b2b_price' => round((float) ($package->b2b_price ?? $package->price), 2),
                'selling_price' => $collectionCenter->sellingPrice((float) ($package->b2b_price ?? $package->price)),
            ])
            ->values();

        return Inertia::render('cc/price-list', [
            'collectionCenter' => [
                'name' => $collectionCenter->name,
                'margin_type' => $collectionCenter->price_margin_type,
                'margin_value' => (float) $collectionCenter->price_margin_value,
            ],
            'tests' => $tests,
            'packages' => $packages,
        ]);
    }

    private function currentCollectionCenter(Request $request): CollectionCenter
    {
        $labId = (int) $request->attributes->get('lab_id');
        $collectionCenterId = (int) ($request->user()?->collection_center_id ?? 0);
        abort_if($collectionCenterId <= 0, 403);

        return CollectionCenter::query()
            ->where('lab_id', $labId)
            ->findOrFail($collectionCenterId);
    }
}
