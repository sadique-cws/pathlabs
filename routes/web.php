<?php

use App\Http\Controllers\Admin\LabFeatureController;
use App\Http\Controllers\BillingController;
use App\Http\Controllers\DoctorController;
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
            Route::get('sample-management', [TestReportController::class, 'sampleManagement'])
                ->middleware('feature:reports.sample_management')
                ->name('sample-management');
            Route::get('result-entry', [TestReportController::class, 'resultEntry'])
                ->middleware('feature:reports.result_entry')
                ->name('result-entry');
            Route::get('result-entry/{sample}', [TestReportController::class, 'resultEntryDetail'])
                ->middleware('feature:reports.result_entry')
                ->name('result-entry-detail');
            Route::put('result-entry/{sample}', [TestReportController::class, 'saveResultEntry'])
                ->middleware('feature:reports.result_entry')
                ->name('result-entry-update');
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
            // Keep clinical-master group for future features like manage groups and packages
        });
    });

    Route::prefix('admin')->name('admin.')->middleware('ensure.admin')->group(function (): void {
        Route::get('labs/features', [LabFeatureController::class, 'index'])->name('labs.features');
        Route::put('labs/{lab}/features', [LabFeatureController::class, 'updateLabPermissions'])->name('labs.features.update');
        Route::put('users/{user}/roles', [LabFeatureController::class, 'updateUserRoles'])->name('users.roles.update');
        Route::put('roles/{role}/permissions', [LabFeatureController::class, 'updateRolePermissions'])->name('roles.permissions.update');
    });
});

require __DIR__ . '/settings.php';
