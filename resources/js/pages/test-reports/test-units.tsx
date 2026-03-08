import { Head } from '@inertiajs/react';
import { Search, TestTube2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type UnitRow = {
    id: number;
    name: string;
    created_date: string;
    updated_date: string;
};

type Props = {
    units: UnitRow[];
    totals: { total_units: number; available_units: number };
};

export default function TestUnits({ units, totals }: Props) {
    const [search, setSearch] = useState('');
    const rows = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (query === '') {
            return units;
        }

        return units.filter((unit) => unit.name.toLowerCase().includes(query));
    }, [units, search]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Test Reports', href: '/lab/test-reports/test-units' },
        { title: 'Manage Test Units', href: '/lab/test-reports/test-units' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Test Units" />

            <div className="min-h-full bg-slate-50/80 p-0">
                <div className="sawtooth border-b border-slate-200 bg-white p-4">
                    <label className="relative block">
                        <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input className="h-9 w-full  border border-slate-200 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20" placeholder="Search test units by name..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    </label>
                </div>

                <div className="grid md:grid-cols-2">
                    <div className="sawtooth border-r border-slate-200 bg-white p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Total Test Units</p>
                        <p className="mt-1 text-2xl font-bold text-slate-800">{totals.total_units}</p>
                    </div>
                    <div className="sawtooth border-slate-200 bg-white p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Units Available</p>
                        <p className="mt-1 text-2xl font-bold text-slate-800">{totals.available_units}</p>
                    </div>
                </div>

                <div className="overflow-hidden border-y border-slate-200 bg-white">
                    <table className="w-full min-w-[700px] text-left">
                        <thead className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            <tr>
                                <th className="px-4 py-3">Unit Name</th>
                                <th className="px-4 py-3">Unit ID</th>
                                <th className="px-4 py-3">Created Date</th>
                                <th className="px-4 py-3">Last Updated</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => (
                                <tr key={row.id} className="border-b border-slate-100 text-sm text-slate-700">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <TestTube2 className="h-4 w-4 text-sky-600" />
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
