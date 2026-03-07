import { Head, Link, useForm } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type ExistingDoctor = {
    id: number;
    name: string;
    phone: string | null;
    email: string | null;
};

type Props = {
    existingDoctors: ExistingDoctor[];
};

export default function AddDoctor({ existingDoctors }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Doctor List', href: '/lab/doctors/manage' },
        { title: 'Add Doctor', href: '/lab/doctors/add' },
    ];

    const [searchName, setSearchName] = useState('');
    const [searchPhone, setSearchPhone] = useState('');
    const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);

    const form = useForm({
        name: '',
        phone: '',
        email: '',
        commission_type: 'percent',
        commission_value: 0,
        is_active: true,
    });

    const matchedDoctors = useMemo(() => {
        const nameQuery = searchName.trim().toLowerCase();
        const phoneQuery = searchPhone.trim().toLowerCase();

        if (nameQuery === '' && phoneQuery === '') {
            return [];
        }

        return existingDoctors
            .filter((doctor) => {
                const doctorName = doctor.name.toLowerCase();
                const doctorPhone = (doctor.phone ?? '').toLowerCase();

                return doctorName.includes(nameQuery) && doctorPhone.includes(phoneQuery);
            })
            .slice(0, 8);
    }, [existingDoctors, searchName, searchPhone]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add Doctor" />

            <div className="min-h-full bg-[#f4f7fb] p-4 md:p-6">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h1 className="text-3xl font-semibold text-slate-800">Add Doctor</h1>
                    <p className="mt-1 text-slate-600">First search by name and mobile. If doctor not found, then create new.</p>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <label className="relative">
                            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <input value={searchName} onChange={(e) => setSearchName(e.target.value)} className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3" placeholder="Search by name..." />
                        </label>
                        <label className="relative">
                            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <input value={searchPhone} onChange={(e) => setSearchPhone(e.target.value)} className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3" placeholder="Search by mobile..." />
                        </label>
                    </div>

                    {matchedDoctors.length > 0 && (
                        <div className="mt-3 rounded-lg border border-slate-200">
                            {matchedDoctors.map((doctor) => (
                                <button
                                    key={doctor.id}
                                    type="button"
                                    onClick={() => setSelectedDoctorId(doctor.id)}
                                    className="flex w-full items-center justify-between border-b border-slate-100 px-3 py-2 text-left text-sm last:border-b-0 hover:bg-slate-50"
                                >
                                    <span>{doctor.name}</span>
                                    <span className="text-slate-500">{doctor.phone ?? '-'}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {selectedDoctorId !== null && (
                        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                            Doctor already exists. <Link href={`/lab/doctors/${selectedDoctorId}/edit`} className="font-semibold underline">Open edit doctor</Link>
                        </div>
                    )}

                    <form
                        className="mt-5 grid gap-3 md:grid-cols-2"
                        onSubmit={(event) => {
                            event.preventDefault();
                            form.post('/lab/doctors');
                        }}
                    >
                        <input className="rounded-lg border border-slate-200 px-3 py-2" placeholder="Doctor Name" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />
                        <input className="rounded-lg border border-slate-200 px-3 py-2" placeholder="Phone" value={form.data.phone} onChange={(e) => form.setData('phone', e.target.value)} />
                        <input className="rounded-lg border border-slate-200 px-3 py-2 md:col-span-2" placeholder="Email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} />
                        <select className="rounded-lg border border-slate-200 px-3 py-2" value={form.data.commission_type} onChange={(e) => form.setData('commission_type', e.target.value)}>
                            <option value="percent">Percent</option>
                            <option value="fixed">Fixed</option>
                        </select>
                        <input type="number" min={0} step="0.01" className="rounded-lg border border-slate-200 px-3 py-2" placeholder="Commission Value" value={form.data.commission_value} onChange={(e) => form.setData('commission_value', Number(e.target.value))} />

                        <div className="md:col-span-2 flex justify-end">
                            <button type="submit" className="rounded-lg bg-[#0f87af] px-4 py-2 text-sm font-semibold text-white">
                                Create Doctor
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
