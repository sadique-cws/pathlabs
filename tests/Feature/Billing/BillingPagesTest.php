<?php

use App\Models\Bill;
use App\Models\Lab;
use App\Models\LabSubscription;
use App\Models\LabTest;
use App\Models\Patient;
use App\Models\Sample;
use App\Models\SubscriptionPlan;
use App\Models\User;
use App\Models\Wallet;
use App\Services\BillingService;
use Inertia\Testing\AssertableInertia as Assert;

function seedBillingPrerequisites(Lab $lab, User $user): void
{
    Wallet::query()->firstOrCreate(
        [
            'walletable_type' => Lab::class,
            'walletable_id' => $lab->id,
        ],
        [
            'lab_id' => $lab->id,
            'balance' => 1000,
            'currency' => 'INR',
        ],
    );

    Wallet::query()->firstOrCreate(
        [
            'walletable_type' => User::class,
            'walletable_id' => $user->id,
        ],
        [
            'lab_id' => $lab->id,
            'balance' => 1000,
            'currency' => 'INR',
        ],
    );

    $plan = SubscriptionPlan::query()->firstOrCreate(
        ['name' => 'Billing Test Plan'],
        [
            'type' => 'pay_as_you_go',
            'price' => 15.00,
            'description' => 'Test plan',
            'is_active' => true,
        ],
    );

    LabSubscription::query()->where('lab_id', $lab->id)->update(['is_current' => false]);

    LabSubscription::query()->updateOrCreate(
        [
            'lab_id' => $lab->id,
            'subscription_plan_id' => $plan->id,
        ],
        [
            'status' => 'active',
            'starts_at' => now()->subDay(),
            'ends_at' => null,
            'bill_limit' => null,
            'bills_used' => 0,
            'is_current' => true,
        ],
    );
}

it('loads create billing page with existing patients for quick select', function () {
    $lab = Lab::factory()->create();
    $user = User::factory()->create(['lab_id' => $lab->id]);

    Patient::factory()->create([
        'lab_id' => $lab->id,
        'name' => 'Existing Patient',
        'phone' => '9191919191',
    ]);

    $this->actingAs($user)
        ->get('/lab/billing/create')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('billing/create')
            ->has('patients', 1)
            ->where('patients.0.name', 'Existing Patient'));
});

it('loads manage bills page with bill data columns', function () {
    $lab = Lab::factory()->create();
    $user = User::factory()->create(['lab_id' => $lab->id]);
    $test = LabTest::factory()->create(['lab_id' => $lab->id, 'price' => 450]);
    seedBillingPrerequisites($lab, $user);

    app(BillingService::class)->createBill($lab->id, [
        'patient' => ['name' => 'Manage Bill Patient', 'phone' => '9191911111'],
        'test_ids' => [$test->id],
        'discount_amount' => 10,
    ], $user);

    $this->actingAs($user)
        ->get('/lab/billing/manage')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('billing/manage')
            ->has('bills', 1)
            ->where('bills.0.patient_name', 'Manage Bill Patient'));

    expect(Bill::query()->where('lab_id', $lab->id)->count())->toBe(1);
});

it('loads manage samples page with rows', function () {
    $lab = Lab::factory()->create();
    $user = User::factory()->create(['lab_id' => $lab->id]);
    $test = LabTest::factory()->create(['lab_id' => $lab->id, 'name' => 'Vitamin Panel', 'sample_type' => 'blood', 'price' => 500]);
    seedBillingPrerequisites($lab, $user);

    $bill = app(BillingService::class)->createBill($lab->id, [
        'patient' => ['name' => 'Sample Patient', 'phone' => '9191912222'],
        'test_ids' => [$test->id],
    ], $user);

    Sample::query()->where('bill_id', $bill->id)->firstOrFail();

    $this->actingAs($user)
        ->get('/lab/billing/samples')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('billing/manage-samples')
            ->has('samples', 1)
            ->where('samples.0.test_name', 'Vitamin Panel')
            ->where('samples.0.patient_name', 'Sample Patient'));
});

