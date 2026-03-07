<?php

use App\Http\Controllers\Admin\LabFeatureController;
use App\Http\Controllers\BillingController;
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
        Route::get('billing/create', [BillingController::class, 'create'])
            ->middleware('feature:billing.create')
            ->name('billing.create');
        Route::get('billing/manage', [BillingController::class, 'manage'])
            ->middleware('feature:billing.manage')
            ->name('billing.manage');
        Route::post('billing/generate-barcode', [BillingController::class, 'generateBarcode'])
            ->middleware('feature:billing.create')
            ->name('billing.generate-barcode');
        Route::post('billing/complete', [BillingController::class, 'complete'])
            ->middleware('feature:billing.create')
            ->name('billing.complete');
    });

    Route::prefix('admin')->name('admin.')->middleware('ensure.admin')->group(function (): void {
        Route::get('labs/features', [LabFeatureController::class, 'index'])->name('labs.features');
        Route::put('labs/{lab}/features', [LabFeatureController::class, 'updateLabPermissions'])->name('labs.features.update');
        Route::put('users/{user}/roles', [LabFeatureController::class, 'updateUserRoles'])->name('users.roles.update');
    });
});

require __DIR__.'/settings.php';
