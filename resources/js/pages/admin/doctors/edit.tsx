import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

type DoctorPayload = {
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
    commission_type: string;
    commission_value: number;
};

type Props = {
    doctor: DoctorPayload;
};

export default function AdminEditDoctor({ doctor }: Props) {
    const form = useForm({
        name: doctor.name,
        phone: doctor.phone ?? '',
        email: doctor.email ?? '',
        doctor_type: doctor.doctor_type,
        specialization: doctor.specialization ?? '',
        consultation_fee: doctor.consultation_fee,
        can_approve_reports: doctor.can_approve_reports,
        is_active: doctor.is_active,
        commission_type: doctor.commission_type,
        commission_value: doctor.commission_value,
    });

    return (
        <AppLayout>
            <Head title={`Edit ${doctor.name}`} />

            <div className="min-h-full bg-slate-50/80 p-0">
                <form onSubmit={(event) => { event.preventDefault(); form.put(`/admin/doctors/${doctor.id}`); }} className="border border-slate-200 bg-white p-6">
                    <h1 className="text-xl font-semibold text-slate-900">Edit Doctor</h1>
                    <p className="mt-1 text-sm text-slate-600">Lab: {doctor.lab_name}</p>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <input className="h-10 border border-slate-200 px-3 text-sm" value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} placeholder="Name" />
                        <input className="h-10 border border-slate-200 px-3 text-sm" value={form.data.phone} onChange={(event) => form.setData('phone', event.target.value)} placeholder="Phone" />
                        <input className="h-10 border border-slate-200 px-3 text-sm md:col-span-2" value={form.data.email} onChange={(event) => form.setData('email', event.target.value)} placeholder="Email" />
                        <select className="h-10 border border-slate-200 px-3 text-sm" value={form.data.doctor_type} onChange={(event) => form.setData('doctor_type', event.target.value)}>
                            <option value="lab_doctor">Lab Doctor</option>
                            <option value="specialist">Specialist</option>
                        </select>
                        <input className="h-10 border border-slate-200 px-3 text-sm" value={form.data.specialization} onChange={(event) => form.setData('specialization', event.target.value)} placeholder="Specialization" />
                        <input type="number" min={0} step="0.01" className="h-10 border border-slate-200 px-3 text-sm" value={form.data.consultation_fee} onChange={(event) => form.setData('consultation_fee', Number(event.target.value))} placeholder="Consultation Fee" />
                        <select className="h-10 border border-slate-200 px-3 text-sm" value={form.data.commission_type} onChange={(event) => form.setData('commission_type', event.target.value)}>
                            <option value="percent">Percent</option>
                            <option value="fixed">Fixed</option>
                        </select>
                        <input type="number" min={0} step="0.01" className="h-10 border border-slate-200 px-3 text-sm" value={form.data.commission_value} onChange={(event) => form.setData('commission_value', Number(event.target.value))} placeholder="Commission Value" />
                        <label className="flex items-center gap-2 text-sm text-slate-700">
                            <input type="checkbox" checked={form.data.can_approve_reports} onChange={(event) => form.setData('can_approve_reports', event.target.checked)} /> Can approve reports
                        </label>
                        <label className="flex items-center gap-2 text-sm text-slate-700">
                            <input type="checkbox" checked={form.data.is_active} onChange={(event) => form.setData('is_active', event.target.checked)} /> Active doctor
                        </label>
                    </div>

                    <div className="mt-5 flex justify-end gap-2 border-t border-slate-200 pt-4">
                        <button type="button" onClick={() => history.back()} className="border border-slate-200 px-4 py-2 text-sm text-slate-700">Back</button>
                        <button type="submit" className="border border-[#147da2] bg-[#147da2] px-4 py-2 text-sm font-medium text-white" disabled={form.processing}>Save</button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
