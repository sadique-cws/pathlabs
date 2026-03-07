import { Head, useForm, usePage } from '@inertiajs/react';
import { useMemo } from 'react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type SampleInfo = {
    id: number;
    barcode: string;
    bill_number: string;
    test_name: string;
    category: string;
    sample_type: string;
    patient_name: string;
    bill_date: string;
    status: string;
    technical_remarks: string;
    approval_date: string;
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
};

export default function ResultEntryForm({ sample, parameters }: Props) {
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

    const statusClass = useMemo(() => {
        if (sample.status === 'Completed') {
            return 'bg-emerald-100 text-emerald-700';
        }

        if (sample.status === 'In_progress' || sample.status === 'In Progress') {
            return 'bg-sky-100 text-sky-700';
        }

        return 'bg-amber-100 text-amber-700';
    }, [sample.status]);

    const submit = (action: 'draft' | 'approve'): void => {
        form.setData('action', action);
        form.put(`/lab/test-reports/result-entry/${sample.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Test Result Entry" />

            <div className="min-h-full bg-[#f4f7fb] p-4 md:p-6">
                {flash?.success && (
                    <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                        {flash.success}
                    </div>
                )}

                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-3xl font-semibold text-slate-800">Test Result Entry</h1>
                        <p className="text-slate-500">Parameter-based result entry</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button type="button" onClick={() => submit('draft')} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
                            Save Draft
                        </button>
                        <button type="button" onClick={() => submit('approve')} className="rounded-lg bg-[#0f87af] px-4 py-2 text-sm font-semibold text-white">
                            Approve & Complete
                        </button>
                    </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-[320px_1fr]">
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                        <h2 className="mb-4 text-lg font-semibold text-slate-800">Sample Information</h2>
                        <div className="space-y-2 text-sm text-slate-700">
                            <p><span className="font-medium text-slate-500">Bill Number:</span> {sample.bill_number}</p>
                            <p><span className="font-medium text-slate-500">Test Name:</span> {sample.test_name}</p>
                            <p><span className="font-medium text-slate-500">Category:</span> {sample.category}</p>
                            <p><span className="font-medium text-slate-500">Patient:</span> {sample.patient_name}</p>
                            <p><span className="font-medium text-slate-500">Barcode:</span> {sample.barcode}</p>
                            <p><span className="font-medium text-slate-500">Bill Date:</span> {sample.bill_date}</p>
                            <p><span className="font-medium text-slate-500">Sample Type:</span> {sample.sample_type}</p>
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${statusClass}`}>
                                {sample.status}
                            </span>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                        <h2 className="mb-4 text-lg font-semibold text-slate-800">Test Parameters & Results</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[760px] text-left">
                                <thead className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    <tr>
                                        <th className="px-2 py-2">Parameter</th>
                                        <th className="px-2 py-2">Result</th>
                                        <th className="px-2 py-2">Unit</th>
                                        <th className="px-2 py-2">Normal Range</th>
                                        <th className="px-2 py-2">Remarks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {form.data.parameters.map((row, index) => (
                                        <tr key={row.key} className="border-b border-slate-100 text-sm">
                                            <td className="px-2 py-2 text-slate-700">{row.name}</td>
                                            <td className="px-2 py-2">
                                                <input
                                                    className="w-full rounded border border-slate-200 px-2 py-1.5"
                                                    value={row.value}
                                                    onChange={(event) => {
                                                        const next = [...form.data.parameters];
                                                        next[index] = { ...next[index], value: event.target.value };
                                                        form.setData('parameters', next);
                                                    }}
                                                />
                                            </td>
                                            <td className="px-2 py-2 text-slate-600">{row.unit}</td>
                                            <td className="px-2 py-2 text-slate-600">{row.normal_range}</td>
                                            <td className="px-2 py-2">
                                                <input
                                                    className="w-full rounded border border-slate-200 px-2 py-1.5"
                                                    value={row.remarks}
                                                    onChange={(event) => {
                                                        const next = [...form.data.parameters];
                                                        next[index] = { ...next[index], remarks: event.target.value };
                                                        form.setData('parameters', next);
                                                    }}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 space-y-3">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">Technician Remarks</label>
                                <textarea
                                    rows={3}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                    value={form.data.technical_remarks}
                                    onChange={(event) => form.setData('technical_remarks', event.target.value)}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">Approval Date</label>
                                <input
                                    type="date"
                                    className="w-full max-w-[220px] rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                    value={form.data.approval_date}
                                    onChange={(event) => form.setData('approval_date', event.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
