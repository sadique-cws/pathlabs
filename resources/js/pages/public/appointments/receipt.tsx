import { Head, useForm, usePage } from '@inertiajs/react';
import { Printer } from 'lucide-react';
import { Code39Barcode } from '@/components/billing/code39-barcode';

type AppointmentPayload = {
    appointment_code: string;
    public_token: string;
    patient_name: string;
    patient_phone: string;
    patient_email: string | null;
    patient_gender: string | null;
    patient_age: number | null;
    patient_address: string | null;
    appointment_date: string;
    slot_time: string;
    status: string;
    consultation_fee: number;
    payment_status: string;
    payment_method: string | null;
    payment_reference: string | null;
    receipt_barcode: string | null;
    cancelled_at: string | null;
    cancel_reason: string | null;
    doctor: {
        name: string;
        specialization: string;
        phone: string;
    };
    lab: {
        name: string;
        location: string;
    };
};

type Props = {
    appointment: AppointmentPayload;
    can_cancel: boolean;
};

export default function AppointmentReceipt({ appointment, can_cancel }: Props) {
    const page = usePage();
    const flash = page.props.flash as { success?: string };
    const errors = (page.props.errors as Record<string, string>) ?? {};

    const cancelForm = useForm({
        patient_phone: '',
        cancel_reason: '',
    });

    return (
        <div className="min-h-screen bg-slate-50">
            <Head title={`Receipt ${appointment.appointment_code}`} />

            <main className="mx-auto w-full max-w-4xl px-4 py-8">
                {flash?.success && <div className="mb-3 border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{flash.success}</div>}
                <div className="border border-slate-200 bg-white p-6" id="appointment-receipt">
                    <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
                        <div>
                            <h1 className="text-2xl font-semibold text-slate-900">Appointment Receipt</h1>
                            <p className="text-sm text-slate-600">{appointment.appointment_code}</p>
                        </div>
                        <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                            <Printer className="h-4 w-4" /> Print
                        </button>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-2 text-sm">
                        <div className="space-y-1">
                            <p className="font-semibold text-slate-900">Patient</p>
                            <p>{appointment.patient_name}</p>
                            <p>{appointment.patient_phone}</p>
                            {appointment.patient_email && <p>{appointment.patient_email}</p>}
                            <p>{appointment.patient_gender ?? '-'} {appointment.patient_age ? `, ${appointment.patient_age} years` : ''}</p>
                            <p>{appointment.patient_address ?? '-'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="font-semibold text-slate-900">Doctor & Lab</p>
                            <p>{appointment.doctor.name} ({appointment.doctor.specialization})</p>
                            <p>{appointment.doctor.phone}</p>
                            <p>{appointment.lab.name}</p>
                            <p>{appointment.lab.location}</p>
                        </div>
                    </div>

                    <div className="mt-4 grid gap-4 border-t border-slate-200 pt-4 md:grid-cols-2 text-sm">
                        <div>
                            <p><span className="font-medium">Appointment Date:</span> {appointment.appointment_date}</p>
                            <p><span className="font-medium">Slot:</span> {appointment.slot_time}</p>
                            <p><span className="font-medium">Status:</span> {appointment.status}</p>
                            <p><span className="font-medium">Payment:</span> {appointment.payment_status} ({appointment.payment_method ?? '-'})</p>
                            <p><span className="font-medium">Reference:</span> {appointment.payment_reference ?? '-'}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-500">Consultation Fee</p>
                            <p className="text-2xl font-semibold text-slate-900">₹{appointment.consultation_fee.toFixed(2)}</p>
                        </div>
                    </div>

                    {appointment.receipt_barcode && (
                        <div className="mt-5 border-t border-slate-200 pt-5 text-center">
                            <p className="mb-2 text-xs font-medium tracking-wide text-slate-500">Receipt Barcode</p>
                            <Code39Barcode value={appointment.receipt_barcode} className="mx-auto h-auto w-full max-w-[260px]" height={50} />
                            <p className="mt-2 text-xs text-slate-500">{appointment.receipt_barcode}</p>
                        </div>
                    )}

                    {appointment.status === 'cancelled' && (
                        <div className="mt-4 border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                            Cancelled{appointment.cancelled_at ? ` at ${appointment.cancelled_at}` : ''}{appointment.cancel_reason ? ` (${appointment.cancel_reason})` : ''}
                        </div>
                    )}
                </div>

                {can_cancel && (
                    <div className="mt-4 border border-slate-200 bg-white p-4">
                        <h2 className="text-base font-semibold text-slate-900">Cancel Appointment</h2>
                        <p className="mt-1 text-xs text-slate-600">Enter registered phone to cancel.</p>

                        <form
                            className="mt-3 grid gap-3 md:grid-cols-3"
                            onSubmit={(event) => {
                                event.preventDefault();
                                cancelForm.post(`/public/appointments/${appointment.public_token}/cancel`);
                            }}
                        >
                            <div>
                                <input
                                    className="w-full border border-slate-200 px-3 py-2 text-sm"
                                    placeholder="Patient phone"
                                    value={cancelForm.data.patient_phone}
                                    onChange={(event) => cancelForm.setData('patient_phone', event.target.value)}
                                />
                                {errors.patient_phone && <p className="mt-1 text-xs text-red-600">{errors.patient_phone}</p>}
                            </div>
                            <input
                                className="w-full border border-slate-200 px-3 py-2 text-sm"
                                placeholder="Reason (optional)"
                                value={cancelForm.data.cancel_reason}
                                onChange={(event) => cancelForm.setData('cancel_reason', event.target.value)}
                            />
                            <button type="submit" className="border border-rose-600 bg-rose-600 px-3 py-2 text-sm font-medium text-white">
                                Cancel Appointment
                            </button>
                        </form>
                    </div>
                )}
            </main>
        </div>
    );
}
