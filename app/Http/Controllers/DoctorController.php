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
        $routePrefix = $this->routePrefix($request);
        $collectionCenterId = $this->currentCollectionCenterId($request);
        $doctorType = $collectionCenterId > 0 ? 'referral' : 'lab_doctor';

        $doctors = Doctor::query()
            ->where('lab_id', $labId)
            ->where('doctor_type', $doctorType)
            ->when($collectionCenterId > 0, fn ($query) => $query->where('collection_center_id', $collectionCenterId))
            ->withSum('commissions as gifts_total', 'amount')
            ->latest('id')
            ->get()
            ->map(fn (Doctor $doctor): array => [
                'id' => $doctor->id,
                'name' => $doctor->name,
                'email' => $doctor->email,
                'phone' => $doctor->phone,
                'specialization' => $doctor->specialization,
                'consultation_fee' => (float) $doctor->consultation_fee,
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
            'routePrefix' => $routePrefix,
            'doctorTitle' => $collectionCenterId > 0 ? 'Referral Doctors' : 'Lab Doctors',
        ]);
    }

    public function add(Request $request): Response
    {
        $labId = (int) $request->attributes->get('lab_id');
        $collectionCenterId = $this->currentCollectionCenterId($request);
        $doctorType = $collectionCenterId > 0 ? 'referral' : 'lab_doctor';

        $existingDoctors = Doctor::query()
            ->where('lab_id', $labId)
            ->where('doctor_type', $doctorType)
            ->when($collectionCenterId > 0, fn ($query) => $query->where('collection_center_id', $collectionCenterId))
            ->orderBy('name')
            ->get(['id', 'name', 'phone', 'email'])
            ->values();

        return Inertia::render('doctors/add', [
            'existingDoctors' => $existingDoctors,
            'routePrefix' => $this->routePrefix($request),
            'doctorTitle' => $collectionCenterId > 0 ? 'Referral Doctor' : 'Lab Doctor',
        ]);
    }

    public function store(StoreDoctorRequest $request): RedirectResponse
    {
        $labId = (int) $request->attributes->get('lab_id');
        $data = $request->validated();
        $collectionCenterId = $this->currentCollectionCenterId($request);
        $doctorType = $collectionCenterId > 0 ? 'referral' : 'lab_doctor';

        $name = trim((string) $data['name']);
        $phone = trim((string) ($data['phone'] ?? ''));
        $email = trim((string) ($data['email'] ?? ''));

        $existingDoctor = Doctor::query()
            ->where('lab_id', $labId)
            ->where('doctor_type', $doctorType)
            ->when($collectionCenterId > 0, fn ($query) => $query->where('collection_center_id', $collectionCenterId))
            ->whereRaw('LOWER(name) = ?', [mb_strtolower($name)])
            ->when($phone !== '', fn ($query) => $query->where('phone', $phone))
            ->first();

        if ($existingDoctor !== null) {
            return to_route($this->routePrefix($request).'.doctors.edit', ['doctor' => $existingDoctor->id])
                ->with('success', 'Doctor already exists. You can edit details.');
        }

        Doctor::query()->create([
            'lab_id' => $labId,
            'collection_center_id' => $collectionCenterId > 0 ? $collectionCenterId : null,
            'name' => $name,
            'phone' => $phone !== '' ? $phone : null,
            'email' => $email !== '' ? $email : null,
            'doctor_type' => $doctorType,
            'specialization' => $data['specialization'] ?? null,
            'can_approve_reports' => (bool) ($data['can_approve_reports'] ?? true),
            'consultation_fee' => (float) ($data['consultation_fee'] ?? 500),
            'commission_type' => $data['commission_type'] ?? 'percent',
            'commission_value' => (float) ($data['commission_value'] ?? 0),
            'is_active' => (bool) ($data['is_active'] ?? true),
        ]);

        return to_route($this->routePrefix($request).'.doctors.manage')
            ->with('success', 'Doctor created successfully.');
    }

    public function edit(Request $request, Doctor $doctor): Response
    {
        $labId = (int) $request->attributes->get('lab_id');
        abort_if($doctor->lab_id !== $labId, 404);
        abort_if($doctor->doctor_type !== ($this->currentCollectionCenterId($request) > 0 ? 'referral' : 'lab_doctor'), 404);
        abort_if($this->currentCollectionCenterId($request) > 0 && (int) $doctor->collection_center_id !== $this->currentCollectionCenterId($request), 404);

        $doctor->loadSum('commissions as gifts_total', 'amount');

        return Inertia::render('doctors/edit', [
            'doctor' => [
                'id' => $doctor->id,
                'name' => $doctor->name,
                'phone' => $doctor->phone,
                'email' => $doctor->email,
                'commission_type' => $doctor->commission_type,
                'commission_value' => (float) $doctor->commission_value,
                'specialization' => $doctor->specialization,
                'consultation_fee' => (float) $doctor->consultation_fee,
                'can_approve_reports' => (bool) $doctor->can_approve_reports,
                'is_active' => (bool) $doctor->is_active,
                'gift_total' => round((float) ($doctor->gifts_total ?? 0), 2),
            ],
            'routePrefix' => $this->routePrefix($request),
            'doctorTitle' => $this->currentCollectionCenterId($request) > 0 ? 'Referral Doctor' : 'Lab Doctor',
        ]);
    }

    public function update(UpdateDoctorRequest $request, Doctor $doctor): RedirectResponse
    {
        $labId = (int) $request->attributes->get('lab_id');
        abort_if($doctor->lab_id !== $labId, 404);
        abort_if($doctor->doctor_type !== ($this->currentCollectionCenterId($request) > 0 ? 'referral' : 'lab_doctor'), 404);
        abort_if($this->currentCollectionCenterId($request) > 0 && (int) $doctor->collection_center_id !== $this->currentCollectionCenterId($request), 404);

        $data = $request->validated();

        $doctor->update([
            'name' => trim((string) $data['name']),
            'phone' => isset($data['phone']) && trim((string) $data['phone']) !== '' ? trim((string) $data['phone']) : null,
            'email' => isset($data['email']) && trim((string) $data['email']) !== '' ? trim((string) $data['email']) : null,
            'specialization' => $data['specialization'] ?? null,
            'consultation_fee' => (float) ($data['consultation_fee'] ?? 500),
            'can_approve_reports' => (bool) ($data['can_approve_reports'] ?? true),
            'commission_type' => $data['commission_type'] ?? 'percent',
            'commission_value' => (float) ($data['commission_value'] ?? 0),
            'is_active' => (bool) ($data['is_active'] ?? true),
        ]);

        return to_route($this->routePrefix($request).'.doctors.manage')
            ->with('success', 'Doctor updated successfully.');
    }

    private function routePrefix(Request $request): string
    {
        return $request->routeIs('cc.*') ? 'cc' : 'lab';
    }

    private function currentCollectionCenterId(Request $request): int
    {
        if (! $request->routeIs('cc.*')) {
            return 0;
        }

        return (int) ($request->user()?->collection_center_id ?? 0);
    }
}
