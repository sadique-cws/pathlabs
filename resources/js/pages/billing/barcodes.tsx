import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Printer } from 'lucide-react';
import { useEffect } from 'react';
import { Code39Barcode } from '@/components/billing/code39-barcode';

type BarcodeRow = {
    sample_id: number;
    barcode: string;
    test_name: string;
};

type Props = {
    bill: {
        id: number;
        bill_number: string;
        patient_name: string;
        billing_at: string | null;
        auto_print: boolean;
        barcodes: BarcodeRow[];
    };
};

export default function BillBarcodeSheet({ bill }: Props) {
    useEffect(() => {
        if (bill.auto_print) {
            window.setTimeout(() => window.print(), 250);
        }
    }, [bill.auto_print]);

    return (
        <>
            <Head title={`Barcode Sheet ${bill.bill_number}`} />

            <style>{`
                @page {
                    size: 65mm auto;
                    margin: 2mm;
                }
                @media print {
                    .no-print {
                        display: none !important;
                    }
                    .label-sheet {
                        background: white !important;
                        padding: 0 !important;
                    }
                    .label-card {
                        break-inside: avoid;
                        page-break-inside: avoid;
                        border: 1px solid #111827 !important;
                    }
                }
            `}</style>

            <div className="min-h-screen bg-slate-100 p-4 md:p-6">
                <div className="no-print mx-auto mb-4 flex max-w-5xl flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <Link href="/lab/billing/manage" className="inline-flex items-center gap-2  border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Link>
                        <div>
                            <h1 className="text-xl font-semibold text-slate-900">Barcode Preview</h1>
                            <p className="text-sm text-slate-500">Bill {bill.bill_number} • {bill.patient_name}</p>
                        </div>
                    </div>

                    <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2  bg-[#0f87af] px-4 py-2 text-sm font-semibold text-white">
                        <Printer className="h-4 w-4" />
                        Print Labels
                    </button>
                </div>

                <div className="label-sheet mx-auto grid max-w-5xl gap-3  bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-3">
                    {bill.barcodes.map((sample) => (
                        <div key={sample.sample_id} className="label-card  border border-slate-300 bg-white p-3">
                            <div className="mb-2 text-xs text-slate-600">
                                <p className="font-semibold text-slate-900">Bill: {bill.bill_number}</p>
                                <p>Sample #{sample.sample_id}</p>
                                <p className="truncate">{sample.test_name}</p>
                            </div>
                            <Code39Barcode value={sample.barcode} className="h-auto w-full" />
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
