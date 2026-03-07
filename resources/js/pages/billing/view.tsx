import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Download, Pencil, Printer } from 'lucide-react';
import { useEffect } from 'react';
import { Code39Barcode } from '@/components/billing/code39-barcode';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type BillViewItem = {
    name: string;
    type: string;
    code: string;
    price: number;
};

type BillViewProps = {
    id: number;
    bill_number: string;
    billing_at: string | null;
    status: string;
    patient: {
        name: string;
        age: number;
        gender: string;
        phone: string;
        address: string;
    };
    info: {
        sample_from: string;
        doctor_discount: number;
        center_discount: number;
    };
    items: BillViewItem[];
    barcodes: Array<{
        sample_id: number;
        barcode: string;
        test_name: string;
    }>;
    auto_print_barcodes: boolean;
    summary: {
        subtotal: number;
        doctor_discount: number;
        center_discount: number;
        total: number;
        paid: number;
        due: number;
    };
};

type Props = {
    bill: BillViewProps;
};

export default function BillView({ bill }: Props) {
    useEffect(() => {
        if (bill.auto_print_barcodes) {
            window.setTimeout(() => window.print(), 200);
        }
    }, [bill.auto_print_barcodes]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Manage Patient Bills', href: '/lab/billing/manage' },
        { title: `Invoice ${bill.bill_number}`, href: `/lab/billing/${bill.id}/view` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Invoice ${bill.bill_number}`} />

            <div className="min-h-full bg-[#f4f7fb] p-4 md:p-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                        <Link href="/lab/billing/manage" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900">
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Link>
                        <h1 className="text-2xl font-semibold text-slate-800">Invoice #{bill.bill_number}</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href={`/lab/billing/${bill.id}/edit`} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
                            <Pencil className="h-4 w-4" />
                            Edit Bill
                        </Link>
                        <button type="button" className="inline-flex items-center gap-2 rounded-lg bg-[#0f87af] px-3 py-2 text-sm font-semibold text-white">
                            <Download className="h-4 w-4" />
                            Download PDF
                        </button>
                        <button type="button" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
                            <Printer className="h-4 w-4" />
                            Print
                        </button>
                        <a href={`/lab/billing/${bill.id}/barcodes`} className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
                            <Printer className="h-4 w-4" />
                            Barcode Preview
                        </a>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-5 flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
                        <div>
                            <h2 className="text-4xl font-bold text-slate-800">PathLab</h2>
                            <p className="text-slate-500">Diagnostic Laboratory</p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-semibold text-slate-800">INVOICE</p>
                            <p className="text-slate-500">#{bill.bill_number}</p>
                            <p className="text-slate-500">Issued: {bill.billing_at ?? '-'}</p>
                        </div>
                    </div>

                    <div className="mb-6 grid gap-4 md:grid-cols-2">
                        <div className="rounded-xl bg-slate-50 p-4">
                            <h3 className="mb-3 text-xl font-semibold text-slate-700">Patient Information</h3>
                            <div className="space-y-1 text-slate-700">
                                <p><span className="font-medium">Name:</span> {bill.patient.name}</p>
                                <p><span className="font-medium">Age/Gender:</span> {bill.patient.age} years, {bill.patient.gender}</p>
                                <p><span className="font-medium">Phone:</span> {bill.patient.phone}</p>
                                <p><span className="font-medium">Address:</span> {bill.patient.address}</p>
                            </div>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-4">
                            <h3 className="mb-3 text-xl font-semibold text-slate-700">Bill Information</h3>
                            <div className="space-y-1 text-slate-700">
                                <p><span className="font-medium">Status:</span> {bill.status}</p>
                                <p><span className="font-medium">Sample From:</span> {bill.info.sample_from}</p>
                                <p><span className="font-medium">Doctor Discount:</span> ₹{bill.info.doctor_discount.toFixed(2)}</p>
                                <p><span className="font-medium">Center Discount:</span> ₹{bill.info.center_discount.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>

                    <h3 className="mb-3 text-xl font-semibold text-slate-800">Tests & Packages</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[680px] text-left">
                            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                <tr>
                                    <th className="px-3 py-3">Item</th>
                                    <th className="px-3 py-3">Type</th>
                                    <th className="px-3 py-3">Code</th>
                                    <th className="px-3 py-3 text-right">Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bill.items.map((item, index) => (
                                    <tr key={`${item.code}-${index}`} className="border-b border-slate-100 text-sm text-slate-700">
                                        <td className="px-3 py-3">{item.name}</td>
                                        <td className="px-3 py-3">{item.type}</td>
                                        <td className="px-3 py-3">{item.code}</td>
                                        <td className="px-3 py-3 text-right">₹{item.price.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <div className="w-full max-w-sm space-y-2 text-sm">
                            <div className="flex justify-between"><span>Subtotal:</span><span>₹{bill.summary.subtotal.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span>Doctor Discount:</span><span>-₹{bill.summary.doctor_discount.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span>Center Discount:</span><span>-₹{bill.summary.center_discount.toFixed(2)}</span></div>
                            <div className="flex justify-between border-t border-slate-200 pt-2 text-xl font-semibold"><span>Total Amount:</span><span>₹{bill.summary.total.toFixed(2)}</span></div>
                            <div className="flex justify-between text-lg font-semibold text-emerald-600"><span>Paid Amount:</span><span>₹{bill.summary.paid.toFixed(2)}</span></div>
                            <div className="flex justify-between text-lg font-semibold text-rose-600"><span>Due Amount:</span><span>₹{bill.summary.due.toFixed(2)}</span></div>
                        </div>
                    </div>

                    <div id="barcodes" className="mt-8 border-t border-slate-200 pt-6">
                        <div className="mb-3 flex items-center justify-between gap-3">
                            <h3 className="text-xl font-semibold text-slate-800">Sample Barcodes</h3>
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
                            >
                                <Printer className="h-4 w-4" />
                                Print
                            </button>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {bill.barcodes.map((sample) => (
                                <div key={sample.sample_id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                                    <p className="text-xs font-medium text-slate-500">Sample #{sample.sample_id}</p>
                                    <p className="mt-1 text-sm text-slate-700">{sample.test_name}</p>
                                    <Code39Barcode value={sample.barcode} className="mt-2 h-auto w-full" height={52} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
