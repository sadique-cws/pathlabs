<?php

namespace App\Http\Controllers;

use App\Http\Requests\CancelPublicDoctorAppointmentRequest;
use App\Http\Requests\StorePublicDoctorAppointmentRequest;
use App\Models\Doctor;
use App\Models\DoctorAppointment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PublicDoctorAppointmentController extends Controller
{
    public function index(): Response
    {
        $doctors = Doctor::query()
            ->where('is_active', true)
            ->with('lab:id,name,city,state')
            ->orderBy('name')
            ->get()
            ->map(fn (Doctor $doctor): array => [
                'id' => $doctor->id,
                'name' => $doctor->name,
                'phone' => $doctor->phone,
                'email' => $doctor->email,
                'specialization' => $doctor->specialization ?? 'General',
                'doctor_type' => $doctor->doctor_type,
                'consultation_fee' => (float) $doctor->consultation_fee,
                'lab_name' => $doctor->lab?->name ?? '-',
                'lab_location' => trim((string) (($doctor->lab?->city ?? '').', '.($doctor->lab?->state ?? '')), ', '),
            ])
            ->values()
            ->all();

        return Inertia::render('public/appointments/doctors', [
            'doctors' => $doctors,
        ]);
    }

    public function book(Doctor $doctor): Response
    {
        abort_if(! $doctor->is_active, 404);

        $doctor->load('lab:id,name,city,state');

        return Inertia::render('public/appointments/book', [
            'doctor' => [
                'id' => $doctor->id,
                'name' => $doctor->name,
                'phone' => $doctor->phone,
                'email' => $doctor->email,
                'specialization' => $doctor->specialization ?? 'General',
                'doctor_type' => $doctor->doctor_type,
                'consultation_fee' => (float) $doctor->consultation_fee,
                'lab_name' => $doctor->lab?->name ?? '-',
                'lab_location' => trim((string) (($doctor->lab?->city ?? '').', '.($doctor->lab?->state ?? '')), ', '),
            ],
            'available_dates' => $this->availableDates(),
            'time_slots' => $this->timeSlots(),
        ]);
    }

    public function store(StorePublicDoctorAppointmentRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        /** @var Doctor $doctor */
        $doctor = Doctor::query()->where('is_active', true)->findOrFail((int) $validated['doctor_id']);

        $appointmentDate = (string) $validated['appointment_date'];
        $slotTime = (string) $validated['slot_time'];
        $appointmentAt = date('Y-m-d H:i:s', strtotime("{$appointmentDate} {$slotTime}"));

        $slotAlreadyBooked = DoctorAppointment::query()
            ->where('doctor_id', $doctor->id)
            ->whereDate('appointment_date', $appointmentDate)
            ->where('slot_time', $slotTime)
            ->whereIn('status', ['scheduled', 'rescheduled'])
            ->exists();

        if ($slotAlreadyBooked) {
            return back()->withErrors(['slot_time' => 'Selected slot is already booked. Please choose another time.'])->withInput();
        }

        $paymentStatus = (string) $validated['payment_status'];

        $appointment = DoctorAppointment::query()->create([
            'public_token' => (string) Str::uuid(),
            'lab_id' => (int) $doctor->lab_id,
            'doctor_id' => $doctor->id,
            'patient_name' => $validated['patient_name'],
            'patient_phone' => $validated['patient_phone'],
            'patient_email' => $validated['patient_email'] ?? null,
            'patient_gender' => $validated['patient_gender'] ?? null,
            'patient_age' => $validated['patient_age'] ?? null,
            'patient_address' => $validated['patient_address'] ?? null,
            'appointment_date' => $appointmentDate,
            'slot_time' => $slotTime,
            'appointment_at' => $appointmentAt,
            'status' => $paymentStatus === 'success' ? 'scheduled' : 'cancelled',
            'consultation_fee' => (float) $doctor->consultation_fee,
            'payment_status' => $paymentStatus,
            'payment_method' => $validated['payment_method'],
            'payment_reference' => 'TXN'.strtoupper(Str::random(10)),
            'receipt_barcode' => null,
            'cancelled_at' => $paymentStatus === 'failed' ? now() : null,
            'cancel_reason' => $paymentStatus === 'failed' ? 'Payment failed' : null,
            'notes' => $validated['notes'] ?? null,
        ]);

        $appointmentCode = 'APT'.now()->format('ymd').str_pad((string) $appointment->id, 6, '0', STR_PAD_LEFT);
        $appointment->update([
            'appointment_code' => $appointmentCode,
            'receipt_barcode' => 'DRM-'.$doctor->lab_id.'-'.$appointment->id,
        ]);

        if ($paymentStatus === 'success') {
            return to_route('public.appointments.success', ['token' => $appointment->public_token]);
        }

        return to_route('public.appointments.failed', ['token' => $appointment->public_token]);
    }

    public function success(string $token): Response
    {
        $appointment = $this->appointmentByToken($token);

        return Inertia::render('public/appointments/status', [
            'mode' => 'success',
            'appointment' => $this->appointmentPayload($appointment),
        ]);
    }

    public function failed(string $token): Response
    {
        $appointment = $this->appointmentByToken($token);

        return Inertia::render('public/appointments/status', [
            'mode' => 'failed',
            'appointment' => $this->appointmentPayload($appointment),
        ]);
    }

    public function receipt(string $token): Response
    {
        $appointment = $this->appointmentByToken($token);

        return Inertia::render('public/appointments/receipt', [
            'appointment' => $this->appointmentPayload($appointment),
            'can_cancel' => in_array($appointment->status, ['scheduled', 'rescheduled'], true),
        ]);
    }

    public function cancel(CancelPublicDoctorAppointmentRequest $request, string $token): RedirectResponse
    {
        $appointment = $this->appointmentByToken($token);

        if (! in_array($appointment->status, ['scheduled', 'rescheduled'], true)) {
            return back()->withErrors(['cancel_reason' => 'This appointment cannot be cancelled now.']);
        }

        if ($appointment->patient_phone !== $request->validated('patient_phone')) {
            return back()->withErrors(['patient_phone' => 'Phone number does not match this appointment.']);
        }

        $appointment->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'cancel_reason' => $request->validated('cancel_reason') ?: 'Cancelled by patient',
        ]);

        return back()->with('success', 'Appointment cancelled successfully.');
    }

    private function appointmentByToken(string $token): DoctorAppointment
    {
        return DoctorAppointment::query()
            ->where('public_token', $token)
            ->with(['doctor:id,name,specialization,phone,consultation_fee,lab_id', 'doctor.lab:id,name,city,state'])
            ->firstOrFail();
    }

    /**
     * @return array<int, array{value: string, label: string}>
     */
    private function availableDates(): array
    {
        return collect(range(0, 9))
            ->map(function (int $offset): array {
                $date = now()->addDays($offset);

                return [
                    'value' => $date->toDateString(),
                    'label' => $date->format('D, d M Y'),
                ];
            })
            ->all();
    }

    /**
     * @return array<int, string>
     */
    private function timeSlots(): array
    {
        return [
            '09:00 AM',
            '09:30 AM',
            '10:00 AM',
            '10:30 AM',
            '11:00 AM',
            '11:30 AM',
            '12:00 PM',
            '12:30 PM',
            '01:00 PM',
            '04:00 PM',
            '04:30 PM',
            '05:00 PM',
            '05:30 PM',
            '06:00 PM',
            '06:30 PM',
            '07:00 PM',
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function appointmentPayload(DoctorAppointment $appointment): array
    {
        return [
            'appointment_code' => $appointment->appointment_code,
            'public_token' => $appointment->public_token,
            'patient_name' => $appointment->patient_name,
            'patient_phone' => $appointment->patient_phone,
            'patient_email' => $appointment->patient_email,
            'patient_gender' => $appointment->patient_gender,
            'patient_age' => $appointment->patient_age,
            'patient_address' => $appointment->patient_address,
            'appointment_date' => $appointment->appointment_date?->format('d/m/Y') ?? '-',
            'slot_time' => $appointment->slot_time,
            'status' => $appointment->status,
            'consultation_fee' => (float) $appointment->consultation_fee,
            'payment_status' => $appointment->payment_status,
            'payment_method' => $appointment->payment_method,
            'payment_reference' => $appointment->payment_reference,
            'receipt_barcode' => $appointment->receipt_barcode,
            'cancelled_at' => $appointment->cancelled_at?->format('d/m/Y h:i A'),
            'cancel_reason' => $appointment->cancel_reason,
            'doctor' => [
                'name' => $appointment->doctor?->name ?? '-',
                'specialization' => $appointment->doctor?->specialization ?? 'General',
                'phone' => $appointment->doctor?->phone ?? '-',
            ],
            'lab' => [
                'name' => $appointment->doctor?->lab?->name ?? '-',
                'location' => trim((string) (($appointment->doctor?->lab?->city ?? '').', '.($appointment->doctor?->lab?->state ?? '')), ', '),
            ],
        ];
    }
}