it('loads bill invoice view page from bill id', function () {
    $lab = Lab::factory()->create();
    $user = User::factory()->create(['lab_id' => $lab->id]);
    $test = LabTest::factory()->create(['lab_id' => $lab->id, 'price' => 500, 'name' => 'Invoice Test']);
    seedBillingPrerequisites($lab, $user);

    $bill = app(BillingService::class)->createBill($lab->id, [
        'patient' => ['name' => 'Invoice Patient', 'phone' => '9191913333'],
        'test_ids' => [$test->id],
    ], $user);

    $this->actingAs($user)
        ->get("/lab/billing/{$bill->id}/view")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('billing/view')
            ->where('bill.bill_number', $bill->bill_number)
            ->where('bill.patient.name', 'Invoice Patient')
            ->has('bill.barcodes', 1));
});

it('loads barcode preview page from manage bill flow', function () {
    $lab = Lab::factory()->create();
    $user = User::factory()->create(['lab_id' => $lab->id]);
    $test = LabTest::factory()->create(['lab_id' => $lab->id, 'price' => 500, 'name' => 'Label Test']);
    seedBillingPrerequisites($lab, $user);

    $bill = app(BillingService::class)->createBill($lab->id, [
        'patient' => ['name' => 'Barcode Sheet Patient', 'phone' => '9191913366'],
        'test_ids' => [$test->id],
    ], $user);

    $this->actingAs($user)
        ->get("/lab/billing/{$bill->id}/barcodes")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('billing/barcodes')
            ->where('bill.bill_number', $bill->bill_number)
            ->has('bill.barcodes', 1));
});

it('creates bill and generates barcodes from new bill endpoint', function () {
    $lab = Lab::factory()->create();
    $user = User::factory()->create(['lab_id' => $lab->id]);
    $test = LabTest::factory()->create(['lab_id' => $lab->id, 'price' => 500, 'name' => 'Barcode Test']);
    seedBillingPrerequisites($lab, $user);

    $response = $this->actingAs($user)
        ->post('/lab/billing/generate-barcode', [
            'patient' => ['name' => 'Barcode Patient', 'phone' => '9191900011'],
            'test_ids' => [$test->id],
            'sample_quantity' => 3,
            'sample_collected_from' => 'Labs',
        ]);

    $bill = Bill::query()->where('lab_id', $lab->id)->whereHas('patient', fn ($query) => $query->where('name', 'Barcode Patient'))->first();

    expect($bill)->not->toBeNull();
    expect($bill?->status)->toBe('barcode_generated');

    $response->assertRedirect("/lab/billing/create?bill_id={$bill->id}");

    $samples = Sample::query()->where('bill_id', $bill->id)->get();
    expect($samples)->toHaveCount(3);
    expect($samples->every(fn (Sample $sample): bool => $sample->barcode !== null && str_contains((string) $sample->barcode, "LAB{$lab->id}-{$bill->id}-")))->toBeTrue();
});

it('updates bill and patient details from bill edit endpoint', function () {
    $lab = Lab::factory()->create();
    $user = User::factory()->create(['lab_id' => $lab->id]);
    $test = LabTest::factory()->create(['lab_id' => $lab->id, 'price' => 500]);
    seedBillingPrerequisites($lab, $user);

    $bill = app(BillingService::class)->createBill($lab->id, [
        'patient' => ['name' => 'Old Patient', 'phone' => '9191900000'],
        'test_ids' => [$test->id],
    ], $user);

    $this->actingAs($user)
        ->put("/lab/billing/{$bill->id}", [
            'billing_at' => now()->format('Y-m-d H:i:s'),
            'sample_collected_from' => 'Home',
            'insurance_details' => 'Insurance A',
            'offer' => 'No Offer',
            'doctor_discount_amount' => 10,
            'doctor_discount_type' => 'fixed',
            'center_discount_amount' => 5,
            'center_discount_type' => 'fixed',
            'payment_amount' => 100,
            'previous_reports' => '',
            'agent_referrer' => '',
            'notes' => 'Updated notes',
            'urgent' => true,
            'soft_copy_only' => false,
            'send_message' => true,
            'patient' => [
                'name' => 'New Patient Name',
                'phone' => '9191999999',
                'gender' => 'male',
                'age_years' => 30,
                'city' => 'Delhi',
                'address' => 'Updated Addr',
                'state' => 'DL',
                'pin_code' => '110001',
            ],
        ])
        ->assertRedirect("/lab/billing/{$bill->id}/view");

    $bill->refresh();
    $bill->patient->refresh();

    expect($bill->sample_collected_from)->toBe('Home')
        ->and($bill->notes)->toBe('Updated notes')
        ->and($bill->patient->name)->toBe('New Patient Name')
        ->and($bill->patient->phone)->toBe('9191999999');
});
