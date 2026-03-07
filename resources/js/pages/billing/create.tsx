import { Head, useForm, usePage } from '@inertiajs/react';
import { CalendarDays, Search } from 'lucide-react';
import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { BreadcrumbItem } from '@/types';

type LabTest = { id: number; name: string; price: string };
type TestPackage = { id: number; name: string; price: string; tests: LabTest[] };
type Doctor = { id: number; name: string };
type CollectionCenter = { id: number; name: string };
type Patient = {
    id: number;
    title: string | null;
    name: string;
    phone: string;
    gender: string | null;
    date_of_birth: string | null;
    age_years: number | null;
    age_months: number | null;
    age_days: number | null;
    address: string | null;
    city: string | null;
    landmark: string | null;
    weight_kg: string | null;
    height_cm: string | null;
    state: string | null;
    pin_code: string | null;
    uhid: string | null;
    id_type: string | null;
};
type Source = { id: number; name: string };
type ServiceMaster = { id: number; name: string; amount: string };
type ChargeRow = { name: string; amount: number };

type Props = {
    tests: LabTest[];
    packages: TestPackage[];
    doctors: Doctor[];
    collectionCenters: CollectionCenter[];
    patients: Patient[];
    sampleCollectionSources: Source[];
    serviceChargeMasters: ServiceMaster[];
    generatedBillId?: number | null;
    serviceCharge: number;
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'New Billing', href: '/lab/billing/create' }];

