import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

type Row = {
    id: number;
    bill_number: string;
    amount: number;
    date: string;
};

type Props = {
    rows: Row[];
};

export default function DoctorCommissions({ rows }: Props) {
    const total = rows.reduce((sum, item) => sum + item.amount, 0);

    return (
        <AppLayout>
            <Head title="Doctor Commissions" />
            <div className="min-h-full bg-white p-4">
                <h1 className="text-3xl font-semibold text-slate-900">Gift Commissions</h1>
                <p className="mt-1 text-sm text-slate-600">Commission earned from pathology referrals</p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">Total: ₹{total.toFixed(2)}</p>

                <div className="mt-3 border border-slate-200">
                    <table className="w-full min-w-[700px] text-left">
                        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                            <tr><th className="px-3 py-2">Bill Number</th><th className="px-3 py-2">Date</th><th className="px-3 py-2">Amount</th></tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => <tr key={row.id} className="border-b border-slate-100 text-sm"><td className="px-3 py-2">{row.bill_number}</td><td className="px-3 py-2">{row.date}</td><td className="px-3 py-2">₹{row.amount.toFixed(2)}</td></tr>)}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
