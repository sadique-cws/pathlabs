import { Head, Link, router } from '@inertiajs/react';
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
    department: string;
    sample_type: string;
    bill_date: string;
    status: string;
};

type Props = {
    rows: ResultRow[];
    stats: {
        pending: number;
        collected: number;
        in_progress: number;
        completed: number;
        total: number;
    };
    filters: {
        status: string;
        department: string;
        search: string;
        date: string;
    };
};

const statusBadge: Record<string, string> = {
    Pending: 'bg-amber-100 text-amber-700',
    Collected: 'bg-blue-100 text-blue-700',
    'In Progress': 'bg-sky-100 text-sky-700',
    Completed: 'bg-emerald-100 text-emerald-700',
};

export default function ResultEntry({ rows, stats, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [page, setPage] = useState(1);
    const itemsPerPage = 50;

    const totalPages = Math.ceil(rows.length / itemsPerPage);
    const paginated = useMemo(() => {
        const start = (page - 1) * itemsPerPage;
        return rows.slice(start, start + itemsPerPage);
    }, [rows, page]);

    // Handle search with debounce or manual trigger
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilter('search', search);
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Test Reports', href: '/lab/test-reports/result-entry' },
        { title: 'Result Entry', href: '/lab/test-reports/result-entry' },
    ];

    const applyFilter = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value };
        router.get('/lab/test-reports/result-entry', newFilters, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Test Reports Dashboard" />

            <div className="min-h-full bg-slate-50/80 p-0">


                <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                    <div className="rounded-lg border border-slate-200 bg-white p-3 sm:p-4 shadow-sm transition-all hover:border-[#147da2]">
                        <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-slate-500">Pending</p>
                        <p className="mt-1 text-xl sm:text-2xl font-bold text-amber-600">{stats.pending}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-3 sm:p-4 shadow-sm transition-all hover:border-[#147da2]">
                        <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-slate-500">Collected</p>
                        <p className="mt-1 text-xl sm:text-2xl font-bold text-blue-600">{stats.collected}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-3 sm:p-4 shadow-sm transition-all hover:border-[#147da2]">
                        <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-slate-500">In Progress</p>
                        <p className="mt-1 text-xl sm:text-2xl font-bold text-sky-600">{stats.in_progress}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-3 sm:p-4 shadow-sm transition-all hover:border-[#147da2]">
                        <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-slate-500">Completed</p>
                        <p className="mt-1 text-xl sm:text-2xl font-bold text-emerald-600">{stats.completed}</p>
                    </div>
                    <div className="col-span-2 sm:col-span-1 rounded-lg border border-slate-200 bg-white p-3 sm:p-4 shadow-sm transition-all hover:border-[#147da2]">
                        <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-slate-500">Total Samples</p>
                        <p className="mt-1 text-xl sm:text-2xl font-bold text-slate-800">{stats.total}</p>
                    </div>
                </div>

                <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-4">
                        <form onSubmit={handleSearch} className="relative flex-1">
                            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <input
                                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-10 pr-3 text-sm outline-none transition focus:border-[#147da2] focus:bg-white focus:ring-1 focus:ring-[#147da2]/20 shadow-inner"
                                placeholder="Search by Patient, Bill#, Barcode..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </form>
                        
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <select
                                className="h-9 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition focus:border-[#147da2]"
                                value={filters.date}
                                onChange={(e) => applyFilter('date', e.target.value)}
                            >
                                <option value="">All Dates</option>
                                <option value="today">Today</option>
                                <option value="yesterday">Yesterday</option>
                            </select>
                            <select
                                className="h-9 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition focus:border-[#147da2]"
                                value={filters.status}
                                onChange={(e) => applyFilter('status', e.target.value)}
                            >
                                <option value="">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="collected">Collected</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                            </select>
                            <select
                                className="h-9 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition focus:border-[#147da2]"
                                value={filters.department}
                                onChange={(e) => applyFilter('department', e.target.value)}
                            >
                                <option value="">All Departments</option>
                                <option value="pathology">Pathology</option>
                                <option value="radiology">Radiology</option>
                                <option value="microbiology">Microbiology</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                    <div className="overflow-x-auto">
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
                                {paginated.map((row) => (
                                    <tr key={row.id} className="border-b border-slate-100 text-sm hover:bg-slate-50 transition-colors text-slate-700">
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
                                            <span className="mt-0.5 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">{row.department}</span>
                                        </td>
                                        <td className="px-4 py-3">{row.bill_date}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${statusBadge[row.status] ?? 'bg-slate-100 text-slate-600'}`}>
                                                {row.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Link href={`/lab/test-reports/result-entry/${row.id}`} className="rounded-lg bg-[#147da2] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#106385]">
                                                {row.status === 'Completed' ? 'View Report' : 'Enter Results'}
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {rows.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-slate-500">No samples found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-3">
                            <span className="text-sm text-slate-500">
                                Showing <span className="font-semibold text-slate-700">{(page - 1) * itemsPerPage + 1}</span> to{' '}
                                <span className="font-semibold text-slate-700">{Math.min(page * itemsPerPage, rows.length)}</span> of{' '}
                                <span className="font-semibold text-slate-700">{rows.length}</span> results
                            </span>
                            <div className="flex gap-2">
                                <button
                                    className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    Previous
                                </button>
                                <button
                                    className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
