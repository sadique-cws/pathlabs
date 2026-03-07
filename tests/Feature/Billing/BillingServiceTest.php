<?php

use App\Events\BillCreated;
use App\Events\CommissionCredited;
use App\Events\SampleCreated;
use App\Events\WalletDebited;
use App\Models\CollectionCenter;
use App\Models\Doctor;
use App\Models\DoctorCommission;
use App\Models\Lab;
use App\Models\LabTest;
use App\Models\TestPackage;
use App\Models\Wallet;
use App\Services\BarcodeService;
use App\Services\BillingService;
use Illuminate\Support\Facades\Event;

it('creates bill with test and package items and expands package tests', function () {
    Event::fake([BillCreated::class, SampleCreated::class, WalletDebited::class, CommissionCredited::class]);

    $lab = Lab::factory()->create();
    $patientPayload = [
        'name' => 'John Smith',
        'phone' => '9999999999',
        'gender' => 'male',
        'age_years' => 35,
    ];

    $directTest = LabTest::factory()->create(['lab_id' => $lab->id, 'price' => 200]);
    $packageTestA = LabTest::factory()->create(['lab_id' => $lab->id, 'price' => 300]);
    $packageTestB = LabTest::factory()->create(['lab_id' => $lab->id, 'price' => 400]);

    $package = TestPackage::factory()->create(['lab_id' => $lab->id, 'price' => 500]);
    $package->tests()->attach([$packageTestA->id, $packageTestB->id], ['lab_id' => $lab->id]);

    $labWallet = Wallet::query()->create([
        'lab_id' => $lab->id,
        'walletable_type' => Lab::class,
        'walletable_id' => $lab->id,
        'balance' => 100,
        'currency' => 'INR',
    ]);

    $service = app(BillingService::class);

    $bill = $service->createBill($lab->id, [
        'patient' => $patientPayload,
        'test_ids' => [$directTest->id],
        'package_ids' => [$package->id],
        'discount_amount' => 50,
    ]);

    expect($bill->bill_number)->toStartWith("LAB{$lab->id}-");
    expect($bill->items)->toHaveCount(2);
    expect($bill->samples)->toHaveCount(3);
    expect((float) $bill->gross_total)->toBe(700.0);
    expect((float) $bill->discount_amount)->toBe(50.0);
    expect((float) $bill->service_charge)->toBe(15.0);
    expect((float) $bill->net_total)->toBe(665.0);

    Event::assertDispatched(BillCreated::class);
    Event::assertDispatched(SampleCreated::class, 3);
    Event::assertDispatched(WalletDebited::class);

    expect((float) $labWallet->fresh()->balance)->toBe(85.0);
});

it('deducts service charge from lab wallet', function () {
    $lab = Lab::factory()->create();
    $test = LabTest::factory()->create(['lab_id' => $lab->id, 'price' => 1000]);

    Wallet::query()->create([
        'lab_id' => $lab->id,
        'walletable_type' => Lab::class,
        'walletable_id' => $lab->id,
        'balance' => 150,
        'currency' => 'INR',
    ]);

    $bill = app(BillingService::class)->createBill($lab->id, [
        'patient' => ['name' => 'Alice', 'phone' => '8888888888'],
        'test_ids' => [$test->id],
        'discount_amount' => 0,
    ]);

    $labWallet = Wallet::query()->where('walletable_type', Lab::class)->where('walletable_id', $lab->id)->firstOrFail();

    expect((float) $labWallet->balance)->toBe(135.0)
        ->and((float) $bill->service_charge)->toBe(15.0);

    $debit = $labWallet->transactions()->where('direction', 'debit')->first();
    expect($debit)->not->toBeNull();
    expect((float) $debit->amount)->toBe(15.0);
});

