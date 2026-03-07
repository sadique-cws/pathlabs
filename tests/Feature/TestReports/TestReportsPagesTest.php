<?php

use App\Models\Lab;
use App\Models\LabTest;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use App\Models\Wallet;
use App\Services\BillingService;
use Inertia\Testing\AssertableInertia as Assert;

function createUserWithFeaturePermission(string $permissionSlug): User
{
    $lab = Lab::factory()->create();
    $user = User::factory()->create(['lab_id' => $lab->id]);
    $role = Role::query()->create(['name' => 'Front Desk', 'slug' => 'front_desk', 'is_system' => true]);
    $permission = Permission::query()->create([
        'name' => $permissionSlug,
        'slug' => $permissionSlug,
        'group' => 'front_desk',
    ]);

    $role->permissions()->attach($permission->id);
    $user->roles()->attach($role->id);
    $lab->permissions()->attach($permission->id, ['is_enabled' => true]);

    return $user;
}

it('loads test units page with reports.test_units permission', function () {
    $user = createUserWithFeaturePermission('reports.test_units');

    $this->actingAs($user)
        ->get('/lab/test-reports/test-units')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('test-reports/test-units')
            ->has('units', 10));
});

it('loads test methods page with reports.test_methods permission', function () {
    $user = createUserWithFeaturePermission('reports.test_methods');

    $this->actingAs($user)
        ->get('/lab/test-reports/test-methods')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('test-reports/test-methods')
            ->has('methods', 10));
});

it('loads sample management page with reports.sample_management permission', function () {
    $user = createUserWithFeaturePermission('reports.sample_management');
    $labId = (int) $user->lab_id;
    $test = LabTest::factory()->create(['lab_id' => $labId]);

    Wallet::query()->create([
        'lab_id' => $labId,
        'walletable_type' => Lab::class,
        'walletable_id' => $labId,
        'balance' => 1000,
        'currency' => 'INR',
    ]);

    app(BillingService::class)->createBill($labId, [
        'patient' => ['name' => 'Reports Patient', 'phone' => '9191999199'],
        'test_ids' => [$test->id],
    ]);

    $this->actingAs($user)
        ->get('/lab/test-reports/sample-management')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('test-reports/sample-management')
            ->has('samples', 1));
});

it('loads result entry page with reports.result_entry permission', function () {
    $user = createUserWithFeaturePermission('reports.result_entry');
    $labId = (int) $user->lab_id;
    $test = LabTest::factory()->create(['lab_id' => $labId]);

    Wallet::query()->create([
        'lab_id' => $labId,
        'walletable_type' => Lab::class,
        'walletable_id' => $labId,
        'balance' => 1000,
        'currency' => 'INR',
    ]);

    app(BillingService::class)->createBill($labId, [
        'patient' => ['name' => 'Result Patient', 'phone' => '9191888188'],
        'test_ids' => [$test->id],
    ]);

    $this->actingAs($user)
        ->get('/lab/test-reports/result-entry')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('test-reports/result-entry')
            ->has('rows', 1)
            ->where('stats.total', 1));
});

it('loads and saves detailed result entry form', function () {
    $user = createUserWithFeaturePermission('reports.result_entry');
    $labId = (int) $user->lab_id;
    $test = LabTest::factory()->create(['lab_id' => $labId, 'name' => 'Complete Blood Count (CBC)']);

    Wallet::query()->create([
        'lab_id' => $labId,
        'walletable_type' => Lab::class,
        'walletable_id' => $labId,
        'balance' => 1000,
        'currency' => 'INR',
    ]);

    app(BillingService::class)->createBill($labId, [
        'patient' => ['name' => 'Result Form Patient', 'phone' => '9191777177'],
        'test_ids' => [$test->id],
    ]);

    $sample = \App\Models\Sample::query()->where('lab_id', $labId)->latest('id')->firstOrFail();

    $this->actingAs($user)
        ->get("/lab/test-reports/result-entry/{$sample->id}")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('test-reports/result-entry-form')
            ->where('sample.id', $sample->id));

    $this->actingAs($user)
        ->put("/lab/test-reports/result-entry/{$sample->id}", [
            'action' => 'draft',
            'approval_date' => now()->toDateString(),
            'technical_remarks' => 'Draft remarks',
            'parameters' => [
                ['key' => 'hb', 'value' => '14.2', 'remarks' => 'Normal'],
            ],
        ])
        ->assertRedirect("/lab/test-reports/result-entry/{$sample->id}");

    $sample->refresh();
    expect($sample->status)->toBe('in_progress');

    $this->actingAs($user)
        ->put("/lab/test-reports/result-entry/{$sample->id}", [
            'action' => 'approve',
            'approval_date' => now()->toDateString(),
            'technical_remarks' => 'Approved',
            'parameters' => [
                ['key' => 'hb', 'value' => '14.8', 'remarks' => 'Approved'],
            ],
        ])
        ->assertRedirect("/lab/test-reports/result-entry/{$sample->id}");

    $sample->refresh();
    expect($sample->status)->toBe('completed');
});
