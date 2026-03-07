import { Head, Link } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type ResultRow = {
    id: number;
    barcode: string;
    bill_number: string;
    patient_name: string;
    patient_phone: string;
    patient_gender: string;
    patient_age: number;
    test_name: string;
    sample_type: string;
    bill_date: string;
    status: string;
};

type Props = {
    rows: ResultRow[];
    stats: {
        pending: number;
        in_progress: number;
        completed: number;
        total: number;
    };
};

export default function ResultEntry({ rows, stats }: Props) {
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (query === '') {
            return rows;
        }

        return rows.filter((row) => (
            `${row.barcode} ${row.bill_number} ${row.patient_name} ${row.test_name}`.toLowerCase().includes(query)
        ));
    }, [rows, search]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Test Reports', href: '/lab/test-reports/result-entry' },
        { title: 'Result Entry', href: '/lab/test-reports/result-entry' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Test Reports Dashboard" />

            <div className="min-h-full bg-slate-50/80 p-4 md:p-6">
                <div className="mb-4">
                    <h1 className="text-xl font-semibold text-slate-800">Test Reports Dashboard</h1>
                    <p className="mt-1 text-sm text-slate-500">Manage patient test samples and enter results</p>
                </div>

                <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg border border-slate-200 bg-white p-4"><p className="text-xs font-medium uppercase tracking-wide text-slate-500">Pending</p><p className="mt-1 text-2xl font-bold text-slate-800">{stats.pending}</p></div>
                    <div className="rounded-lg border border-slate-200 bg-white p-4"><p className="text-xs font-medium uppercase tracking-wide text-slate-500">In Progress</p><p className="mt-1 text-2xl font-bold text-slate-800">{stats.in_progress}</p></div>
                    <div className="rounded-lg border border-slate-200 bg-white p-4"><p className="text-xs font-medium uppercase tracking-wide text-slate-500">Completed</p><p className="mt-1 text-2xl font-bold text-slate-800">{stats.completed}</p></div>
                    <div className="rounded-lg border border-slate-200 bg-white p-4"><p className="text-xs font-medium uppercase tracking-wide text-slate-500">Total Samples</p><p className="mt-1 text-2xl font-bold text-slate-800">{stats.total}</p></div>
                </div>

                <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4">
                    <label className="relative block">
                        <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input className="h-9 w-full rounded-md border border-slate-200 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20" placeholder="Search by patient, bill, or test..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    </label>
                </div>

                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                    <table className="w-full min-w-[1100px] text-left">
                        <thead className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            <tr>
                                <th className="px-4 py-3">Sample Details</th>
                                <th className="px-4 py-3">Patient Information</th>
                                <th className="px-4 py-3">Test Information</th>
                                <th className="px-4 py-3">Bill Date</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((row) => (
                                <tr key={row.id} className="border-b border-slate-100 text-sm text-slate-700">
                                    <td className="px-4 py-3">
                                        <p className="font-medium">{row.bill_number}</p>
                                        <p className="text-xs text-slate-500">{row.barcode}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p>{row.patient_name}</p>
                                        <p className="text-xs text-slate-500">{row.patient_phone}</p>
                                        <p className="text-xs text-slate-500">{row.patient_gender}, {row.patient_age} years</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p>{row.test_name}</p>
                                        <p className="text-xs text-slate-500">{row.sample_type}</p>
                                    </td>
                                    <td className="px-4 py-3">{row.bill_date}</td>
                                    <td className="px-4 py-3">{row.status}</td>
                                    <td className="px-4 py-3">
                                        <Link href={`/lab/test-reports/result-entry/${row.id}`} className="rounded-lg bg-[#147da2] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#106385]">
                                            Enter Results
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
