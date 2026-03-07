import { Head } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type SampleRow = {
    id: number;
    sample_code: string;
    bill_number: string;
    patient_name: string;
    test_name: string;
    sample_type: string;
    bill_date: string;
    status: string;
};

type Props = {
    samples: SampleRow[];
};

export default function SampleManagement({ samples }: Props) {
    const [search, setSearch] = useState('');
    const rows = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (query === '') {
            return samples;
        }

        return samples.filter((sample) => (
            `${sample.sample_code} ${sample.bill_number} ${sample.patient_name} ${sample.test_name}`.toLowerCase().includes(query)
        ));
    }, [samples, search]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Test Reports', href: '/lab/test-reports/sample-management' },
        { title: 'Sample Management', href: '/lab/test-reports/sample-management' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sample Management" />

            <div className="min-h-full bg-[#f4f7fb] p-4 md:p-6">
                <div className="mb-4">
                    <h1 className="text-3xl font-semibold text-slate-800">Sample Management</h1>
                    <p className="text-slate-500">Track and manage all test samples</p>
                </div>

                <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4">
                    <label className="relative block">
                        <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <input className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm" placeholder="Search by sample code, bill, patient, test..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    </label>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <table className="w-full min-w-[900px] text-left">
                        <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            <tr>
                                <th className="px-4 py-3">Sample Code</th>
                                <th className="px-4 py-3">Bill Number</th>
                                <th className="px-4 py-3">Patient Name</th>
                                <th className="px-4 py-3">Test Name</th>
                                <th className="px-4 py-3">Sample Type</th>
                                <th className="px-4 py-3">Bill Date</th>
                                <th className="px-4 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => (
                                <tr key={row.id} className="border-b border-slate-100 text-sm text-slate-700">
                                    <td className="px-4 py-3">{row.sample_code}</td>
                                    <td className="px-4 py-3">{row.bill_number}</td>
                                    <td className="px-4 py-3">{row.patient_name}</td>
                                    <td className="px-4 py-3">{row.test_name}</td>
                                    <td className="px-4 py-3">{row.sample_type}</td>
                                    <td className="px-4 py-3">{row.bill_date}</td>
                                    <td className="px-4 py-3">{row.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
