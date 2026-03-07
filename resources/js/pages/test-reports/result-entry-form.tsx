import { Head, useForm, usePage, Link } from '@inertiajs/react';
import { useEffect, useMemo } from 'react';
import { Printer } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type SampleInfo = {
    id: number;
    barcode: string;
    bill_number: string;
    test_name: string;
    department: string;
    sample_type: string;
    patient_name: string;
    patient_phone: string;
    patient_gender: string;
    patient_age: number;
    bill_date: string;
    status: string;
    technical_remarks: string;
    approval_date: string;
    approved_by_name: string | null;
};

type ParameterRow = {
    key: string;
    name: string;
    unit: string;
    normal_range: string;
    value: string;
    remarks: string;
};

type Props = {
    sample: SampleInfo;
    parameters: ParameterRow[];
    userRole: 'doctor' | 'lab_tech';
};

const statusLabels: Record<string, { label: string; className: string }> = {
    pending: { label: 'Pending', className: 'bg-amber-100 text-amber-700' },
    collected: { label: 'Collected', className: 'bg-blue-100 text-blue-700' },
    in_progress: { label: 'In Progress', className: 'bg-sky-100 text-sky-700' },
    completed: { label: 'Completed', className: 'bg-emerald-100 text-emerald-700' },
};

export default function ResultEntryForm({ sample, parameters, userRole }: Props) {
    const page = usePage();
    const flash = page.props.flash as { success?: string };
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Test Reports', href: '/lab/test-reports/result-entry' },
        { title: 'Result Entry', href: '/lab/test-reports/result-entry' },
        { title: sample.test_name, href: `/lab/test-reports/result-entry/${sample.id}` },
    ];

    const form = useForm({
        action: 'draft',
        approval_date: sample.approval_date,
        technical_remarks: sample.technical_remarks,
        parameters,
    });

    useEffect(() => {
        form.setData({
            action: 'draft',
            approval_date: sample.approval_date,
            technical_remarks: sample.technical_remarks,
            parameters,
        });
    }, [sample.id]);

    const currentStatus = statusLabels[sample.status] ?? statusLabels.pending;
    const isCompleted = sample.status === 'completed';
    const isDoctor = userRole === 'doctor';

    const submit = (action: 'draft' | 'approve' | 'collect'): void => {
        form.setData('action', action);
        form.put(`/lab/test-reports/result-entry/${sample.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Test Result Entry" />

            <div className="min-h-full bg-slate-50/80 p-0">
                {flash?.success && (
                    <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                        {flash.success}
                    </div>
                )}

                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-semibold text-slate-800">Test Result Entry</h1>
                        <p className="mt-1 text-sm text-slate-500">
                            {sample.test_name} — <span className="font-medium text-[#147da2]">{sample.department}</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Lab Tech: can Save Draft & Mark Collected */}
                        {!isDoctor && !isCompleted && (
                            <>
                                {sample.status === 'pending' && (
                                    <button
                                        type="button"
                                        onClick={() => submit('collect')}
                                        className="rounded-md border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                                    >
                                        Mark Collected
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => submit('draft')}
                                    className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                >
                                    Save Draft
                                </button>
                            </>
                        )}
                        {/* Doctor: can Approve */}
                        {isDoctor && !isCompleted && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => submit('draft')}
                                    className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                >
                                    Save Draft
                                </button>
                                <button
                                    type="button"
                                    onClick={() => submit('approve')}
                                    className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                                >
                                    Approve & Complete
                                </button>
                            </>
                        )}
                        {/* Print Report (only when completed) */}
                        {isCompleted && (
                            <Link
                                href={`/lab/test-reports/result-entry/${sample.id}/print`}
                                className="flex items-center gap-1.5 rounded-md bg-[#147da2] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#106385]"
                            >
                                <Printer className="h-4 w-4" />
                                Print Report
                            </Link>
                        )}
                    </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-[320px_1fr]">
                    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                            <h2 className="text-base font-semibold text-slate-800">Sample Information</h2>
                            <span className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${currentStatus.className}`}>
                                {currentStatus.label}
                            </span>
                        </div>
                        
                        <div className="flex flex-col gap-3 text-[13px]">
                            <div className="grid grid-cols-[90px_1fr] items-start gap-3">
                                <span className="text-slate-500">Patient</span>
                                <div>
                                    <p className="font-semibold text-slate-800">{sample.patient_name}</p>
                                    <p className="mt-0.5 text-[11px] font-medium text-slate-500">{sample.patient_gender} • {sample.patient_age}y • {sample.patient_phone}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-[90px_1fr] items-center gap-3 border-t border-slate-50 pt-3">
                                <span className="text-slate-500">Bill No.</span>
                                <span className="font-medium text-slate-800">{sample.bill_number}</span>
                            </div>

                            <div className="grid grid-cols-[90px_1fr] items-center gap-3 border-t border-slate-50 pt-3">
                                <span className="text-slate-500">Bill Date</span>
                                <span className="font-medium text-slate-800">{sample.bill_date}</span>
                            </div>

                            <div className="grid grid-cols-[90px_1fr] items-center gap-3 border-t border-slate-50 pt-3">
                                <span className="text-slate-500">Test name</span>
                                <span className="font-medium text-[#147da2]">{sample.test_name}</span>
                            </div>

                            <div className="grid grid-cols-[90px_1fr] items-center gap-3 border-t border-slate-50 pt-3">
                                <span className="text-slate-500">Department</span>
                                <span className="font-medium text-slate-800">{sample.department}</span>
                            </div>

                            <div className="grid grid-cols-[90px_1fr] items-center gap-3 border-t border-slate-50 pt-3">
                                <span className="text-slate-500">Sample Type</span>
                                <span className="font-medium text-slate-800">{sample.sample_type || 'None'}</span>
                            </div>

                            <div className="grid grid-cols-[90px_1fr] items-center gap-3 border-t border-slate-50 pt-3">
                                <span className="text-slate-500">Barcode</span>
                                {sample.barcode ? (
                                    <span className="font-mono font-bold tracking-tight text-slate-700">{sample.barcode}</span>
                                ) : (
                                    <span className="text-slate-400">-</span>
                                )}
                            </div>
                        </div>

                        {isCompleted && (
                            <div className="mt-5 flex flex-col gap-1.5 rounded-lg border border-emerald-100 bg-emerald-50/50 p-3.5 text-xs text-emerald-800">
                                <div className="flex items-center gap-1.5 font-semibold text-emerald-700">
                                    <span className="flex h-4 w-4 border border-emerald-300 items-center justify-center rounded-full bg-emerald-200 text-[10px]">✓</span> 
                                    Approved
                                </div>
                                {sample.approved_by_name && (
                                    <div className="mt-1 ml-5 flex items-center justify-between">
                                        <span className="font-medium text-emerald-600/80">Doctor:</span>
                                        <span className="font-semibold">{sample.approved_by_name}</span>
                                    </div>
                                )}
                                <div className="ml-5 flex items-center justify-between">
                                    <span className="font-medium text-emerald-600/80">Date:</span>
                                    <span className="font-medium">{sample.approval_date}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-white p-6">
                        <h2 className="mb-4 border-b border-slate-100 pb-3 text-base font-semibold text-slate-800">Test Parameters & Results</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[760px] text-left">
                                <thead className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    <tr>
                                        <th className="px-2 py-2">Parameter</th>
                                        <th className="px-2 py-2">Result</th>
                                        <th className="px-2 py-2">Unit</th>
                                        <th className="px-2 py-2">Normal Range</th>
                                        <th className="px-2 py-2">Remarks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {form.data.parameters.map((row, index) => {
                                        const rangeStatus = row.value && row.normal_range && row.normal_range !== '-' ? getRangeStatus(row.value, row.normal_range) : 'normal';
                                        
                                        return (
                                        <tr key={row.key} className="border-b border-slate-100 text-sm">
                                            <td className="px-2 py-2 text-slate-700">{row.name}</td>
                                            <td className="px-2 py-2">
                                                <div className="relative">
                                                    <input
                                                        className={`h-9 w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm outline-none transition focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20 disabled:bg-slate-50 disabled:text-slate-500 ${rangeStatus !== 'normal' ? 'font-bold text-red-700 pr-8' : ''}`}
                                                        value={row.value}
                                                        disabled={isCompleted}
                                                        onChange={(event) => {
                                                            const next = [...form.data.parameters];
                                                            next[index] = { ...next[index], value: event.target.value };
                                                            form.setData('parameters', next);
                                                        }}
                                                    />
                                                    {rangeStatus === 'high' && <span className="absolute right-2 top-2 text-xs font-bold text-red-600">(H)</span>}
                                                    {rangeStatus === 'low' && <span className="absolute right-2 top-2 text-xs font-bold text-red-600">(L)</span>}
                                                </div>
                                            </td>
                                            <td className="px-2 py-2">
                                                <input
                                                    className="h-9 w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm outline-none transition focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20 disabled:bg-slate-50 disabled:text-slate-500"
                                                    value={row.unit}
                                                    disabled={isCompleted}
                                                    onChange={(event) => {
                                                        const next = [...form.data.parameters];
                                                        next[index] = { ...next[index], unit: event.target.value };
                                                        form.setData('parameters', next);
                                                    }}
                                                />
                                            </td>
                                            <td className="px-2 py-2">
                                                <input
                                                    className="h-9 w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm outline-none transition focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20 disabled:bg-slate-50 disabled:text-slate-500"
                                                    value={row.normal_range}
                                                    disabled={isCompleted}
                                                    onChange={(event) => {
                                                        const next = [...form.data.parameters];
                                                        next[index] = { ...next[index], normal_range: event.target.value };
                                                        form.setData('parameters', next);
                                                    }}
                                                />
                                            </td>
                                            <td className="px-2 py-2">
                                                <input
                                                    className="h-9 w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm outline-none transition focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20 disabled:bg-slate-50 disabled:text-slate-500"
                                                    value={row.remarks}
                                                    disabled={isCompleted}
                                                    onChange={(event) => {
                                                        const next = [...form.data.parameters];
                                                        next[index] = { ...next[index], remarks: event.target.value };
                                                        form.setData('parameters', next);
                                                    }}
                                                />
                                            </td>
                                        </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-6 grid gap-4 border-t border-slate-100 pt-5 md:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-sm font-semibold text-slate-700">Technician Remarks</label>
                                <textarea
                                    rows={3}
                                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20 disabled:bg-slate-50 disabled:text-slate-500"
                                    value={form.data.technical_remarks}
                                    disabled={isCompleted}
                                    onChange={(event) => form.setData('technical_remarks', event.target.value)}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-semibold text-slate-700">Approval Date</label>
                                <input
                                    type="date"
                                    className="h-9 w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm outline-none transition focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20 disabled:bg-slate-50 disabled:text-slate-500"
                                    value={form.data.approval_date}
                                    disabled={isCompleted || !isDoctor}
                                    onChange={(event) => form.setData('approval_date', event.target.value)}
                                />
                                {!isDoctor && !isCompleted && (
                                    <p className="mt-1 text-xs text-slate-400">Only the approving doctor can set this date</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

/**
 * Parses "X - Y" ranges and checks if value falls outside, returns status.
 */
function getRangeStatus(value: string, normalRange: string): 'high' | 'low' | 'normal' {
    const numVal = parseFloat(value);
    if (isNaN(numVal)) return 'normal';

    const match = normalRange.match(/^([\d.]+)\s*[-–]\s*([\d.]+)$/);
    if (!match) return 'normal';

    const low = parseFloat(match[1]);
    const high = parseFloat(match[2]);
    if (numVal < low) return 'low';
    if (numVal > high) return 'high';
    return 'normal';
}
