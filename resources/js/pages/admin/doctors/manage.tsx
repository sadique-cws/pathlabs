import { Head, Link } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import AppLayout from '@/layouts/app-layout';

type DoctorRow = {
    id: number;
    lab_name: string;
    name: string;
    phone: string | null;
    email: string | null;
    doctor_type: string;
    specialization: string | null;
    consultation_fee: number;
    can_approve_reports: boolean;
    is_active: boolean;
    created_date: string | null;
};

type Props = {
    doctors: DoctorRow[];
};

export default function AdminManageDoctors({ doctors }: Props) {
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (query === '') {
            return doctors;
        }

        return doctors.filter((doctor) => (`${doctor.lab_name} ${doctor.name} ${doctor.specialization ?? ''} ${doctor.email ?? ''} ${doctor.phone ?? ''}`).toLowerCase().includes(query));
    }, [doctors, search]);

    return (
        <AppLayout>
            <Head title="Admin Doctors" />

            <div className="min-h-full bg-slate-50/80 p-0">
                <div className="border-b border-slate-200 bg-white p-4">
                    <h1 className="text-xl font-semibold text-slate-900">Manage Doctors (All Labs)</h1>
                    <p className="mt-1 text-sm text-slate-600">Admin can manage both lab doctors and specialist doctors.</p>

                    <label className="relative mt-3 block max-w-lg">
                        <Search className="pointer-events-none absolute left-3 top-[11px] h-4 w-4 text-slate-400" />
                        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by lab, doctor, specialization..." className="h-10 w-full border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none" />
                    </label>
                </div>

                <div className="border border-t-0 border-slate-200 bg-white overflow-x-auto">
                    <table className="w-full min-w-[1100px] text-left">
                        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                            <tr>
                                <th className="px-3 py-2">Lab</th>
                                <th className="px-3 py-2">Doctor</th>
                                <th className="px-3 py-2">Type</th>
                                <th className="px-3 py-2">Specialization</th>
                                <th className="px-3 py-2">Fee</th>
                                <th className="px-3 py-2">Approver</th>
                                <th className="px-3 py-2">Status</th>
                                <th className="px-3 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((doctor) => (
                                <tr key={doctor.id} className="border-b border-slate-100 text-sm text-slate-700">
                                    <td className="px-3 py-2">{doctor.lab_name}</td>
                                    <td className="px-3 py-2">
                                        <p className="font-medium text-slate-900">{doctor.name}</p>
                                        <p className="text-xs text-slate-500">{doctor.phone ?? '-'} • {doctor.email ?? '-'}</p>
                                    </td>
                                    <td className="px-3 py-2">{doctor.doctor_type}</td>
                                    <td className="px-3 py-2">{doctor.specialization ?? '-'}</td>
                                    <td className="px-3 py-2">₹{doctor.consultation_fee.toFixed(2)}</td>
                                    <td className="px-3 py-2">{doctor.can_approve_reports ? 'Yes' : 'No'}</td>
                                    <td className="px-3 py-2">{doctor.is_active ? 'Active' : 'Inactive'}</td>
                                    <td className="px-3 py-2">
                                        <Link href={`/admin/doctors/${doctor.id}/edit`} className="inline-flex border border-slate-200 px-2 py-1 text-xs font-medium text-slate-700">Edit</Link>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-3 py-8 text-center text-sm text-slate-500">No doctors found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
