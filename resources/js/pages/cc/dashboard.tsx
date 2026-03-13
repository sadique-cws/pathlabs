import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type Props = {
    collectionCenter: {
        id: number;
        name: string;
        margin_type: string;
        margin_value: number;
    };
    totals: {
        bills: number;
        patients: number;
        doctors: number;
        revenue: number;
        commission: number;
    };
    recentBills: Array<{
        id: number;
        bill_number: string;
        patient_name: string;
        patient_phone: string;
        doctor_name: string;
        amount: number;
        paid_amount: number;
        billing_at: string | null;
        status: string;
    }>;
};

export default function CollectionCenterDashboard({ collectionCenter, totals, recentBills }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [{ title: 'CC Dashboard', href: '/cc/dashboard' }];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Collection Center Dashboard" />

            <div className="space-y-5 bg-slate-50/80">
                <section className="border border-slate-200 bg-white p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">B2B Portal</p>
                    <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-slate-900">{collectionCenter.name}</h1>
                            <p className="mt-1 text-sm text-slate-500">
                                Margin policy: {collectionCenter.margin_type === 'percent' ? `${collectionCenter.margin_value}%` : `₹${collectionCenter.margin_value.toFixed(2)}`} above B2B base price
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Link href="/cc/billing/create" className="border border-[#147da2] bg-[#147da2] px-4 py-2 text-sm font-semibold text-white">
                                New Bill
                            </Link>
                            <Link href="/cc/price-list" className="border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
                                Price List
                            </Link>
                        </div>
                    </div>
                </section>

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    {[
                        ['Total Bills', totals.bills],
                        ['Patients', totals.patients],
                        ['Referral Doctors', totals.doctors],
                        ['Revenue', `₹${totals.revenue.toFixed(2)}`],
                        ['Wallet Earnings', `₹${totals.commission.toFixed(2)}`],
                    ].map(([label, value]) => (
                        <div key={label} className="border border-slate-200 bg-white p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
                            <p className="mt-3 text-2xl font-semibold text-slate-900">{value}</p>
                        </div>
                    ))}
                </section>

                <section className="border border-slate-200 bg-white">
                    <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">Recent Bills</h2>
                            <p className="text-sm text-slate-500">Only this collection center&apos;s bills are shown here.</p>
                        </div>
                        <Link href="/cc/billing/manage" className="text-sm font-semibold text-[#147da2]">
                            View all
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className="border-b border-slate-200 bg-slate-50/80 text-slate-500">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Bill</th>
                                    <th className="px-4 py-3 font-semibold">Patient</th>
                                    <th className="px-4 py-3 font-semibold">Doctor</th>
                                    <th className="px-4 py-3 font-semibold">Amount</th>
                                    <th className="px-4 py-3 font-semibold">Paid</th>
                                    <th className="px-4 py-3 font-semibold">Date</th>
                                    <th className="px-4 py-3 font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentBills.map((bill) => (
                                    <tr key={bill.id} className="border-b border-slate-100 text-slate-700 last:border-0">
                                        <td className="px-4 py-3 font-medium text-slate-900">{bill.bill_number}</td>
                                        <td className="px-4 py-3">
                                            <div>{bill.patient_name}</div>
                                            <div className="text-xs text-slate-400">{bill.patient_phone}</div>
                                        </td>
                                        <td className="px-4 py-3">{bill.doctor_name}</td>
                                        <td className="px-4 py-3">₹{bill.amount.toFixed(2)}</td>
                                        <td className="px-4 py-3">₹{bill.paid_amount.toFixed(2)}</td>
                                        <td className="px-4 py-3">{bill.billing_at ?? '-'}</td>
                                        <td className="px-4 py-3">{bill.status}</td>
                                    </tr>
                                ))}
                                {recentBills.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                                            No bills found for this collection center.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
