<?php

namespace App\Http\Controllers;

use App\Http\Requests\CompleteBillingRequest;
use App\Http\Requests\StoreBillRequest;
use App\Http\Requests\UpdateBillRequest;
use App\Models\Bill;
use App\Models\CollectionCenter;
use App\Models\Doctor;
use App\Models\LabTest;
use App\Models\Patient;
use App\Models\Sample;
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
            ->limit(1500)
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

    public function manageSamples(Request $request): Response
    {
        $labId = (int) $request->attributes->get('lab_id');
        $search = $request->input('search', '');
        $dateFilter = $request->input('date', '');

        $query = Sample::query()
            ->where('lab_id', $labId)
            ->with([
                'bill:id,bill_number,billing_at,patient_id',
                'bill.patient:id,name',
                'test:id,name,sample_type',
            ]);

        if ($search !== '') {
            $query->where(function ($q) use ($search): void {
                $q->where('barcode', 'like', "%{$search}%")
                    ->orWhereHas('bill', function ($bq) use ($search): void {
                        $bq->where('bill_number', 'like', "%{$search}%")
                            ->orWhereHas('patient', function ($pq) use ($search): void {
                                $pq->where('name', 'like', "%{$search}%");
                            });
                    });
            });
        }

        if ($dateFilter === 'today') {
            $query->whereHas('bill', fn($q) => $q->whereDate('billing_at', now()->toDateString()));
        } elseif ($dateFilter === 'yesterday') {
            $query->whereHas('bill', fn($q) => $q->whereDate('billing_at', now()->subDay()->toDateString()));
        }

        $samples = $query
            ->orderByRaw("CASE WHEN status = 'pending' THEN 1 WHEN status = 'collected' THEN 2 WHEN status = 'in_progress' THEN 3 WHEN status = 'completed' THEN 4 ELSE 5 END")
            ->latest('id')
            ->limit(1500)
            ->get()
            ->map(function (Sample $sample) use ($labId): array {
                $billDate = $sample->bill?->billing_at?->format('Y-m-d');
                $sampleDate = $sample->bill?->billing_at?->format('ymd') ?? now()->format('ymd');
                $sampleCode = sprintf(
                    '%d-%s-%02d',
                    $labId,
                    $sampleDate,
                    ((int) $sample->id) % 100,
                );

                return [
                    'id' => $sample->id,
                    'sample_code' => $sampleCode,
                    'barcode' => $sample->barcode,
                    'bill_number' => $sample->bill?->bill_number,
                    'patient_name' => $sample->bill?->patient?->name,
                    'test_name' => $sample->test?->name,
                    'sample_type' => $sample->test?->sample_type !== null && $sample->test?->sample_type !== '' ? ucfirst($sample->test->sample_type) : 'None',
                    'bill_date' => $billDate,
                    'collected_at' => $sample->collected_at?->format('Y-m-d H:i'),
                    'outsource' => '-',
                ];
            })
            ->values();

        return Inertia::render('billing/manage-samples', [
            'samples' => $samples,
            'filters' => [
                'search' => $search,
                'date' => $dateFilter,
            ],
        ]);
    }

    public function view(Request $request, Bill $bill): Response
    {
        $labId = (int) $request->attributes->get('lab_id');
        abort_if($bill->lab_id !== $labId, 404);

        $bill->load([
            'patient',
            'doctor',
            'collectionCenter',
            'items',
            'samples.test:id,name',
        ]);

        $totalAmount = round((float) $bill->net_total, 2);
        $paidAmount = round((float) $bill->payment_amount, 2);
        $dueAmount = max(0, round($totalAmount - $paidAmount, 2));

        return Inertia::render('billing/view', [
            'bill' => [
                'id' => $bill->id,
                'bill_number' => $bill->bill_number,
                'billing_at' => $bill->billing_at?->format('d M Y \\a\\t h:i a'),
                'status' => $dueAmount <= 0 ? 'Paid' : 'Due',
                'patient' => [
                    'name' => $bill->patient?->name ?? '-',
                    'age' => $bill->patient?->age_years ?? 0,
                    'gender' => $bill->patient?->gender !== null && $bill->patient?->gender !== '' ? ucfirst((string) $bill->patient?->gender) : '-',
                    'phone' => $bill->patient?->phone ?? '-',
                    'address' => trim(collect([
                        $bill->patient?->address,
                        $bill->patient?->city,
                        $bill->patient?->state,
                        $bill->patient?->pin_code,
                    ])->filter()->implode(', ')) ?: '-',
                ],
                'info' => [
                    'sample_from' => $bill->sample_collected_from ?? '-',
                    'doctor_discount' => round((float) $bill->doctor_discount_amount, 2),
                    'center_discount' => round((float) $bill->center_discount_amount, 2),
                ],
                'items' => $bill->items->map(function ($item): array {
                    return [
                        'name' => $item->name,
                        'type' => ucfirst((string) $item->billable_type),
                        'code' => $item->billable_type === 'test'
                            ? sprintf('TEST-%04d', (int) $item->billable_id)
                            : sprintf('PACK-%04d', (int) $item->billable_id),
                        'price' => round((float) $item->total_price, 2),
                    ];
                })->values()->all(),
                'barcodes' => $bill->samples
                    ->map(fn(Sample $sample): array => [
                        'sample_id' => $sample->id,
                        'barcode' => $sample->barcode ?? '',
                        'test_name' => $sample->test?->name ?? '-',
                    ])
                    ->values()
                    ->all(),
                'summary' => [
                    'subtotal' => round((float) $bill->gross_total, 2),
                    'doctor_discount' => round((float) $bill->doctor_discount_amount, 2),
                    'center_discount' => round((float) $bill->center_discount_amount, 2),
                    'total' => $totalAmount,
                    'paid' => $paidAmount,
                    'due' => $dueAmount,
                ],
                'auto_print_barcodes' => $request->query('print') === 'barcodes',
            ],
        ]);
    }

    public function edit(Request $request, Bill $bill): Response
    {
        $labId = (int) $request->attributes->get('lab_id');
        abort_if($bill->lab_id !== $labId, 404);
        $bill->load('patient');

        return Inertia::render('billing/edit', [
            'bill' => [
                'id' => $bill->id,
                'bill_number' => $bill->bill_number,
                'billing_at' => $bill->billing_at?->format('Y-m-d\TH:i'),
                'sample_collected_from' => $bill->sample_collected_from,
                'insurance_details' => $bill->insurance_details,
                'offer' => $bill->offer,
                'doctor_discount_amount' => (float) $bill->doctor_discount_amount,
                'doctor_discount_type' => $bill->doctor_discount_type ?? 'fixed',
                'center_discount_amount' => (float) $bill->center_discount_amount,
                'center_discount_type' => $bill->center_discount_type ?? 'fixed',
                'payment_amount' => (float) $bill->payment_amount,
                'previous_reports' => $bill->previous_reports,
                'agent_referrer' => $bill->agent_referrer,
                'notes' => $bill->notes,
                'urgent' => (bool) $bill->urgent,
                'soft_copy_only' => (bool) $bill->soft_copy_only,
                'send_message' => (bool) $bill->send_message,
                'patient' => [
                    'name' => $bill->patient?->name ?? '',
                    'phone' => $bill->patient?->phone ?? '',
                    'gender' => $bill->patient?->gender ?? 'male',
                    'age_years' => $bill->patient?->age_years,
                    'city' => $bill->patient?->city,
                    'address' => $bill->patient?->address,
                    'state' => $bill->patient?->state,
                    'pin_code' => $bill->patient?->pin_code,
                ],
            ],
        ]);
    }

    public function update(UpdateBillRequest $request, Bill $bill): RedirectResponse
    {
        $labId = (int) $request->attributes->get('lab_id');
        abort_if($bill->lab_id !== $labId, 404);

        $data = $request->validated();
        $patientData = $data['patient'];
        unset($data['patient']);

        if ($bill->patient !== null) {
            $bill->patient->update($patientData);
        }

        $bill->update($data);

        return to_route('lab.billing.view', ['bill' => $bill->id])->with('success', 'Bill and patient details updated.');
    }

    public function barcodes(Request $request, Bill $bill): Response
    {
        $labId = (int) $request->attributes->get('lab_id');
        abort_if($bill->lab_id !== $labId, 404);

        $bill->load([
            'patient:id,name',
            'samples:id,bill_id,test_id,barcode',
            'samples.test:id,name',
        ]);

        return Inertia::render('billing/barcodes', [
            'bill' => [
                'id' => $bill->id,
                'bill_number' => $bill->bill_number,
                'patient_name' => $bill->patient?->name ?? '-',
                'billing_at' => $bill->billing_at?->format('d M Y h:i A'),
                'auto_print' => $request->boolean('print'),
                'barcodes' => $bill->samples
                    ->map(fn(Sample $sample): array => [
                        'sample_id' => $sample->id,
                        'barcode' => $sample->barcode ?? '',
                        'test_name' => $sample->test?->name ?? '-',
                    ])
                    ->values()
                    ->all(),
            ],
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
