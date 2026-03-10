import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { CalendarDays, CheckCircle2, Clock3, CreditCard, UserRound } from 'lucide-react';
import { useMemo, useState } from 'react';

type DoctorInfo = {
    id: number;
    name: string;
    phone: string | null;
    email: string | null;
    specialization: string;
    doctor_type: string;
    consultation_fee: number;
    lab_name: string;
    lab_location: string;
};

type DateOption = {
    value: string;
    label: string;
};

type Props = {
    doctor: DoctorInfo;
    available_dates: DateOption[];
    time_slots: string[];
};

export default function PublicBookAppointment({ doctor, available_dates, time_slots }: Props) {
    const page = usePage();
    const serverErrors = (page.props.errors as Record<string, string>) ?? {};
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

    const form = useForm({
        doctor_id: doctor.id,
        appointment_date: available_dates[0]?.value ?? '',
        slot_time: time_slots[0] ?? '',
        patient_name: '',
        patient_phone: '',
        patient_email: '',
        patient_gender: 'male',
        patient_age: '',
        patient_address: '',
        payment_method: 'upi',
        payment_status: 'success',
        notes: '',
    });

    const buildValidationErrors = (data: typeof form.data): Record<string, string> => {
        const errors: Record<string, string> = {};

        if (data.appointment_date.trim() === '') {
            errors.appointment_date = 'Appointment date is required.';
        }

        if (data.slot_time.trim() === '') {
            errors.slot_time = 'Time slot is required.';
        }

        if (data.patient_name.trim().length < 2) {
            errors.patient_name = 'Patient name must be at least 2 characters.';
        }

        if (data.patient_phone.trim() === '') {
            errors.patient_phone = 'Phone is required.';
        } else if (!/^\d{10,15}$/.test(data.patient_phone.trim())) {
            errors.patient_phone = 'Enter a valid phone number.';
        }

        if (data.patient_email.trim() !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.patient_email.trim())) {
            errors.patient_email = 'Enter a valid email address.';
        }

        if (String(data.patient_age).trim() !== '') {
            const age = Number(data.patient_age);
            if (!Number.isInteger(age) || age < 0 || age > 120) {
                errors.patient_age = 'Age must be between 0 and 120.';
            }
        }

        return errors;
    };

    const setField = (field: keyof typeof form.data, value: string | number) => {
        form.setData(field, value as never);
        validateSingleField(field, String(value));
    };

    const validateSingleField = (field: keyof typeof form.data, value: string) => {
        let message = '';

        if (field === 'appointment_date' && value.trim() === '') {
            message = 'Appointment date is required.';
        }

        if (field === 'slot_time' && value.trim() === '') {
            message = 'Time slot is required.';
        }

        if (field === 'patient_name' && value.trim().length < 2) {
            message = 'Patient name must be at least 2 characters.';
        }

        if (field === 'patient_phone') {
            if (value.trim() === '') {
                message = 'Phone is required.';
            } else if (!/^\d{10,15}$/.test(value.trim())) {
                message = 'Enter a valid phone number.';
            }
        }

        if (field === 'patient_email' && value.trim() !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
            message = 'Enter a valid email address.';
        }

        if (field === 'patient_age' && value.trim() !== '') {
            const age = Number(value);
            if (!Number.isInteger(age) || age < 0 || age > 120) {
                message = 'Age must be between 0 and 120.';
            }
        }

        setClientErrors((current) => {
            if (message === '') {
                const next = { ...current };
                delete next[field];

                return next;
            }

            return {
                ...current,
                [field]: message,
            };
        });
    };

    const canGoNextFromSlot = useMemo(
        () =>
            form.data.appointment_date !== '' &&
            form.data.slot_time !== '' &&
            !clientErrors.appointment_date &&
            !clientErrors.slot_time,
        [form.data.appointment_date, form.data.slot_time, clientErrors.appointment_date, clientErrors.slot_time],
    );

    const canGoNextFromPatient = useMemo(
        () =>
            form.data.patient_name.trim() !== '' &&
            form.data.patient_phone.trim() !== '' &&
            !clientErrors.patient_name &&
            !clientErrors.patient_phone &&
            !clientErrors.patient_email &&
            !clientErrors.patient_age,
        [form.data.patient_name, form.data.patient_phone, clientErrors],
    );

    const submit = () => {
        const nextErrors = buildValidationErrors(form.data);
        setClientErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) {
            return;
        }
        form.post('/public/appointments');
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Head title="Book Appointment" />

            <main className="mx-auto w-full max-w-5xl px-4 py-8">
                <div className="border border-slate-200 bg-white p-5">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-semibold text-slate-900">{doctor.name}</h1>
                            <p className="text-sm text-slate-600">{doctor.specialization} • {doctor.lab_name}</p>
                            <p className="text-xs text-slate-500">{doctor.lab_location}</p>
                        </div>
                        <div className="border border-slate-200 bg-slate-50 px-3 py-2 text-right">
                            <p className="text-xs text-slate-500">Consultation Fee</p>
                            <p className="text-lg font-semibold text-slate-900">₹{doctor.consultation_fee.toFixed(2)}</p>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-3 border border-slate-200 text-sm">
                        <div className={`flex items-center justify-center gap-2 px-3 py-2 ${step === 1 ? 'bg-[#147da2] text-white' : 'bg-white text-slate-600'}`}><CalendarDays className="h-4 w-4" /> Date & Slot</div>
                        <div className={`flex items-center justify-center gap-2 px-3 py-2 ${step === 2 ? 'bg-[#147da2] text-white' : 'bg-white text-slate-600'}`}><UserRound className="h-4 w-4" /> Patient Info</div>
                        <div className={`flex items-center justify-center gap-2 px-3 py-2 ${step === 3 ? 'bg-[#147da2] text-white' : 'bg-white text-slate-600'}`}><CreditCard className="h-4 w-4" /> Payment</div>
                    </div>

                    {step === 1 && (
                        <section className="mt-4 space-y-4 border border-slate-200 bg-slate-50 p-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">Appointment Date</label>
                                <div className="grid gap-2 sm:grid-cols-3">
                                    {available_dates.map((date) => (
                                        <button
                                            key={date.value}
                                            type="button"
                                            onClick={() => setField('appointment_date', date.value)}
                                            className={`border px-3 py-2 text-left text-sm ${form.data.appointment_date === date.value ? 'border-[#147da2] bg-white text-[#147da2]' : 'border-slate-200 bg-white text-slate-700'}`}
                                        >
                                            {date.label}
                                        </button>
                                    ))}
                                </div>
                                {(clientErrors.appointment_date || serverErrors.appointment_date) && <p className="mt-1 text-xs text-red-600">{clientErrors.appointment_date || serverErrors.appointment_date}</p>}
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">Time Slot</label>
                                <div className="grid gap-2 sm:grid-cols-4">
                                    {time_slots.map((slot) => (
                                        <button
                                            key={slot}
                                            type="button"
                                            onClick={() => setField('slot_time', slot)}
                                            className={`inline-flex items-center justify-center gap-1 border px-2 py-2 text-sm ${form.data.slot_time === slot ? 'border-[#147da2] bg-white text-[#147da2]' : 'border-slate-200 bg-white text-slate-700'}`}
                                        >
                                            <Clock3 className="h-3.5 w-3.5" />
                                            {slot}
                                        </button>
                                    ))}
                                </div>
                                {(clientErrors.slot_time || serverErrors.slot_time) && <p className="mt-1 text-xs text-red-600">{clientErrors.slot_time || serverErrors.slot_time}</p>}
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    disabled={!canGoNextFromSlot}
                                    onClick={() => setStep(2)}
                                    className="border border-[#147da2] bg-[#147da2] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </section>
                    )}

                    {step === 2 && (
                        <section className="mt-4 space-y-3 border border-slate-200 bg-slate-50 p-4">
                            <div className="grid gap-3 md:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-700">Patient Name *</label>
                                    <input className="w-full border border-slate-200 bg-white px-3 py-2 text-sm" value={form.data.patient_name} onChange={(event) => setField('patient_name', event.target.value)} />
                                    {(clientErrors.patient_name || serverErrors.patient_name) && <p className="mt-1 text-xs text-red-600">{clientErrors.patient_name || serverErrors.patient_name}</p>}
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-700">Phone *</label>
                                    <input className="w-full border border-slate-200 bg-white px-3 py-2 text-sm" value={form.data.patient_phone} onChange={(event) => setField('patient_phone', event.target.value)} />
                                    {(clientErrors.patient_phone || serverErrors.patient_phone) && <p className="mt-1 text-xs text-red-600">{clientErrors.patient_phone || serverErrors.patient_phone}</p>}
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                                    <input className="w-full border border-slate-200 bg-white px-3 py-2 text-sm" value={form.data.patient_email} onChange={(event) => setField('patient_email', event.target.value)} />
                                    {(clientErrors.patient_email || serverErrors.patient_email) && <p className="mt-1 text-xs text-red-600">{clientErrors.patient_email || serverErrors.patient_email}</p>}
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-700">Gender</label>
                                    <select className="w-full border border-slate-200 bg-white px-3 py-2 text-sm" value={form.data.patient_gender} onChange={(event) => form.setData('patient_gender', event.target.value)}>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-700">Age</label>
                                    <input className="w-full border border-slate-200 bg-white px-3 py-2 text-sm" value={form.data.patient_age} onChange={(event) => setField('patient_age', event.target.value)} />
                                    {(clientErrors.patient_age || serverErrors.patient_age) && <p className="mt-1 text-xs text-red-600">{clientErrors.patient_age || serverErrors.patient_age}</p>}
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-700">Address</label>
                                    <input className="w-full border border-slate-200 bg-white px-3 py-2 text-sm" value={form.data.patient_address} onChange={(event) => form.setData('patient_address', event.target.value)} />
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <button type="button" onClick={() => setStep(1)} className="border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700">Back</button>
                                <button
                                    type="button"
                                    disabled={!canGoNextFromPatient}
                                    onClick={() => setStep(3)}
                                    className="border border-[#147da2] bg-[#147da2] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </section>
                    )}

                    {step === 3 && (
                        <section className="mt-4 space-y-4 border border-slate-200 bg-slate-50 p-4">
                            <div className="grid gap-3 md:grid-cols-3">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-700">Payment Method</label>
                                    <select className="w-full border border-slate-200 bg-white px-3 py-2 text-sm" value={form.data.payment_method} onChange={(event) => form.setData('payment_method', event.target.value)}>
                                        <option value="upi">UPI</option>
                                        <option value="card">Card</option>
                                        <option value="cash">Cash</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-700">Payment Result (Demo)</label>
                                    <select className="w-full border border-slate-200 bg-white px-3 py-2 text-sm" value={form.data.payment_status} onChange={(event) => form.setData('payment_status', event.target.value)}>
                                        <option value="success">Success</option>
                                        <option value="failed">Failed</option>
                                    </select>
                                </div>
                                <div className="border border-slate-200 bg-white px-3 py-2">
                                    <p className="text-xs text-slate-500">Payable Fee</p>
                                    <p className="text-lg font-semibold text-slate-900">₹{doctor.consultation_fee.toFixed(2)}</p>
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">Notes</label>
                                <textarea className="w-full border border-slate-200 bg-white px-3 py-2 text-sm" rows={3} value={form.data.notes} onChange={(event) => form.setData('notes', event.target.value)} />
                            </div>

                            <div className="flex items-center justify-between">
                                <button type="button" onClick={() => setStep(2)} className="border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700">Back</button>
                                <button type="button" onClick={submit} disabled={form.processing} className="inline-flex items-center gap-2 border border-[#147da2] bg-[#147da2] px-4 py-2 text-sm font-medium text-white">
                                    <CheckCircle2 className="h-4 w-4" />
                                    {form.processing ? 'Booking...' : 'Pay & Book'}
                                </button>
                            </div>
                        </section>
                    )}

                    <div className="mt-4">
                        <Link href="/public/doctors" className="text-sm text-[#147da2]">← Back to doctors</Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
