import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type BillEditData = {
    id: number;
    bill_number: string;
    billing_at: string | null;
    sample_collected_from: string | null;
    insurance_details: string | null;
    offer: string | null;
    doctor_discount_amount: number;
    doctor_discount_type: string;
    center_discount_amount: number;
    center_discount_type: string;
    payment_amount: number;
    previous_reports: string | null;
    agent_referrer: string | null;
    notes: string | null;
    urgent: boolean;
    soft_copy_only: boolean;
    send_message: boolean;
    patient: {
        name: string;
        phone: string;
        gender: string;
        age_years: number | null;
        city: string | null;
        address: string | null;
        state: string | null;
        pin_code: string | null;
    };
};

type Props = {
    bill: BillEditData;
};

export default function EditBill({ bill }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Manage Patient Bills', href: '/lab/billing/manage' },
        { title: `Edit ${bill.bill_number}`, href: `/lab/billing/${bill.id}/edit` },
    ];

    const form = useForm({
        billing_at: bill.billing_at ?? '',
        sample_collected_from: bill.sample_collected_from ?? '',
        insurance_details: bill.insurance_details ?? '',
        offer: bill.offer ?? 'No Offer',
        doctor_discount_amount: bill.doctor_discount_amount,
        doctor_discount_type: bill.doctor_discount_type ?? 'fixed',
        center_discount_amount: bill.center_discount_amount,
        center_discount_type: bill.center_discount_type ?? 'fixed',
        payment_amount: bill.payment_amount,
        previous_reports: bill.previous_reports ?? '',
        agent_referrer: bill.agent_referrer ?? '',
        notes: bill.notes ?? '',
        urgent: bill.urgent,
        soft_copy_only: bill.soft_copy_only,
        send_message: bill.send_message,
        patient: {
            name: bill.patient.name,
            phone: bill.patient.phone,
            gender: bill.patient.gender,
            age_years: bill.patient.age_years ?? 0,
            city: bill.patient.city ?? '',
            address: bill.patient.address ?? '',
            state: bill.patient.state ?? '',
            pin_code: bill.patient.pin_code ?? '',
        },
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${bill.bill_number}`} />

            <div className="min-h-full bg-[#f4f7fb] p-4 md:p-6">
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        form.put(`/lab/billing/${bill.id}`);
                    }}
                    className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                    <h1 className="text-2xl font-semibold text-slate-800">Edit Bill & Patient Details</h1>

                    <div className="grid gap-4 lg:grid-cols-2">
                        <div className="space-y-3 rounded-lg border border-slate-200 p-4">
                            <h2 className="text-lg font-semibold text-slate-700">Patient</h2>
                            <input className="w-full rounded-lg border border-slate-200 px-3 py-2" value={form.data.patient.name} onChange={(e) => form.setData('patient', { ...form.data.patient, name: e.target.value })} placeholder="Patient Name" />
                            <input className="w-full rounded-lg border border-slate-200 px-3 py-2" value={form.data.patient.phone} onChange={(e) => form.setData('patient', { ...form.data.patient, phone: e.target.value })} placeholder="Phone" />
                            <div className="grid grid-cols-2 gap-2">
                                <select className="rounded-lg border border-slate-200 px-3 py-2" value={form.data.patient.gender} onChange={(e) => form.setData('patient', { ...form.data.patient, gender: e.target.value })}>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                                <input type="number" className="rounded-lg border border-slate-200 px-3 py-2" value={form.data.patient.age_years} onChange={(e) => form.setData('patient', { ...form.data.patient, age_years: Number(e.target.value) })} placeholder="Age Years" />
                                <input className="rounded-lg border border-slate-200 px-3 py-2" value={form.data.patient.city} onChange={(e) => form.setData('patient', { ...form.data.patient, city: e.target.value })} placeholder="City" />
                                <input className="rounded-lg border border-slate-200 px-3 py-2" value={form.data.patient.state} onChange={(e) => form.setData('patient', { ...form.data.patient, state: e.target.value })} placeholder="State" />
                            </div>
                            <input className="w-full rounded-lg border border-slate-200 px-3 py-2" value={form.data.patient.address} onChange={(e) => form.setData('patient', { ...form.data.patient, address: e.target.value })} placeholder="Address" />
                            <input className="w-full rounded-lg border border-slate-200 px-3 py-2" value={form.data.patient.pin_code} onChange={(e) => form.setData('patient', { ...form.data.patient, pin_code: e.target.value })} placeholder="Pin Code" />
                        </div>

                        <div className="space-y-3 rounded-lg border border-slate-200 p-4">
                            <h2 className="text-lg font-semibold text-slate-700">Bill</h2>
                            <input type="datetime-local" className="w-full rounded-lg border border-slate-200 px-3 py-2" value={form.data.billing_at} onChange={(e) => form.setData('billing_at', e.target.value)} />
                            <input className="w-full rounded-lg border border-slate-200 px-3 py-2" value={form.data.sample_collected_from} onChange={(e) => form.setData('sample_collected_from', e.target.value)} placeholder="Sample Collected From" />
                            <input className="w-full rounded-lg border border-slate-200 px-3 py-2" value={form.data.insurance_details} onChange={(e) => form.setData('insurance_details', e.target.value)} placeholder="Insurance Details" />
                            <div className="grid grid-cols-2 gap-2">
                                <input type="number" step="0.01" className="rounded-lg border border-slate-200 px-3 py-2" value={form.data.doctor_discount_amount} onChange={(e) => form.setData('doctor_discount_amount', Number(e.target.value))} placeholder="Doctor Discount" />
                                <input type="number" step="0.01" className="rounded-lg border border-slate-200 px-3 py-2" value={form.data.center_discount_amount} onChange={(e) => form.setData('center_discount_amount', Number(e.target.value))} placeholder="Center Discount" />
                                <input type="number" step="0.01" className="rounded-lg border border-slate-200 px-3 py-2" value={form.data.payment_amount} onChange={(e) => form.setData('payment_amount', Number(e.target.value))} placeholder="Payment Amount" />
                                <input className="rounded-lg border border-slate-200 px-3 py-2" value={form.data.offer} onChange={(e) => form.setData('offer', e.target.value)} placeholder="Offer" />
                            </div>
                            <textarea className="h-24 w-full rounded-lg border border-slate-200 px-3 py-2" value={form.data.notes} onChange={(e) => form.setData('notes', e.target.value)} placeholder="Notes" />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button type="submit" className="rounded-lg bg-[#0f87af] px-4 py-2 text-sm font-semibold text-white" disabled={form.processing}>
                            Save Bill
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
