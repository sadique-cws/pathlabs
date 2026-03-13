import { Head, Link } from '@inertiajs/react';
import { Eye, FileSpreadsheet, Pencil, Printer, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Pagination } from '@/components/pagination';
import type { BreadcrumbItem } from '@/types';

type BillRow = {
    id: number;
    bill_number: string;
    patient_name: string | null;
    mobile: string | null;
    ref_doctor: string;
    payable_amount: number;
    paid_amount: number;
    due_amount: number;
    discount_amount: number;
    bill_date: string | null;
    bill_date_value: string | null;
    payment_status: string;
    status: string;
};

type Props = {
    bills: BillRow[];
    routePrefix?: string;
    panelTitle?: string;
};

const columns: Array<{ key: string; label: string }> = [
    { key: 'bill', label: 'Bill#' },
    { key: 'name', label: 'Name' },
    { key: 'mobile', label: 'Mobile' },
    { key: 'refDoctor', label: 'Ref Dr.' },
    { key: 'payable', label: 'Payable' },
    { key: 'paid', label: 'Paid Amt' },
    { key: 'due', label: 'Due' },
    { key: 'discount', label: 'Discount' },
    { key: 'billDate', label: 'Bill Date' },
    { key: 'payment', label: 'Payment' },
    { key: 'status', label: 'Status' },
];

