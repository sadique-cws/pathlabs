import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type DoctorEdit = {
    id: number;
    name: string;
    phone: string | null;
    email: string | null;
    commission_type: string;
    commission_value: number;
    specialization: string | null;
    consultation_fee: number;
    can_approve_reports: boolean;
    is_active: boolean;
    gift_total: number;
};

type Props = {
    doctor: DoctorEdit;
    routePrefix?: string;
    doctorTitle?: string;
};

export default function EditDoctor({ doctor, routePrefix = 'lab', doctorTitle = 'Lab Doctor' }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: `${doctorTitle}s`, href: `/${routePrefix}/doctors/manage` },
        { title: `Edit ${doctor.name}`, href: `/${routePrefix}/doctors/${doctor.id}/edit` },
    ];

    const form = useForm({
        name: doctor.name,
        phone: doctor.phone ?? '',
        email: doctor.email ?? '',
        specialization: doctor.specialization ?? '',
        consultation_fee: doctor.consultation_fee,
        can_approve_reports: doctor.can_approve_reports,
        commission_type: doctor.commission_type,
        commission_value: doctor.commission_value,
        is_active: doctor.is_active,
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${doctor.name}`} />

            <div className="min-h-full bg-slate-50/80 p-0">
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        form.put(`/${routePrefix}/doctors/${doctor.id}`);
                    }}
                    className=" border border-slate-200 bg-white p-6"
                >
                    <div className="border-b border-slate-100 pb-4">
                        <h1 className="text-lg font-semibold text-slate-800">Edit {doctorTitle}</h1>
                        <p className="mt-1 text-sm text-slate-500">Gift credited to doctor wallet: ₹{doctor.gift_total.toFixed(2)}</p>
                    </div>

                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                        <input className="h-9 w-full  border border-slate-200 px-3 py-1.5 text-sm outline-none transition focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} placeholder="Doctor Name" />
                        <input className="h-9 w-full  border border-slate-200 px-3 py-1.5 text-sm outline-none transition focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20" value={form.data.phone} onChange={(e) => form.setData('phone', e.target.value)} placeholder="Phone" />
                        <input className="h-9 w-full  border border-slate-200 px-3 py-1.5 text-sm outline-none transition focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20 md:col-span-2" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} placeholder="Email" />
                        <input className="h-9 w-full  border border-slate-200 px-3 py-1.5 text-sm outline-none transition focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20" value={form.data.specialization} onChange={(e) => form.setData('specialization', e.target.value)} placeholder="Specialization" />
                        <input type="number" min={0} step="0.01" className="h-9 w-full  border border-slate-200 px-3 py-1.5 text-sm outline-none transition focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20" value={form.data.consultation_fee} onChange={(e) => form.setData('consultation_fee', Number(e.target.value))} placeholder="Consultation Fee" />
                        <select className="h-9 w-full  border border-slate-200 px-3 py-1.5 text-sm outline-none transition focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20" value={form.data.commission_type} onChange={(e) => form.setData('commission_type', e.target.value)}>
                            <option value="percent">Percent</option>
                            <option value="fixed">Fixed</option>
                        </select>
                        <input type="number" min={0} step="0.01" className="h-9 w-full  border border-slate-200 px-3 py-1.5 text-sm outline-none transition focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20" value={form.data.commission_value} onChange={(e) => form.setData('commission_value', Number(e.target.value))} placeholder="Commission Value" />
                        <label className="md:col-span-2 flex items-center gap-2 text-sm text-slate-700">
                            <input type="checkbox" className="h-4 w-4 border-slate-300 text-[#147da2] focus:ring-[#147da2]" checked={form.data.can_approve_reports} onChange={(e) => form.setData('can_approve_reports', e.target.checked)} />
                            Can approve reports
                        </label>
                    </div>

                    <label className="mt-4 flex items-center gap-2 text-sm text-slate-700">
                        <input type="checkbox" className="h-4 w-4 border-slate-300 text-[#147da2] focus:ring-[#147da2]" checked={form.data.is_active} onChange={(e) => form.setData('is_active', e.target.checked)} />
                        Active {doctorTitle}
                    </label>

                    <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
                        <button type="button" onClick={() => history.back()} className=" border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Cancel</button>
                        <button type="submit" className=" bg-[#147da2] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#106385]" disabled={form.processing}>
                            Save {doctorTitle}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
