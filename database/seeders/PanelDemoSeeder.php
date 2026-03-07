<?php

namespace Database\Seeders;

use App\Models\Bill;
use App\Models\CollectionCenter;
use App\Models\Doctor;
use App\Models\Lab;
use App\Models\LabTest;
use App\Models\Permission;
use App\Models\Role;
use App\Models\SampleCollectionSource;
use App\Models\ServiceCharge;
use App\Models\TestPackage;
use App\Models\User;
use App\Models\Wallet;
use App\Services\BillingService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class PanelDemoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        [$rolesBySlug, $permissionsBySlug] = $this->seedRolesAndPermissions();

        $lab = Lab::query()->updateOrCreate(
            ['code' => 'PATHLAB-MAIN'],
            [
                'name' => 'PathLabs Main Diagnostics',
                'phone' => '9999991000',
                'is_active' => true,
            ],
        );

        $this->seedPanelUsers($lab, $rolesBySlug);
        $this->seedLabFeatureAccess($lab, $permissionsBySlug);

        $doctor = Doctor::query()->updateOrCreate(
            ['lab_id' => $lab->id, 'email' => 'doctor@pathlabs.test'],
            [
                'name' => 'Dr. Aaryan Sharma',
                'phone' => '9999992001',
                'commission_type' => 'percent',
                'commission_value' => 10,
                'is_active' => true,
            ],
        );

        $collectionCenter = CollectionCenter::query()->updateOrCreate(
            ['lab_id' => $lab->id, 'name' => 'City Collection Hub'],
            [
                'phone' => '9999993001',
                'address' => 'Sector 21, Main Road',
                'commission_type' => 'percent',
                'commission_value' => 5,
                'is_active' => true,
            ],
        );

        $tests = collect([
            ['code' => 'CBC', 'name' => 'Complete Blood Count (CBC)', 'price' => 350],
            ['code' => 'LFT', 'name' => 'Liver Function Test', 'price' => 650],
            ['code' => 'KFT', 'name' => 'Kidney Function Test', 'price' => 600],
            ['code' => 'XRCH', 'name' => 'Chest X-Ray', 'price' => 900],
            ['code' => 'THY', 'name' => 'Thyroid Panel', 'price' => 800],
            ['code' => 'USAB', 'name' => 'Abdominal Ultrasound', 'price' => 1200],
        ])->map(function (array $testData) use ($lab): LabTest {
            return LabTest::query()->updateOrCreate(
                ['lab_id' => $lab->id, 'code' => $testData['code']],
                [
                    'name' => $testData['name'],
                    'sample_type' => 'blood',
                    'price' => $testData['price'],
                    'referral_commission_value' => 10,
                    'referral_commission_type' => 'percent',
                    'collection_center_commission_value' => 5,
                    'collection_center_commission_type' => 'percent',
                    'is_active' => true,
                ],
            );
        });

        $executivePackage = TestPackage::query()->updateOrCreate(
            ['lab_id' => $lab->id, 'code' => 'EXEC100'],
            [
                'name' => 'Executive Health Package',
                'price' => 1800,
                'is_active' => true,
            ],
        );

        $radiologyPackage = TestPackage::query()->updateOrCreate(
            ['lab_id' => $lab->id, 'code' => 'RAD200'],
            [
                'name' => 'Radiology Basic Package',
                'price' => 2000,
                'is_active' => true,
            ],
        );

        $executivePackage->tests()->syncWithPivotValues([
            $tests->firstWhere('code', 'CBC')->id,
            $tests->firstWhere('code', 'LFT')->id,
            $tests->firstWhere('code', 'THY')->id,
        ], ['lab_id' => $lab->id]);

        $radiologyPackage->tests()->syncWithPivotValues([
            $tests->firstWhere('code', 'XRCH')->id,
            $tests->firstWhere('code', 'USAB')->id,
        ], ['lab_id' => $lab->id]);

        Wallet::query()->updateOrCreate(
            ['walletable_type' => Lab::class, 'walletable_id' => $lab->id],
            ['lab_id' => $lab->id, 'currency' => 'INR', 'balance' => 20000],
        );

        Wallet::query()->updateOrCreate(
            ['walletable_type' => Doctor::class, 'walletable_id' => $doctor->id],
            ['lab_id' => $lab->id, 'currency' => 'INR', 'balance' => 0],
        );

        Wallet::query()->updateOrCreate(
            ['walletable_type' => CollectionCenter::class, 'walletable_id' => $collectionCenter->id],
            ['lab_id' => $lab->id, 'currency' => 'INR', 'balance' => 0],
        );

        SampleCollectionSource::query()->updateOrCreate(
            ['lab_id' => $lab->id, 'name' => 'Labs'],
            ['is_active' => true],
        );
        SampleCollectionSource::query()->updateOrCreate(
            ['lab_id' => $lab->id, 'name' => 'Home'],
            ['is_active' => true],
        );

        ServiceCharge::query()->updateOrCreate(
            ['lab_id' => $lab->id, 'name' => 'E-service Charge'],
            ['amount' => 15, 'is_active' => true],
        );
        ServiceCharge::query()->updateOrCreate(
            ['lab_id' => $lab->id, 'name' => 'Collection Fee'],
            ['amount' => 40, 'is_active' => true],
        );

        if (! Bill::query()->where('lab_id', $lab->id)->exists()) {
            /** @var BillingService $billingService */
            $billingService = app(BillingService::class);

            $billingService->createBill($lab->id, [
                'patient' => [
                    'name' => 'Riya Verma',
                    'phone' => '9000000001',
                    'gender' => 'female',
                    'age_years' => 29,
                    'city' => 'Delhi',
                ],
                'doctor_id' => $doctor->id,
                'collection_center_id' => $collectionCenter->id,
                'test_ids' => [$tests->firstWhere('code', 'CBC')->id, $tests->firstWhere('code', 'KFT')->id],
                'package_ids' => [$executivePackage->id],
                'discount_amount' => 150,
            ]);

            $billingService->createBill($lab->id, [
                'patient' => [
                    'name' => 'Arjun Rao',
                    'phone' => '9000000002',
                    'gender' => 'male',
                    'age_years' => 41,
                    'city' => 'Noida',
                ],
                'doctor_id' => $doctor->id,
                'test_ids' => [$tests->firstWhere('code', 'XRCH')->id],
                'package_ids' => [$radiologyPackage->id],
                'discount_amount' => 100,
            ]);
        }
    }

    /**
     * @return array{0: array<string, Role>, 1: array<string, Permission>}
     */
    private function seedRolesAndPermissions(): array
    {
        $permissionData = [
            ['slug' => 'dashboard.view', 'name' => 'Dashboard View', 'group' => 'dashboard'],
            ['slug' => 'billing.create', 'name' => 'Create Bill', 'group' => 'billing'],
            ['slug' => 'billing.manage', 'name' => 'Manage Bills', 'group' => 'billing'],
            ['slug' => 'samples.manage', 'name' => 'Manage Samples', 'group' => 'billing'],
            ['slug' => 'patients.manage', 'name' => 'Manage Patients', 'group' => 'masters'],
            ['slug' => 'doctors.manage', 'name' => 'Manage Referral Doctors', 'group' => 'masters'],
            ['slug' => 'test_result.entry', 'name' => 'Test Result Entry', 'group' => 'results'],
            ['slug' => 'admin.labs.features', 'name' => 'Admin Lab Features', 'group' => 'admin'],
        ];

        $permissionsBySlug = [];
        foreach ($permissionData as $item) {
            $permissionsBySlug[$item['slug']] = Permission::query()->updateOrCreate(
                ['slug' => $item['slug']],
                ['name' => $item['name'], 'group' => $item['group']],
            );
        }

        $roleData = [
            ['slug' => 'admin', 'name' => 'Admin'],
            ['slug' => 'lab_manager', 'name' => 'Lab Manager'],
            ['slug' => 'collection_center', 'name' => 'Collection Center'],
            ['slug' => 'doctor', 'name' => 'Doctor'],
            ['slug' => 'front_desk', 'name' => 'Front Desk'],
        ];

        $rolesBySlug = [];
        foreach ($roleData as $item) {
            $rolesBySlug[$item['slug']] = Role::query()->updateOrCreate(
                ['slug' => $item['slug']],
                ['name' => $item['name'], 'is_system' => true],
            );
        }

        $rolePermissionMap = [
            'admin' => array_keys($permissionsBySlug),
            'lab_manager' => ['dashboard.view', 'billing.create', 'billing.manage', 'samples.manage', 'patients.manage', 'doctors.manage', 'test_result.entry'],
            'collection_center' => ['dashboard.view', 'billing.create', 'billing.manage'],
            'doctor' => ['dashboard.view', 'billing.manage'],
            'front_desk' => ['dashboard.view', 'billing.create', 'billing.manage', 'patients.manage'],
        ];

        foreach ($rolePermissionMap as $roleSlug => $permissionSlugs) {
            $permissionIds = collect($permissionSlugs)
                ->map(fn (string $slug): ?int => $permissionsBySlug[$slug]->id ?? null)
                ->filter()
                ->values();

            $rolesBySlug[$roleSlug]->permissions()->sync($permissionIds);
        }

        return [$rolesBySlug, $permissionsBySlug];
    }

    /**
     * @param  array<string, Role>  $rolesBySlug
     */
    private function seedPanelUsers(Lab $lab, array $rolesBySlug): void
    {
        $users = [
            ['name' => 'Super Admin', 'email' => 'admin@pathlabs.test', 'role' => 'admin'],
            ['name' => 'Lab Manager', 'email' => 'lab@pathlabs.test', 'role' => 'lab_manager'],
            ['name' => 'Collection Center User', 'email' => 'cc@pathlabs.test', 'role' => 'collection_center'],
            ['name' => 'Referral Doctor', 'email' => 'doctor@pathlabs.test', 'role' => 'doctor'],
            ['name' => 'Front Desk Executive', 'email' => 'frontdesk@pathlabs.test', 'role' => 'front_desk'],
        ];

        foreach ($users as $userData) {
            $user = User::query()->updateOrCreate(
                ['email' => $userData['email']],
                [
                    'lab_id' => $lab->id,
                    'name' => $userData['name'],
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                ],
            );

            $role = $rolesBySlug[$userData['role']] ?? null;
            if ($role !== null) {
                $user->roles()->sync([$role->id]);
            }
        }
    }

    /**
     * @param  array<string, Permission>  $permissionsBySlug
     */
    private function seedLabFeatureAccess(Lab $lab, array $permissionsBySlug): void
    {
        $enabledSlugs = [
            'dashboard.view',
            'billing.create',
            'billing.manage',
            'samples.manage',
            'patients.manage',
            'doctors.manage',
            'test_result.entry',
        ];

        $syncData = [];
        foreach ($enabledSlugs as $slug) {
            if (! isset($permissionsBySlug[$slug])) {
                continue;
            }

            $syncData[$permissionsBySlug[$slug]->id] = ['is_enabled' => true];
        }

        $lab->permissions()->sync($syncData);
    }
}
