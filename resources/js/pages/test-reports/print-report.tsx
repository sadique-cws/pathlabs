import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Printer } from 'lucide-react';

type ParameterRow = {
    key: string;
    name: string;
    unit: string;
    normal_range: string;
    value: string;
    remarks: string;
};

type LabConfig = {
    name: string;
    logo_url: string | null;
    email: string | null;
    phone: string | null;
    website: string | null;
    address: string | null;
    gst_number: string | null;
    lab_license_number: string | null;
    lab_director_name: string | null;
    technician_name: string | null;
    technician_qualification: string | null;
    technician_signature_url: string | null;
};

type Props = {
    sample: {
        id: number;
        barcode: string;
        bill_number: string;
        test_name: string;
        department: string;
        sample_type: string;
        status: string;
        bill_date: string;
        approval_date: string;
        technical_remarks: string;
        approved_by_name: string | null;
    };
    patient: {
        name: string;
        phone: string;
        gender: string;
        age: number;
    };
    parameters: ParameterRow[];
    labConfig: LabConfig | null;
};

export default function PrintReport({ sample, patient, parameters, labConfig }: Props) {
    const labName = labConfig?.name || 'PathLab Diagnostics';

    return (
        <>
            <Head title={`Report — ${sample.test_name}`} />

            <style>{`
                @page {
                    size: A4;
                    margin: 10mm;
                }
                @media print {
                    .no-print {
                        display: none !important;
                    }
                    body {
                        background: white !important;
                    }
                    .report-page {
                        box-shadow: none !important;
                        border: none !important;
                        padding: 0 !important;
                    }
                }
            `}</style>

            <div className="min-h-screen bg-slate-100 p-4 md:p-6">
                {/* Toolbar */}
                <div className="no-print mx-auto mb-4 flex max-w-4xl flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <Link
                            href={`/lab/test-reports/result-entry/${sample.id}`}
                            className="inline-flex items-center gap-2  border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Link>
                        <div>
                            <h1 className="text-xl font-semibold text-slate-900">Print Report</h1>
                            <p className="text-sm text-slate-500">{sample.test_name} — {patient.name}</p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-2  bg-[#147da2] px-4 py-2 text-sm font-semibold text-white shadow-sm"
                    >
                        <Printer className="h-4 w-4" />
                        Print Report
                    </button>
                </div>

                {/* Report */}
                <div className="report-page mx-auto max-w-4xl  border border-slate-200 bg-white shadow-sm">
                    {/* Header */}
                    <div className="border-b-2 border-[#147da2] px-8 py-6">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                                {labConfig?.logo_url && (
                                    <img
                                        src={labConfig.logo_url}
                                        alt={labName}
                                        className="h-14 w-14 object-contain border border-slate-100 p-1"
                                    />
                                )}
                                <div>
                                    <h2 className="text-2xl font-bold text-[#147da2]">{labName}</h2>
                                    {labConfig?.address && (
                                        <p className="mt-0.5 text-sm text-slate-500">{labConfig.address}</p>
                                    )}
                                    <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0 text-xs text-slate-400">
                                        {labConfig?.phone && <span>Ph: {labConfig.phone}</span>}
                                        {labConfig?.email && <span>Email: {labConfig.email}</span>}
                                    </div>
                                    {labConfig?.lab_license_number && (
                                        <p className="mt-0.5 text-xs text-slate-400">License: {labConfig.lab_license_number}</p>
                                    )}
                                </div>
                            </div>
                            <div className="text-right text-sm text-slate-600">
                                <p className="font-semibold text-slate-800">Lab Report</p>
                                <p>Bill #: {sample.bill_number}</p>
                                <p>Barcode: {sample.barcode}</p>
                            </div>
                        </div>
                    </div>

                    {/* Patient Info */}
                    <div className="grid grid-cols-2 gap-6 border-b border-slate-200 px-8 py-4">
                        <div className="space-y-1 text-sm">
                            <p><span className="font-semibold text-slate-600">Patient Name:</span> <span className="text-slate-800">{patient.name}</span></p>
                            <p><span className="font-semibold text-slate-600">Gender / Age:</span> <span className="text-slate-800">{patient.gender} / {patient.age} yrs</span></p>
                            <p><span className="font-semibold text-slate-600">Phone:</span> <span className="text-slate-800">{patient.phone}</span></p>
                        </div>
                        <div className="space-y-1 text-right text-sm">
                            <p><span className="font-semibold text-slate-600">Bill Date:</span> <span className="text-slate-800">{sample.bill_date}</span></p>
                            <p><span className="font-semibold text-slate-600">Report Date:</span> <span className="text-slate-800">{sample.approval_date}</span></p>
                            <p><span className="font-semibold text-slate-600">Department:</span> <span className="text-slate-800">{sample.department}</span></p>
                        </div>
                    </div>

                    {/* Test Info Header */}
                    <div className="border-b border-slate-200 bg-[#147da2]/5 px-8 py-3">
                        <h3 className="text-base font-bold text-[#147da2]">{sample.test_name}</h3>
                        <p className="text-xs text-slate-500">Sample Type: {sample.sample_type}</p>
                    </div>

                    {/* Parameters Table */}
                    <div className="px-8 py-4">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b-2 border-slate-300">
                                    <th className="py-2 text-left font-bold text-slate-700">Test Parameter</th>
                                    <th className="py-2 text-center font-bold text-slate-700">Result</th>
                                    <th className="py-2 text-center font-bold text-slate-700">Unit</th>
                                    <th className="py-2 text-center font-bold text-slate-700">Normal Range</th>
                                    <th className="py-2 text-right font-bold text-slate-700">Remarks</th>
                                </tr>
                            </thead>
                            <tbody>
                                {parameters.map((row) => {
                                    const isAbnormal = row.value && row.normal_range && row.normal_range !== '-' && isValueOutOfRange(row.value, row.normal_range);
                                    return (
                                        <tr key={row.key} className="border-b border-slate-100">
                                            <td className="py-2.5 text-slate-700">{row.name}</td>
                                            <td className={`py-2.5 text-center font-semibold ${isAbnormal ? 'text-red-600' : 'text-slate-800'}`}>
                                                {row.value || '-'}
                                                {isAbnormal && <span className="ml-1 text-xs">*</span>}
                                            </td>
                                            <td className="py-2.5 text-center text-slate-600">{row.unit}</td>
                                            <td className="py-2.5 text-center text-slate-600">{row.normal_range}</td>
                                            <td className="py-2.5 text-right text-slate-500">{row.remarks || '-'}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {parameters.some((r) => r.value && r.normal_range && r.normal_range !== '-' && isValueOutOfRange(r.value, r.normal_range)) && (
                            <p className="mt-3 text-xs text-red-600">* Values marked with asterisk are outside the normal range.</p>
                        )}
                    </div>

                    {/* Remarks */}
                    {sample.technical_remarks && (
                        <div className="border-t border-slate-200 px-8 py-4">
                            <h4 className="text-sm font-semibold text-slate-700">Technician Remarks</h4>
                            <p className="mt-1 text-sm text-slate-600">{sample.technical_remarks}</p>
                        </div>
                    )}

                    {/* Footer / Signature */}
                    <div className="border-t-2 border-slate-300 px-8 py-6">
                        <div className="flex items-end justify-between">
                            <div className="text-xs text-slate-400">
                                <p>Generated by {labName}</p>
                                <p>This is a computer-generated report.</p>
                            </div>
                            <div className="text-center">
                                {labConfig?.technician_signature_url && (
                                    <img
                                        src={labConfig.technician_signature_url}
                                        alt="Signature"
                                        className="mx-auto mb-1 h-12 max-w-[160px] object-contain"
                                    />
                                )}
                                {sample.approved_by_name && (
                                    <p className="mb-2 text-base font-bold text-slate-800">Dr. {sample.approved_by_name}</p>
                                )}
                                {labConfig?.lab_director_name && !sample.approved_by_name && (
                                    <p className="mb-2 text-base font-bold text-slate-800">{labConfig.lab_director_name}</p>
                                )}
                                <div className="mb-1 h-px w-48 bg-slate-400" />
                                <p className="text-sm font-semibold text-slate-700">
                                    {sample.department === 'Pathology' ? 'Pathologist' : sample.department === 'Radiology' ? 'Radiologist' : 'Authorized Signatory'}
                                </p>
                                {labConfig?.technician_name && (
                                    <p className="text-xs text-slate-500">
                                        Lab Tech: {labConfig.technician_name}
                                        {labConfig.technician_qualification && ` (${labConfig.technician_qualification})`}
                                    </p>
                                )}
                                <p className="text-xs text-slate-500">Date: {sample.approval_date}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

/**
 * Simple heuristic: parse "X - Y" ranges and check if value falls outside.
 */
function isValueOutOfRange(value: string, normalRange: string): boolean {
    const numVal = parseFloat(value);
    if (isNaN(numVal)) return false;

    const match = normalRange.match(/^([\d.]+)\s*[-–]\s*([\d.]+)$/);
    if (!match) return false;

    const low = parseFloat(match[1]);
    const high = parseFloat(match[2]);
    return numVal < low || numVal > high;
}
