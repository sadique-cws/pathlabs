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
            ['code' => 'CBC', 'name' => 'Complete Blood Count (CBC)', 'price' => 350, 'department' => 'pathology', 'sample_type' => 'blood'],
            ['code' => 'LFT', 'name' => 'Liver Function Test', 'price' => 650, 'department' => 'pathology', 'sample_type' => 'blood'],
            ['code' => 'KFT', 'name' => 'Kidney Function Test', 'price' => 600, 'department' => 'pathology', 'sample_type' => 'blood'],
            ['code' => 'XRCH', 'name' => 'Chest X-Ray', 'price' => 900, 'department' => 'radiology', 'sample_type' => 'imaging'],
            ['code' => 'THY', 'name' => 'Thyroid Panel', 'price' => 800, 'department' => 'pathology', 'sample_type' => 'blood'],
            ['code' => 'USAB', 'name' => 'Abdominal Ultrasound', 'price' => 1200, 'department' => 'radiology', 'sample_type' => 'imaging'],
        ])->map(function (array $testData) use ($lab): LabTest {
            return LabTest::query()->updateOrCreate(
                ['lab_id' => $lab->id, 'code' => $testData['code']],
                [
                    'name' => $testData['name'],
                    'sample_type' => $testData['sample_type'],
                    'department' => $testData['department'],
                    'price' => $testData['price'],
                    'referral_commission_value' => 10,
                    'referral_commission_type' => 'percent',
                    'collection_center_commission_value' => 5,
                    'collection_center_commission_type' => 'percent',
                    'is_active' => true,
                ],
            );
        });

        $this->seedTestParameters($tests);

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
            ['slug' => 'dashboard.view', 'name' => 'Dashboard View', 'group' => 'front_desk'],
            ['slug' => 'front_desk.access', 'name' => 'Front Desk Access', 'group' => 'front_desk'],
            ['slug' => 'billing.create', 'name' => 'Add New Bill', 'group' => 'front_desk'],
            ['slug' => 'billing.view', 'name' => 'View Bills', 'group' => 'front_desk'],
            ['slug' => 'billing.edit', 'name' => 'Edit Bill', 'group' => 'front_desk'],
            ['slug' => 'billing.manage', 'name' => 'Manage Bills Page', 'group' => 'front_desk'],
            ['slug' => 'samples.manage', 'name' => 'Manage Samples', 'group' => 'front_desk'],
            ['slug' => 'patients.add', 'name' => 'Add Patient', 'group' => 'front_desk'],
            ['slug' => 'patients.view', 'name' => 'View Patients', 'group' => 'front_desk'],
            ['slug' => 'patients.edit', 'name' => 'Edit Patient', 'group' => 'front_desk'],
            ['slug' => 'patients.manage', 'name' => 'Manage Patients', 'group' => 'front_desk'],
            ['slug' => 'doctors.add', 'name' => 'Add Doctor', 'group' => 'front_desk'],
            ['slug' => 'doctors.view', 'name' => 'View Doctors', 'group' => 'front_desk'],
            ['slug' => 'doctors.edit', 'name' => 'Edit Doctor', 'group' => 'front_desk'],
            ['slug' => 'doctors.manage', 'name' => 'Manage Referral Doctors', 'group' => 'front_desk'],
            ['slug' => 'test_result.entry', 'name' => 'Test Result Entry', 'group' => 'front_desk'],
            ['slug' => 'clinical_master.manage_groups', 'name' => 'Clinical Master - Manage Groups', 'group' => 'front_desk'],
            ['slug' => 'clinical_master.manage_tests', 'name' => 'Clinical Master - Manage Tests', 'group' => 'front_desk'],
            ['slug' => 'clinical_master.manage_packages', 'name' => 'Clinical Master - Manage Packages', 'group' => 'front_desk'],
            ['slug' => 'reports.test_units', 'name' => 'Test Reports - Test Units', 'group' => 'front_desk'],
            ['slug' => 'reports.test_methods', 'name' => 'Test Reports - Test Methods', 'group' => 'front_desk'],
            ['slug' => 'reports.sample_management', 'name' => 'Test Reports - Sample Management', 'group' => 'front_desk'],
            ['slug' => 'reports.report_formats', 'name' => 'Test Reports - Report Formats', 'group' => 'front_desk'],
            ['slug' => 'reports.result_entry', 'name' => 'Test Reports - Result Entry', 'group' => 'front_desk'],
            ['slug' => 'reports.job_sheets', 'name' => 'Test Reports - Job Sheets', 'group' => 'front_desk'],
            ['slug' => 'reports.performance_metrics', 'name' => 'Test Reports - Performance Metrics', 'group' => 'front_desk'],
            ['slug' => 'reports.lab_overview', 'name' => 'Test Reports - Lab Overview', 'group' => 'front_desk'],
            ['slug' => 'patient_services.records', 'name' => 'Patient Services - Patient Records', 'group' => 'front_desk'],
            ['slug' => 'doctor_desk.records', 'name' => 'Lab Doctor Desk - Doctor Records', 'group' => 'front_desk'],
            ['slug' => 'procurement.vendors', 'name' => 'Procurement - Vendor Directory', 'group' => 'front_desk'],
            ['slug' => 'procurement.orders', 'name' => 'Procurement - Purchase Orders', 'group' => 'front_desk'],
            ['slug' => 'wallet.view', 'name' => 'Wallet - View Balance', 'group' => 'billing'],
            ['slug' => 'wallet.topup', 'name' => 'Wallet - Add Funds', 'group' => 'billing'],
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
            'lab_manager' => [
                'dashboard.view',
                'front_desk.access',
                'billing.create',
                'billing.view',
                'billing.edit',
                'billing.manage',
                'samples.manage',
                'patients.add',
                'patients.view',
                'patients.edit',
                'patients.manage',
                'doctors.add',
                'doctors.view',
                'doctors.edit',
                'doctors.manage',
                'test_result.entry',
                'reports.test_units',
                'reports.test_methods',
                'reports.sample_management',
                'reports.result_entry',
                'wallet.view',
                'wallet.topup',
                'clinical_master.manage_tests',
            ],
            'collection_center' => ['dashboard.view', 'front_desk.access', 'billing.create', 'billing.view', 'billing.manage'],
            'doctor' => [
                'dashboard.view',
                'billing.view',
                'billing.manage',
                'test_result.entry',
                'reports.result_entry',
                'reports.test_units',
                'reports.test_methods',
                'reports.sample_management',
                'doctor_desk.records',
            ],
            'front_desk' => [
                'dashboard.view',
                'front_desk.access',
                'billing.create',
                'billing.view',
                'billing.edit',
                'billing.manage',
                'samples.manage',
                'patients.add',
                'patients.view',
                'patients.edit',
                'patients.manage',
                'doctors.add',
                'doctors.view',
                'doctors.edit',
                'doctors.manage',
                'test_result.entry',
                'reports.test_units',
                'reports.test_methods',
                'reports.sample_management',
                'reports.result_entry',
                'clinical_master.manage_tests',
            ],
        ];

        foreach ($rolePermissionMap as $roleSlug => $permissionSlugs) {
            $permissionIds = collect($permissionSlugs)
                ->map(fn(string $slug): ?int => $permissionsBySlug[$slug]->id ?? null)
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
            'front_desk.access',
            'billing.create',
            'billing.view',
            'billing.edit',
            'billing.manage',
            'samples.manage',
            'patients.add',
            'patients.view',
            'patients.edit',
            'patients.manage',
            'doctors.add',
            'doctors.view',
            'doctors.edit',
            'doctors.manage',
            'test_result.entry',
            'reports.test_units',
            'reports.test_methods',
            'reports.sample_management',
            'reports.result_entry',
            'wallet.view',
            'wallet.topup',
            'clinical_master.manage_tests',
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

    /**
     * @param \Illuminate\Support\Collection<int, LabTest> $tests
     */
    private function seedTestParameters(\Illuminate\Support\Collection $tests): void
    {
        $cbc = $tests->firstWhere('code', 'CBC');
        if ($cbc) {
            $cbc->parameters()->createMany([
                ['name' => 'Hemoglobin (Hb)', 'unit' => 'g/dL', 'normal_range' => '13.5 - 17.5'],
                ['name' => 'Hematocrit (Hct)', 'unit' => '%', 'normal_range' => '40 - 50'],
                ['name' => 'RBC Count', 'unit' => '10^6/uL', 'normal_range' => '4.5 - 5.9'],
                ['name' => 'WBC Count', 'unit' => '10^3/uL', 'normal_range' => '4.0 - 11.0'],
                ['name' => 'Platelet Count', 'unit' => '10^3/uL', 'normal_range' => '150 - 450'],
                ['name' => 'Neutrophils', 'unit' => '%', 'normal_range' => '40 - 80'],
                ['name' => 'Lymphocytes', 'unit' => '%', 'normal_range' => '20 - 40'],
                ['name' => 'Eosinophils', 'unit' => '%', 'normal_range' => '1 - 6'],
                ['name' => 'Monocytes', 'unit' => '%', 'normal_range' => '2 - 10'],
                ['name' => 'Basophils', 'unit' => '%', 'normal_range' => '0 - 1'],
            ]);
        }

        $lft = $tests->firstWhere('code', 'LFT');
        if ($lft) {
            $lft->parameters()->createMany([
                ['name' => 'Bilirubin Total', 'unit' => 'mg/dL', 'normal_range' => '0.3 - 1.2'],
                ['name' => 'Bilirubin Direct', 'unit' => 'mg/dL', 'normal_range' => '0.0 - 0.3'],
                ['name' => 'Bilirubin Indirect', 'unit' => 'mg/dL', 'normal_range' => '0.1 - 1.0'],
                ['name' => 'SGOT (AST)', 'unit' => 'U/L', 'normal_range' => '0 - 40'],
                ['name' => 'SGPT (ALT)', 'unit' => 'U/L', 'normal_range' => '0 - 41'],
                ['name' => 'Alkaline Phosphatase', 'unit' => 'U/L', 'normal_range' => '40 - 129'],
                ['name' => 'Total Protein', 'unit' => 'g/dL', 'normal_range' => '6.6 - 8.3'],
                ['name' => 'Albumin', 'unit' => 'g/dL', 'normal_range' => '3.5 - 5.2'],
                ['name' => 'Globulin', 'unit' => 'g/dL', 'normal_range' => '2.3 - 3.5'],
            ]);
        }

        $kft = $tests->firstWhere('code', 'KFT');
        if ($kft) {
            $kft->parameters()->createMany([
                ['name' => 'Urea', 'unit' => 'mg/dL', 'normal_range' => '15 - 40'],
                ['name' => 'Creatinine', 'unit' => 'mg/dL', 'normal_range' => '0.6 - 1.2'],
                ['name' => 'Uric Acid', 'unit' => 'mg/dL', 'normal_range' => '3.5 - 7.2'],
                ['name' => 'Sodium', 'unit' => 'mEq/L', 'normal_range' => '135 - 145'],
                ['name' => 'Potassium', 'unit' => 'mEq/L', 'normal_range' => '3.5 - 5.1'],
                ['name' => 'Chloride', 'unit' => 'mEq/L', 'normal_range' => '98 - 107'],
            ]);
        }

        $xrch = $tests->firstWhere('code', 'XRCH');
        if ($xrch) {
            $xrch->parameters()->createMany([
                ['name' => 'Observation / Findings', 'unit' => '-', 'normal_range' => 'Normal pattern'],
                ['name' => 'Impression', 'unit' => '-', 'normal_range' => 'Clinically correlated'],
            ]);
        }

        $usab = $tests->firstWhere('code', 'USAB');
        if ($usab) {
            $usab->parameters()->createMany([
                ['name' => 'Liver Size & Echotexture', 'unit' => '-', 'normal_range' => 'Normal'],
                ['name' => 'Gallbladder', 'unit' => '-', 'normal_range' => 'Normal'],
                ['name' => 'Pancreas', 'unit' => '-', 'normal_range' => 'Normal'],
                ['name' => 'Spleen', 'unit' => '-', 'normal_range' => 'Normal'],
                ['name' => 'Kidneys', 'unit' => '-', 'normal_range' => 'Normal'],
                ['name' => 'Impressions', 'unit' => '-', 'normal_range' => 'No focal lesion'],
            ]);
        }

        $thy = $tests->firstWhere('code', 'THY');
        if ($thy) {
            $thy->parameters()->createMany([
                ['name' => 'Total T3', 'unit' => 'ng/dL', 'normal_range' => '60 - 200'],
                ['name' => 'Total T4', 'unit' => 'ug/dL', 'normal_range' => '4.5 - 12.0'],
                ['name' => 'TSH', 'unit' => 'uIU/mL', 'normal_range' => '0.3 - 5.5'],
            ]);
        }
    }
}
