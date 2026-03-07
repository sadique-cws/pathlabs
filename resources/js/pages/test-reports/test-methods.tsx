import { Head } from '@inertiajs/react';
import { FlaskConical, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type MethodRow = {
    id: number;
    name: string;
    created_date: string;
    updated_date: string;
};

type Props = {
    methods: MethodRow[];
    totals: { total_methods: number; available_methods: number };
};

export default function TestMethods({ methods, totals }: Props) {
    const [search, setSearch] = useState('');
    const rows = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (query === '') {
            return methods;
        }

        return methods.filter((method) => method.name.toLowerCase().includes(query));
    }, [methods, search]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Test Reports', href: '/lab/test-reports/test-methods' },
        { title: 'Test Methods', href: '/lab/test-reports/test-methods' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Test Methods" />

            <div className="min-h-full bg-[#f4f7fb] p-4 md:p-6">
                <div className="mb-4">
                    <h1 className="text-3xl font-semibold text-slate-800">Manage Test Methods</h1>
                    <p className="text-slate-500">Create and manage test methods for laboratory procedures</p>
                </div>

                <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4">
                    <label className="relative block">
                        <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <input className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm" placeholder="Search test methods by name..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    </label>
                </div>

                <div className="mb-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                        <p className="text-slate-500">Total Test Methods</p>
                        <p className="text-4xl font-bold text-slate-800">{totals.total_methods}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                        <p className="text-slate-500">Methods Available</p>
                        <p className="text-4xl font-bold text-slate-800">{totals.available_methods}</p>
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <table className="w-full min-w-[700px] text-left">
                        <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            <tr>
                                <th className="px-4 py-3">Method Name</th>
                                <th className="px-4 py-3">Method ID</th>
                                <th className="px-4 py-3">Created Date</th>
                                <th className="px-4 py-3">Last Updated</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => (
                                <tr key={row.id} className="border-b border-slate-100 text-sm text-slate-700">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <FlaskConical className="h-4 w-4 text-sky-600" />
                                            {row.name}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">{row.id}</td>
                                    <td className="px-4 py-3">{row.created_date}</td>
                                    <td className="px-4 py-3">{row.updated_date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
