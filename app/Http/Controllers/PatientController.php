<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePatientRequest;
use App\Http\Requests\UpdatePatientRequest;
use App\Models\Patient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PatientController extends Controller
{
    public function add(): Response
    {
        return Inertia::render('patients/add');
    }

    public function store(StorePatientRequest $request): RedirectResponse
    {
        $labId = (int) $request->attributes->get('lab_id');
        $data = $request->validated();
        $data['lab_id'] = $labId;

        Patient::query()->create($data);

        return to_route('lab.patients.manage')->with('success', 'Patient added successfully.');
    }

    public function manage(Request $request): Response
    {
        $labId = (int) $request->attributes->get('lab_id');

        $patients = Patient::query()
            ->where('lab_id', $labId)
            ->orderByDesc('id')
            ->limit(500)
            ->get([
                'id',
                'title',
                'name',
                'phone',
                'gender',
                'age_years',
                'city',
                'address',
            ])
            ->map(fn (Patient $patient): array => [
                'id' => $patient->id,
                'title' => $patient->title ?? '-',
                'name' => $patient->name,
                'mobile' => $patient->phone,
                'gender' => $patient->gender !== null && $patient->gender !== '' ? ucfirst($patient->gender) : '-',
                'age' => $patient->age_years ?? 0,
                'city' => $patient->city ?? '-',
                'address' => $patient->address ?? '-',
                'package' => '-',
            ])
            ->values();

        return Inertia::render('patients/manage', [
            'patients' => $patients,
        ]);
    }

    public function edit(Request $request, Patient $patient): Response
    {
        $labId = (int) $request->attributes->get('lab_id');
        abort_if($patient->lab_id !== $labId, 404);

        return Inertia::render('patients/edit', [
            'patient' => [
                'id' => $patient->id,
                'title' => $patient->title ?? 'Mr.',
                'name' => $patient->name,
                'phone' => $patient->phone,
                'gender' => $patient->gender ?? 'male',
                'age_years' => $patient->age_years,
                'age_months' => $patient->age_months,
                'age_days' => $patient->age_days,
                'city' => $patient->city,
                'address' => $patient->address,
                'state' => $patient->state,
                'pin_code' => $patient->pin_code,
                'landmark' => $patient->landmark,
                'weight_kg' => $patient->weight_kg,
                'height_cm' => $patient->height_cm,
                'uhid' => $patient->uhid,
                'id_type' => $patient->id_type,
            ],
        ]);
    }

    public function update(UpdatePatientRequest $request, Patient $patient): RedirectResponse
    {
        $labId = (int) $request->attributes->get('lab_id');
        abort_if($patient->lab_id !== $labId, 404);

        $patient->update($request->validated());

        return to_route('lab.patients.manage')->with('success', 'Patient details updated.');
    }
}
