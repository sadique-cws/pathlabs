<?php

use App\Models\Bill;
use App\Models\Lab;
use Database\Seeders\PanelDemoSeeder;

it('seeds panel accounts and billing demo data', function () {
    $this->seed(PanelDemoSeeder::class);

    $this->assertDatabaseHas('users', ['email' => 'admin@pathlabs.test']);
    $this->assertDatabaseHas('users', ['email' => 'lab@pathlabs.test']);
    $this->assertDatabaseHas('users', ['email' => 'cc@pathlabs.test']);
    $this->assertDatabaseHas('users', ['email' => 'doctor@pathlabs.test']);
    $this->assertDatabaseHas('users', ['email' => 'frontdesk@pathlabs.test']);

    $lab = Lab::query()->where('code', 'PATHLAB-MAIN')->first();

    expect($lab)->not->toBeNull();
    expect(Bill::query()->where('lab_id', $lab->id)->count())->toBeGreaterThan(0);
    expect($lab->tests()->count())->toBeGreaterThan(0);
    expect($lab->packages()->count())->toBeGreaterThan(0);
    expect($lab->doctors()->count())->toBeGreaterThan(0);
    expect($lab->collectionCenters()->count())->toBeGreaterThan(0);
});
