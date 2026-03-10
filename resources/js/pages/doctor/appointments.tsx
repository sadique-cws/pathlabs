import { Head, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

type Appointment = {
    id: number;
    patient_name: string;
    patient_phone: string;
    appointment_at: string;
    status: string;
    notes: string | null;
};

type Props = {
    appointments: Appointment[];
};

export default function DoctorAppointments({ appointments }: Props) {
    const page = usePage();
    const flash = page.props.flash as { success?: string };

    const appointmentForm = useForm({
        patient_name: '',
        patient_phone: '',
        appointment_at: '',
        notes: '',
    });

    return (
        <AppLayout>
            <Head title="Doctor Appointments" />
            <div className="min-h-full bg-white p-4">
                {flash?.success && <div className="mb-3 border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{flash.success}</div>}
                <h1 className="text-3xl font-semibold text-slate-900">Schedule Appointment</h1>

                <form className="mt-4 grid gap-3 border border-slate-200 p-4 md:grid-cols-5" onSubmit={(e) => { e.preventDefault(); appointmentForm.post('/doctor/appointments'); }}>
                    <input className="border border-slate-200 px-2 py-2 text-sm" placeholder="Patient Name" value={appointmentForm.data.patient_name} onChange={(e) => appointmentForm.setData('patient_name', e.target.value)} />
                    <input className="border border-slate-200 px-2 py-2 text-sm" placeholder="Phone" value={appointmentForm.data.patient_phone} onChange={(e) => appointmentForm.setData('patient_phone', e.target.value)} />
                    <input type="datetime-local" className="border border-slate-200 px-2 py-2 text-sm" value={appointmentForm.data.appointment_at} onChange={(e) => appointmentForm.setData('appointment_at', e.target.value)} />
                    <input className="border border-slate-200 px-2 py-2 text-sm" placeholder="Notes" value={appointmentForm.data.notes} onChange={(e) => appointmentForm.setData('notes', e.target.value)} />
                    <button className="bg-[#147da2] px-3 py-2 text-sm font-semibold text-white" type="submit">Add</button>
                </form>

                <h2 className="mt-6 text-xl font-semibold text-slate-900">My Appointments</h2>
                <div className="mt-2 border border-slate-200">
                    <table className="w-full min-w-[780px] text-left">
                        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                            <tr><th className="px-3 py-2">Patient</th><th className="px-3 py-2">Phone</th><th className="px-3 py-2">Date Time</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Notes</th></tr>
                        </thead>
                        <tbody>
                            {appointments.map((a) => <tr key={a.id} className="border-b border-slate-100 text-sm"><td className="px-3 py-2">{a.patient_name}</td><td className="px-3 py-2">{a.patient_phone}</td><td className="px-3 py-2">{a.appointment_at}</td><td className="px-3 py-2">{a.status}</td><td className="px-3 py-2">{a.notes ?? '-'}</td></tr>)}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
