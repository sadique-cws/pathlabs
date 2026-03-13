import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';

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
    routePrefix?: string;
};

/* ─── Reusable tiny form-field label ─── */
function FieldLabel({ children, htmlFor, required }: { children: React.ReactNode; htmlFor?: string; required?: boolean }) {
    return (
        <label htmlFor={htmlFor} className="mb-1 block text-xs font-medium tracking-wide text-slate-500 uppercase">
            {children}
            {required && <span className="ml-0.5 text-rose-500">*</span>}
        </label>
    );
}

const inputClasses =
    'h-9 w-full  border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20';

export default function EditBill({ bill, routePrefix = 'lab' }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Manage Patient Bills', href: `/${routePrefix}/billing/manage` },
        { title: `Edit ${bill.bill_number}`, href: `/${routePrefix}/billing/${bill.id}/edit` },
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
                        form.put(`/${routePrefix}/billing/${bill.id}`);
                    }}
                    className="space-y-12"
                >
                    <div className="grid grid-cols-1 xl:grid-cols-2">
                        {/* Patient Basic Info */}
                        <div className="sawtooth bg-white p-5 border-x border-b border-t border-slate-200">
                            <h2 className="mb-1 text-base font-semibold text-slate-800">Patient Information</h2>
                            <p className="mb-4 text-xs text-slate-400">Update patients basic & contact details</p>
                            
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="md:col-span-2">
                                    <FieldLabel required>Patient Name</FieldLabel>
                                    <input className={inputClasses} value={form.data.patient.name} onChange={(e) => form.setData('patient', { ...form.data.patient, name: e.target.value })} placeholder="Full name" />
                                </div>
                                <div>
                                    <FieldLabel required>Phone Number</FieldLabel>
                                    <input className={inputClasses} value={form.data.patient.phone} onChange={(e) => form.setData('patient', { ...form.data.patient, phone: e.target.value })} placeholder="10-digit number" />
                                </div>
                                <div>
                                    <FieldLabel>Gender</FieldLabel>
                                    <select className={inputClasses} value={form.data.patient.gender} onChange={(e) => form.setData('patient', { ...form.data.patient, gender: e.target.value })}>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <FieldLabel>Age (Years)</FieldLabel>
                                    <input type="number" className={inputClasses} value={form.data.patient.age_years ?? ''} onChange={(e) => form.setData('patient', { ...form.data.patient, age_years: Number(e.target.value) })} placeholder="Age" />
                                </div>
                                <div>
                                    <FieldLabel>City</FieldLabel>
                                    <input className={inputClasses} value={form.data.patient.city} onChange={(e) => form.setData('patient', { ...form.data.patient, city: e.target.value })} placeholder="e.g. Jaipur" />
                                </div>
                                <div>
                                    <FieldLabel>State</FieldLabel>
                                    <input className={inputClasses} value={form.data.patient.state} onChange={(e) => form.setData('patient', { ...form.data.patient, state: e.target.value })} placeholder="e.g. Rajasthan" />
                                </div>
                                <div>
                                    <FieldLabel>PIN Code</FieldLabel>
                                    <input className={inputClasses} value={form.data.patient.pin_code} onChange={(e) => form.setData('patient', { ...form.data.patient, pin_code: e.target.value })} placeholder="6-digit code" />
                                </div>
                                <div className="md:col-span-2">
                                    <FieldLabel>Address</FieldLabel>
                                    <input className={inputClasses} value={form.data.patient.address} onChange={(e) => form.setData('patient', { ...form.data.patient, address: e.target.value })} placeholder="Street address" />
                                </div>
                            </div>
                        </div>

                        {/* Bill Specific Details */}
                        <div className="sawtooth bg-white p-5 border-x border-b border-t border-slate-200 border-l-0">
                            <h2 className="mb-1 text-base font-semibold text-slate-800">Bill Details</h2>
                            <p className="mb-4 text-xs text-slate-400">Update billing metadata & additional parameters</p>
                            
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="md:col-span-2">
                                    <FieldLabel>Billing Date & Time</FieldLabel>
                                    <input type="datetime-local" className={inputClasses} value={form.data.billing_at} onChange={(e) => form.setData('billing_at', e.target.value)} />
                                </div>
                                <div className="md:col-span-2">
                                    <FieldLabel>Sample Collected From</FieldLabel>
                                    <input className={inputClasses} value={form.data.sample_collected_from} onChange={(e) => form.setData('sample_collected_from', e.target.value)} placeholder="Collector source" />
                                </div>
                                <div className="md:col-span-2">
                                    <FieldLabel>Insurance Details</FieldLabel>
                                    <input className={inputClasses} value={form.data.insurance_details} onChange={(e) => form.setData('insurance_details', e.target.value)} placeholder="Policy info" />
                                </div>
                                <div>
                                    <FieldLabel>Doctor Discount</FieldLabel>
                                    <input type="number" step="0.01" className={inputClasses} value={form.data.doctor_discount_amount} onChange={(e) => form.setData('doctor_discount_amount', Number(e.target.value))} />
                                </div>
                                <div>
                                    <FieldLabel>Center Discount</FieldLabel>
                                    <input type="number" step="0.01" className={inputClasses} value={form.data.center_discount_amount} onChange={(e) => form.setData('center_discount_amount', Number(e.target.value))} />
                                </div>
                                <div>
                                    <FieldLabel>Payment Amount</FieldLabel>
                                    <input type="number" step="0.01" className={inputClasses} value={form.data.payment_amount} onChange={(e) => form.setData('payment_amount', Number(e.target.value))} />
                                </div>
                                <div>
                                    <FieldLabel>Offer Package</FieldLabel>
                                    <input className={inputClasses} value={form.data.offer} onChange={(e) => form.setData('offer', e.target.value)} placeholder="Current offer" />
                                </div>
                                <div className="md:col-span-2">
                                    <FieldLabel>Notes & Remarks</FieldLabel>
                                    <textarea className="w-full  border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20" rows={2} value={form.data.notes} onChange={(e) => form.setData('notes', e.target.value)} placeholder="Any special notes..." />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 px-6 pb-12">
                        <Button type="button" variant="outline" onClick={() => history.back()}>Cancel</Button>
                        <Button type="submit" className="bg-[#147da2] hover:bg-[#106385]" disabled={form.processing}>
                            Save Bill Changes
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
