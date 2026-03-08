<?php

namespace App\Http\Controllers;

use App\Models\Bill;
use App\Models\Doctor;
use App\Models\LabTest;
use App\Models\Patient;
use App\Models\TestPackage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function globalSearch(Request $request): JsonResponse
    {
        $query = $request->get('query');
        $labId = (int) $request->attributes->get('lab_id');

        if (strlen($query) < 2) {
            return response()->json([]);
        }

        $results = [];

        // 1. Search Patients
        $patients = Patient::query()
            ->where('lab_id', $labId)
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                    ->orWhere('phone', 'like', "%{$query}%")
                    ->orWhere('uhid', 'like', "%{$query}%");
            })
            ->limit(5)
            ->get();

        foreach ($patients as $patient) {
            $results[] = [
                'type' => 'Patient',
                'title' => $patient->name,
                'subtitle' => "ID: {$patient->uhid} | Mob: {$patient->phone}",
                'url' => route('lab.patients.edit', $patient->id),
            ];
        }

        // 2. Search Bills
        $bills = Bill::query()
            ->where('lab_id', $labId)
            ->where('bill_number', 'like', "%{$query}%")
            ->with('patient')
            ->limit(5)
            ->get();

        foreach ($bills as $bill) {
            $results[] = [
                'type' => 'Bill',
                'title' => $bill->bill_number,
                'subtitle' => "Patient: " . ($bill->patient?->name ?? 'N/A'),
                'url' => route('lab.billing.view', $bill->id),
            ];
        }

        // 3. Search Tests
        $tests = LabTest::query()
            ->where(function ($q) use ($labId) {
                $q->where('lab_id', $labId)->orWhere('is_system', true);
            })
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                    ->orWhere('code', 'like', "%{$query}%");
            })
            ->limit(5)
            ->get();

        foreach ($tests as $test) {
            $results[] = [
                'type' => 'Test',
                'title' => $test->name,
                'subtitle' => "Code: {$test->code} | Price: ₹{$test->price}",
                'url' => route('lab.clinical-master.tests') . "?search={$test->code}",
            ];
        }

        // 4. Search Packages
        $packages = TestPackage::query()
            ->where(function ($q) use ($labId) {
                $q->where('lab_id', $labId)->orWhere('is_system', true);
            })
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                    ->orWhere('code', 'like', "%{$query}%");
            })
            ->limit(5)
            ->get();

        foreach ($packages as $pkg) {
            $results[] = [
                'type' => 'Package',
                'title' => $pkg->name,
                'subtitle' => "Code: {$pkg->code} | Price: ₹{$pkg->price}",
                'url' => route('lab.clinical-master.packages') . "?search={$pkg->code}",
            ];
        }

        // 5. Search Doctors
        $doctors = Doctor::query()
            ->where('lab_id', $labId)
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                    ->orWhere('phone', 'like', "%{$query}%");
            })
            ->limit(5)
            ->get();

        foreach ($doctors as $doctor) {
            $results[] = [
                'type' => 'Doctor',
                'title' => $doctor->name,
                'subtitle' => "Phone: " . ($doctor->phone ?? 'N/A'),
                'url' => route('lab.doctors.edit', $doctor->id),
            ];
        }

        return response()->json($results);
    }
}
