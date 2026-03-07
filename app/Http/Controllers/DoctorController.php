<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDoctorRequest;
use App\Http\Requests\UpdateDoctorRequest;
use App\Models\Doctor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DoctorController extends Controller
{
    public function manage(Request $request): Response
    {
        $labId = (int) $request->attributes->get('lab_id');

        $doctors = Doctor::query()
            ->where('lab_id', $labId)
            ->withSum('commissions as gifts_total', 'amount')
            ->latest('id')
            ->get()
            ->map(fn (Doctor $doctor): array => [
                'id' => $doctor->id,
                'name' => $doctor->name,
                'email' => $doctor->email,
                'phone' => $doctor->phone,
                'gift_total' => round((float) ($doctor->gifts_total ?? 0), 2),
                'status' => $doctor->is_active ? 'Accepted' : 'Inactive',
                'created_date' => $doctor->created_at?->format('d/m/Y'),
            ])
            ->values();

        $stats = [
            'total' => $doctors->count(),
            'accepted' => $doctors->where('status', 'Accepted')->count(),
            'with_gifts' => $doctors->filter(fn (array $doctor): bool => (float) $doctor['gift_total'] > 0)->count(),
        ];

        return Inertia::render('doctors/manage', [
            'doctors' => $doctors,
            'stats' => $stats,
        ]);
    }

    public function add(Request $request): Response
    {
        $labId = (int) $request->attributes->get('lab_id');
        $existingDoctors = Doctor::query()
            ->where('lab_id', $labId)
            ->orderBy('name')
            ->get(['id', 'name', 'phone', 'email'])
            ->values();

        return Inertia::render('doctors/add', [
            'existingDoctors' => $existingDoctors,
        ]);
    }

    public function store(StoreDoctorRequest $request): RedirectResponse
    {
        $labId = (int) $request->attributes->get('lab_id');
        $data = $request->validated();

        $name = trim((string) $data['name']);
        $phone = trim((string) ($data['phone'] ?? ''));
        $email = trim((string) ($data['email'] ?? ''));

        $existingDoctor = Doctor::query()
            ->where('lab_id', $labId)
            ->whereRaw('LOWER(name) = ?', [mb_strtolower($name)])
            ->when($phone !== '', fn ($query) => $query->where('phone', $phone))
            ->first();

        if ($existingDoctor !== null) {
            return to_route('lab.doctors.edit', ['doctor' => $existingDoctor->id])
                ->with('success', 'Doctor already exists. You can edit details.');
        }

        Doctor::query()->create([
            'lab_id' => $labId,
            'name' => $name,
            'phone' => $phone !== '' ? $phone : null,
            'email' => $email !== '' ? $email : null,
            'commission_type' => $data['commission_type'] ?? 'percent',
            'commission_value' => (float) ($data['commission_value'] ?? 0),
            'is_active' => (bool) ($data['is_active'] ?? true),
        ]);

        return to_route('lab.doctors.manage')
            ->with('success', 'Doctor created successfully.');
    }

    public function edit(Request $request, Doctor $doctor): Response
    {
        $labId = (int) $request->attributes->get('lab_id');
        abort_if($doctor->lab_id !== $labId, 404);

        $doctor->loadSum('commissions as gifts_total', 'amount');

        return Inertia::render('doctors/edit', [
            'doctor' => [
                'id' => $doctor->id,
                'name' => $doctor->name,
                'phone' => $doctor->phone,
                'email' => $doctor->email,
                'commission_type' => $doctor->commission_type,
                'commission_value' => (float) $doctor->commission_value,
                'is_active' => (bool) $doctor->is_active,
                'gift_total' => round((float) ($doctor->gifts_total ?? 0), 2),
            ],
        ]);
    }

    public function update(UpdateDoctorRequest $request, Doctor $doctor): RedirectResponse
    {
        $labId = (int) $request->attributes->get('lab_id');
        abort_if($doctor->lab_id !== $labId, 404);

        $data = $request->validated();

        $doctor->update([
            'name' => trim((string) $data['name']),
            'phone' => isset($data['phone']) && trim((string) $data['phone']) !== '' ? trim((string) $data['phone']) : null,
            'email' => isset($data['email']) && trim((string) $data['email']) !== '' ? trim((string) $data['email']) : null,
            'commission_type' => $data['commission_type'] ?? 'percent',
            'commission_value' => (float) ($data['commission_value'] ?? 0),
            'is_active' => (bool) ($data['is_active'] ?? true),
        ]);

        return to_route('lab.doctors.manage')
            ->with('success', 'Doctor updated successfully.');
    }
}
