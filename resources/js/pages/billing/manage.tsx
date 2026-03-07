import { Head, Link } from '@inertiajs/react';
import { Eye, FileSpreadsheet, Pencil, Printer, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
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
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Manage Patient Bills',
        href: '/lab/billing/manage',
    },
];

const columns: Array<{ key: keyof Filters; label: string; placeholder: string }> = [
    { key: 'bill', label: 'Bill#', placeholder: 'Filter bill...' },
    { key: 'name', label: 'Name', placeholder: 'Filter name...' },
    { key: 'mobile', label: 'Mobile', placeholder: 'Filter mobile...' },
    { key: 'refDoctor', label: 'Ref Dr.', placeholder: 'Filter doctor...' },
    { key: 'payable', label: 'Payable', placeholder: 'Filter amount...' },
    { key: 'paid', label: 'Paid Amt', placeholder: 'Filter paid...' },
    { key: 'due', label: 'Due', placeholder: 'Filter due...' },
    { key: 'discount', label: 'Discount', placeholder: 'Filter discount...' },
    { key: 'billDate', label: 'Bill Date', placeholder: 'Filter date...' },
    { key: 'payment', label: 'Payment', placeholder: 'Filter payment...' },
    { key: 'status', label: 'Status', placeholder: 'Filter status...' },
];

type Filters = {
    bill: string;
    name: string;
    mobile: string;
    refDoctor: string;
    payable: string;
    paid: string;
    due: string;
    discount: string;
    billDate: string;
    payment: string;
    status: string;
};

const defaultFilters: Filters = {
    bill: '',
    name: '',
    mobile: '',
    refDoctor: '',
    payable: '',
    paid: '',
    due: '',
    discount: '',
    billDate: '',
    payment: '',
    status: '',
};

export default function ManageBills({ bills }: Props) {
    const [filters, setFilters] = useState<Filters>(defaultFilters);

    const filteredBills = useMemo(() => {
        return bills.filter((bill) => {
            const checks: Array<boolean> = [
                bill.bill_number.toLowerCase().includes(filters.bill.toLowerCase()),
                (bill.patient_name ?? '').toLowerCase().includes(filters.name.toLowerCase()),
                (bill.mobile ?? '').toLowerCase().includes(filters.mobile.toLowerCase()),
                bill.ref_doctor.toLowerCase().includes(filters.refDoctor.toLowerCase()),
                bill.payable_amount.toString().toLowerCase().includes(filters.payable.toLowerCase()),
                bill.paid_amount.toString().toLowerCase().includes(filters.paid.toLowerCase()),
                bill.due_amount.toString().toLowerCase().includes(filters.due.toLowerCase()),
                bill.discount_amount.toString().toLowerCase().includes(filters.discount.toLowerCase()),
                (bill.bill_date ?? '').toLowerCase().includes(filters.billDate.toLowerCase()),
                bill.payment_status.toLowerCase().includes(filters.payment.toLowerCase()),
                bill.status.toLowerCase().includes(filters.status.toLowerCase()),
            ];

            return checks.every(Boolean);
        });
    }, [bills, filters]);

    const setFilter = (key: keyof Filters, value: string): void => {
        setFilters((current) => ({
            ...current,
            [key]: value,
        }));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Patient Bills" />

            <div className="min-h-full bg-slate-50/80 p-4 md:p-6">
                <div className="rounded-lg border border-slate-200 bg-white">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
                        <h1 className="text-xl font-semibold text-slate-800">Manage Patient Bills</h1>
                        <div className="flex items-center gap-2">
                            <button type="button" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                                <Printer className="h-4 w-4" />
                                Printer
                            </button>
                            <button type="button" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                                <FileSpreadsheet className="h-4 w-4" />
                                Export
                            </button>
                            <Link href="/lab/billing/create" className="rounded-lg bg-[#147da2] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#106385]">
                                + New Bill
                            </Link>
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
                                <tr className="bg-white">
                                    {columns.map((column) => (
                                        <th key={`filter-${column.key}`} className="px-2 py-2">
                                            <label className="relative block">
                                                <Search className="pointer-events-none absolute left-2 top-2.5 h-3.5 w-3.5 text-slate-400" />
                                                <input
                                                    value={filters[column.key]}
                                                    onChange={(event) => setFilter(column.key, event.target.value)}
                                                    className="w-full rounded-md border border-slate-200 py-1.5 pl-7 pr-2 text-xs font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20"
                                                    placeholder={column.placeholder}
                                                />
                                            </label>
                                        </th>
                                    ))}
                                    <th className="px-2 py-2"></th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredBills.map((bill) => (
                                    <tr key={bill.id} className="border-b border-slate-100 text-xs text-slate-800">
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
                                            <span className="inline-flex h-3 w-3 rounded-full bg-amber-400"></span>
                                        </td>
                                        <td className="px-3 py-3 whitespace-nowrap">
                                            <div className="flex items-center gap-1">
                                                <Link href={`/lab/billing/${bill.id}/view`} className="rounded p-1 text-blue-500 hover:bg-blue-50">
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                                <a href={`/lab/billing/${bill.id}/barcodes`} className="rounded p-1 text-emerald-600 hover:bg-emerald-50" title="View / Print Barcodes">
                                                    <Printer className="h-4 w-4" />
                                                </a>
                                                <Link href={`/lab/billing/${bill.id}/edit`} className="rounded p-1 text-slate-500 hover:bg-slate-100">
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
                </div>
            </div>
        </AppLayout>
    );
}