export default function ManageBills({ bills, routePrefix = 'lab', panelTitle = 'Manage Patient Bills' }: Props) {
    const [search, setSearch] = useState('');
    const [dateRange, setDateRange] = useState('');
    const [paymentStatus, setPaymentStatus] = useState<'' | 'Complete' | 'Partial'>('');
    const [page, setPage] = useState(1);
    const itemsPerPage = 50;

    const filteredBills = useMemo(() => {
        setPage(1); // Reset page on filter changes
        const q = search.trim().toLowerCase();
        let result = bills;

        if (q) {
            result = result.filter(
                (b) =>
                    b.bill_number.toLowerCase().includes(q) ||
                    (b.patient_name || '').toLowerCase().includes(q) ||
                    (b.mobile || '').toLowerCase().includes(q),
            );
        }

        if (dateRange === 'today') {
            const today = new Date().toISOString().split('T')[0];
            result = result.filter((b) => b.bill_date_value === today);
        } else if (dateRange === 'yesterday') {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yDate = yesterday.toISOString().split('T')[0];
            result = result.filter((b) => b.bill_date_value === yDate);
        }

        if (paymentStatus) {
            result = result.filter((b) => b.payment_status === paymentStatus);
        }

        return result;
    }, [bills, search, dateRange, paymentStatus]);

    const totalPages = Math.ceil(filteredBills.length / itemsPerPage);
    const paginated = useMemo(() => {
        const start = (page - 1) * itemsPerPage;
        return filteredBills.slice(start, start + itemsPerPage);
    }, [filteredBills, page]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Patient Bills" />

            <div className="min-h-full bg-slate-50/80 p-0">
                <div className=" border-0 border-slate-200 bg-white">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2 ml-auto w-full sm:w-auto">
                            <button type="button" className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2  border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                                <Printer className="h-4 w-4" />
                                <span className="hidden xs:inline">Printer</span>
                            </button>
                            <button type="button" className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2  border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                                <FileSpreadsheet className="h-4 w-4" />
                                <span className="hidden xs:inline">Export</span>
                            </button>
                            <Link href={`/${routePrefix}/billing/create`} className="flex-[2] sm:flex-none text-center  bg-[#147da2] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#106385]">
                                + New Bill
                            </Link>
                        </div>
                    </div>

                    <div className="p-4 border-b border-slate-100">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <label className="relative block w-full sm:w-64">
                                    <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                                    <input
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="h-9 w-full  border border-slate-200 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20"
                                        placeholder="Search bills..."
                                    />
                                </label>

                                <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                                    <select
                                        value={dateRange}
                                        onChange={(e) => setDateRange(e.target.value)}
                                        className="h-9 w-full sm:w-auto  border border-slate-200 px-3 text-sm outline-none transition focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20"
                                    >
                                        <option value="">All Dates</option>
                                        <option value="today">Today</option>
                                        <option value="yesterday">Yesterday</option>
                                    </select>

                                    <select
                                        value={paymentStatus}
                                        onChange={(e) => setPaymentStatus(e.target.value as '' | 'Complete' | 'Partial')}
                                        className="h-9 w-full sm:w-auto  border border-slate-200 px-3 text-sm outline-none transition focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20"
                                    >
                                        <option value="">All Status</option>
                                        <option value="Complete">Complete</option>
                                        <option value="Partial">Partial</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-[1380px] w-full text-left">
                            <thead className="border-b border-slate-200 bg-slate-50/70 text-sm font-medium text-slate-700">
                                <tr>
                                    {columns.map((column) => (
                                        <th key={column.key} className="px-3 py-3 whitespace-nowrap">{column.label}</th>
                                    ))}
                                    <th className="px-3 py-3 whitespace-nowrap">Opt</th>
                                </tr>
                            </thead>

                            <tbody>
                                {paginated.map((bill) => (
                                    <tr key={bill.id} className="border-b border-slate-100 text-[13px] hover:bg-slate-50 transition-colors">
                                        <td className="px-3 py-3 whitespace-nowrap">{bill.bill_number}</td>
                                        <td className="px-3 py-3 whitespace-nowrap">{bill.patient_name ?? '-'}</td>
                                        <td className="px-3 py-3 whitespace-nowrap">{bill.mobile ?? '-'}</td>
                                        <td className="px-3 py-3 whitespace-nowrap">{bill.ref_doctor}</td>
                                        <td className="px-3 py-3 whitespace-nowrap">₹{bill.payable_amount.toFixed(2)}</td>
                                        <td className="px-3 py-3 whitespace-nowrap">₹{bill.paid_amount.toFixed(2)}</td>
                                        <td className="px-3 py-3 whitespace-nowrap">₹{bill.due_amount.toFixed(2)}</td>
                                        <td className="px-3 py-3 whitespace-nowrap">₹{bill.discount_amount.toFixed(2)}</td>
                                        <td className="px-3 py-3 whitespace-nowrap">{bill.bill_date ?? '-'}</td>
                                        <td className="px-3 py-3 whitespace-nowrap">
                                            <span className={bill.payment_status === 'Complete' ? 'text-emerald-600' : 'text-amber-600'}>{bill.payment_status}</span>
                                        </td>
                                        <td className="px-3 py-3 whitespace-nowrap">
                                            <span className="inline-flex h-3 w-3  bg-amber-400"></span>
                                        </td>
                                        <td className="px-3 py-3 whitespace-nowrap">
                                            <div className="flex items-center gap-1">
                                                <Link href={`/${routePrefix}/billing/${bill.id}/view`} className="p-1 text-blue-500 hover:bg-blue-50">
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                                <a href={`/${routePrefix}/billing/${bill.id}/barcodes`} className="p-1 text-emerald-600 hover:bg-emerald-50" title="View / Print Barcodes">
                                                    <Printer className="h-4 w-4" />
                                                </a>
                                                <Link href={`/${routePrefix}/billing/${bill.id}/edit`} className="p-1 text-slate-500 hover:bg-slate-100">
                                                    <Pencil className="h-4 w-4" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {filteredBills.length === 0 && (
                                    <tr>
                                        <td colSpan={12} className="px-3 py-8 text-center text-sm text-slate-500">
                                            No bills matched current filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                
                    {filteredBills.length > 0 && (
                        <Pagination
                            totalItems={filteredBills.length}
                            pageSize={itemsPerPage}
                            currentPage={page}
                            onPageChange={setPage}
                            from={(page - 1) * itemsPerPage + 1}
                            to={Math.min(page * itemsPerPage, filteredBills.length)}
                        />
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: panelTitle,
            href: `/${routePrefix}/billing/manage`,
        },
    ];
