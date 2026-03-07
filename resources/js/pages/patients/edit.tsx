import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type PatientEdit = {
    id: number;
    title: string;
    name: string;
    phone: string;
    gender: string;
    age_years: number | null;
    age_months: number | null;
    age_days: number | null;
    city: string | null;
    address: string | null;
    state: string | null;
    pin_code: string | null;
    landmark: string | null;
    weight_kg: string | null;
    height_cm: string | null;
    uhid: string | null;
    id_type: string | null;
};

type Props = {
    patient: PatientEdit;
};

export default function EditPatient({ patient }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Manage Patients', href: '/lab/patients/manage' },
        { title: `Edit #${patient.id}`, href: `/lab/patients/${patient.id}/edit` },
    ];

    const form = useForm({
        title: patient.title ?? 'Mr.',
        name: patient.name,
        phone: patient.phone,
        gender: patient.gender ?? 'male',
        age_years: patient.age_years ?? 0,
        age_months: patient.age_months ?? 0,
        age_days: patient.age_days ?? 0,
        city: patient.city ?? '',
        address: patient.address ?? '',
        state: patient.state ?? '',
        pin_code: patient.pin_code ?? '',
        landmark: patient.landmark ?? '',
        weight_kg: patient.weight_kg ?? '',
        height_cm: patient.height_cm ?? '',
        uhid: patient.uhid ?? '',
        id_type: patient.id_type ?? '',
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Patient" />

            <div className="min-h-full bg-[#f4f7fb] p-4 md:p-6">
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        form.put(`/lab/patients/${patient.id}`);
                    }}
                    className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                    <h1 className="text-2xl font-semibold text-slate-800">Edit Patient Details</h1>

                    <div className="grid gap-3 md:grid-cols-4">
                        <select className="rounded-lg border border-slate-200 px-3 py-2" value={form.data.title} onChange={(e) => form.setData('title', e.target.value)}>
                            <option value="Mr.">Mr.</option>
                            <option value="Mrs.">Mrs.</option>
                            <option value="Ms.">Ms.</option>
                            <option value="Dr.">Dr.</option>
                        </select>
                        <input className="rounded-lg border border-slate-200 px-3 py-2 md:col-span-3" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} placeholder="Name" />
                        <input className="rounded-lg border border-slate-200 px-3 py-2" value={form.data.phone} onChange={(e) => form.setData('phone', e.target.value)} placeholder="Phone" />
                        <select className="rounded-lg border border-slate-200 px-3 py-2" value={form.data.gender} onChange={(e) => form.setData('gender', e.target.value)}>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                        <input type="number" className="rounded-lg border border-slate-200 px-3 py-2" value={form.data.age_years} onChange={(e) => form.setData('age_years', Number(e.target.value))} placeholder="Age Years" />
                        <input className="rounded-lg border border-slate-200 px-3 py-2" value={form.data.city} onChange={(e) => form.setData('city', e.target.value)} placeholder="City" />
                        <input className="rounded-lg border border-slate-200 px-3 py-2 md:col-span-2" value={form.data.address} onChange={(e) => form.setData('address', e.target.value)} placeholder="Address" />
                        <input className="rounded-lg border border-slate-200 px-3 py-2" value={form.data.state} onChange={(e) => form.setData('state', e.target.value)} placeholder="State" />
                        <input className="rounded-lg border border-slate-200 px-3 py-2" value={form.data.pin_code} onChange={(e) => form.setData('pin_code', e.target.value)} placeholder="Pin Code" />
                    </div>

                    <div className="flex justify-end gap-2">
                        <button type="submit" className="rounded-lg bg-[#0f87af] px-4 py-2 text-sm font-semibold text-white" disabled={form.processing}>
                            Save Patient
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
