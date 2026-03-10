import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

type Row = {
    id: number;
    bill_number: string;
    test_name: string;
    status: string;
    bill_date: string;
};

type Props = {
    rows: Row[];
    canApprove: boolean;
};

export default function DoctorReports({ rows, canApprove }: Props) {
    return (
        <AppLayout>
            <Head title="Doctor Lab Reports" />
            <div className="min-h-full bg-white p-4">
                <h1 className="text-3xl font-semibold text-slate-900">Lab Reports</h1>
                <p className="mt-1 text-sm text-slate-600">Review reports from pathology labs</p>
                {!canApprove && <p className="mt-2 text-xs text-amber-700">Approval actions are available only for lab doctors.</p>}

                <div className="mt-3 border border-slate-200">
                    <table className="w-full min-w-[780px] text-left">
                        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                            <tr><th className="px-3 py-2">Bill</th><th className="px-3 py-2">Test</th><th className="px-3 py-2">Date</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Action</th></tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => (
                                <tr key={row.id} className="border-b border-slate-100 text-sm">
                                    <td className="px-3 py-2">{row.bill_number}</td>
                                    <td className="px-3 py-2">{row.test_name}</td>
                                    <td className="px-3 py-2">{row.bill_date}</td>
                                    <td className="px-3 py-2">{row.status}</td>
                                    <td className="px-3 py-2">{canApprove ? <button type="button" className="bg-[#147da2] px-2 py-1 text-xs text-white">Approve</button> : '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
