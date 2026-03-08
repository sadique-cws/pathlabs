import { Head, useForm, usePage } from '@inertiajs/react';
import { CalendarDays, ChevronDown, Search } from 'lucide-react';
import { useDeferredValue, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
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

/* ─── Reusable tiny form-field label ─── */
function FieldLabel({ children, htmlFor, required }: { children: React.ReactNode; htmlFor?: string; required?: boolean }) {
    return (
        <label htmlFor={htmlFor} className="mb-1 block text-xs font-medium tracking-wide text-slate-500 uppercase">
            {children}
            {required && <span className="ml-0.5 text-rose-500">*</span>}
        </label>
    );
}

/* ─── Inline validation error ─── */
function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return <p className="mt-1 text-xs text-rose-500">{message}</p>;
}

/* ─── Searchable Select (combobox) ─── */
type SearchableSelectOption = { value: string; label: string };

function SearchableSelect({
    options,
    value,
    onChange,
    placeholder = 'Select…',
    className = '',
}: {
    options: SearchableSelectOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const filtered = useMemo(() => {
        const q = search.toLowerCase().trim();
        if (q === '') return options;
        return options.filter((o) => o.label.toLowerCase().includes(q));
    }, [options, search]);

    const selectedLabel = options.find((o) => o.value === value)?.label ?? '';

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
                setSearch('');
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <button
                type="button"
                onClick={() => {
                    setOpen(!open);
                    setSearch('');
                    setTimeout(() => inputRef.current?.focus(), 0);
                }}
                className="flex h-9 w-full items-center justify-between  border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20"
            >
                <span className={selectedLabel ? 'text-slate-700' : 'text-slate-400'}>
                    {selectedLabel || placeholder}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {open && (
                <div className="absolute inset-x-0 z-30 mt-1  border border-slate-200 bg-white shadow-lg">
                    <div className="border-b border-slate-100 p-1.5">
                        <input
                            ref={inputRef}
                            className="h-8 w-full border-0 bg-slate-50 px-2.5 text-sm outline-none placeholder:text-slate-400"
                            placeholder="Type to search…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="max-h-48 overflow-auto py-1">
                        {filtered.length === 0 && (
                            <div className="px-3 py-2 text-sm text-slate-400">No results</div>
                        )}
                        {filtered.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => {
                                    onChange(opt.value);
                                    setOpen(false);
                                    setSearch('');
                                }}
                                className={`flex w-full items-center px-3 py-2 text-left text-sm transition hover:bg-slate-50 ${
                                    opt.value === value ? 'bg-[#147da2]/5 font-medium text-[#147da2]' : 'text-slate-700'
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

/* ─── Consistent styling constants ─── */
const inputClasses =
    'h-9 w-full  border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20';

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
    const [showPatientSuggestions, setShowPatientSuggestions] = useState(false);
    const [selectedPatientLabel, setSelectedPatientLabel] = useState<string | null>(null);
    const [sampleSources, setSampleSources] = useState<string[]>(sampleCollectionSources.map((source) => source.name));
    const [selectedServiceMasterId, setSelectedServiceMasterId] = useState('');
    const [newServiceName, setNewServiceName] = useState('');
    const [newServiceAmount, setNewServiceAmount] = useState(0);
    const [doctorModalOpen, setDoctorModalOpen] = useState(false);
    const [newDoctorForm, setNewDoctorForm] = useState({ name: '', phone: '' });
    const [dobYear, setDobYear] = useState('');
    const [dobMonth, setDobMonth] = useState('');
    const [dobDay, setDobDay] = useState('');
    const patientSearchRef = useRef<HTMLDivElement | null>(null);
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

    /* Memoised option lists for SearchableSelect */
    const titleOptions: SearchableSelectOption[] = [
        { value: 'Mr.', label: 'Mr.' },
        { value: 'Mrs.', label: 'Mrs.' },
        { value: 'Ms.', label: 'Ms.' },
        { value: 'Dr.', label: 'Dr.' },
    ];
    const genderOptions: SearchableSelectOption[] = [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
        { value: 'other', label: 'Other' },
    ];
    const yearOptions: SearchableSelectOption[] = useMemo(() => Array.from({ length: 120 }, (_, i) => { const y = String(new Date().getFullYear() - i); return { value: y, label: y }; }), []);
    const monthOptions: SearchableSelectOption[] = useMemo(() => Array.from({ length: 12 }, (_, i) => { const m = String(i + 1).padStart(2, '0'); return { value: m, label: m }; }), []);
    const dayOptions: SearchableSelectOption[] = useMemo(() => Array.from({ length: 31 }, (_, i) => { const d = String(i + 1).padStart(2, '0'); return { value: d, label: d }; }), []);
    const doctorOptions: SearchableSelectOption[] = useMemo(() => [
        { value: '__add_new__', label: '+ Add New Doctor' },
        { value: '__none__', label: 'No Doctor' },
        ...doctors.map((d) => ({ value: String(d.id), label: d.name })),
    ], [doctors]);
    const collectionCenterOptions: SearchableSelectOption[] = useMemo(() => [
        { value: '', label: 'Select center' },
        ...collectionCenters.map((c) => ({ value: String(c.id), label: c.name })),
    ], [collectionCenters]);
    const serviceChargeOptions: SearchableSelectOption[] = useMemo(() => [
        { value: '', label: 'Select service charge' },
        ...serviceChargeMasters.map((s) => ({ value: String(s.id), label: `${s.name} (₹${s.amount})` })),
    ], [serviceChargeMasters]);
    const offerOptions: SearchableSelectOption[] = [
        { value: 'No Offer', label: 'No Offer' },
        { value: 'Festival Offer', label: 'Festival Offer' },
        { value: 'Corporate Offer', label: 'Corporate Offer' },
    ];
    const discountTypeOptions: SearchableSelectOption[] = [
        { value: 'fixed', label: 'Fixed (₹)' },
        { value: 'percent', label: 'Percent (%)' },
    ];

    useEffect(() => {
        const onClickOutside = (event: MouseEvent): void => {
            const target = event.target;
            if (!(target instanceof Node)) {
                return;
            }

            if (patientSearchRef.current !== null && !patientSearchRef.current.contains(target)) {
                setShowPatientSuggestions(false);
            }
        };

        document.addEventListener('mousedown', onClickOutside);

        return () => {
            document.removeEventListener('mousedown', onClickOutside);
        };
    }, []);

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
                id_type: patient.id_type ?? '',
            },
        }));

        if (patient.date_of_birth !== null) {
            const date = new Date(patient.date_of_birth);
            setDobYear(String(date.getFullYear()));
            setDobMonth(String(date.getMonth() + 1));
            setDobDay(String(date.getDate()));
        }

        setSelectedPatientLabel(`${patient.name} • ${patient.phone}`);
        setPatientSearch('');
        setShowPatientSuggestions(false);
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

            <div className="min-h-full bg-slate-50/80 p-0">
                {flash?.success && (
                    <div className="mb-4  border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                        {flash.success}
                    </div>
                )}

                <form onSubmit={generateBarcode}>
                    {/* ─── Patient Info Row ─── */}
                    <div className="grid xl:grid-cols-2">
                        {/* Patient Basic */}
                        <div className="sawtooth bg-white border-0 p-5 border-r border-b border-slate-200">
                            <h2 className="mb-1 text-base font-semibold text-slate-800">Patient Basic Information</h2>
                            <p className="mb-4 text-xs text-slate-400">Search existing or add new patient details</p>

                            {/* Patient search */}
                            <div ref={patientSearchRef} className="relative mb-4">
                                <FieldLabel>Search Patient</FieldLabel>
                                <div className="relative">
                                    <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                    <input
                                        className={`${inputClasses} pl-9`}
                                        placeholder="Name or phone number…"
                                        value={patientSearch}
                                        onFocus={() => setShowPatientSuggestions(patientSearch.trim() !== '')}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setPatientSearch(value);
                                            setShowPatientSuggestions(value.trim() !== '');
                                            setSelectedPatientLabel(null);
                                            form.setData('patient_id', '');
                                        }}
                                    />
                                </div>

                                {showPatientSuggestions && patientSearch !== '' && (
                                    <div className="absolute inset-x-0 z-20 mt-1 max-h-44 overflow-auto  border border-slate-200 bg-white py-1">
                                        {matchedPatients.map((patient) => (
                                            <button type="button" key={patient.id} onClick={() => selectExistingPatient(patient)} className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-slate-50">
                                                <span className="font-medium text-slate-700">{patient.name}</span>
                                                <span className="text-xs text-slate-400">{patient.phone}</span>
                                            </button>
                                        ))}
                                        {matchedPatients.length === 0 && (
                                            <div className="px-3 py-2 text-sm text-slate-400">
                                                No existing patient found.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {selectedPatientLabel !== null && (
                                <div className="mb-4 flex items-center justify-between  border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                                    <span>Selected: <strong>{selectedPatientLabel}</strong></span>
                                    <button
                                        type="button"
                                        className="border border-emerald-300 px-2 py-0.5 text-xs font-medium hover:bg-emerald-100"
                                        onClick={() => {
                                            setSelectedPatientLabel(null);
                                            form.setData('patient_id', '');
                                        }}
                                    >
                                        Change
                                    </button>
                                </div>
                            )}

                            <div className="grid gap-4 md:grid-cols-2">
                                {/* Title + Name */}
                                <div className="md:col-span-2">
                                    <FieldLabel required>Patient Name</FieldLabel>
                                    <div className="grid grid-cols-1 xs:grid-cols-[100px_1fr] gap-2">
                                        <SearchableSelect options={titleOptions} value={form.data.patient.title} onChange={(v) => form.setData('patient', { ...form.data.patient, title: v })} placeholder="Title" />
                                        <input className={`${inputClasses} ${form.errors['patient.name'] ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20' : ''}`} placeholder="Full name" value={form.data.patient.name} onChange={(e) => form.setData('patient', { ...form.data.patient, name: e.target.value })} />
                                    </div>
                                    <FieldError message={form.errors['patient.name']} />
                                </div>

                                <div>
                                    <FieldLabel required>Phone</FieldLabel>
                                    <input className={`${inputClasses} ${form.errors['patient.phone'] ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20' : ''}`} placeholder="10‑digit number" value={form.data.patient.phone} onChange={(e) => form.setData('patient', { ...form.data.patient, phone: e.target.value })} />
                                    <FieldError message={form.errors['patient.phone']} />
                                </div>
                                <div>
                                    <FieldLabel>Gender</FieldLabel>
                                    <SearchableSelect options={genderOptions} value={form.data.patient.gender} onChange={(v) => form.setData('patient', { ...form.data.patient, gender: v })} placeholder="Select gender" />
                                </div>

                                {/* DOB only */}
                                <div className="md:col-span-2">
                                    <FieldLabel>Date of Birth</FieldLabel>
                                    <div className="grid grid-cols-2 xs:grid-cols-3 gap-2">
                                        <div className="col-span-2 xs:col-span-1">
                                            <SearchableSelect options={yearOptions} value={dobYear} onChange={setDobYear} placeholder="Year" />
                                        </div>
                                        <SearchableSelect options={monthOptions} value={dobMonth} onChange={setDobMonth} placeholder="Month" />
                                        <SearchableSelect options={dayOptions} value={dobDay} onChange={setDobDay} placeholder="Day" />
                                    </div>
                                </div>

                                {/* Doctor */}
                                <div className="md:col-span-2">
                                    <FieldLabel>Referring Doctor</FieldLabel>
                                    <SearchableSelect options={doctorOptions} value={form.data.doctor_id === '' ? '__none__' : form.data.doctor_id} onChange={onDoctorSelect} placeholder="Select doctor" />
                                </div>

                                {/* Collection center */}
                                <div className="md:col-span-2">
                                    <FieldLabel>Collection Center</FieldLabel>
                                    <SearchableSelect options={collectionCenterOptions} value={form.data.collection_center_id} onChange={(v) => form.setData('collection_center_id', v)} placeholder="Select center" />
                                </div>
                            </div>
                        </div>

                        {/* Patient Additional */}
                        <div className="sawtooth bg-white p-5 border-r border-b border-slate-200">
                            <h2 className="mb-1 text-base font-semibold text-slate-800">Patient Additional Information</h2>
                            <p className="mb-4 text-xs text-slate-400">Address, identification & body metrics</p>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <FieldLabel>Pin Code</FieldLabel>
                                    <input className={inputClasses} placeholder="e.g. 110001" value={form.data.patient.pin_code} onChange={(e) => form.setData('patient', { ...form.data.patient, pin_code: e.target.value })} />
                                </div>
                                <div>
                                    <FieldLabel>State</FieldLabel>
                                    <input className={inputClasses} placeholder="e.g. Rajasthan" value={form.data.patient.state} onChange={(e) => form.setData('patient', { ...form.data.patient, state: e.target.value })} />
                                </div>
                                <div>
                                    <FieldLabel>City</FieldLabel>
                                    <input className={inputClasses} placeholder="e.g. Jaipur" value={form.data.patient.city} onChange={(e) => form.setData('patient', { ...form.data.patient, city: e.target.value })} />
                                </div>
                                <div>
                                    <FieldLabel>Landmark</FieldLabel>
                                    <input className={inputClasses} placeholder="Near…" value={form.data.patient.landmark} onChange={(e) => form.setData('patient', { ...form.data.patient, landmark: e.target.value })} />
                                </div>
                                <div className="md:col-span-2">
                                    <FieldLabel>Address</FieldLabel>
                                    <input className={inputClasses} placeholder="Street address" value={form.data.patient.address} onChange={(e) => form.setData('patient', { ...form.data.patient, address: e.target.value })} />
                                </div>
                                <div>
                                    <FieldLabel>Weight (kg)</FieldLabel>
                                    <input className={inputClasses} placeholder="e.g. 65" value={form.data.patient.weight_kg} onChange={(e) => form.setData('patient', { ...form.data.patient, weight_kg: e.target.value })} />
                                </div>
                                <div>
                                    <FieldLabel>Height (cm)</FieldLabel>
                                    <input className={inputClasses} placeholder="e.g. 170" value={form.data.patient.height_cm} onChange={(e) => form.setData('patient', { ...form.data.patient, height_cm: e.target.value })} />
                                </div>
                                <div>
                                    <FieldLabel>UHID / Govt ID</FieldLabel>
                                    <input className={inputClasses} placeholder="ID number" value={form.data.patient.uhid} onChange={(e) => form.setData('patient', { ...form.data.patient, uhid: e.target.value })} />
                                </div>
                                <div>
                                    <FieldLabel>ID Type</FieldLabel>
                                    <input className={inputClasses} placeholder="ABHA / Aadhar" value={form.data.patient.id_type} onChange={(e) => form.setData('patient', { ...form.data.patient, id_type: e.target.value })} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ─── Tests / Packages / Others ─── */}
                    <div className="sawtooth bg-white p-5 border-r border-b border-slate-200">
                        <div className="mb-4 flex items-center gap-1">
                            {form.errors.test_ids && <span className="mr-2 text-xs font-medium text-rose-500">{form.errors.test_ids}</span>}
                            {(['tests', 'packages', 'others'] as const).map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setTab(t)}
                                    className={` px-4 py-2 text-sm font-medium capitalize transition-colors ${
                                        tab === t
                                            ? 'bg-[#147da2] text-white'
                                            : 'bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                                    }`}
                                >
                                    {t}{t === 'tests' ? <span className="ml-0.5 text-rose-500">*</span> : null}
                                </button>
                            ))}
                        </div>

                        {tab === 'tests' && (
                            <div className="grid gap-5 md:grid-cols-2">
                                <div>
                                    <div className="relative mb-3 ">
                                        <Search className="pointer-events-none absolute left-3  top-2.5 h-4 w-4 text-slate-400" />
                                        <input className={`${inputClasses} pl-9`} placeholder="Search tests…" value={testSearch} onChange={(e) => setTestSearch(e.target.value)} />
                                    </div>
                                    <div className="max-h-72 space-y-1 overflow-auto  border border-slate-200 p-2">
                                        {filteredTests.map((test) => (
                                            <button key={test.id} type="button" onClick={() => addTest(test.id)} className="flex w-full items-center justify-between  px-3 py-2 text-left text-sm transition hover:bg-slate-50">
                                                <span className="text-slate-700">{test.name}</span>
                                                <span className="font-semibold text-slate-500">₹{test.price}</span>
                                            </button>
                                        ))}
                                        {filteredTests.length === 0 && (
                                            <p className="py-4 text-center text-sm text-slate-400">No tests found</p>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">Selected Tests ({selectedTests.length})</p>
                                    <div className="max-h-80 space-y-1.5 overflow-auto  border border-slate-200 p-2">
                                        {selectedTests.length === 0 && (
                                            <p className="py-6 text-center text-sm text-slate-400">No tests selected yet</p>
                                        )}
                                        {selectedTests.map((test) => (
                                            <div key={test.id} className="flex items-center justify-between  border border-slate-100 bg-slate-50 px-3 py-2">
                                                <span className="text-sm font-medium text-slate-700">{test.name}</span>
                                                <button type="button" onClick={() => removeTest(test.id)} className="text-xs font-medium text-rose-500 hover:text-rose-700">Remove</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {tab === 'packages' && (
                            <div className="grid gap-5 md:grid-cols-2">
                                <div>
                                    <div className="relative mb-3">
                                        <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                        <input className={`${inputClasses} pl-9`} placeholder="Search packages…" value={packageSearch} onChange={(e) => setPackageSearch(e.target.value)} />
                                    </div>
                                    <div className="max-h-72 space-y-1 overflow-auto  border border-slate-200 p-2">
                                        {filteredPackages.map((pack) => (
                                            <button key={pack.id} type="button" onClick={() => addPackage(pack.id)} className="flex w-full items-center justify-between  px-3 py-2 text-left text-sm transition hover:bg-slate-50">
                                                <span className="text-slate-700">{pack.name}</span>
                                                <span className="font-semibold text-slate-500">₹{pack.price}</span>
                                            </button>
                                        ))}
                                        {filteredPackages.length === 0 && (
                                            <p className="py-4 text-center text-sm text-slate-400">No packages found</p>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">Selected Packages ({selectedPackages.length})</p>
                                    <div className="max-h-80 space-y-1.5 overflow-auto  border border-slate-200 p-2">
                                        {selectedPackages.length === 0 && (
                                            <p className="py-6 text-center text-sm text-slate-400">No packages selected yet</p>
                                        )}
                                        {selectedPackages.map((pack) => (
                                            <button key={pack.id} type="button" onClick={() => form.setData('package_ids', form.data.package_ids.filter((id) => id !== pack.id))} className="flex w-full items-center justify-between  border border-slate-100 bg-slate-50 px-3 py-2 text-left text-sm">
                                                <span className="font-medium text-slate-700">{pack.name}</span>
                                                <span className="font-semibold text-slate-500">₹{pack.price}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {tab === 'others' && (
                            <div className="space-y-4">
                                <div className="grid gap-3 grid-cols-1 xs:grid-cols-[1fr_auto] md:grid-cols-[1fr_140px_auto]">
                                    <input className={inputClasses} placeholder="Charge name" value={newServiceName} onChange={(e) => setNewServiceName(e.target.value)} />
                                    <input type="number" min={0} step="0.01" className={inputClasses} placeholder="Amount" value={newServiceAmount} onChange={(e) => setNewServiceAmount(Number(e.target.value))} />
                                    <button type="button" onClick={() => addCharge()} className="h-9 w-full xs:w-auto  bg-[#147da2] px-4 text-sm font-medium text-white transition hover:bg-[#106385]">+ Add</button>
                                </div>
                                {serviceChargeMasters.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {serviceChargeMasters.map((master) => (
                                            <button key={master.id} type="button" onClick={() => addCharge(master.name, Number(master.amount))} className=" border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50">
                                                {master.name} – ₹{master.amount}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                <div className=" border border-slate-200 p-2">
                                    {form.data.service_other_charges.length === 0 && (
                                        <p className="py-4 text-center text-sm text-slate-400">No additional charges added</p>
                                    )}
                                    {form.data.service_other_charges.map((charge, index) => (
                                        <div key={`${charge.name}-${index}`} className="mb-1 flex items-center justify-between  bg-slate-50 px-3 py-2 text-sm">
                                            <span className="text-slate-700">{charge.name}</span>
                                            <div className="flex items-center gap-3">
                                                <span className="font-semibold text-slate-600">₹{charge.amount.toFixed(2)}</span>
                                                <button type="button" className="text-xs font-medium text-rose-500 hover:text-rose-700" onClick={() => form.setData('service_other_charges', form.data.service_other_charges.filter((_, i) => i !== index))}>×</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ─── Billing & Payment Section ─── */}
                    <div className="sawtooth bg-white border-r border-b border-slate-200">
                        <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-3">
                            <div className="flex items-center gap-3 text-sm">
                                <Badge className="bg-[#147da2] text-white">1</Badge>
                                <span className="font-medium text-slate-700">Billing Info</span>
                                <Separator className="mx-1 flex-1" />
                                <Badge variant="outline">2</Badge>
                                <span className="text-slate-400">Payment</span>
                                <Separator className="mx-1 flex-1" />
                                <Badge variant="outline">3</Badge>
                                <span className="text-slate-400">Bill Generated</span>
                            </div>
                        </div>
                        <div className="p-0">
                            <div className="grid grid-cols-1 lg:grid-cols-2">
                                {/* Left — Billing Info */}
                                <div className="space-y-4 border-b border-slate-200 p-5 lg:border-b-0 lg:border-r">
                                    <h3 className="text-base font-semibold text-slate-800">Billing Information</h3>

                                    <div>
                                        <FieldLabel>Billing Time</FieldLabel>
                                        <div className="relative">
                                            <Input type="datetime-local" value={form.data.billing_at} onChange={(e) => form.setData('billing_at', e.target.value)} />
                                            <CalendarDays className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                                        </div>
                                    </div>

                                    <div>
                                        <FieldLabel>Sample Collected From</FieldLabel>
                                        <div className="grid grid-cols-1 xs:grid-cols-[1fr_auto] gap-2">
                                            <Input list="sample-sources" value={form.data.sample_collected_from} onChange={(e) => form.setData('sample_collected_from', e.target.value)} />
                                            <Button type="button" variant="outline" size="sm" className="h-9 w-full xs:w-auto" onClick={addSampleSource}>+ Add</Button>
                                            <datalist id="sample-sources">{sampleSources.map((source) => <option key={source} value={source} />)}</datalist>
                                        </div>
                                    </div>

                                    <div>
                                        <FieldLabel>Insurance</FieldLabel>
                                        <Input placeholder="Insurance details" value={form.data.insurance_details} onChange={(e) => form.setData('insurance_details', e.target.value)} />
                                    </div>

                                    <div>
                                        <FieldLabel>Service / Other Charges</FieldLabel>
                                        <div className="grid grid-cols-1 xs:grid-cols-[1fr_auto] gap-2">
                                            <SearchableSelect options={serviceChargeOptions} value={selectedServiceMasterId} onChange={setSelectedServiceMasterId} placeholder="Select service charge" />
                                            <Button type="button" variant="outline" size="sm" className="h-9 w-full xs:w-auto" onClick={addSelectedServiceCharge}>+ Add</Button>
                                        </div>
                                    </div>

                                    {form.data.service_other_charges.length > 0 && (
                                        <div>
                                            <FieldLabel>Selected Charges</FieldLabel>
                                            <div className="space-y-1.5  border border-slate-200 p-2">
                                                {form.data.service_other_charges.map((charge, index) => (
                                                    <div key={`${charge.name}-${index}`} className="flex items-center justify-between  bg-slate-50 px-3 py-2 text-sm">
                                                        <span className="text-slate-700">{charge.name}</span>
                                                        <div className="flex items-center gap-3">
                                                            <span className="font-medium text-slate-600">₹{charge.amount.toFixed(2)}</span>
                                                            <Button type="button" size="sm" variant="ghost" className="h-auto px-1 py-0 text-xs text-rose-500 hover:text-rose-700" onClick={() => form.setData('service_other_charges', form.data.service_other_charges.filter((_, i) => i !== index))}>Remove</Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <FieldLabel>Offer</FieldLabel>
                                        <SearchableSelect options={offerOptions} value={form.data.offer} onChange={(v) => form.setData('offer', v)} placeholder="Select offer" />
                                    </div>

                                    <div>
                                        <FieldLabel>Doctor Discount</FieldLabel>
                                        <div className="grid grid-cols-1 xs:grid-cols-[1fr_140px] gap-2">
                                            <Input type="number" min={0} step="0.01" value={form.data.doctor_discount} onChange={(e) => form.setData('doctor_discount', Number(e.target.value))} />
                                            <SearchableSelect options={discountTypeOptions} value={form.data.doctor_discount_type} onChange={(v) => form.setData('doctor_discount_type', v)} />
                                        </div>
                                    </div>

                                    <div>
                                        <FieldLabel>Center Discount</FieldLabel>
                                        <div className="grid grid-cols-1 xs:grid-cols-[1fr_140px] gap-2">
                                            <Input type="number" min={0} step="0.01" value={form.data.center_discount} onChange={(e) => form.setData('center_discount', Number(e.target.value))} />
                                            <SearchableSelect options={discountTypeOptions} value={form.data.center_discount_type} onChange={(v) => form.setData('center_discount_type', v)} />
                                        </div>
                                    </div>

                                    <div>
                                        <FieldLabel>Comment / Clinical Notes</FieldLabel>
                                        <textarea className="min-h-20 w-full  border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20" value={form.data.notes} onChange={(e) => form.setData('notes', e.target.value)} />
                                    </div>

                                    <div>
                                        <div className="mb-1 flex items-center justify-between">
                                            <FieldLabel>Previous Reports</FieldLabel>
                                            <Button type="button" size="sm" variant="outline" className="h-7 text-xs">+ Add</Button>
                                        </div>
                                        <Input value={form.data.previous_reports} onChange={(e) => form.setData('previous_reports', e.target.value)} />
                                    </div>

                                    <div>
                                        <FieldLabel>Agent / Referrer</FieldLabel>
                                        <Input placeholder="Search and select agent…" value={form.data.agent_referrer} onChange={(e) => form.setData('agent_referrer', e.target.value)} />
                                    </div>
                                </div>

                                {/* Right — Payment */}
                                <div className="space-y-4 p-5">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-base font-semibold text-slate-800">Payment Information</h3>
                                        <Badge variant="secondary" className="text-xs">Complete billing first</Badge>
                                    </div>

                                    <Alert variant="destructive">
                                        <AlertTitle>Complete billing information before payment</AlertTitle>
                                        <AlertDescription>At least one test or package must be selected.</AlertDescription>
                                    </Alert>

                                    <div>
                                        <FieldLabel>Payment Amount</FieldLabel>
                                        <div className="grid grid-cols-1 xs:grid-cols-[1fr_auto] gap-2">
                                            <Input type="number" min={0} step="0.01" value={form.data.payment_amount} onChange={(e) => form.setData('payment_amount', Number(e.target.value))} />
                                            <Button type="button" variant="secondary" size="sm" className="h-9 w-full xs:w-auto" onClick={() => form.setData('payment_amount', billTotal)}>Full Payment</Button>
                                        </div>
                                    </div>

                                    {/* Bill summary */}
                                    <div className="space-y-2  border border-slate-200 bg-slate-50/50 p-4 text-sm">
                                        <div className="flex justify-between py-1"><span className="text-slate-500">Test Total</span><span className="font-medium text-slate-700">₹{testTotal.toFixed(2)}</span></div>
                                        <div className="flex justify-between py-1"><span className="text-slate-500">Package Total</span><span className="font-medium text-slate-700">₹{packageTotal.toFixed(2)}</span></div>
                                        <Separator />
                                        <div className="space-y-1 py-1">
                                            <div className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">Service Charges</div>
                                            {form.data.service_other_charges.map((charge, index) => (
                                                <div key={`payment-charge-${index}`} className="flex justify-between text-slate-500">
                                                    <span>• {charge.name}</span>
                                                    <span>₹{charge.amount.toFixed(2)}</span>
                                                </div>
                                            ))}
                                            <div className="flex justify-between text-slate-500">
                                                <span>• E-service Charge (incl. GST)</span>
                                                <span>₹{Number(serviceCharge).toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between font-medium text-slate-700 pt-1">
                                                <span>Total Service Charges</span>
                                                <span>₹{totalServiceCharge.toFixed(2)}</span>
                                            </div>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between py-1 font-medium text-rose-600"><span>Total Discount</span><span>-₹{totalDiscount.toFixed(2)}</span></div>
                                        <Separator />
                                        <div className="flex justify-between py-1 text-base font-semibold text-rose-600"><span>Due</span><span>₹{dueAmount.toFixed(2)}</span></div>
                                        <div className="flex justify-between py-1 text-base font-bold text-slate-800"><span>Bill Total</span><span>₹{billTotal.toFixed(2)}</span></div>
                                    </div>

                                    <div className="max-w-xs">
                                        <FieldLabel>Barcode Qty (Bill Wise)</FieldLabel>
                                        <Input type="number" min={1} max={20} value={form.data.sample_quantity} onChange={(e) => form.setData('sample_quantity', Math.max(1, Math.min(20, Number(e.target.value) || 1)))} />
                                    </div>

                                    <div className="flex flex-wrap items-center gap-5 border-t border-slate-200 pt-4">
                                        <label className="inline-flex items-center gap-2 text-sm text-slate-600">
                                            <Checkbox checked={form.data.urgent} onCheckedChange={(checked) => form.setData('urgent', checked === true)} />
                                            Urgent
                                        </label>
                                        <label className="inline-flex items-center gap-2 text-sm text-slate-600">
                                            <Checkbox checked={form.data.soft_copy_only} onCheckedChange={(checked) => form.setData('soft_copy_only', checked === true)} />
                                            Soft Copy Only
                                        </label>
                                        <label className="inline-flex items-center gap-2 text-sm text-slate-600">
                                            <Checkbox checked={form.data.send_message} onCheckedChange={(checked) => form.setData('send_message', checked === true)} />
                                            Send Message
                                        </label>
                                    </div>

                                    <div className="flex flex-col xs:flex-row justify-end gap-3 border-t border-slate-200 pt-4">
                                        <Button type="submit" disabled={form.processing} className="w-full xs:w-auto bg-[#147da2] hover:bg-[#106385]">Generate Barcode</Button>
                                        <Button type="button" variant="outline" onClick={completeBilling} disabled={completeForm.processing || !generatedBillId} className="w-full xs:w-auto">Complete Billing</Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
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
                        <Button type="button" onClick={saveNewDoctor} className="bg-[#147da2] hover:bg-[#106385]">Save Doctor</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
