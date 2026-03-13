<?php

use App\Models\Bill;
use App\Models\CollectionCenter;
use App\Models\Lab;
use App\Models\LabSubscription;
use App\Models\LabTest;
use App\Models\Patient;
use App\Models\Permission;
use App\Models\Role;
use App\Models\Sample;
use App\Models\SubscriptionPlan;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function seedCollectionCenterAccess(Lab $lab, array $permissionSlugs): array
{
    $role = Role::query()->create([
        'name' => 'Collection Center',
        'slug' => 'collection_center',
        'is_system' => true,
    ]);

    $permissionIds = collect($permissionSlugs)->map(function (string $slug) use ($lab): int {
        $permission = Permission::query()->create([
            'name' => str($slug)->replace('.', ' ')->title()->toString(),
            'slug' => $slug,
            'group' => 'collection_center',
        ]);

        $lab->permissions()->attach($permission->id, ['is_enabled' => true]);

        return $permission->id;
    })->all();

    $role->permissions()->sync($permissionIds);

    return [$role, $permissionIds];
}

test('collection center users are redirected to the cc dashboard', function () {
    $lab = Lab::factory()->create();
    [$role] = seedCollectionCenterAccess($lab, ['dashboard.view']);
    $collectionCenter = CollectionCenter::factory()->create(['lab_id' => $lab->id]);
    $user = User::factory()->create([
        'lab_id' => $lab->id,
        'collection_center_id' => $collectionCenter->id,
    ]);
    $user->roles()->attach($role->id);

    $this->actingAs($user)
        ->get('/dashboard')
        ->assertRedirect('/cc/dashboard');
});

test('collection center manage bills only shows its own bills', function () {
    $lab = Lab::factory()->create();
    [$role] = seedCollectionCenterAccess($lab, ['billing.manage']);
    $ownCenter = CollectionCenter::factory()->create(['lab_id' => $lab->id, 'name' => 'Own Center']);
    $otherCenter = CollectionCenter::factory()->create(['lab_id' => $lab->id, 'name' => 'Other Center']);
    $user = User::factory()->create([
        'lab_id' => $lab->id,
        'collection_center_id' => $ownCenter->id,
    ]);
    $user->roles()->attach($role->id);

    $ownPatient = Patient::factory()->create(['lab_id' => $lab->id, 'collection_center_id' => $ownCenter->id]);
    $otherPatient = Patient::factory()->create(['lab_id' => $lab->id, 'collection_center_id' => $otherCenter->id]);

    Bill::factory()->create([
        'lab_id' => $lab->id,
        'patient_id' => $ownPatient->id,
        'collection_center_id' => $ownCenter->id,
        'bill_number' => 'OWN-BILL-001',
    ]);

    Bill::factory()->create([
        'lab_id' => $lab->id,
        'patient_id' => $otherPatient->id,
        'collection_center_id' => $otherCenter->id,
        'bill_number' => 'OTHER-BILL-002',
    ]);

    $this->actingAs($user)
        ->get('/cc/billing/manage')
        ->assertOk()
        ->assertSee('OWN-BILL-001')
        ->assertDontSee('OTHER-BILL-002');
});

test('collection center users cannot open lab panel routes directly', function () {
    $lab = Lab::factory()->create();
    [$role] = seedCollectionCenterAccess($lab, ['billing.manage']);
    $collectionCenter = CollectionCenter::factory()->create(['lab_id' => $lab->id]);
    $user = User::factory()->create([
        'lab_id' => $lab->id,
        'collection_center_id' => $collectionCenter->id,
    ]);
    $user->roles()->attach($role->id);

    $this->actingAs($user)
        ->get('/lab/billing/manage')
        ->assertForbidden();
});

test('collection center bills use b2b price plus center margin', function () {
    $lab = Lab::factory()->create();
    [$role] = seedCollectionCenterAccess($lab, ['billing.create']);
    $collectionCenter = CollectionCenter::factory()->create([
        'lab_id' => $lab->id,
        'price_margin_type' => 'percent',
        'price_margin_value' => 25,
        'commission_type' => 'percent',
        'commission_value' => 0,
    ]);
    $user = User::factory()->create([
        'lab_id' => $lab->id,
        'collection_center_id' => $collectionCenter->id,
    ]);
    $user->roles()->attach($role->id);

    $plan = SubscriptionPlan::query()->create([
        'name' => 'Pay As You Go',
        'type' => 'pay_as_you_go',
        'price' => 15,
        'duration_months' => null,
        'bill_limit' => null,
        'description' => 'Test plan',
        'is_active' => true,
    ]);
    LabSubscription::query()->create([
        'lab_id' => $lab->id,
        'subscription_plan_id' => $plan->id,
        'status' => 'active',
        'starts_at' => now()->subHour(),
        'ends_at' => null,
        'bill_limit' => null,
        'bills_used' => 0,
        'is_current' => true,
    ]);
    Wallet::query()->create([
        'lab_id' => $lab->id,
        'walletable_type' => User::class,
        'walletable_id' => $user->id,
        'balance' => 5000,
        'currency' => 'INR',
    ]);

    $test = LabTest::factory()->create([
        'lab_id' => $lab->id,
        'price' => 1000,
        'b2b_price' => 600,
        'sample_type' => 'blood',
    ]);

    $this->actingAs($user)
        ->post('/cc/billing/generate-barcode', [
            'patient' => [
                'name' => 'CC Patient',
                'phone' => '9999999999',
                'gender' => 'male',
                'age_years' => 30,
            ],
            'test_ids' => [$test->id],
            'payment_amount' => 765,
            'sample_quantity' => 1,
        ])
        ->assertRedirect();

    $bill = Bill::query()->latest('id')->firstOrFail();
    $sample = Sample::query()->where('bill_id', $bill->id)->firstOrFail();

    expect((int) $bill->collection_center_id)->toBe($collectionCenter->id)
        ->and((float) $bill->test_total)->toBe(750.0)
        ->and((float) $bill->gross_total)->toBe(750.0)
        ->and((float) $bill->net_total)->toBe(765.0)
        ->and($sample->barcode)->not->toBeNull();
});
