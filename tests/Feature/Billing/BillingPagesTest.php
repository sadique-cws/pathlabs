<?php

use App\Models\Bill;
use App\Models\Lab;
use App\Models\LabTest;
use App\Models\Patient;
use App\Models\User;
use App\Models\Wallet;
use App\Services\BillingService;
use Inertia\Testing\AssertableInertia as Assert;

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

    Wallet::query()->create([
        'lab_id' => $lab->id,
        'walletable_type' => Lab::class,
        'walletable_id' => $lab->id,
        'balance' => 1000,
        'currency' => 'INR',
    ]);

    app(BillingService::class)->createBill($lab->id, [
        'patient' => ['name' => 'Manage Bill Patient', 'phone' => '9191911111'],
        'test_ids' => [$test->id],
        'discount_amount' => 10,
    ]);

    $this->actingAs($user)
        ->get('/lab/billing/manage')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('billing/manage')
            ->has('bills', 1)
            ->where('bills.0.patient_name', 'Manage Bill Patient'));

    expect(Bill::query()->where('lab_id', $lab->id)->count())->toBe(1);
});
