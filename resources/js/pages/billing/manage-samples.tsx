import { Head, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type SampleRow = {
    id: number;
    sample_code: string;
    barcode: string | null;
    bill_number: string | null;
    patient_name: string | null;
    test_name: string | null;
    sample_type: string;
    bill_date: string | null;
    collected_at: string | null;
    outsource: string;
};

type Props = {
    samples: SampleRow[];
    filters: {
        search: string;
        date: string;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Manage Samples',
        href: '/lab/billing/samples',
    },
];

const pageSizeOptions = [10, 20, 50];

export default function ManageSamples({ samples, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [pageSize, setPageSize] = useState(20);
    const [page, setPage] = useState(1);

    const totalItems = samples.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const currentPage = Math.min(page, totalPages);
    const from = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const to = Math.min(totalItems, currentPage * pageSize);

    const paginatedRows = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return samples.slice(start, start + pageSize);
    }, [samples, currentPage, pageSize]);

    const applyServerFilter = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value };
        router.get('/lab/billing/samples', newFilters, {
            preserveState: true,
            replace: true,
        });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyServerFilter('search', search);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Samples" />

            <div className="min-h-full bg-slate-50/80 p-4 md:p-6">
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
                        <h1 className="text-xl font-semibold text-slate-800">Manage Samples</h1>

                        <div className="flex items-center gap-3">
                            <select
                                value={filters.date || ''}
                                onChange={(e) => applyServerFilter('date', e.target.value)}
                                className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20"
                            >
                                <option value="">All Dates</option>
                                <option value="today">Today</option>
                                <option value="yesterday">Yesterday</option>
                            </select>

                            <form onSubmit={handleSearch} className="relative">
                                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search barcode, bill, patient..."
                                    className="h-9 w-64 rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20 shadow-sm"
                                />
                            </form>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b border-slate-200 bg-slate-50/50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                <tr>
                                    <th className="px-5 py-3">Sample Code</th>
                                    <th className="px-5 py-3">Barcode</th>
                                    <th className="px-3 py-3">Bill#</th>
                                    <th className="px-3 py-3">Patient Name</th>
                                    <th className="px-3 py-3">Test Name</th>
                                    <th className="px-3 py-3">Sample Type</th>
                                    <th className="px-3 py-3 text-center">Bill Date</th>
                                    <th className="px-3 py-3">Collected At</th>
                                    <th className="px-3 py-3">Outsource</th>
                                </tr>
                            </thead>
                            <tbody className="text-[13px] text-slate-700">
                                {paginatedRows.map((row) => (
                                    <tr key={row.id} className="border-b border-slate-100 transition hover:bg-slate-50/50">
                                        <td className="px-5 py-3 font-medium text-slate-900">{row.sample_code}</td>
                                        <td className="px-5 py-3">
                                            {row.barcode ? (
                                                <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600">
                                                    {row.barcode}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 italic">No Barcode</span>
                                            )}
                                        </td>
                                        <td className="px-3 py-3">{row.bill_number ?? '-'}</td>
                                        <td className="px-3 py-3 font-medium">{row.patient_name ?? '-'}</td>
                                        <td className="px-3 py-3">{row.test_name ?? '-'}</td>
                                        <td className="px-3 py-3">
                                            <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                                                {row.sample_type}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3 text-center text-slate-500 whitespace-nowrap">
                                            {row.bill_date}
                                        </td>
                                        <td className="px-3 py-3 text-slate-500 whitespace-nowrap">
                                            {row.collected_at ?? '-'}
                                        </td>
                                        <td className="px-3 py-3 font-medium text-amber-600 uppercase text-[11px]">
                                            {row.outsource}
                                        </td>
                                    </tr>
                                ))}
                                {samples.length === 0 && (
                                    <tr>
                                        <td colSpan={9} className="px-5 py-8 text-center text-slate-500 italic">
                                            No samples found matching these filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-200 bg-white px-5 py-3">
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-slate-500 lowercase">
                                Showing <span className="font-semibold text-slate-700">{from}</span> to{' '}
                                <span className="font-semibold text-slate-700">{to}</span> of{' '}
                                <span className="font-semibold text-slate-700">{totalItems}</span> results
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-400">Items per page:</span>
                                <select
                                    value={pageSize}
                                    onChange={(e) => {
                                        setPageSize(Number(e.target.value));
                                        setPage(1);
                                    }}
                                    className="h-7 rounded border border-slate-200 bg-white px-1 text-xs outline-none"
                                >
                                    {pageSizeOptions.map((size) => (
                                        <option key={size} value={size}>
                                            {size}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <div className="flex items-center px-1 text-sm font-medium text-slate-500">
                                Page {currentPage} of {totalPages}
                            </div>
                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
