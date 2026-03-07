import { Head, Link } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type DoctorRow = {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    gift_total: number;
    status: string;
    created_date: string | null;
};

type Props = {
    doctors: DoctorRow[];
    stats: {
        total: number;
        accepted: number;
        with_gifts: number;
    };
};

export default function ManageDoctors({ doctors, stats }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Doctor List', href: '/lab/doctors/manage' },
    ];
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (query === '') {
            return doctors;
        }

        return doctors.filter((doctor) => (
            `${doctor.name} ${doctor.email ?? ''} ${doctor.phone ?? ''}`.toLowerCase().includes(query)
        ));
    }, [doctors, search]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Lab Doctors List" />

            <div className="min-h-full bg-slate-50/80 p-0">
                <div className="mb-4">
                    <h1 className="text-xl font-semibold text-slate-800">Lab Doctors List</h1>
                    <p className="mt-1 text-sm text-slate-500">View and manage doctors registered in your lab</p>
                </div>

                <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4">
                    <label className="relative block">
                        <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search doctors by name, email, or phone..." className="h-9 w-full rounded-md border border-slate-200 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20" />
                    </label>
                </div>

                <div className="mb-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-lg border border-slate-200 bg-white p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Total Doctors</p>
                        <p className="mt-1 text-2xl font-semibold text-slate-800">{stats.total}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Accepted</p>
                        <p className="mt-1 text-2xl font-semibold text-slate-800">{stats.accepted}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">With Gifts</p>
                        <p className="mt-1 text-2xl font-semibold text-slate-800">{stats.with_gifts}</p>
                    </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[980px] text-left">
                            <thead className="border-b border-slate-200 bg-slate-50/70 text-sm font-semibold text-slate-700">
                                <tr>
                                    <th className="px-3 py-3">Username</th>
                                    <th className="px-3 py-3">Email</th>
                                    <th className="px-3 py-3">Phone</th>
                                    <th className="px-3 py-3">Gift</th>
                                    <th className="px-3 py-3">Status</th>
                                    <th className="px-3 py-3">Created Date</th>
                                    <th className="px-3 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((doctor) => (
                                    <tr key={doctor.id} className="border-b border-slate-100 text-sm text-slate-700">
                                        <td className="px-3 py-3 font-medium text-slate-800">{doctor.name}</td>
                                        <td className="px-3 py-3">{doctor.email ?? '-'}</td>
                                        <td className="px-3 py-3">{doctor.phone ?? '-'}</td>
                                        <td className="px-3 py-3">{doctor.gift_total > 0 ? `₹${doctor.gift_total.toFixed(2)}` : 'Not Assigned'}</td>
                                        <td className="px-3 py-3">
                                            <span className={`rounded-full px-2 py-1 text-xs font-semibold ${doctor.status === 'Accepted' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                                {doctor.status}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3">{doctor.created_date ?? '-'}</td>
                                        <td className="px-3 py-3">
                                            <Link href={`/lab/doctors/${doctor.id}/edit`} className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200">
                                                Edit
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-3 py-8 text-center text-sm text-slate-500">
                                            No doctors found.
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
