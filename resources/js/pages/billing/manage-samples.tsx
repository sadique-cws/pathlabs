import { Head } from '@inertiajs/react';
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Search } from 'lucide-react';
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
};

type Filters = {
    sampleCode: string;
    billNumber: string;
    patientName: string;
    testName: string;
    sampleType: string;
    billDate: string;
    collectedAt: string;
    outsource: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Manage Samples',
        href: '/lab/billing/samples',
    },
];

const defaultFilters: Filters = {
    sampleCode: '',
    billNumber: '',
    patientName: '',
    testName: '',
    sampleType: '',
    billDate: '',
    collectedAt: '',
    outsource: '',
};

const pageSizeOptions = [10, 20, 50];

export default function ManageSamples({ samples }: Props) {
    const [filters, setFilters] = useState<Filters>(defaultFilters);
    const [globalSearch, setGlobalSearch] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [page, setPage] = useState(1);

    const filteredRows = useMemo(() => {
        const query = globalSearch.trim().toLowerCase();

        return samples.filter((row) => {
            const matchesGlobal = query === ''
                || `${row.sample_code} ${row.bill_number ?? ''} ${row.patient_name ?? ''} ${row.test_name ?? ''} ${row.sample_type} ${row.bill_date ?? ''}`
                    .toLowerCase()
                    .includes(query);

            const matchesDate = dateFilter === '' || row.bill_date === dateFilter;

            const checks = [
                row.sample_code.toLowerCase().includes(filters.sampleCode.toLowerCase()),
                (row.bill_number ?? '').toLowerCase().includes(filters.billNumber.toLowerCase()),
                (row.patient_name ?? '').toLowerCase().includes(filters.patientName.toLowerCase()),
                (row.test_name ?? '').toLowerCase().includes(filters.testName.toLowerCase()),
                row.sample_type.toLowerCase().includes(filters.sampleType.toLowerCase()),
                (row.bill_date ?? '').toLowerCase().includes(filters.billDate.toLowerCase()),
                (row.collected_at ?? '').toLowerCase().includes(filters.collectedAt.toLowerCase()),
                row.outsource.toLowerCase().includes(filters.outsource.toLowerCase()),
            ];

            return matchesGlobal && matchesDate && checks.every(Boolean);
        });
    }, [samples, filters, globalSearch, dateFilter]);

    const totalItems = filteredRows.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const currentPage = Math.min(page, totalPages);
    const from = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const to = Math.min(totalItems, currentPage * pageSize);

    const paginatedRows = useMemo(() => {
        const start = (currentPage - 1) * pageSize;

        return filteredRows.slice(start, start + pageSize);
    }, [filteredRows, currentPage, pageSize]);

    const setFilter = (key: keyof Filters, value: string): void => {
        setPage(1);
        setFilters((current) => ({
            ...current,
            [key]: value,
        }));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Samples" />

            <div className="min-h-full bg-slate-50/80 p-4 md:p-6">
                <div className="rounded-lg border border-slate-200 bg-white">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
                        <h1 className="text-[20px] font-semibold text-slate-800">Manage Samples</h1>

                        <div className="flex items-center gap-2">
                            <label className="relative">
                                <CalendarDays className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                                <input
                                    type="date"
                                    value={dateFilter}
                                    onChange={(event) => {
                                        setDateFilter(event.target.value);
                                        setPage(1);
                                    }}
                                    className="rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm"
                                />
                            </label>

                            <label className="relative">
                                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                <input
                                    value={globalSearch}
                                    onChange={(event) => {
                                        setGlobalSearch(event.target.value);
                                        setPage(1);
                                    }}
                                    placeholder="Search"
                                    className="rounded-lg border border-slate-200 bg-slate-50/80 py-2 pl-9 pr-3 text-sm text-slate-800 transition focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20"
                                />
                            </label>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-[1260px] w-full text-left">
                            <thead className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                <tr>
                                    <th className="px-3 py-3"><input type="checkbox" /></th>
                                    <th className="px-3 py-3 whitespace-nowrap">Sample Code <ChevronDown className="ml-1 inline h-4 w-4" /></th>
                                    <th className="px-3 py-3 whitespace-nowrap">Bill Number <ChevronDown className="ml-1 inline h-4 w-4" /></th>
                                    <th className="px-3 py-3 whitespace-nowrap">Patient Name <ChevronDown className="ml-1 inline h-4 w-4" /></th>
                                    <th className="px-3 py-3 whitespace-nowrap">Test Name <ChevronDown className="ml-1 inline h-4 w-4" /></th>
                                    <th className="px-3 py-3 whitespace-nowrap">Sample Type <ChevronDown className="ml-1 inline h-4 w-4" /></th>
                                    <th className="px-3 py-3 whitespace-nowrap">Bill Date <ChevronDown className="ml-1 inline h-4 w-4" /></th>
                                    <th className="px-3 py-3 whitespace-nowrap">Collected At <ChevronDown className="ml-1 inline h-4 w-4" /></th>
                                    <th className="px-3 py-3 whitespace-nowrap">Outsource <ChevronDown className="ml-1 inline h-4 w-4" /></th>
                                </tr>
                                <tr className="bg-white">
                                    <th className="px-2 py-2"></th>
                                    <th className="px-2 py-2"><input value={filters.sampleCode} onChange={(e) => setFilter('sampleCode', e.target.value)} className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs" placeholder="Filter sample code..." /></th>
                                    <th className="px-2 py-2"><input value={filters.billNumber} onChange={(e) => setFilter('billNumber', e.target.value)} className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs" placeholder="Filter bill number..." /></th>
                                    <th className="px-2 py-2"><input value={filters.patientName} onChange={(e) => setFilter('patientName', e.target.value)} className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs" placeholder="Filter patient..." /></th>
                                    <th className="px-2 py-2"><input value={filters.testName} onChange={(e) => setFilter('testName', e.target.value)} className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs" placeholder="Filter test..." /></th>
                                    <th className="px-2 py-2"><input value={filters.sampleType} onChange={(e) => setFilter('sampleType', e.target.value)} className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs" placeholder="Filter type..." /></th>
                                    <th className="px-2 py-2"><input value={filters.billDate} onChange={(e) => setFilter('billDate', e.target.value)} className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs" placeholder="Filter date..." /></th>
                                    <th className="px-2 py-2"><input value={filters.collectedAt} onChange={(e) => setFilter('collectedAt', e.target.value)} className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs" placeholder="Filter collection..." /></th>
                                    <th className="px-2 py-2"><input value={filters.outsource} onChange={(e) => setFilter('outsource', e.target.value)} className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs" placeholder="Filter outsource..." /></th>
                                </tr>
                            </thead>

                            <tbody>
                                {paginatedRows.map((row) => (
                                    <tr key={row.id} className="border-b border-slate-100 text-sm text-slate-800">
                                        <td className="px-3 py-3"><input type="checkbox" /></td>
                                        <td className="px-3 py-3 whitespace-nowrap">{row.sample_code}</td>
                                        <td className="px-3 py-3 whitespace-nowrap">{row.bill_number ?? '-'}</td>
                                        <td className="px-3 py-3 whitespace-nowrap">{row.patient_name ?? '-'}</td>
                                        <td className="px-3 py-3 whitespace-nowrap">{row.test_name ?? '-'}</td>
                                        <td className="px-3 py-3 whitespace-nowrap">{row.sample_type}</td>
                                        <td className="px-3 py-3 whitespace-nowrap">{row.bill_date ?? '-'}</td>
                                        <td className="px-3 py-3 whitespace-nowrap">{row.collected_at ?? '-'}</td>
                                        <td className="px-3 py-3 whitespace-nowrap">{row.outsource}</td>
                                    </tr>
                                ))}

                                {paginatedRows.length === 0 && (
                                    <tr>
                                        <td colSpan={9} className="px-3 py-10 text-center text-sm text-slate-500">No samples found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-sm">
                        <div className="flex items-center gap-4">
                            <span>Showing {from} to {to} of {totalItems} items</span>
                            <label className="flex items-center gap-2">
                                <span>Show:</span>
                                <select
                                    value={pageSize}
                                    onChange={(event) => {
                                        setPageSize(Number(event.target.value));
                                        setPage(1);
                                    }}
                                    className="rounded-md border border-slate-200 px-2 py-1"
                                >
                                    {pageSizeOptions.map((size) => (
                                        <option key={size} value={size}>{size}</option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        <div className="flex items-center gap-1">
                            <button type="button" disabled={currentPage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-3 py-1.5 transition disabled:opacity-50 hover:bg-slate-50">
                                <ChevronLeft className="h-4 w-4" /> Previous
                            </button>
                            {Array.from({ length: Math.min(totalPages, 4) }, (_, index) => index + 1).map((pageNo) => (
                                <button
                                    key={pageNo}
                                    type="button"
                                    onClick={() => setPage(pageNo)}
                                    className={`rounded-md border px-3 py-1.5 transition ${currentPage === pageNo ? 'border-[#147da2] bg-[#147da2] text-white' : 'border-slate-200 hover:bg-slate-50'}`}
                                >
                                    {pageNo}
                                </button>
                            ))}
                            <button type="button" disabled={currentPage >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-3 py-1.5 transition disabled:opacity-50 hover:bg-slate-50">
                                Next <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
