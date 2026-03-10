<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateAdminDoctorRequest;
use App\Models\Doctor;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class DoctorManagementController extends Controller
{
    public function index(): Response
    {
        $doctors = Doctor::query()
            ->with('lab:id,name')
            ->latest('id')
            ->get()
            ->map(fn (Doctor $doctor): array => [
                'id' => $doctor->id,
                'lab_name' => $doctor->lab?->name ?? '-',
                'name' => $doctor->name,
                'phone' => $doctor->phone,
                'email' => $doctor->email,
                'doctor_type' => $doctor->doctor_type,
                'specialization' => $doctor->specialization,
                'consultation_fee' => (float) $doctor->consultation_fee,
                'can_approve_reports' => (bool) $doctor->can_approve_reports,
                'is_active' => (bool) $doctor->is_active,
                'created_date' => $doctor->created_at?->format('d/m/Y'),
            ])
            ->values()
            ->all();

        return Inertia::render('admin/doctors/manage', [
            'doctors' => $doctors,
        ]);
    }

    public function edit(Doctor $doctor): Response
    {
        $doctor->load('lab:id,name');

        return Inertia::render('admin/doctors/edit', [
            'doctor' => [
                'id' => $doctor->id,
                'lab_name' => $doctor->lab?->name ?? '-',
                'name' => $doctor->name,
                'phone' => $doctor->phone,
                'email' => $doctor->email,
                'doctor_type' => $doctor->doctor_type,
                'specialization' => $doctor->specialization,
                'consultation_fee' => (float) $doctor->consultation_fee,
                'can_approve_reports' => (bool) $doctor->can_approve_reports,
                'is_active' => (bool) $doctor->is_active,
                'commission_type' => $doctor->commission_type,
                'commission_value' => (float) $doctor->commission_value,
            ],
        ]);
    }

    public function update(UpdateAdminDoctorRequest $request, Doctor $doctor): RedirectResponse
    {
        $doctor->update($request->validated());

        return to_route('admin.doctors.index')->with('success', 'Doctor updated successfully.');
    }
}
