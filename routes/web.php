<?php

use App\Http\Controllers\Admin\LabFeatureController;
use App\Http\Controllers\BillingController;
use App\Http\Controllers\DoctorController;
use App\Http\Controllers\Lab\WalletController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\TestReportController;
use App\Http\Controllers\TestParameterController;
use App\Http\Middleware\EnsureLabContext;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified', EnsureLabContext::class])->group(function (): void {
    Route::get('dashboard', [BillingController::class, 'dashboard'])
        ->middleware('feature:dashboard.view')
        ->name('dashboard');

    Route::prefix('lab')->name('lab.')->group(function (): void {
        Route::get('search', [\App\Http\Controllers\SearchController::class, 'globalSearch'])->name('search');

        Route::get('coming-soon', function () {
            return inertia('coming-soon');
        })->name('coming-soon');

        Route::get('billing/create', [BillingController::class, 'create'])
            ->middleware('feature:billing.create')
            ->name('billing.create');
        Route::get('billing/manage', [BillingController::class, 'manage'])
            ->middleware('feature:billing.manage')
            ->name('billing.manage');
        Route::get('billing/{bill}/view', [BillingController::class, 'view'])
            ->middleware('feature:billing.view')
            ->name('billing.view');
        Route::get('billing/{bill}/barcodes', [BillingController::class, 'barcodes'])
            ->middleware('feature:billing.view')
            ->name('billing.barcodes');
        Route::get('billing/{bill}/edit', [BillingController::class, 'edit'])
            ->middleware('feature:billing.edit')
            ->name('billing.edit');
        Route::put('billing/{bill}', [BillingController::class, 'update'])
            ->middleware('feature:billing.edit')
            ->name('billing.update');
        Route::get('billing/samples', [BillingController::class, 'manageSamples'])
            ->middleware('feature:samples.manage')
            ->name('billing.samples');
        Route::post('billing/generate-barcode', [BillingController::class, 'generateBarcode'])
            ->middleware('feature:billing.create')
            ->name('billing.generate-barcode');
        Route::post('billing/complete', [BillingController::class, 'complete'])
            ->middleware('feature:billing.create')
            ->name('billing.complete');

        Route::get('wallet', [WalletController::class, 'index'])
            ->middleware('feature:wallet.view')
            ->name('wallet.index');
        Route::post('wallet/topup', [WalletController::class, 'topup'])
            ->middleware('feature:wallet.topup')
            ->name('wallet.topup');

        Route::get('patients/manage', [PatientController::class, 'manage'])
            ->middleware('feature:patients.manage')
            ->name('patients.manage');
        Route::get('patients/add', [PatientController::class, 'add'])
            ->middleware('feature:patients.add')
            ->name('patients.add');
        Route::post('patients', [PatientController::class, 'store'])
            ->middleware('feature:patients.add')
            ->name('patients.store');
        Route::get('patients/{patient}/edit', [PatientController::class, 'edit'])
            ->middleware('feature:patients.edit')
            ->name('patients.edit');
        Route::put('patients/{patient}', [PatientController::class, 'update'])
            ->middleware('feature:patients.edit')
            ->name('patients.update');

        Route::get('doctors/add', [DoctorController::class, 'add'])
            ->middleware('feature:doctors.add')
            ->name('doctors.add');
        Route::post('doctors', [DoctorController::class, 'store'])
            ->middleware('feature:doctors.add')
            ->name('doctors.store');
        Route::get('doctors/manage', [DoctorController::class, 'manage'])
            ->middleware('feature:doctors.manage')
            ->name('doctors.manage');
        Route::get('doctors/{doctor}/edit', [DoctorController::class, 'edit'])
            ->middleware('feature:doctors.edit')
            ->name('doctors.edit');
        Route::put('doctors/{doctor}', [DoctorController::class, 'update'])
            ->middleware('feature:doctors.edit')
            ->name('doctors.update');

        Route::prefix('test-reports')->name('test-reports.')->group(function (): void {
            Route::get('test-units', [TestReportController::class, 'testUnits'])
                ->middleware('feature:reports.test_units')
                ->name('test-units');
            Route::get('test-methods', [TestReportController::class, 'testMethods'])
                ->middleware('feature:reports.test_methods')
                ->name('test-methods');
            Route::get('result-entry', [TestReportController::class, 'resultEntry'])
                ->middleware('feature:reports.result_entry')
                ->name('result-entry');
            Route::get('result-entry/{sample}', [TestReportController::class, 'resultEntryDetail'])
                ->middleware('feature:reports.result_entry')
                ->name('result-entry-detail');
            Route::put('result-entry/{sample}', [TestReportController::class, 'saveResultEntry'])
                ->middleware('feature:reports.result_entry')
                ->name('result-entry-update');
            Route::get('result-entry/{sample}/print', [TestReportController::class, 'printReport'])
                ->middleware('feature:reports.result_entry')
                ->name('result-entry-print');
            Route::get('parameters', [TestParameterController::class, 'index'])
                ->middleware('feature:clinical_master.manage_tests')
                ->name('parameters');
            Route::post('parameters', [TestParameterController::class, 'store'])
                ->middleware('feature:clinical_master.manage_tests')
                ->name('parameters.store');
            Route::put('parameters/{testParameter}', [TestParameterController::class, 'update'])
                ->middleware('feature:clinical_master.manage_tests')
                ->name('parameters.update');
            Route::delete('parameters/{testParameter}', [TestParameterController::class, 'destroy'])
                ->middleware('feature:clinical_master.manage_tests')
                ->name('parameters.destroy');
        });

        Route::prefix('clinical-master')->name('clinical-master.')->group(function (): void {
            Route::get('tests', [\App\Http\Controllers\Lab\ClinicalMasterController::class, 'manageTests'])
                ->middleware('feature:clinical_master.manage_tests')
                ->name('tests');
            Route::post('tests', [\App\Http\Controllers\Lab\ClinicalMasterController::class, 'storeTest'])
                ->middleware('feature:clinical_master.manage_tests')
                ->name('tests.store');
            Route::put('tests/{test}', [\App\Http\Controllers\Lab\ClinicalMasterController::class, 'updateTest'])
                ->middleware('feature:clinical_master.manage_tests')
                ->name('tests.update');
            Route::delete('tests/{test}', [\App\Http\Controllers\Lab\ClinicalMasterController::class, 'destroyTest'])
                ->middleware('feature:clinical_master.manage_tests')
                ->name('tests.destroy');

            Route::get('packages', [\App\Http\Controllers\Lab\ClinicalMasterController::class, 'managePackages'])
                ->middleware('feature:clinical_master.manage_packages')
                ->name('packages');
            Route::post('packages', [\App\Http\Controllers\Lab\ClinicalMasterController::class, 'storePackage'])
                ->middleware('feature:clinical_master.manage_packages')
                ->name('packages.store');
            Route::put('packages/{package}', [\App\Http\Controllers\Lab\ClinicalMasterController::class, 'updatePackage'])
                ->middleware('feature:clinical_master.manage_packages')
                ->name('packages.update');
            Route::delete('packages/{package}', [\App\Http\Controllers\Lab\ClinicalMasterController::class, 'destroyPackage'])
                ->middleware('feature:clinical_master.manage_packages')
                ->name('packages.destroy');
        });

        Route::get('subscription', [\App\Http\Controllers\Lab\SubscriptionController::class, 'index'])->name('subscription.index');
        Route::post('subscription', [\App\Http\Controllers\Lab\SubscriptionController::class, 'subscribe'])->name('subscription.store');

        Route::get('configuration', [\App\Http\Controllers\Lab\LabConfigurationController::class, 'show'])->name('configuration.show');
        Route::post('configuration', [\App\Http\Controllers\Lab\LabConfigurationController::class, 'update'])->name('configuration.update');
    });

    Route::prefix('admin')->name('admin.')->middleware('ensure.admin')->group(function (): void {
        Route::get('labs', [\App\Http\Controllers\Admin\LabController::class, 'index'])->name('labs.index');
        Route::post('labs', [\App\Http\Controllers\Admin\LabController::class, 'store'])->name('labs.store');
        Route::get('labs/{lab}', [\App\Http\Controllers\Admin\LabController::class, 'show'])->name('labs.show');
        Route::put('labs/{lab}', [\App\Http\Controllers\Admin\LabController::class, 'update'])->name('labs.update');
        Route::post('labs/{lab}/assign-plan', [\App\Http\Controllers\Admin\LabController::class, 'assignPlan'])->name('labs.assign-plan');
        Route::post('labs/{lab}/switch', [\App\Http\Controllers\Admin\LabController::class, 'switchContext'])->name('labs.switch');
        Route::get('switch-back', [\App\Http\Controllers\Admin\LabController::class, 'backToAdmin'])->name('switch-back');
        Route::delete('labs/{lab}', [\App\Http\Controllers\Admin\LabController::class, 'destroy'])->name('labs.destroy');

        Route::get('labs/features', [LabFeatureController::class, 'index'])->name('labs.features');
        Route::put('labs/{lab}/features', [LabFeatureController::class, 'updateLabPermissions'])->name('labs.features.update');
        Route::put('users/{user}/roles', [LabFeatureController::class, 'updateUserRoles'])->name('users.roles.update');
        Route::put('roles/{role}/permissions', [LabFeatureController::class, 'updateRolePermissions'])->name('roles.permissions.update');

        Route::get('plans', [\App\Http\Controllers\Admin\SubscriptionPlanController::class, 'index'])->name('plans.index');
        Route::post('plans', [\App\Http\Controllers\Admin\SubscriptionPlanController::class, 'store'])->name('plans.store');
        Route::put('plans/{plan}', [\App\Http\Controllers\Admin\SubscriptionPlanController::class, 'update'])->name('plans.update');
        Route::delete('plans/{plan}', [\App\Http\Controllers\Admin\SubscriptionPlanController::class, 'destroy'])->name('plans.destroy');
    });
});

require __DIR__ . '/settings.php';