export default function BillingCreate({
    tests,
    packages,
    doctors,
    collectionCenters,
    patients,
    sampleCollectionSources,
    serviceChargeMasters,
    generatedBillId,
    serviceCharge,
}: Props) {
    const page = usePage();
    const flash = page.props.flash as { success?: string };

    const [tab, setTab] = useState<'tests' | 'packages' | 'others'>('tests');
    const [testSearch, setTestSearch] = useState('');
    const [packageSearch, setPackageSearch] = useState('');
    const [patientSearch, setPatientSearch] = useState('');
    const [sampleSources, setSampleSources] = useState<string[]>(sampleCollectionSources.map((source) => source.name));
    const [selectedServiceMasterId, setSelectedServiceMasterId] = useState('');
    const [newServiceName, setNewServiceName] = useState('');
    const [newServiceAmount, setNewServiceAmount] = useState(0);
    const [doctorModalOpen, setDoctorModalOpen] = useState(false);
    const [newDoctorForm, setNewDoctorForm] = useState({ name: '', phone: '' });
    const [dobYear, setDobYear] = useState('');
    const [dobMonth, setDobMonth] = useState('');
    const [dobDay, setDobDay] = useState('');
    const deferredPatientSearch = useDeferredValue(patientSearch);
    const deferredTestSearch = useDeferredValue(testSearch);
    const deferredPackageSearch = useDeferredValue(packageSearch);

    const form = useForm({
        patient_id: '',
        patient: {
            title: 'Mr.',
            name: '',
            phone: '',
            gender: 'male',
            date_of_birth: '',
            age_years: '',
            age_months: '',
            age_days: '',
            address: '',
            city: '',
            landmark: '',
            weight_kg: '',
            height_cm: '',
            state: '',
            pin_code: '',
            uhid: '',
            id_type: 'ABHA / Aadhar',
        },
        doctor_id: '',
        doctor_name: '',
        doctor_phone: '',
        collection_center_id: '',
        test_ids: [] as number[],
        sample_quantity: 1,
        package_ids: [] as number[],
        discount_amount: 0,
        doctor_discount: 0,
        doctor_discount_type: 'fixed',
        center_discount: 0,
        center_discount_type: 'fixed',
        service_other_charges: [] as ChargeRow[],
        sample_collected_from: sampleCollectionSources[0]?.name ?? 'Labs',
        insurance_details: '',
        offer: 'No Offer',
        previous_reports: '',
        agent_referrer: '',
        payment_amount: 0,
        urgent: false,
        soft_copy_only: false,
        send_message: true,
        billing_at: new Date().toISOString().slice(0, 16),
        notes: '',
    });

    const completeForm = useForm({ bill_id: generatedBillId ?? 0 });

    useEffect(() => {
        completeForm.setData('bill_id', generatedBillId ?? 0);
    }, [generatedBillId]);

    useEffect(() => {
        if (dobYear === '' || dobMonth === '' || dobDay === '') {
            return;
        }

        const selectedDate = new Date(Number(dobYear), Number(dobMonth) - 1, Number(dobDay));
        const now = new Date();

        let years = now.getFullYear() - selectedDate.getFullYear();
        let months = now.getMonth() - selectedDate.getMonth();
        let days = now.getDate() - selectedDate.getDate();

        if (days < 0) {
            months -= 1;
            days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
        }
        if (months < 0) {
            years -= 1;
            months += 12;
        }

        form.setData('patient', {
            ...form.data.patient,
            date_of_birth: `${dobYear}-${dobMonth.padStart(2, '0')}-${dobDay.padStart(2, '0')}`,
            age_years: String(Math.max(0, years)),
            age_months: String(Math.max(0, months)),
            age_days: String(Math.max(0, days)),
        });
    }, [dobYear, dobMonth, dobDay]);

    const matchedPatients = useMemo(() => {
        const query = deferredPatientSearch.trim().toLowerCase();
        if (query === '') {
            return [];
        }

        return patients.filter((patient) => `${patient.name} ${patient.phone}`.toLowerCase().includes(query)).slice(0, 8);
    }, [patients, deferredPatientSearch]);

    const filteredTests = useMemo(() => {
        if (tab !== 'tests') {
            return [];
        }

        const query = deferredTestSearch.trim().toLowerCase();

        return tests.filter((test) => test.name.toLowerCase().includes(query));
    }, [tests, deferredTestSearch, tab]);

    const filteredPackages = useMemo(() => {
        if (tab !== 'packages') {
            return [];
        }

        const query = deferredPackageSearch.trim().toLowerCase();

        return packages.filter((pack) => pack.name.toLowerCase().includes(query));
    }, [packages, deferredPackageSearch, tab]);

    const selectedTests = useMemo(() => tests.filter((test) => form.data.test_ids.includes(test.id)), [tests, form.data.test_ids]);
    const selectedPackages = useMemo(() => packages.filter((pack) => form.data.package_ids.includes(pack.id)), [packages, form.data.package_ids]);

    const testTotal = selectedTests.reduce((sum, item) => sum + Number(item.price), 0);
    const packageTotal = selectedPackages.reduce((sum, item) => sum + Number(item.price), 0);
    const serviceOtherTotal = form.data.service_other_charges.reduce((sum, item) => sum + item.amount, 0);
    const totalServiceCharge = Number(serviceCharge) + serviceOtherTotal;
    const grossTotal = testTotal + packageTotal;
    const doctorDiscountValue = form.data.doctor_discount_type === 'percent'
        ? (grossTotal * Number(form.data.doctor_discount)) / 100
        : Number(form.data.doctor_discount);
    const centerDiscountValue = form.data.center_discount_type === 'percent'
        ? (grossTotal * Number(form.data.center_discount)) / 100
        : Number(form.data.center_discount);
    const totalDiscount = Number(form.data.discount_amount) + doctorDiscountValue + centerDiscountValue;
    const billTotal = Math.max(0, grossTotal - totalDiscount) + totalServiceCharge;
    const dueAmount = Math.max(0, billTotal - Number(form.data.payment_amount));

    const years = Array.from({ length: 100 }, (_, index) => String(new Date().getFullYear() - index));
    const months = Array.from({ length: 12 }, (_, index) => String(index + 1));
    const days = Array.from({ length: 31 }, (_, index) => String(index + 1));

    function selectExistingPatient(patient: Patient): void {
        form.setData((current) => ({
            ...current,
            patient_id: String(patient.id),
            patient: {
                title: patient.title ?? 'Mr.',
                name: patient.name,
                phone: patient.phone,
                gender: patient.gender ?? 'male',
                date_of_birth: patient.date_of_birth ?? '',
                age_years: patient.age_years !== null ? String(patient.age_years) : '',
                age_months: patient.age_months !== null ? String(patient.age_months) : '',
                age_days: patient.age_days !== null ? String(patient.age_days) : '',
                address: patient.address ?? '',
                city: patient.city ?? '',
                landmark: patient.landmark ?? '',
                weight_kg: patient.weight_kg ?? '',
                height_cm: patient.height_cm ?? '',
                state: patient.state ?? '',
                pin_code: patient.pin_code ?? '',
                uhid: patient.uhid ?? '',
                id_type: patient.id_type ?? 'ABHA / Aadhar',
            },
        }));

        if (patient.date_of_birth !== null) {
            const date = new Date(patient.date_of_birth);
            setDobYear(String(date.getFullYear()));
            setDobMonth(String(date.getMonth() + 1));
            setDobDay(String(date.getDate()));
        }

        setPatientSearch(patient.name);
    }

    function addTest(testId: number): void {
        if (!form.data.test_ids.includes(testId)) {
            form.setData('test_ids', [...form.data.test_ids, testId]);
        }
    }

    function removeTest(testId: number): void {
        form.setData('test_ids', form.data.test_ids.filter((id) => id !== testId));
    }

    function addPackage(packageId: number): void {
        if (!form.data.package_ids.includes(packageId)) {
            form.setData('package_ids', [...form.data.package_ids, packageId]);
        }
    }

    function addCharge(chargeName?: string, chargeAmount?: number): void {
        const name = (chargeName ?? newServiceName).trim();
        const amount = chargeAmount ?? newServiceAmount;

        if (name !== '' && amount > 0) {
            form.setData('service_other_charges', [...form.data.service_other_charges, { name, amount }]);
            setNewServiceName('');
            setNewServiceAmount(0);
        }
    }

    function addSelectedServiceCharge(): void {
        if (selectedServiceMasterId === '') {
            return;
        }

        const service = serviceChargeMasters.find((item) => String(item.id) === selectedServiceMasterId);

        if (service === undefined) {
            return;
        }

        addCharge(service.name, Number(service.amount));
    }

    function addSampleSource(): void {
        const value = form.data.sample_collected_from.trim();
        if (value !== '' && !sampleSources.includes(value)) {
            setSampleSources([...sampleSources, value]);
        }
    }

    function onDoctorSelect(value: string): void {
        if (value === '__add_new__') {
            setDoctorModalOpen(true);
            return;
        }

        if (value === '__none__') {
            form.setData('doctor_id', '');
            return;
        }

        form.setData('doctor_id', value);
        form.setData('doctor_name', '');
        form.setData('doctor_phone', '');
    }

    function saveNewDoctor(): void {
        const name = newDoctorForm.name.trim();
        const phone = newDoctorForm.phone.trim();
        if (name === '') {
            return;
        }

        form.setData('doctor_id', '');
        form.setData('doctor_name', name);
        form.setData('doctor_phone', phone);
        setDoctorModalOpen(false);
    }

    function generateBarcode(event: React.FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        form.post('/lab/billing/generate-barcode');
    }

    function completeBilling(): void {
        completeForm.post('/lab/billing/complete');
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Bill" />

            <div className="min-h-full bg-[#f4f7fb] p-4 md:p-6">
                {flash?.success && <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-700">{flash.success}</div>}

                <form onSubmit={generateBarcode} className="space-y-4">
                    <div className="grid gap-4 xl:grid-cols-2">
                        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                            <h2 className="mb-3 text-lg font-semibold text-slate-800">Patient Basic Information</h2>

                            <input className="mb-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Enter phone number to search patients..." value={patientSearch} onChange={(e) => setPatientSearch(e.target.value)} />

                            {patientSearch !== '' && matchedPatients.length > 0 && (
                                <div className="mb-3 max-h-40 overflow-auto rounded-lg border border-slate-200 bg-white p-1">
                                    {matchedPatients.map((patient) => (
                                        <button type="button" key={patient.id} onClick={() => selectExistingPatient(patient)} className="flex w-full items-center justify-between rounded px-2 py-2 text-left text-sm hover:bg-slate-50">
                                            <span>{patient.name}</span>
                                            <span className="text-xs text-slate-500">{patient.phone}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className="grid gap-3 md:grid-cols-2">
                                <div className="grid grid-cols-[110px_1fr] gap-2 md:col-span-2">
                                    <select className="rounded-lg border border-slate-200 px-3 py-2" value={form.data.patient.title} onChange={(e) => form.setData('patient', { ...form.data.patient, title: e.target.value })}>
                                        <option>Mr.</option>
                                        <option>Mrs.</option>
                                        <option>Ms.</option>
                                        <option>Dr.</option>
                                    </select>
                                    <input className="rounded-lg border border-slate-200 px-3 py-2" placeholder="Patient name" value={form.data.patient.name} onChange={(e) => form.setData('patient', { ...form.data.patient, name: e.target.value })} />
                                </div>

                                <input className="rounded-lg border border-slate-200 px-3 py-2" placeholder="Phone number" value={form.data.patient.phone} onChange={(e) => form.setData('patient', { ...form.data.patient, phone: e.target.value })} />
                                <select className="rounded-lg border border-slate-200 px-3 py-2" value={form.data.patient.gender} onChange={(e) => form.setData('patient', { ...form.data.patient, gender: e.target.value })}>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>

                                <div className="md:col-span-2">
                                    <p className="mb-1 text-sm text-slate-600">Date of Birth</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        <select className="rounded-lg border border-slate-200 px-3 py-2" value={dobYear} onChange={(e) => setDobYear(e.target.value)}>
                                            <option value="">Year</option>
                                            {years.map((year) => <option key={year} value={year}>{year}</option>)}
                                        </select>
                                        <select className="rounded-lg border border-slate-200 px-3 py-2" value={dobMonth} onChange={(e) => setDobMonth(e.target.value)}>
                                            <option value="">Month</option>
                                            {months.map((month) => <option key={month} value={month}>{month}</option>)}
                                        </select>
                                        <select className="rounded-lg border border-slate-200 px-3 py-2" value={dobDay} onChange={(e) => setDobDay(e.target.value)}>
                                            <option value="">Day</option>
                                            {days.map((day) => <option key={day} value={day}>{day}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="md:col-span-2 grid grid-cols-3 gap-2">
                                    <input className="rounded-lg border border-slate-200 px-2 py-2" placeholder="Age Years" value={form.data.patient.age_years} onChange={(e) => form.setData('patient', { ...form.data.patient, age_years: e.target.value })} />
                                    <input className="rounded-lg border border-slate-200 px-2 py-2" placeholder="Age Months" value={form.data.patient.age_months} onChange={(e) => form.setData('patient', { ...form.data.patient, age_months: e.target.value })} />
                                    <input className="rounded-lg border border-slate-200 px-2 py-2" placeholder="Age Days" value={form.data.patient.age_days} onChange={(e) => form.setData('patient', { ...form.data.patient, age_days: e.target.value })} />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Select value={form.data.doctor_id === '' ? '__none__' : form.data.doctor_id} onValueChange={onDoctorSelect}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Search and select doctor" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="__add_new__">+ Add New Doctor</SelectItem>
                                            <SelectItem value="__none__">No Doctor</SelectItem>
                                            {doctors.map((doctor) => <SelectItem key={doctor.id} value={String(doctor.id)}>{doctor.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <select className="md:col-span-2 rounded-lg border border-slate-200 px-3 py-2" value={form.data.collection_center_id} onChange={(e) => form.setData('collection_center_id', e.target.value)}>
                                    <option value="">Collection center</option>
                                    {collectionCenters.map((center) => <option key={center.id} value={center.id}>{center.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                            <h2 className="mb-4 text-lg font-semibold text-slate-800">Patient Additional Information</h2>
                            <div className="grid gap-3 md:grid-cols-2">
                                <input className="rounded-lg border border-slate-200 px-3 py-2" placeholder="Pin code" value={form.data.patient.pin_code} onChange={(e) => form.setData('patient', { ...form.data.patient, pin_code: e.target.value })} />
                                <input className="rounded-lg border border-slate-200 px-3 py-2" placeholder="State" value={form.data.patient.state} onChange={(e) => form.setData('patient', { ...form.data.patient, state: e.target.value })} />
                                <input className="rounded-lg border border-slate-200 px-3 py-2" placeholder="City" value={form.data.patient.city} onChange={(e) => form.setData('patient', { ...form.data.patient, city: e.target.value })} />
                                <input className="rounded-lg border border-slate-200 px-3 py-2" placeholder="Landmark" value={form.data.patient.landmark} onChange={(e) => form.setData('patient', { ...form.data.patient, landmark: e.target.value })} />
                                <input className="md:col-span-2 rounded-lg border border-slate-200 px-3 py-2" placeholder="Address" value={form.data.patient.address} onChange={(e) => form.setData('patient', { ...form.data.patient, address: e.target.value })} />
                                <input className="rounded-lg border border-slate-200 px-3 py-2" placeholder="Weight (kg)" value={form.data.patient.weight_kg} onChange={(e) => form.setData('patient', { ...form.data.patient, weight_kg: e.target.value })} />
                                <input className="rounded-lg border border-slate-200 px-3 py-2" placeholder="Height (cm)" value={form.data.patient.height_cm} onChange={(e) => form.setData('patient', { ...form.data.patient, height_cm: e.target.value })} />
                                <input className="rounded-lg border border-slate-200 px-3 py-2" placeholder="UHID / Govt ID" value={form.data.patient.uhid} onChange={(e) => form.setData('patient', { ...form.data.patient, uhid: e.target.value })} />
                                <input className="rounded-lg border border-slate-200 px-3 py-2" placeholder="ID Type" value={form.data.patient.id_type} onChange={(e) => form.setData('patient', { ...form.data.patient, id_type: e.target.value })} />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                        <div className="mb-3 flex items-center gap-2">
                            <button type="button" onClick={() => setTab('tests')} className={`rounded px-3 py-2 text-sm font-semibold ${tab === 'tests' ? 'bg-[#0f87af] text-white' : 'bg-slate-100 text-slate-700'}`}>Tests</button>
                            <button type="button" onClick={() => setTab('packages')} className={`rounded px-3 py-2 text-sm font-semibold ${tab === 'packages' ? 'bg-[#0f87af] text-white' : 'bg-slate-100 text-slate-700'}`}>Packages</button>
                            <button type="button" onClick={() => setTab('others')} className={`rounded px-3 py-2 text-sm font-semibold ${tab === 'others' ? 'bg-[#0f87af] text-white' : 'bg-slate-100 text-slate-700'}`}>Others</button>
                        </div>

                        {tab === 'tests' && (
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="relative mb-2 block">
                                        <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                        <input className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3" placeholder="Search tests" value={testSearch} onChange={(e) => setTestSearch(e.target.value)} />
                                    </label>
                                    <div className="max-h-72 space-y-2 overflow-auto rounded-lg border border-slate-200 p-2">
                                        {filteredTests.map((test) => (
                                            <button key={test.id} type="button" onClick={() => addTest(test.id)} className="flex w-full items-center justify-between rounded border border-slate-200 px-3 py-2 text-left text-sm hover:bg-slate-50">
                                                <span>{test.name}</span><span className="font-semibold">₹{test.price}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="max-h-80 overflow-auto rounded-lg border border-slate-200 p-2">
                                    {selectedTests.map((test) => (
                                        <div key={test.id} className="mb-2 rounded border border-slate-200 bg-slate-50 p-2">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium">{test.name}</p>
                                                <button type="button" onClick={() => removeTest(test.id)} className="text-xs text-rose-600">Remove</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {tab === 'packages' && (
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="relative mb-2 block">
                                        <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                        <input className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3" placeholder="Search packages" value={packageSearch} onChange={(e) => setPackageSearch(e.target.value)} />
                                    </label>
                                    <div className="max-h-72 space-y-2 overflow-auto rounded-lg border border-slate-200 p-2">
                                        {filteredPackages.map((pack) => (
                                            <button key={pack.id} type="button" onClick={() => addPackage(pack.id)} className="flex w-full items-center justify-between rounded border border-slate-200 px-3 py-2 text-left text-sm hover:bg-slate-50">
                                                <span>{pack.name}</span><span className="font-semibold">₹{pack.price}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="max-h-80 overflow-auto rounded-lg border border-slate-200 p-2">
                                    {selectedPackages.map((pack) => (
                                        <button key={pack.id} type="button" onClick={() => form.setData('package_ids', form.data.package_ids.filter((id) => id !== pack.id))} className="mb-2 flex w-full items-center justify-between rounded border border-slate-200 bg-slate-50 px-3 py-2 text-left text-sm">
                                            <span>{pack.name}</span><span className="font-semibold">₹{pack.price}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {tab === 'others' && (
                            <div className="space-y-3">
                                <div className="grid gap-2 md:grid-cols-[1fr_140px_120px]">
                                    <input className="rounded-lg border border-slate-200 px-3 py-2" placeholder="Service charge name" value={newServiceName} onChange={(e) => setNewServiceName(e.target.value)} />
                                    <input type="number" min={0} step="0.01" className="rounded-lg border border-slate-200 px-3 py-2" placeholder="Amount" value={newServiceAmount} onChange={(e) => setNewServiceAmount(Number(e.target.value))} />
                                    <button type="button" onClick={() => addCharge()} className="rounded-lg bg-[#0f87af] px-3 py-2 text-sm font-semibold text-white">+ Add</button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {serviceChargeMasters.map((master) => (
                                        <button key={master.id} type="button" onClick={() => addCharge(master.name, Number(master.amount))} className="rounded border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                                            {master.name} - ₹{master.amount}
                                        </button>
                                    ))}
                                </div>
                                <div className="rounded-lg border border-slate-200 p-2">
                                    {form.data.service_other_charges.map((charge, index) => (
                                        <div key={`${charge.name}-${index}`} className="mb-2 flex items-center justify-between rounded bg-slate-50 px-3 py-2 text-sm">
                                            <span>{charge.name}</span>
                                            <div className="flex items-center gap-3">
                                                <span className="font-semibold">₹{charge.amount.toFixed(2)}</span>
                                                <button type="button" className="text-rose-600" onClick={() => form.setData('service_other_charges', form.data.service_other_charges.filter((_, i) => i !== index))}>x</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <Card className="gap-0 py-0">
                        <CardHeader className="border-b px-4 py-3">
                            <div className="flex items-center gap-3 text-sm">
                                <Badge>1</Badge>
                                <span className="font-medium">Billing Info</span>
                                <Separator className="mx-1 flex-1" />
                                <Badge variant="outline">2</Badge>
                                <span className="text-muted-foreground">Payment</span>
                                <Separator className="mx-1 flex-1" />
                                <Badge variant="outline">3</Badge>
                                <span className="text-muted-foreground">Bill Generated</span>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="grid grid-cols-1 lg:grid-cols-2">
                                <div className="space-y-4 border-b p-4 lg:border-r lg:border-b-0">
                                    <CardTitle>Billing Information</CardTitle>

                                    <div className="space-y-2">
                                        <Label>Billing Time</Label>
                                        <div className="relative">
                                            <Input type="datetime-local" value={form.data.billing_at} onChange={(e) => form.setData('billing_at', e.target.value)} />
                                            <CalendarDays className="text-muted-foreground pointer-events-none absolute right-3 top-2.5 h-4 w-4" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Sample Collected From</Label>
                                        <div className="grid grid-cols-[1fr_auto] gap-2">
                                            <Input list="sample-sources" value={form.data.sample_collected_from} onChange={(e) => form.setData('sample_collected_from', e.target.value)} />
                                            <Button type="button" variant="outline" onClick={addSampleSource}>+ Add</Button>
                                            <datalist id="sample-sources">{sampleSources.map((source) => <option key={source} value={source} />)}</datalist>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Insurance</Label>
                                        <Input placeholder="Add insurance details" value={form.data.insurance_details} onChange={(e) => form.setData('insurance_details', e.target.value)} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Service/Other Charges</Label>
                                        <div className="grid grid-cols-[1fr_auto] gap-2">
                                            <select className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring h-9 rounded-md border px-3 py-1 text-sm shadow-xs focus-visible:ring-1 focus-visible:outline-none" value={selectedServiceMasterId} onChange={(e) => setSelectedServiceMasterId(e.target.value)}>
                                                <option value="">Select service charge</option>
                                                {serviceChargeMasters.map((item) => (
                                                    <option key={item.id} value={String(item.id)}>{item.name} (₹{item.amount})</option>
                                                ))}
                                            </select>
                                            <Button type="button" variant="outline" onClick={addSelectedServiceCharge}>+ Add</Button>
                                        </div>
                                    </div>

                                    {form.data.service_other_charges.length > 0 && (
                                        <div className="space-y-2">
                                            <Label>Selected Charges</Label>
                                            <div className="space-y-2 rounded-md border p-2">
                                                {form.data.service_other_charges.map((charge, index) => (
                                                    <div key={`${charge.name}-${index}`} className="bg-muted flex items-center justify-between rounded-md px-3 py-2 text-sm">
                                                        <span>{charge.name}</span>
                                                        <div className="flex items-center gap-3">
                                                            <span className="font-medium">₹{charge.amount.toFixed(2)}</span>
                                                            <Button type="button" size="sm" variant="ghost" onClick={() => form.setData('service_other_charges', form.data.service_other_charges.filter((_, i) => i !== index))}>Remove</Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label>Offer</Label>
                                        <select className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs focus-visible:ring-1 focus-visible:outline-none" value={form.data.offer} onChange={(e) => form.setData('offer', e.target.value)}>
                                            <option value="No Offer">No Offer</option>
                                            <option value="Festival Offer">Festival Offer</option>
                                            <option value="Corporate Offer">Corporate Offer</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Doctor Discount</Label>
                                        <div className="grid grid-cols-[1fr_154px] gap-2">
                                            <Input type="number" min={0} step="0.01" value={form.data.doctor_discount} onChange={(e) => form.setData('doctor_discount', Number(e.target.value))} />
                                            <select className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring h-9 rounded-md border px-3 py-1 text-sm shadow-xs focus-visible:ring-1 focus-visible:outline-none" value={form.data.doctor_discount_type} onChange={(e) => form.setData('doctor_discount_type', e.target.value)}>
                                                <option value="fixed">Fixed (₹)</option>
                                                <option value="percent">Percent (%)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Center Discount</Label>
                                        <div className="grid grid-cols-[1fr_154px] gap-2">
                                            <Input type="number" min={0} step="0.01" value={form.data.center_discount} onChange={(e) => form.setData('center_discount', Number(e.target.value))} />
                                            <select className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring h-9 rounded-md border px-3 py-1 text-sm shadow-xs focus-visible:ring-1 focus-visible:outline-none" value={form.data.center_discount_type} onChange={(e) => form.setData('center_discount_type', e.target.value)}>
                                                <option value="fixed">Fixed (₹)</option>
                                                <option value="percent">Percent (%)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Comment / Clinical Notes</Label>
                                        <textarea className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring min-h-20 w-full rounded-md border px-3 py-2 text-sm shadow-xs focus-visible:ring-1 focus-visible:outline-none" value={form.data.notes} onChange={(e) => form.setData('notes', e.target.value)} />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label>Previous Reports</Label>
                                            <Button type="button" size="sm" variant="outline">+ Add</Button>
                                        </div>
                                        <Input value={form.data.previous_reports} onChange={(e) => form.setData('previous_reports', e.target.value)} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Agent / Referrer</Label>
                                        <Input placeholder="Search and select agent..." value={form.data.agent_referrer} onChange={(e) => form.setData('agent_referrer', e.target.value)} />
                                    </div>
                                </div>

                                <div className="space-y-4 p-4">
                                    <div className="flex items-center gap-2">
                                        <CardTitle>Payment Information</CardTitle>
                                        <Badge variant="secondary">Complete billing first</Badge>
                                    </div>

                                    <Alert variant="destructive">
                                        <AlertTitle>Complete billing information before payment</AlertTitle>
                                        <AlertDescription>At least one test or package must be selected.</AlertDescription>
                                    </Alert>

                                    <div className="space-y-2">
                                        <Label>Payment Amount</Label>
                                        <div className="grid grid-cols-[1fr_auto] gap-2">
                                            <Input type="number" min={0} step="0.01" value={form.data.payment_amount} onChange={(e) => form.setData('payment_amount', Number(e.target.value))} />
                                            <Button type="button" variant="secondary" onClick={() => form.setData('payment_amount', billTotal)}>Full Payment</Button>
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between border-b pb-2"><span>Test Total:</span><span className="font-medium">₹{testTotal.toFixed(2)}</span></div>
                                        <div className="flex justify-between border-b pb-2"><span>Package Total:</span><span className="font-medium">₹{packageTotal.toFixed(2)}</span></div>
                                        <div className="space-y-1 border-b pb-2">
                                            <div className="font-medium">Service Charges:</div>
                                            {form.data.service_other_charges.map((charge, index) => (
                                                <div key={`payment-charge-${index}`} className="text-muted-foreground flex justify-between">
                                                    <span>• {charge.name}:</span>
                                                    <span>₹{charge.amount.toFixed(2)}</span>
                                                </div>
                                            ))}
                                            <div className="text-muted-foreground flex justify-between">
                                                <span>• E-service Charge (including GST):</span>
                                                <span>₹{Number(serviceCharge).toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between pt-1 font-medium">
                                                <span>Total Service Charges:</span>
                                                <span>₹{totalServiceCharge.toFixed(2)}</span>
                                            </div>
                                        </div>
                                        <div className="text-destructive flex justify-between border-b pb-2 font-medium"><span>Total Discount:</span><span>-₹{totalDiscount.toFixed(2)}</span></div>
                                        <div className="text-destructive flex justify-between text-lg font-semibold"><span>Due:</span><span>₹{dueAmount.toFixed(2)}</span></div>
                                        <div className="flex justify-between text-lg font-semibold"><span>Bill Total:</span><span>₹{billTotal.toFixed(2)}</span></div>
                                    </div>

                                    <div className="max-w-xs space-y-2">
                                        <Label>Barcode Qty (Bill Wise)</Label>
                                        <Input type="number" min={1} max={20} value={form.data.sample_quantity} onChange={(e) => form.setData('sample_quantity', Math.max(1, Math.min(20, Number(e.target.value) || 1)))} />
                                    </div>

                                    <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3">
                                        <label className="inline-flex items-center gap-2 text-sm">
                                            <Checkbox checked={form.data.urgent} onCheckedChange={(checked) => form.setData('urgent', checked === true)} />
                                            Urgent
                                        </label>
                                        <label className="inline-flex items-center gap-2 text-sm">
                                            <Checkbox checked={form.data.soft_copy_only} onCheckedChange={(checked) => form.setData('soft_copy_only', checked === true)} />
                                            Soft Copy Only
                                        </label>
                                        <label className="inline-flex items-center gap-2 text-sm">
                                            <Checkbox checked={form.data.send_message} onCheckedChange={(checked) => form.setData('send_message', checked === true)} />
                                            Send Message
                                        </label>
                                    </div>

                                    <div className="flex flex-wrap justify-end gap-2">
                                        <Button type="submit" disabled={form.processing}>Generate Barcode</Button>
                                        <Button type="button" variant="secondary" onClick={completeBilling} disabled={completeForm.processing || !generatedBillId}>Complete Billing</Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>

            <Dialog open={doctorModalOpen} onOpenChange={setDoctorModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Doctor</DialogTitle>
                        <DialogDescription>Create referral doctor while billing.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div className="space-y-2">
                            <Label htmlFor="new-doctor-name">Doctor Name</Label>
                            <Input id="new-doctor-name" value={newDoctorForm.name} onChange={(event) => setNewDoctorForm((current) => ({ ...current, name: event.target.value }))} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-doctor-phone">Phone (Optional)</Label>
                            <Input id="new-doctor-phone" value={newDoctorForm.phone} onChange={(event) => setNewDoctorForm((current) => ({ ...current, phone: event.target.value }))} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setDoctorModalOpen(false)}>Cancel</Button>
                        <Button type="button" onClick={saveNewDoctor}>Save Doctor</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
