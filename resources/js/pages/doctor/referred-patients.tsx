import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

type Row = {
    id: number;
    bill_number: string;
    patient_name: string;
    patient_phone: string;
    status: string;
    amount: number;
    bill_date: string;
};

type Props = {
    rows: Row[];
};

export default function DoctorReferredPatients({ rows }: Props) {
    return (
        <AppLayout>
            <Head title="Referred Patients" />
            <div className="min-h-full bg-white p-4">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold text-slate-900">Referred Patients</h1>
                        <p className="mt-1 text-sm text-slate-600">Track your patient referrals and reports across labs</p>
                    </div>
                </div>

                <div className="border border-slate-200">
                    <table className="w-full min-w-[900px] text-left">
                        <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                            <tr>
                                <th className="px-3 py-2">Bill</th>
                                <th className="px-3 py-2">Patient</th>
                                <th className="px-3 py-2">Phone</th>
                                <th className="px-3 py-2">Date</th>
                                <th className="px-3 py-2">Status</th>
                                <th className="px-3 py-2">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => (
                                <tr key={row.id} className="border-b border-slate-100 text-sm">
                                    <td className="px-3 py-2">{row.bill_number}</td>
                                    <td className="px-3 py-2">{row.patient_name}</td>
                                    <td className="px-3 py-2">{row.patient_phone}</td>
                                    <td className="px-3 py-2">{row.bill_date}</td>
                                    <td className="px-3 py-2">{row.status}</td>
                                    <td className="px-3 py-2">₹{row.amount.toFixed(2)}</td>
                                </tr>
                            ))}
                            {rows.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-3 py-12 text-center text-sm text-slate-500">No referred patients found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
