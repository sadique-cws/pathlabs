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

            <div className="min-h-full bg-slate-50/80 p-0 lg:p-8">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link href="/lab/billing/manage" className="inline-flex h-9 w-9 items-center justify-center  border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <h1 className="text-xl font-semibold text-slate-800">Invoice #{bill.bill_number}</h1>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Link href={`/lab/billing/${bill.id}/edit`} className="inline-flex items-center gap-2  border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                            <Pencil className="h-4 w-4" />
                            Edit Bill
                        </Link>
                        <button type="button" className="inline-flex items-center gap-2  bg-[#147da2] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#106385]">
                            <Download className="h-4 w-4" />
                            Download PDF
                        </button>
                        <button type="button" className="inline-flex items-center gap-2  border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                            <Printer className="h-4 w-4" />
                            Print
                        </button>
                        <a href={`/lab/billing/${bill.id}/barcodes`} className="inline-flex items-center gap-2  border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100">
                            <Printer className="h-4 w-4" />
                            Barcode Preview
                        </a>
                    </div>
                </div>

                <div className="mx-auto max-w-5xl  border border-slate-200 bg-white p-6 md:p-8 lg:p-10">
                    <div className="mb-8 flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-6">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight text-[#147da2]">PathLab</h2>
                            <p className="mt-1 text-sm font-medium uppercase tracking-widest text-slate-500">Diagnostic Laboratory</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xl font-bold tracking-widest text-slate-300">INVOICE</p>
                            <p className="mt-1 text-lg font-medium tracking-wide text-slate-800">#{bill.bill_number}</p>
                            <p className="mt-1 text-sm text-slate-500">Issued: {bill.billing_at ?? '-'}</p>
                        </div>
                    </div>

                    <div className="mb-8 grid gap-6 md:grid-cols-2">
                        <div className=" border border-slate-100 bg-slate-50/50 p-5">
                            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-slate-400">Patient Information</h3>
                            <div className="space-y-2 text-sm text-slate-700">
                                <p><span className="font-semibold text-slate-800">Name:</span> {bill.patient.name}</p>
                                <p><span className="font-semibold text-slate-800">Age/Gender:</span> {bill.patient.age} years, {bill.patient.gender}</p>
                                <p><span className="font-semibold text-slate-800">Phone:</span> {bill.patient.phone}</p>
                                <p><span className="font-semibold text-slate-800">Address:</span> {bill.patient.address}</p>
                            </div>
                        </div>
                        <div className=" border border-slate-100 bg-slate-50/50 p-5">
                            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-slate-400">Bill Information</h3>
                            <div className="space-y-2 text-sm text-slate-700">
                                <p><span className="font-semibold text-slate-800">Status:</span> {bill.status}</p>
                                <p><span className="font-semibold text-slate-800">Sample From:</span> {bill.info.sample_from}</p>
                                <p><span className="font-semibold text-slate-800">Doctor Discount:</span> ₹{bill.info.doctor_discount.toFixed(2)}</p>
                                <p><span className="font-semibold text-slate-800">Center Discount:</span> ₹{bill.info.center_discount.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>

                    <h3 className="mb-4 text-base font-semibold text-slate-800">Tests & Packages</h3>
                    <div className="overflow-hidden  border border-slate-200">
                        <table className="w-full min-w-[680px] text-left">
                            <thead className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                <tr>
                                    <th className="px-4 py-3">Item</th>
                                    <th className="px-4 py-3">Type</th>
                                    <th className="px-4 py-3">Code</th>
                                    <th className="px-4 py-3 text-right">Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bill.items.map((item, index) => (
                                    <tr key={`${item.code}-${index}`} className="border-b border-slate-100 bg-white text-sm text-slate-700 last:border-0">
                                        <td className="px-4 py-3">{item.name}</td>
                                        <td className="px-4 py-3">{item.type}</td>
                                        <td className="px-4 py-3">{item.code}</td>
                                        <td className="px-4 py-3 text-right">₹{item.price.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-8 flex justify-end">
                        <div className="w-full max-w-sm  bg-slate-50 p-5 text-sm">
                            <div className="space-y-3 pb-4">
                                <div className="flex justify-between text-slate-600"><span>Subtotal:</span><span>₹{bill.summary.subtotal.toFixed(2)}</span></div>
                                <div className="flex justify-between text-slate-600"><span>Doctor Discount:</span><span>-₹{bill.summary.doctor_discount.toFixed(2)}</span></div>
                                <div className="flex justify-between text-slate-600"><span>Center Discount:</span><span>-₹{bill.summary.center_discount.toFixed(2)}</span></div>
                            </div>
                            <div className="flex justify-between border-t border-slate-200 pt-4 text-lg font-bold text-slate-800"><span>Total Amount:</span><span>₹{bill.summary.total.toFixed(2)}</span></div>
                            <div className="mt-2 flex justify-between text-base font-semibold text-emerald-600"><span>Paid Amount:</span><span>₹{bill.summary.paid.toFixed(2)}</span></div>
                            <div className="mt-2 flex justify-between text-base font-semibold text-rose-600"><span>Due Amount:</span><span>₹{bill.summary.due.toFixed(2)}</span></div>
                        </div>
                    </div>

                    <div id="barcodes" className="mt-10 border-t border-slate-100 pt-8">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <h3 className="text-base font-semibold text-slate-800">Sample Barcodes</h3>
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="inline-flex items-center gap-2  border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                            >
                                <Printer className="h-4 w-4" />
                                Print Barcodes
                            </button>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {bill.barcodes.map((sample) => (
                                <div key={sample.sample_id} className="flex flex-col items-center justify-center  border border-slate-200 bg-white p-4 text-center">
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Sample #{sample.sample_id}</p>
                                    <p className="mt-1 mb-3 text-sm font-medium text-slate-700 line-clamp-1" title={sample.test_name}>{sample.test_name}</p>
                                    <Code39Barcode value={sample.barcode} className="h-auto w-full max-w-[200px]" height={48} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
