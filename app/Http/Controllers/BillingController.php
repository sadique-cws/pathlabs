<?php

namespace App\Http\Controllers;

use App\Http\Requests\CompleteBillingRequest;
use App\Http\Requests\StoreBillRequest;
use App\Models\Bill;
use App\Models\CollectionCenter;
use App\Models\Doctor;
use App\Models\LabTest;
use App\Models\Patient;
use App\Models\SampleCollectionSource;
use App\Models\ServiceCharge;
use App\Models\TestPackage;
use App\Services\BillingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BillingController extends Controller
{
    public function dashboard(Request $request): Response
    {
        $labId = (int) $request->attributes->get('lab_id');

        $totals = [
            'patients' => Bill::query()->where('lab_id', $labId)->distinct('patient_id')->count('patient_id'),
            'bills' => Bill::query()->where('lab_id', $labId)->count(),
            'tests' => Bill::query()->where('lab_id', $labId)->sum('test_total'),
            'due' => Bill::query()->where('lab_id', $labId)->sum('service_charge'),
        ];

        $recentBills = Bill::query()
            ->where('lab_id', $labId)
            ->with(['patient'])
            ->latest('billing_at')
            ->limit(8)
            ->get();

        return Inertia::render('dashboard', [
            'totals' => $totals,
            'recentBills' => $recentBills,
        ]);
    }

    public function create(Request $request): Response
    {
        $labId = (int) $request->attributes->get('lab_id');
        $generatedBillId = $request->integer('bill_id');

        return Inertia::render('billing/create', [
            'tests' => LabTest::query()->where('lab_id', $labId)->where('is_active', true)->orderBy('name')->get(),
            'packages' => TestPackage::query()->where('lab_id', $labId)->where('is_active', true)->with('tests')->orderBy('name')->get(),
            'doctors' => Doctor::query()->where('lab_id', $labId)->where('is_active', true)->orderBy('name')->get(),
            'patients' => Patient::query()
                ->where('lab_id', $labId)
                ->select([
                    'id',
                    'title',
                    'name',
                    'phone',
                    'gender',
                    'date_of_birth',
                    'age_years',
                    'age_months',
                    'age_days',
                    'address',
                    'city',
                    'landmark',
                    'weight_kg',
                    'height_cm',
                    'state',
                    'pin_code',
                    'uhid',
                    'id_type',
                ])
                ->orderBy('name')
                ->limit(300)
                ->get(),
            'collectionCenters' => CollectionCenter::query()->where('lab_id', $labId)->where('is_active', true)->orderBy('name')->get(),
            'sampleCollectionSources' => SampleCollectionSource::query()->where('lab_id', $labId)->where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'serviceChargeMasters' => ServiceCharge::query()->where('lab_id', $labId)->where('is_active', true)->orderBy('name')->get(['id', 'name', 'amount']),
            'generatedBillId' => $generatedBillId > 0 ? $generatedBillId : null,
            'serviceCharge' => 15,
        ]);
    }

    public function manage(Request $request): Response
    {
        $labId = (int) $request->attributes->get('lab_id');

        $bills = Bill::query()
            ->where('lab_id', $labId)
            ->with(['patient:id,name,phone', 'doctor:id,name'])
            ->latest('billing_at')
            ->limit(300)
            ->get()
            ->map(function (Bill $bill): array {
                $payableAmount = round((float) $bill->net_total, 2);
                $dueAmount = round((float) $bill->service_charge, 2);
                $paidAmount = max(0, round($payableAmount - $dueAmount, 2));

                return [
                    'id' => $bill->id,
                    'bill_number' => $bill->bill_number,
                    'patient_name' => $bill->patient?->name,
                    'mobile' => $bill->patient?->phone,
                    'ref_doctor' => $bill->doctor?->name ?? 'SELF',
                    'payable_amount' => $payableAmount,
                    'paid_amount' => $paidAmount,
                    'due_amount' => $dueAmount,
                    'discount_amount' => (float) $bill->discount_amount,
                    'bill_date' => $bill->billing_at?->format('d/m/Y'),
                    'bill_date_value' => $bill->billing_at?->format('Y-m-d'),
                    'payment_status' => $dueAmount <= 0 ? 'Complete' : 'Partial',
                    'status' => ucfirst($bill->status),
                ];
            })
            ->values();

        return Inertia::render('billing/manage', [
            'bills' => $bills,
        ]);
    }

    public function generateBarcode(StoreBillRequest $request, BillingService $billingService): RedirectResponse
    {
        $labId = (int) $request->attributes->get('lab_id');
        $bill = $billingService->createBill($labId, $request->validated());

        return to_route('lab.billing.create', ['bill_id' => $bill->id])
            ->with('success', "Barcodes generated for bill {$bill->bill_number}. Now complete billing.");
    }

    public function complete(CompleteBillingRequest $request, BillingService $billingService): RedirectResponse
    {
        $labId = (int) $request->attributes->get('lab_id');
        $bill = $billingService->completeBill($labId, (int) $request->validated('bill_id'));

        return to_route('lab.billing.manage')
            ->with('success', "Billing completed for {$bill->bill_number}.");
    }
}
