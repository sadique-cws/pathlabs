<?php

use App\Models\Bill;
use App\Models\Doctor;
use App\Models\Lab;
use App\Models\LabSubscription;
use App\Models\LabTest;
use App\Models\Patient;
use App\Models\Permission;
use App\Models\Role;
use App\Models\SubscriptionPlan;
use App\Models\User;
use App\Models\Wallet;
use App\Services\BillingService;
use Inertia\Testing\AssertableInertia as Assert;

function createDoctorPortalUser(array $permissionSlugs = []): array
{
    $lab = Lab::factory()->create();
    $user = User::factory()->create([
        'lab_id' => $lab->id,
        'email' => 'doctor-portal@test.local',
    ]);

    $doctor = Doctor::factory()->create([
        'lab_id' => $lab->id,
        'email' => $user->email,
        'doctor_type' => 'lab_doctor',
        'can_approve_reports' => true,
    ]);

    $role = Role::query()->create([
        'name' => 'Doctor Role',
        'slug' => 'doctor',
        'is_system' => true,
    ]);

    $permissions = collect($permissionSlugs)->map(function (string $slug): Permission {
        return Permission::query()->firstOrCreate(
            ['slug' => $slug],
            ['name' => $slug, 'group' => 'doctor_portal'],
        );
    });

    $role->permissions()->sync($permissions->pluck('id')->all());
    $user->roles()->sync([$role->id]);

    foreach ($permissions as $permission) {
        $lab->permissions()->syncWithoutDetaching([
            $permission->id => ['is_enabled' => true],
        ]);
    }

    Wallet::query()->create([
        'lab_id' => $lab->id,
        'walletable_type' => Lab::class,
        'walletable_id' => $lab->id,
        'balance' => 2000,
        'currency' => 'INR',
    ]);
    Wallet::query()->create([
        'lab_id' => $lab->id,
        'walletable_type' => User::class,
        'walletable_id' => $user->id,
        'balance' => 2000,
        'currency' => 'INR',
    ]);
    $plan = SubscriptionPlan::query()->create([
        'name' => 'Doctor Portal Plan',
        'type' => 'pay_as_you_go',
        'price' => 15.00,
        'description' => 'Test plan',
        'is_active' => true,
    ]);
    LabSubscription::query()->create([
        'lab_id' => $lab->id,
        'subscription_plan_id' => $plan->id,
        'status' => 'active',
        'starts_at' => now()->subDay(),
        'ends_at' => null,
        'bill_limit' => null,
        'bills_used' => 0,
        'is_current' => true,
    ]);

    return [$lab, $user, $doctor];
}

it('loads doctor dashboard when doctor portal access is enabled', function () {
    [, $user] = createDoctorPortalUser([
        'doctor_portal.access',
    ]);

    $this->actingAs($user)
        ->get('/doctor/dashboard')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('doctor/dashboard')
            ->has('stats'));
});

it('creates appointments and leave entries from doctor portal', function () {
    [, $user] = createDoctorPortalUser([
        'doctor_portal.appointments',
        'doctor_portal.leave_management',
    ]);

    $this->actingAs($user)
        ->post('/doctor/appointments', [
            'patient_name' => 'Portal Patient',
            'patient_phone' => '9000012345',
            'appointment_at' => now()->addDay()->format('Y-m-d H:i:s'),
            'notes' => 'Follow-up',
        ])
        ->assertRedirect();

    $this->actingAs($user)
        ->post('/doctor/leaves', [
            'leave_date' => now()->addDays(2)->toDateString(),
            'reason' => 'Personal',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('doctor_appointments', [
        'patient_name' => 'Portal Patient',
        'patient_phone' => '9000012345',
    ]);

    $this->assertDatabaseHas('doctor_leaves', [
        'reason' => 'Personal',
    ]);

    $this->actingAs($user)
        ->get('/doctor/leaves')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('doctor/leaves')
            ->has('leaves', 1));
});

it('shows only referred patients for logged in doctor', function () {
    [$lab, $user, $doctor] = createDoctorPortalUser([
        'doctor_portal.referred_patients',
    ]);

    $otherDoctor = Doctor::factory()->create([
        'lab_id' => $lab->id,
    ]);

    $test = LabTest::factory()->create([
        'lab_id' => $lab->id,
        'price' => 400,
    ]);

    $patient = Patient::factory()->create([
        'lab_id' => $lab->id,
        'name' => 'Doctor Referral Patient',
        'phone' => '9000099999',
    ]);

    app(BillingService::class)->createBill($lab->id, [
        'patient' => [
            'name' => $patient->name,
            'phone' => $patient->phone,
        ],
        'doctor_id' => $doctor->id,
        'test_ids' => [$test->id],
    ], $user);

    app(BillingService::class)->createBill($lab->id, [
        'patient' => [
            'name' => 'Other Doctor Patient',
            'phone' => '9111100000',
        ],
        'doctor_id' => $otherDoctor->id,
        'test_ids' => [$test->id],
    ], $user);

    $this->actingAs($user)
        ->get('/doctor/referred-patients')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('doctor/referred-patients')
            ->where('rows.0.patient_name', 'Doctor Referral Patient'));

    expect(Bill::query()->where('lab_id', $lab->id)->count())->toBe(2);
});

it('redirects legacy lab doctor urls to doctor url pattern', function () {
    [, $user] = createDoctorPortalUser([
        'doctor_portal.access',
    ]);

    $this->actingAs($user)
        ->get('/lab/doctor/dashboard')
        ->assertRedirect('/doctor/dashboard');
});
