<?php

namespace App\Services;

use App\Events\BillCreated;
use App\Events\SampleCreated;
use App\Models\Bill;
use App\Models\BillItem;
use App\Models\CollectionCenter;
use App\Models\Doctor;
use App\Models\Lab;
use App\Models\LabTest;
use App\Models\Patient;
use App\Models\Sample;
use App\Models\SampleCollectionSource;
use App\Models\ServiceCharge;
use App\Models\TestPackage;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class BillingService
{
    private const float SERVICE_CHARGE = 15.0;

    public function __construct(
        private BarcodeService $barcodeService,
        private WalletService $walletService,
        private CommissionService $commissionService,
    ) {}

    /**
     * @param  array<string, mixed>  $payload
     */
    public function createBill(int $labId, array $payload): Bill
    {
        return DB::transaction(function () use ($labId, $payload): Bill {
            $tests = $this->fetchTests($labId, $payload['test_ids'] ?? []);
            $packages = $this->fetchPackages($labId, $payload['package_ids'] ?? []);
            $patient = $this->resolvePatient($labId, $payload);
            $doctorId = $this->resolveDoctorId($labId, $payload);
            $collectionCenterId = $this->resolveCollectionCenterId($labId, $payload);

            $serviceOtherCharges = $this->resolveServiceOtherCharges($labId, $payload);
            $serviceOtherChargeAmount = round($serviceOtherCharges->sum('amount'), 2);
            $baseServiceCharge = self::SERVICE_CHARGE;
            $finalServiceCharge = round($baseServiceCharge + $serviceOtherChargeAmount, 2);

            $testTotal = round($tests->sum(fn(LabTest $test): float => (float) $test->price), 2);
            $packageTotal = round($packages->sum(fn(TestPackage $package): float => (float) $package->price), 2);
            $grossTotal = round($testTotal + $packageTotal, 2);
            $baseDiscount = round((float) ($payload['discount_amount'] ?? 0), 2);
            $doctorDiscountType = (string) ($payload['doctor_discount_type'] ?? 'fixed');
            $centerDiscountType = (string) ($payload['center_discount_type'] ?? 'fixed');
            $doctorDiscountInput = round((float) ($payload['doctor_discount'] ?? 0), 2);
            $centerDiscountInput = round((float) ($payload['center_discount'] ?? 0), 2);
            $doctorDiscount = $this->resolveDiscountAmount($doctorDiscountInput, $doctorDiscountType, $grossTotal);
            $centerDiscount = $this->resolveDiscountAmount($centerDiscountInput, $centerDiscountType, $grossTotal);
            $discount = min($baseDiscount + $doctorDiscount + $centerDiscount, $grossTotal);
            $netWithoutService = max(0, $grossTotal - $discount);
            $netTotal = round($netWithoutService + $finalServiceCharge, 2);
            $paymentAmount = round((float) ($payload['payment_amount'] ?? 0), 2);

            $bill = Bill::query()->create([
                'lab_id' => $labId,
                'patient_id' => $patient->id,
                'doctor_id' => $doctorId,
                'collection_center_id' => $collectionCenterId,
                'bill_number' => $this->generateBillNumber($labId),
                'billing_at' => $payload['billing_at'] ?? now(),
                'sample_collected_from' => $payload['sample_collected_from'] ?? null,
                'insurance_details' => $payload['insurance_details'] ?? null,
                'service_other_charges' => $serviceOtherCharges->values()->all(),
                'service_other_total' => $serviceOtherChargeAmount,
                'offer' => $payload['offer'] ?? null,
                'test_total' => $testTotal,
                'package_total' => $packageTotal,
                'gross_total' => $grossTotal,
                'discount_amount' => $discount,
                'doctor_discount_amount' => $doctorDiscount,
                'doctor_discount_type' => $doctorDiscountType,
                'center_discount_amount' => $centerDiscount,
                'center_discount_type' => $centerDiscountType,
                'service_charge' => $finalServiceCharge,
                'net_total' => $netTotal,
                'payment_amount' => min($paymentAmount, $netTotal),
                'urgent' => (bool) ($payload['urgent'] ?? false),
                'soft_copy_only' => (bool) ($payload['soft_copy_only'] ?? false),
                'send_message' => (bool) ($payload['send_message'] ?? true),
                'previous_reports' => $payload['previous_reports'] ?? null,
                'agent_referrer' => $payload['agent_referrer'] ?? null,
                'status' => 'barcode_generated',
                'notes' => $this->buildBillNotes($payload, $serviceOtherCharges),
            ]);

            $directTestItems = $this->createBillItems($bill, $tests, $packages);
            $expandedTests = $this->expandPackageTests($tests, $packages);
            $sampleQuantity = max(1, min(20, (int) ($payload['sample_quantity'] ?? 1)));
            $this->createSamples($bill, $expandedTests, $directTestItems, $sampleQuantity);

            $this->persistSampleCollectionSource($labId, $payload['sample_collected_from'] ?? null);

            $lab = Lab::query()->findOrFail($labId);
            $labWallet = $this->walletService->ensureWallet($lab, $labId);
            $this->walletService->debit($labWallet, $baseServiceCharge, $bill, 'Billing service charge deducted');

            $commissionBase = round($netWithoutService, 2);
            $this->commissionService->creditDoctorCommission($bill, $commissionBase);
            $this->commissionService->creditCollectionCenterCommission($bill, $commissionBase);

            $bill = $bill->fresh(['items', 'samples']) ?? $bill;
            event(new BillCreated($bill));

            return $bill;
        }, 3);
    }

    public function completeBill(int $labId, int $billId): Bill
    {
        return DB::transaction(function () use ($labId, $billId): Bill {
            $bill = Bill::query()
                ->where('lab_id', $labId)
                ->lockForUpdate()
                ->findOrFail($billId);

            if ($bill->status !== 'completed') {
                $bill->update([
                    'status' => 'completed',
                ]);
            }

            return $bill->fresh(['items', 'samples']) ?? $bill;
        });
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function resolveDoctorId(int $labId, array $payload): ?int
    {
        $doctorId = $payload['doctor_id'] ?? null;

        if ($doctorId !== null && $doctorId !== '') {
            return Doctor::query()
                ->where('lab_id', $labId)
                ->findOrFail((int) $doctorId)
                ->id;
        }

        $doctorName = trim((string) ($payload['doctor_name'] ?? ''));

        if ($doctorName === '') {
            return null;
        }

        $doctorPhone = trim((string) ($payload['doctor_phone'] ?? ''));

        return Doctor::query()->create([
            'lab_id' => $labId,
            'name' => $doctorName,
            'phone' => $doctorPhone !== '' ? $doctorPhone : null,
            'commission_type' => 'percent',
            'commission_value' => 0,
            'is_active' => true,
        ])->id;
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function resolveCollectionCenterId(int $labId, array $payload): ?int
    {
        $collectionCenterId = $payload['collection_center_id'] ?? null;

        if ($collectionCenterId === null || $collectionCenterId === '') {
            return null;
        }

        return CollectionCenter::query()
            ->where('lab_id', $labId)
            ->findOrFail((int) $collectionCenterId)
            ->id;
    }

    /**
     * @param  array<int, int>  $testIds
     * @return Collection<int, LabTest>
     */
    private function fetchTests(int $labId, array $testIds): Collection
    {
        if ($testIds === []) {
            return collect();
        }

        return LabTest::query()
            ->where('lab_id', $labId)
            ->whereIn('id', $testIds)
            ->get();
    }

    /**
     * @param  array<int, int>  $packageIds
     * @return Collection<int, TestPackage>
     */
    private function fetchPackages(int $labId, array $packageIds): Collection
    {
        if ($packageIds === []) {
            return collect();
        }

        return TestPackage::query()
            ->where('lab_id', $labId)
            ->whereIn('id', $packageIds)
            ->with('tests')
            ->get();
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function resolvePatient(int $labId, array $payload): Patient
    {
        if (isset($payload['patient_id']) && $payload['patient_id'] !== '' && $payload['patient_id'] !== null) {
            return Patient::query()
                ->where('lab_id', $labId)
                ->findOrFail($payload['patient_id']);
        }

        /** @var array<string, mixed> $patientPayload */
        $patientPayload = $payload['patient'];

        return Patient::query()->create([
            'lab_id' => $labId,
            'title' => $patientPayload['title'] ?? null,
            'uhid' => $patientPayload['uhid'] ?? null,
            'name' => $patientPayload['name'],
            'phone' => $patientPayload['phone'],
            'gender' => $patientPayload['gender'] ?? null,
            'date_of_birth' => $patientPayload['date_of_birth'] ?? null,
            'age_years' => $patientPayload['age_years'] ?? null,
            'age_months' => $patientPayload['age_months'] ?? null,
            'age_days' => $patientPayload['age_days'] ?? null,
            'address' => $patientPayload['address'] ?? null,
            'city' => $patientPayload['city'] ?? null,
            'landmark' => $patientPayload['landmark'] ?? null,
            'weight_kg' => $patientPayload['weight_kg'] ?? null,
            'height_cm' => $patientPayload['height_cm'] ?? null,
            'state' => $patientPayload['state'] ?? null,
            'pin_code' => $patientPayload['pin_code'] ?? null,
            'id_type' => $patientPayload['id_type'] ?? null,
        ]);
    }

    /**
     * @param  Collection<int, LabTest>  $tests
     * @param  Collection<int, TestPackage>  $packages
     * @return Collection<int, BillItem>
     */
    private function createBillItems(Bill $bill, Collection $tests, Collection $packages): Collection
    {
        $directTestItems = collect();

        foreach ($tests as $test) {
            $item = BillItem::query()->create([
                'lab_id' => $bill->lab_id,
                'bill_id' => $bill->id,
                'billable_type' => 'test',
                'billable_id' => $test->id,
                'test_id' => $test->id,
                'name' => $test->name,
                'quantity' => 1,
                'unit_price' => (float) $test->price,
                'total_price' => (float) $test->price,
            ]);

            $directTestItems->put($test->id, $item);
        }

        foreach ($packages as $package) {
            BillItem::query()->create([
                'lab_id' => $bill->lab_id,
                'bill_id' => $bill->id,
                'billable_type' => 'package',
                'billable_id' => $package->id,
                'package_id' => $package->id,
                'name' => $package->name,
                'quantity' => 1,
                'unit_price' => (float) $package->price,
                'total_price' => (float) $package->price,
            ]);
        }

        return $directTestItems;
    }

    /**
     * @param  Collection<int, LabTest>  $tests
     * @param  Collection<int, TestPackage>  $packages
     * @return Collection<int, LabTest>
     */
    private function expandPackageTests(Collection $tests, Collection $packages): Collection
    {
        $expanded = $tests->keyBy('id');

        foreach ($packages as $package) {
            foreach ($package->tests as $test) {
                $expanded->put($test->id, $test);
            }
        }

        return $expanded->values();
    }

    /**
     * @param  Collection<int, LabTest>  $expandedTests
     * @param  Collection<int, BillItem>  $directTestItems
     */
    private function createSamples(Bill $bill, Collection $expandedTests, Collection $directTestItems, int $sampleQuantity): void
    {
        foreach ($expandedTests as $test) {
            $billItem = $directTestItems->get($test->id);

            $sampleType = strtolower(trim((string) $test->sample_type));
            $nonPhysicalSamples = ['none', 'imaging', 'radiology', 'x-ray', 'xray', 'ultrasound', 'mri', 'ct scan'];
            $requiresPhysicalSample = $sampleType !== '' && !in_array($sampleType, $nonPhysicalSamples, true);

            for ($index = 0; $index < $sampleQuantity; $index++) {
                $status = $requiresPhysicalSample ? 'pending' : 'collected';

                $sample = Sample::query()->create([
                    'lab_id' => $bill->lab_id,
                    'bill_id' => $bill->id,
                    'bill_item_id' => $billItem?->id,
                    'test_id' => $test->id,
                    'barcode' => null,
                    'status' => $status,
                ]);

                if ($requiresPhysicalSample) {
                    $sample->update([
                        'barcode' => $this->barcodeService->generate($bill->lab_id, $bill->id, $sample->id),
                    ]);
                } else {
                    $sample->update([
                        'collected_at' => now(),
                    ]);
                }

                event(new SampleCreated($sample->fresh() ?? $sample));
            }
        }
    }

    private function generateBillNumber(int $labId): string
    {
        do {
            $billNumber = sprintf(
                'LAB%s-%s-%04d',
                $labId,
                now()->format('YmdHis'),
                random_int(1, 9999),
            );
        } while (Bill::query()->where('bill_number', $billNumber)->exists());

        return $billNumber;
    }

    private function resolveDiscountAmount(float $value, string $type, float $grossTotal): float
    {
        if ($value <= 0) {
            return 0;
        }

        if ($type === 'percent') {
            return round(($grossTotal * $value) / 100, 2);
        }

        return round($value, 2);
    }

    /**
     * @param  array<string, mixed>  $payload
     * @param  Collection<int, array{name: string, amount: float}>  $serviceOtherCharges
     */
    private function buildBillNotes(array $payload, Collection $serviceOtherCharges): ?string
    {
        $sections = [
            'comment' => $payload['notes'] ?? null,
            'sample_collected_from' => $payload['sample_collected_from'] ?? null,
            'insurance_details' => $payload['insurance_details'] ?? null,
            'service_other_charges' => $serviceOtherCharges->values()->all(),
            'offer' => $payload['offer'] ?? null,
            'previous_reports' => $payload['previous_reports'] ?? null,
            'agent_referrer' => $payload['agent_referrer'] ?? null,
            'urgent' => (bool) ($payload['urgent'] ?? false),
            'soft_copy_only' => (bool) ($payload['soft_copy_only'] ?? false),
            'send_message' => (bool) ($payload['send_message'] ?? false),
            'payment_amount' => round((float) ($payload['payment_amount'] ?? 0), 2),
        ];

        $notes = json_encode($sections, JSON_UNESCAPED_UNICODE);

        return $notes !== false ? $notes : null;
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return Collection<int, array{name: string, amount: float}>
     */
    private function resolveServiceOtherCharges(int $labId, array $payload): Collection
    {
        $charges = collect($payload['service_other_charges'] ?? [])
            ->filter(fn(mixed $charge): bool => is_array($charge) && isset($charge['name']))
            ->map(function (array $charge) use ($labId): array {
                $name = trim((string) $charge['name']);
                $amount = round((float) ($charge['amount'] ?? 0), 2);

                if ($name === '' || $amount <= 0) {
                    return ['name' => '', 'amount' => 0.0];
                }

                ServiceCharge::query()->firstOrCreate([
                    'lab_id' => $labId,
                    'name' => $name,
                ], [
                    'amount' => $amount,
                    'is_active' => true,
                ]);

                return [
                    'name' => $name,
                    'amount' => $amount,
                ];
            })
            ->filter(fn(array $charge): bool => $charge['name'] !== '' && $charge['amount'] > 0)
            ->values();

        return $charges;
    }

    private function persistSampleCollectionSource(int $labId, mixed $value): void
    {
        $name = trim((string) $value);

        if ($name === '') {
            return;
        }

        SampleCollectionSource::query()->firstOrCreate([
            'lab_id' => $labId,
            'name' => $name,
        ], [
            'is_active' => true,
        ]);
    }
}
