import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const discountPackages = ['No Offer', 'Silver Package', 'Gold Package', 'Corporate Plan'];

export default function AddPatient() {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Manage Patients', href: '/lab/patients/manage' },
        { title: 'Add Patient', href: '/lab/patients/add' },
    ];

    const form = useForm({
        title: 'Mr.',
        name: '',
        phone: '',
        alternative_phone: '',
        age_years: '',
        gender: '',
        address: '',
        pin_code: '',
        city: '',
        landmark: '',
        state: '',
        discount_package: 'No Offer',
        discount_expiry_date: '',
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add Patient" />

            <div className="min-h-full bg-[#f4f7fb] p-4 md:p-6">
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="rounded-t-2xl bg-[#0f87af] px-6 py-4">
                        <h1 className="text-3xl font-semibold text-white">Add Patient</h1>
                    </div>

                    <form
                        className="grid gap-6 p-6 lg:grid-cols-2"
                        onSubmit={(event) => {
                            event.preventDefault();
                            form.post('/lab/patients');
                        }}
                    >
                        <div className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-semibold text-slate-700">Name *</label>
                                <div className="grid grid-cols-[120px_1fr] gap-2">
                                    <select className="rounded-lg border border-slate-200 px-3 py-2" value={form.data.title} onChange={(e) => form.setData('title', e.target.value)}>
                                        <option value="Mr.">Mr.</option>
                                        <option value="Mrs.">Mrs.</option>
                                        <option value="Ms.">Ms.</option>
                                    </select>
                                    <input className="rounded-lg border border-slate-200 px-3 py-2" placeholder="Full Name" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-semibold text-slate-700">Age *</label>
                                <input type="number" min={0} className="w-full rounded-lg border border-slate-200 px-3 py-2" placeholder="Age in years" value={form.data.age_years} onChange={(e) => form.setData('age_years', e.target.value)} />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-semibold text-slate-700">Gender *</label>
                                <select className="w-full rounded-lg border border-slate-200 px-3 py-2" value={form.data.gender} onChange={(e) => form.setData('gender', e.target.value)}>
                                    <option value="">Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-semibold text-slate-700">Address</label>
                                <input className="w-full rounded-lg border border-slate-200 px-3 py-2" placeholder="Address" value={form.data.address} onChange={(e) => form.setData('address', e.target.value)} />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="mb-1 block text-sm font-semibold text-slate-700">PIN Code</label>
                                    <input className="w-full rounded-lg border border-slate-200 px-3 py-2" placeholder="PIN Code" value={form.data.pin_code} onChange={(e) => form.setData('pin_code', e.target.value)} />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-semibold text-slate-700">City</label>
                                    <input className="w-full rounded-lg border border-slate-200 px-3 py-2" placeholder="City" value={form.data.city} onChange={(e) => form.setData('city', e.target.value)} />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-semibold text-slate-700">Local Area</label>
                                <input className="w-full rounded-lg border border-slate-200 px-3 py-2" placeholder="Local Area" value={form.data.landmark} onChange={(e) => form.setData('landmark', e.target.value)} />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-semibold text-slate-700">Phone Number *</label>
                                <input className="w-full rounded-lg border border-slate-200 px-3 py-2" placeholder="10-digit mobile number" value={form.data.phone} onChange={(e) => form.setData('phone', e.target.value)} />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-semibold text-slate-700">Alternative Phone Number</label>
                                <input className="w-full rounded-lg border border-slate-200 px-3 py-2" placeholder="10-digit alternative mobile number" value={form.data.alternative_phone} onChange={(e) => form.setData('alternative_phone', e.target.value)} />
                            </div>

                            <div className="rounded-xl bg-[#eef8f8] p-4">
                                <h2 className="mb-3 text-2xl font-semibold text-slate-800">Discount Information</h2>
                                <div className="space-y-3">
                                    <div>
                                        <label className="mb-1 block text-sm font-semibold text-slate-700">Select Discount Package</label>
                                        <select className="w-full rounded-lg border border-slate-200 px-3 py-2" value={form.data.discount_package} onChange={(e) => form.setData('discount_package', e.target.value)}>
                                            {discountPackages.map((discountPackage) => (
                                                <option key={discountPackage} value={discountPackage}>{discountPackage}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-semibold text-slate-700">Discount Expiry Date</label>
                                        <input type="date" className="w-full rounded-lg border border-slate-200 px-3 py-2" value={form.data.discount_expiry_date} onChange={(e) => form.setData('discount_expiry_date', e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-span-full flex justify-end gap-3 border-t border-slate-200 pt-4">
                            <button type="button" onClick={() => history.back()} className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700">Cancel</button>
                            <button type="submit" className="rounded-lg bg-[#0f87af] px-5 py-2 text-sm font-semibold text-white" disabled={form.processing}>Add Patient</button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
