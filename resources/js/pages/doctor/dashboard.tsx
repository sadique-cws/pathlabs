import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

type Props = {
    stats: {
        referred_patients: number;
        upcoming_appointments: number;
        commission_total: number;
    };
};

export default function DoctorDashboard({ stats }: Props) {
    return (
        <AppLayout>
            <Head title="Doctor Dashboard" />
            <div className="min-h-full bg-white p-4">
                <h1 className="text-3xl font-semibold text-slate-900">Doctor Dashboard</h1>
                <p className="mt-1 text-sm text-slate-600">Overview of referral, appointments, and earnings</p>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="border border-slate-200 p-4"><p className="text-xs text-slate-500">Referred Patients</p><p className="text-4xl font-semibold">{stats.referred_patients}</p></div>
                    <div className="border border-slate-200 p-4"><p className="text-xs text-slate-500">Upcoming Appointments</p><p className="text-4xl font-semibold">{stats.upcoming_appointments}</p></div>
                    <div className="border border-slate-200 p-4"><p className="text-xs text-slate-500">Gift Commission</p><p className="text-4xl font-semibold">₹{stats.commission_total.toFixed(2)}</p></div>
                </div>
            </div>
        </AppLayout>
    );
}
