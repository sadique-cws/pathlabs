import { Head, Link } from '@inertiajs/react';
import { Activity, FileText, TestTube2, Wallet } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { cn } from '@/lib/utils';

type BillRow = {
    id: number;
    bill_number: string;
    billing_at: string;
    net_total: string;
    status: string;
    patient: {
        name: string;
    };
};

type Props = {
    totals: {
        patients: number;
        bills: number;
        tests: number;
        due: number;
    };
    recentBills: BillRow[];
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Lab Dashboard',
        href: '/dashboard',
    },
];

const cards = [
    { key: 'patients', title: 'Patients', icon: Activity, color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { key: 'bills', title: 'Bills', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { key: 'tests', title: 'Revenue', icon: TestTube2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { key: 'due', title: 'Service Charges', icon: Wallet, color: 'text-rose-600', bg: 'bg-rose-50' },
] as const;

export default function Dashboard({ totals, recentBills }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Lab Analytics" />

            <div className="flex h-full flex-1 flex-col gap-5 bg-slate-50/80">
                <div className="flex items-center justify-end">
                    <Link
                        href="/lab/billing/create"
                        className="w-full sm:w-auto text-center rounded-lg bg-[#147da2] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#106385]"
                    >
                        + Create Bill
                    </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4">
                    {cards.map((card, index) => {
                        const value = totals[card.key];

                        return (
                            <div
                                key={card.key}
                                className={cn(
                                    "sawtooth bg-white p-4 sm:p-5 border-y border-r border-slate-200",
                                    index === 0 && "border-l",
                                    index === 2 && "border-l xl:border-l-0",
                                )}
                            >
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-slate-500">{card.title}</p>
                                    <div className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg ${card.bg} ${card.color}`}>
                                        <card.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                    </div>
                                </div>
                                <p className="mt-2 sm:mt-3 text-lg sm:text-2xl font-bold text-slate-900 truncate">
                                    {card.key === 'tests' || card.key === 'due' ? `₹${value}` : value}
                                </p>
                            </div>
                        );
                    })}
                </div>

                <div className="sawtooth bg-white p-5 border border-slate-200 mt-2">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-base font-semibold text-slate-800">Recent Transactions</h2>
                        <Link href="/lab/billing/create" className="text-xs font-bold uppercase tracking-widest text-[#147da2] transition hover:text-[#106385]">
                            View All
                        </Link>
                    </div>

                    <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
                        <table className="min-w-[600px] sm:min-w-full text-left text-sm">
                            <thead className="text-xs uppercase text-slate-500">
                                <tr>
                                    <th className="px-3 py-2">Bill No</th>
                                    <th className="px-3 py-2">Patient</th>
                                    <th className="px-3 py-2">Date</th>
                                    <th className="px-3 py-2">Amount</th>
                                    <th className="px-3 py-2">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentBills.map((bill) => (
                                    <tr key={bill.id} className="border-t border-slate-100">
                                        <td className="px-3 py-3 font-medium text-slate-700">{bill.bill_number}</td>
                                        <td className="px-3 py-3 text-slate-700">{bill.patient?.name ?? '-'}</td>
                                        <td className="px-3 py-3 text-slate-600">{new Date(bill.billing_at).toLocaleString()}</td>
                                        <td className="px-3 py-3 font-semibold text-slate-800">₹{bill.net_total}</td>
                                        <td className="px-3 py-3">
                                            <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                                                {bill.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {recentBills.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-3 py-8 text-center text-slate-500">
                                            No bills available yet.
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
