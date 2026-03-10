<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDoctorAppointmentRequest;
use App\Http\Requests\StoreDoctorLeaveRequest;
use App\Http\Requests\UpdateDoctorAppointmentRequest;
use App\Models\Bill;
use App\Models\Doctor;
use App\Models\DoctorAppointment;
use App\Models\DoctorCommission;
use App\Models\DoctorLeave;
use App\Models\Sample;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DoctorPortalController extends Controller
{
    public function dashboard(Request $request): Response
    {
        $doctor = $this->resolveDoctor($request);
        $labId = (int) $request->attributes->get('lab_id');

        $referredCount = Bill::query()->where('lab_id', $labId)->where('doctor_id', $doctor->id)->count();
        $upcomingAppointments = DoctorAppointment::query()
            ->where('lab_id', $labId)
            ->where('doctor_id', $doctor->id)
            ->whereDate('appointment_at', '>=', now()->toDateString())
            ->count();
        $commissionTotal = (float) DoctorCommission::query()
            ->where('lab_id', $labId)
            ->where('doctor_id', $doctor->id)
            ->sum('amount');

        return Inertia::render('doctor/dashboard', [
            'stats' => [
                'referred_patients' => $referredCount,
                'upcoming_appointments' => $upcomingAppointments,
                'commission_total' => $commissionTotal,
            ],
        ]);
    }

    public function referredPatients(Request $request): Response
    {
        $doctor = $this->resolveDoctor($request);
        $labId = (int) $request->attributes->get('lab_id');

        $rows = Bill::query()
            ->where('lab_id', $labId)
            ->where('doctor_id', $doctor->id)
            ->with(['patient:id,name,phone'])
            ->latest('id')
            ->limit(300)
            ->get()
            ->map(fn (Bill $bill): array => [
                'id' => $bill->id,
                'bill_number' => $bill->bill_number,
                'patient_name' => $bill->patient?->name ?? '-',
                'patient_phone' => $bill->patient?->phone ?? '-',
                'status' => ucfirst((string) $bill->status),
                'amount' => (float) $bill->net_total,
                'bill_date' => $bill->billing_at?->format('d/m/Y') ?? '-',
            ])
            ->values()
            ->all();

        return Inertia::render('doctor/referred-patients', [
            'rows' => $rows,
        ]);
    }

    public function appointments(Request $request): Response
    {
        $doctor = $this->resolveDoctor($request);
        $labId = (int) $request->attributes->get('lab_id');

        $appointments = DoctorAppointment::query()
            ->where('lab_id', $labId)
            ->where('doctor_id', $doctor->id)
            ->latest('appointment_at')
            ->get()
            ->map(fn (DoctorAppointment $appointment): array => [
                'id' => $appointment->id,
                'patient_name' => $appointment->patient_name,
                'patient_phone' => $appointment->patient_phone,
                'appointment_at' => $appointment->appointment_at?->format('Y-m-d\TH:i'),
                'status' => $appointment->status,
                'notes' => $appointment->notes,
            ])
            ->values()
            ->all();

        return Inertia::render('doctor/appointments', [
            'appointments' => $appointments,
        ]);
    }

    public function leaves(Request $request): Response
    {
        $doctor = $this->resolveDoctor($request);
        $labId = (int) $request->attributes->get('lab_id');

        $leaves = DoctorLeave::query()
            ->where('lab_id', $labId)
            ->where('doctor_id', $doctor->id)
            ->latest('leave_date')
            ->get()
            ->map(fn (DoctorLeave $leave): array => [
                'id' => $leave->id,
                'leave_date' => $leave->leave_date?->format('Y-m-d'),
                'reason' => $leave->reason,
            ])
            ->values()
            ->all();

        return Inertia::render('doctor/leaves', [
            'leaves' => $leaves,
        ]);
    }

    public function storeAppointment(StoreDoctorAppointmentRequest $request): RedirectResponse
    {
        $doctor = $this->resolveDoctor($request);
        $labId = (int) $request->attributes->get('lab_id');

        DoctorAppointment::query()->create([
            'lab_id' => $labId,
            'doctor_id' => $doctor->id,
            ...$request->validated(),
            'status' => 'scheduled',
        ]);

        return back()->with('success', 'Appointment scheduled.');
    }

    public function updateAppointment(UpdateDoctorAppointmentRequest $request, DoctorAppointment $appointment): RedirectResponse
    {
        $doctor = $this->resolveDoctor($request);
        abort_if($appointment->doctor_id !== $doctor->id, 404);
        abort_if($appointment->lab_id !== (int) $request->attributes->get('lab_id'), 404);

        $appointment->update($request->validated());

        return back()->with('success', 'Appointment updated.');
    }

    public function storeLeave(StoreDoctorLeaveRequest $request): RedirectResponse
    {
        $doctor = $this->resolveDoctor($request);
        $labId = (int) $request->attributes->get('lab_id');

        DoctorLeave::query()->create([
            'lab_id' => $labId,
            'doctor_id' => $doctor->id,
            ...$request->validated(),
        ]);

        return back()->with('success', 'Leave marked.');
    }

    public function commissions(Request $request): Response
    {
        $doctor = $this->resolveDoctor($request);
        $labId = (int) $request->attributes->get('lab_id');

        $commissions = DoctorCommission::query()
            ->where('lab_id', $labId)
            ->where('doctor_id', $doctor->id)
            ->with('bill:id,bill_number,billing_at')
            ->latest('id')
            ->limit(200)
            ->get()
            ->map(fn (DoctorCommission $commission): array => [
                'id' => $commission->id,
                'bill_number' => $commission->bill?->bill_number ?? '-',
                'amount' => (float) $commission->amount,
                'date' => $commission->created_at?->format('d/m/Y') ?? '-',
            ])
            ->values()
            ->all();

        return Inertia::render('doctor/commissions', [
            'rows' => $commissions,
        ]);
    }

    public function reports(Request $request): Response
    {
        $doctor = $this->resolveDoctor($request);
        $labId = (int) $request->attributes->get('lab_id');

        $rows = Sample::query()
            ->where('lab_id', $labId)
            ->with(['bill:id,bill_number,billing_at', 'test:id,name'])
            ->latest('id')
            ->limit(200)
            ->get()
            ->map(fn (Sample $sample): array => [
                'id' => $sample->id,
                'bill_number' => $sample->bill?->bill_number ?? '-',
                'test_name' => $sample->test?->name ?? '-',
                'status' => ucfirst((string) $sample->status),
                'bill_date' => $sample->bill?->billing_at?->format('d/m/Y') ?? '-',
            ])
            ->values()
            ->all();

        return Inertia::render('doctor/reports', [
            'rows' => $rows,
            'canApprove' => $doctor->can_approve_reports,
        ]);
    }

    private function resolveDoctor(Request $request): Doctor
    {
        $labId = (int) $request->attributes->get('lab_id');
        $email = (string) ($request->user()?->email ?? '');

        return Doctor::query()
            ->where('lab_id', $labId)
            ->where('email', $email)
            ->firstOrFail();
    }
}
