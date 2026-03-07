import { Head, Link } from '@inertiajs/react';
import { Activity, FileText, TestTube2, Wallet } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

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
    { key: 'patients', title: 'Patients', icon: Activity, bg: 'from-cyan-500 to-cyan-600' },
    { key: 'bills', title: 'Bills', icon: FileText, bg: 'from-blue-500 to-blue-600' },
    { key: 'tests', title: 'Revenue', icon: TestTube2, bg: 'from-amber-500 to-amber-600' },
    { key: 'due', title: 'Service Charges', icon: Wallet, bg: 'from-rose-500 to-rose-600' },
] as const;

export default function Dashboard({ totals, recentBills }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Lab Analytics" />

            <div className="flex h-full flex-1 flex-col gap-5 bg-[#f4f7fb] p-4 md:p-6">
                <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                    <div>
                        <h1 className="text-3xl font-semibold text-slate-900">Lab Analytics</h1>
                        <p className="text-sm text-slate-500">Operational overview for your pathology and radiology billing unit.</p>
                    </div>
                    <Link
                        href="/lab/billing/create"
                        className="rounded-lg bg-[#0f87af] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0c7395]"
                    >
                        + Create Bill
                    </Link>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {cards.map((card) => {
                        const value = totals[card.key];

                        return (
                            <div
                                key={card.key}
                                className={`rounded-2xl bg-gradient-to-br ${card.bg} p-5 text-white shadow-md`}
                            >
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-white/90">{card.title}</p>
                                    <card.icon className="h-5 w-5" />
                                </div>
                                <p className="mt-3 text-3xl font-bold">{card.key === 'tests' || card.key === 'due' ? `₹${value}` : value}</p>
                            </div>
                        );
                    })}
                </div>

                <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-slate-900">Recent Bills</h2>
                        <Link href="/lab/billing/create" className="text-sm font-medium text-[#0f87af]">
                            New Bill
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
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