it('credits commission to doctor and collection center wallets', function () {
    Event::fake([CommissionCredited::class]);

    $lab = Lab::factory()->create();
    $doctor = Doctor::factory()->create([
        'lab_id' => $lab->id,
        'commission_type' => 'percent',
        'commission_value' => 10,
    ]);

    $collectionCenter = CollectionCenter::factory()->create([
        'lab_id' => $lab->id,
        'commission_type' => 'percent',
        'commission_value' => 5,
    ]);

    $test = LabTest::factory()->create(['lab_id' => $lab->id, 'price' => 1000]);

    Wallet::query()->create([
        'lab_id' => $lab->id,
        'walletable_type' => Lab::class,
        'walletable_id' => $lab->id,
        'balance' => 500,
        'currency' => 'INR',
    ]);

    $bill = app(BillingService::class)->createBill($lab->id, [
        'patient' => ['name' => 'Bob', 'phone' => '7777777777'],
        'doctor_id' => $doctor->id,
        'collection_center_id' => $collectionCenter->id,
        'test_ids' => [$test->id],
        'discount_amount' => 100,
    ]);

    $doctorWallet = Wallet::query()->where('walletable_type', Doctor::class)->where('walletable_id', $doctor->id)->firstOrFail();
    $centerWallet = Wallet::query()->where('walletable_type', CollectionCenter::class)->where('walletable_id', $collectionCenter->id)->firstOrFail();

    expect((float) $doctorWallet->balance)->toBe(90.0);
    expect((float) $centerWallet->balance)->toBe(45.0);

    $commission = DoctorCommission::query()->where('doctor_id', $doctor->id)->where('bill_id', $bill->id)->first();
    expect($commission)->not->toBeNull();
    expect((float) $commission->amount)->toBe(90.0);

    Event::assertDispatched(CommissionCredited::class, 2);
});

it('generates barcode in LABID-BILLID-SAMPLEID format', function () {
    $barcode = app(BarcodeService::class)->generate(12, 345, 6);

    expect($barcode)->toBe('LAB12-345-6');
});

it('creates referral doctor on the fly and generates multiple barcodes using quantity', function () {
    $lab = Lab::factory()->create();
    $test = LabTest::factory()->create(['lab_id' => $lab->id, 'price' => 600]);

    Wallet::query()->create([
        'lab_id' => $lab->id,
        'walletable_type' => Lab::class,
        'walletable_id' => $lab->id,
        'balance' => 500,
        'currency' => 'INR',
    ]);

    $bill = app(BillingService::class)->createBill($lab->id, [
        'patient' => ['name' => 'Qty User', 'phone' => '7000000001'],
        'doctor_name' => 'Dr. Runtime',
        'doctor_phone' => '9555555555',
        'test_ids' => [$test->id],
        'sample_quantity' => 3,
        'sample_collected_from' => 'Mobile Camp',
        'service_other_charges' => [
            ['name' => 'Collection Fee', 'amount' => 40],
        ],
    ]);

    expect($bill->doctor)->not->toBeNull();
    expect($bill->doctor?->name)->toBe('Dr. Runtime');
    expect($bill->status)->toBe('barcode_generated');
    expect($bill->samples)->toHaveCount(3);
    expect((float) $bill->service_charge)->toBe(55.0);
});

it('completes billing only after barcode generation', function () {
    $lab = Lab::factory()->create();
    $test = LabTest::factory()->create(['lab_id' => $lab->id, 'price' => 500]);

    Wallet::query()->create([
        'lab_id' => $lab->id,
        'walletable_type' => Lab::class,
        'walletable_id' => $lab->id,
        'balance' => 500,
        'currency' => 'INR',
    ]);

    $service = app(BillingService::class);

    $bill = $service->createBill($lab->id, [
        'patient' => ['name' => 'Complete User', 'phone' => '7000000002'],
        'test_ids' => [$test->id],
    ]);

    expect($bill->status)->toBe('barcode_generated');

    $completed = $service->completeBill($lab->id, $bill->id);

    expect($completed->status)->toBe('completed');
});
