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
        { title: 'Referral Doctor List', href: '/lab/doctors/manage' },
        { title: 'Add Referral Doctor', href: '/lab/doctors/add' },
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
            <Head title="Add Referral Doctor" />

            <div className="min-h-full bg-slate-50/80 p-0">
                <div className="sawtooth border-b border-slate-200 bg-white p-6">
                    <h1 className="border-b border-slate-100 pb-3 text-lg font-semibold text-slate-800">Add Referral Doctor</h1>
                    <p className="mt-3 text-sm text-slate-500">First search by name and mobile. If referral doctor not found, then create new.</p>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <label className="relative">
                            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <input value={searchName} onChange={(e) => setSearchName(e.target.value)} className="h-9 w-full  border border-slate-200 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20" placeholder="Search by name..." />
                        </label>
                        <label className="relative">
                            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <input value={searchPhone} onChange={(e) => setSearchPhone(e.target.value)} className="h-9 w-full  border border-slate-200 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20" placeholder="Search by mobile..." />
                        </label>
                    </div>

                    {matchedDoctors.length > 0 && (
                        <div className="mt-3  border border-slate-200">
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
                        <div className="mt-3  border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                            Referral doctor already exists. <Link href={`/lab/doctors/${selectedDoctorId}/edit`} className="font-semibold underline">Open edit referral doctor</Link>
                        </div>
                    )}

                    <form
                        className="mt-6 grid gap-4 border-t border-slate-100 pt-5 md:grid-cols-2"
                        onSubmit={(event) => {
                            event.preventDefault();
                            form.post('/lab/doctors');
                        }}
                    >
                        <input className="h-9 w-full  border border-slate-200 px-3 py-1.5 text-sm outline-none transition focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20" placeholder="Doctor Name" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />
                        <input className="h-9 w-full  border border-slate-200 px-3 py-1.5 text-sm outline-none transition focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20" placeholder="Phone" value={form.data.phone} onChange={(e) => form.setData('phone', e.target.value)} />
                        <input className="h-9 w-full  border border-slate-200 px-3 py-1.5 text-sm outline-none transition focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20 md:col-span-2" placeholder="Email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} />
                        <select className="h-9 w-full  border border-slate-200 px-3 py-1.5 text-sm outline-none transition focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20" value={form.data.commission_type} onChange={(e) => form.setData('commission_type', e.target.value)}>
                            <option value="percent">Percent</option>
                            <option value="fixed">Fixed</option>
                        </select>
                        <input type="number" min={0} step="0.01" className="h-9 w-full  border border-slate-200 px-3 py-1.5 text-sm outline-none transition focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20" placeholder="Commission Value" value={form.data.commission_value} onChange={(e) => form.setData('commission_value', Number(e.target.value))} />

                        <div className="md:col-span-2 flex justify-end gap-3 border-t border-slate-100 pt-5">
                            <button type="button" onClick={() => history.back()} className=" border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Cancel</button>
                            <button type="submit" className=" bg-[#147da2] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#106385]">
                                Create Referral Doctor
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
