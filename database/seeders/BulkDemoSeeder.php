<?php

namespace Database\Seeders;

use App\Models\Bill;
use App\Models\BillItem;
use App\Models\Doctor;
use App\Models\Lab;
use App\Models\LabTest;
use App\Models\Patient;
use App\Models\Sample;
use Carbon\Carbon;
use Faker\Factory as Faker;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BulkDemoSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create();
        $lab = Lab::query()->where('code', 'PATHLAB-MAIN')->first();

        if (!$lab) {
            $this->command->warn('Lab not found. Run PanelDemoSeeder first.');
            return;
        }

        $tests = LabTest::query()->where('lab_id', $lab->id)->get();
        if ($tests->isEmpty()) {
            $this->command->warn('Tests not found. Run PanelDemoSeeder first.');
            return;
        }

        $doctors = Doctor::query()->where('lab_id', $lab->id)->get();
        if ($doctors->isEmpty()) {
            $this->command->warn('Doctors not found. Run PanelDemoSeeder first.');
            return;
        }

        $this->command->info('Creating 1000 Bulk Patients and Bills...');

        for ($i = 0; $i < 1000; $i++) {
            $patient = Patient::query()->create([
                'lab_id' => $lab->id,
                'title' => $faker->randomElement(['Mr.', 'Mrs.', 'Ms.']),
                'name' => $faker->name(),
                'phone' => $faker->numerify('9#########'),
                'gender' => $faker->randomElement(['male', 'female']),
                'age_years' => $faker->numberBetween(18, 80),
                'city' => $faker->city(),
            ]);

            $randomTestCount = $faker->numberBetween(1, 4);
            $randomTests = $tests->random($randomTestCount);

            $testTotal = $randomTests->sum('price');
            $grossTotal = $testTotal;
            $netTotal = $grossTotal + 15; // 15 service charge

            $bill = Bill::query()->create([
                'lab_id' => $lab->id,
                'patient_id' => $patient->id,
                'doctor_id' => $doctors->random()->id,
                'bill_number' => 'LAB' . $lab->id . '-' . now()->format('YmdHis') . '-' . str_pad((string)$i, 4, '0', STR_PAD_LEFT),
                'billing_at' => Carbon::now()->subMinutes(rand(1, 10000)),
                'test_total' => $testTotal,
                'package_total' => 0,
                'gross_total' => $grossTotal,
                'discount_amount' => 0,
                'service_charge' => 15,
                'net_total' => $netTotal,
                'payment_amount' => $netTotal,
                'status' => 'completed',
            ]);

            foreach ($randomTests as $test) {
                $billItem = BillItem::query()->create([
                    'lab_id' => $lab->id,
                    'bill_id' => $bill->id,
                    'billable_type' => 'test',
                    'billable_id' => $test->id,
                    'test_id' => $test->id,
                    'name' => $test->name,
                    'quantity' => 1,
                    'unit_price' => $test->price,
                    'total_price' => $test->price,
                ]);

                $sampleType = strtolower(trim((string) $test->sample_type));
                $nonPhysicalSamples = ['none', 'imaging', 'radiology', 'x-ray', 'xray', 'ultrasound', 'mri', 'ct scan'];
                $requiresPhysicalSample = $sampleType !== '' && !in_array($sampleType, $nonPhysicalSamples, true);

                $statusRandomizer = rand(1, 100);
                if ($requiresPhysicalSample) {
                    if ($statusRandomizer < 20) {
                        $status = 'pending';
                    } elseif ($statusRandomizer < 50) {
                        $status = 'collected';
                    } elseif ($statusRandomizer < 70) {
                        $status = 'in_progress';
                    } else {
                        $status = 'completed';
                    }
                } else {
                    if ($statusRandomizer < 25) {
                        $status = 'collected';
                    } elseif ($statusRandomizer < 50) {
                        $status = 'in_progress';
                    } else {
                        $status = 'completed';
                    }
                }

                Sample::query()->create([
                    'lab_id' => $lab->id,
                    'bill_id' => $bill->id,
                    'bill_item_id' => $billItem->id,
                    'test_id' => $test->id,
                    'barcode' => $requiresPhysicalSample ? ('LAB-B-' . Str::random(6)) : null,
                    'status' => $status,
                    'collected_at' => $status !== 'pending' ? Carbon::now()->subMinutes(rand(1, 500)) : null,
                ]);
            }
        }

        $this->command->info('Successfully seeded 1000 Bulk records');
    }
}
