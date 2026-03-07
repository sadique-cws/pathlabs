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

            <div className="min-h-full bg-slate-50/80 p-0">
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        form.put(`/lab/billing/${bill.id}`);
                    }}
                    className="rounded-lg border border-slate-200 bg-white p-6"
                >
                    <h1 className="border-b border-slate-100 pb-4 text-lg font-semibold text-slate-800">Edit Bill & Patient Details</h1>

                    <div className="mt-5 grid gap-5 lg:grid-cols-2">
                        <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-5">
                            <h2 className="mb-4 text-base font-semibold text-slate-800">Patient</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-700">Patient Name</label>
                                    <input className="h-9 w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm outline-none transition focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20" value={form.data.patient.name} onChange={(e) => form.setData('patient', { ...form.data.patient, name: e.target.value })} placeholder="Patient Name" />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-700">Phone Number</label>
                                    <input className="h-9 w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm outline-none transition focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20" value={form.data.patient.phone} onChange={(e) => form.setData('patient', { ...form.data.patient, phone: e.target.value })} placeholder="Phone" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-slate-700">Gender</label>
                                        <select className="h-9 w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm outline-none transition focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20" value={form.data.patient.gender} onChange={(e) => form.setData('patient', { ...form.data.patient, gender: e.target.value })}>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-slate-700">Age</label>
                                        <input type="number" className="h-9 w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm outline-none transition focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20" value={form.data.patient.age_years} onChange={(e) => form.setData('patient', { ...form.data.patient, age_years: Number(e.target.value) })} placeholder="Age Years" />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-slate-700">City</label>
                                        <input className="h-9 w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm outline-none transition focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20" value={form.data.patient.city} onChange={(e) => form.setData('patient', { ...form.data.patient, city: e.target.value })} placeholder="City" />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-slate-700">State</label>
                                        <input className="h-9 w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm outline-none transition focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20" value={form.data.patient.state} onChange={(e) => form.setData('patient', { ...form.data.patient, state: e.target.value })} placeholder="State" />
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-700">Address</label>
                                    <input className="h-9 w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm outline-none transition focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20" value={form.data.patient.address} onChange={(e) => form.setData('patient', { ...form.data.patient, address: e.target.value })} placeholder="Address" />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-700">PIN Code</label>
                                    <input className="h-9 w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm outline-none transition focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20" value={form.data.patient.pin_code} onChange={(e) => form.setData('patient', { ...form.data.patient, pin_code: e.target.value })} placeholder="Pin Code" />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-5">
                            <h2 className="mb-4 text-base font-semibold text-slate-800">Bill Details</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-700">Billing Date & Time</label>
                                    <input type="datetime-local" className="h-9 w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm outline-none transition focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20" value={form.data.billing_at} onChange={(e) => form.setData('billing_at', e.target.value)} />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-700">Sample Collected From</label>
                                    <input className="h-9 w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm outline-none transition focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20" value={form.data.sample_collected_from} onChange={(e) => form.setData('sample_collected_from', e.target.value)} placeholder="Sample Collected From" />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-700">Insurance Details</label>
                                    <input className="h-9 w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm outline-none transition focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20" value={form.data.insurance_details} onChange={(e) => form.setData('insurance_details', e.target.value)} placeholder="Insurance Details" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-slate-700">Doctor Discount</label>
                                        <input type="number" step="0.01" className="h-9 w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm outline-none transition focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20" value={form.data.doctor_discount_amount} onChange={(e) => form.setData('doctor_discount_amount', Number(e.target.value))} placeholder="0.00" />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-slate-700">Center Discount</label>
                                        <input type="number" step="0.01" className="h-9 w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm outline-none transition focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20" value={form.data.center_discount_amount} onChange={(e) => form.setData('center_discount_amount', Number(e.target.value))} placeholder="0.00" />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-slate-700">Payment Amount</label>
                                        <input type="number" step="0.01" className="h-9 w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm outline-none transition focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20" value={form.data.payment_amount} onChange={(e) => form.setData('payment_amount', Number(e.target.value))} placeholder="0.00" />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-slate-700">Offer Package</label>
                                        <input className="h-9 w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm outline-none transition focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20" value={form.data.offer} onChange={(e) => form.setData('offer', e.target.value)} placeholder="Offer" />
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-700">Notes & Remarks</label>
                                    <textarea className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20" rows={3} value={form.data.notes} onChange={(e) => form.setData('notes', e.target.value)} placeholder="Type notes here..." />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
                        <button type="button" onClick={() => history.back()} className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Cancel</button>
                        <button type="submit" className="rounded-md bg-[#147da2] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#106385]" disabled={form.processing}>
                            Save Bill Changes
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
