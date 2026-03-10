import { Head, Link } from '@inertiajs/react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

type AppointmentPayload = {
    appointment_code: string;
    public_token: string;
    appointment_date: string;
    slot_time: string;
    consultation_fee: number;
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
    mode: 'success' | 'failed';
    appointment: AppointmentPayload;
};

export default function AppointmentStatus({ mode, appointment }: Props) {
    const isSuccess = mode === 'success';

    return (
        <div className="min-h-screen bg-slate-50">
            <Head title={isSuccess ? 'Appointment Confirmed' : 'Payment Failed'} />

            <main className="mx-auto w-full max-w-3xl px-4 py-10">
                <div className="border border-slate-200 bg-white p-6 text-center">
                    {isSuccess ? (
                        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
                    ) : (
                        <AlertCircle className="mx-auto h-12 w-12 text-rose-600" />
                    )}

                    <h1 className="mt-3 text-2xl font-semibold text-slate-900">
                        {isSuccess ? 'Appointment Booked Successfully' : 'Payment Failed'}
                    </h1>
                    <p className="mt-1 text-sm text-slate-600">
                        {isSuccess
                            ? 'Your appointment has been confirmed. You can view or print receipt.'
                            : 'Payment did not complete. You can retry by selecting another doctor slot.'}
                    </p>

                    <div className="mt-5 border border-slate-200 bg-slate-50 p-4 text-left text-sm">
                        <p><span className="font-medium">Appointment ID:</span> {appointment.appointment_code}</p>
                        <p><span className="font-medium">Doctor:</span> {appointment.doctor.name} ({appointment.doctor.specialization})</p>
                        <p><span className="font-medium">Date/Slot:</span> {appointment.appointment_date} • {appointment.slot_time}</p>
                        <p><span className="font-medium">Lab:</span> {appointment.lab.name}</p>
                        <p><span className="font-medium">Fee:</span> ₹{appointment.consultation_fee.toFixed(2)}</p>
                    </div>

                    <div className="mt-5 flex flex-wrap justify-center gap-2">
                        {isSuccess && (
                            <Link href={`/public/appointments/${appointment.public_token}/receipt`} className="border border-[#147da2] bg-[#147da2] px-4 py-2 text-sm font-medium text-white">
                                View Receipt
                            </Link>
                        )}
                        <Link href="/public/doctors" className="border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700">
                            Book Another
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
