import { Head, useForm, router } from '@inertiajs/react';
import {
    Building2,
    MapPin,
    CreditCard,
    Calendar,
    Scale,
    Stethoscope,
    Upload,
    Eye,
    EyeOff,
    Pencil,
    X,
    Check,
} from 'lucide-react';
import { useRef, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

type LabConfig = {
    id: number;
    name: string;
    code: string;
    phone: string | null;
    logo_path: string | null;
    logo_url: string | null;
    email: string | null;
    website: string | null;
    established_year: number | null;
    address: string | null;
    city: string | null;
    state: string | null;
    pincode: string | null;
    nearest_location: string | null;
    payment_receive_account: string;
    upi_qr_code_path: string | null;
    upi_qr_code_url: string | null;
    online_booking_available: boolean;
    home_sample_collection: boolean;
    gst_number: string | null;
    lab_license_number: string | null;
    lab_director_name: string | null;
    technician_name: string | null;
    technician_qualification: string | null;
    technician_license_number: string | null;
    technician_signature_path: string | null;
    technician_signature_url: string | null;
};

type Props = {
    lab: LabConfig | null;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Settings', href: '#' },
    { title: 'Lab Configuration', href: '/lab/configuration' },
];

/* ─── Section wrapper with icon ─── */
function ConfigSection({
    icon: Icon,
    title,
    children,
    color = 'bg-[#147da2]',
}: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    children: React.ReactNode;
    color?: string;
}) {
    return (
        <div className="bg-white border border-slate-200 overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <div className={cn('h-8 w-8 flex items-center justify-center text-white', color)}>
                    <Icon className="h-4 w-4" />
                </div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">{title}</h2>
            </div>
            <div className="p-6">{children}</div>
        </div>
    );
}

/* ─── Field wrapper ─── */
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {label}
                {required && <span className="ml-0.5 text-rose-500">*</span>}
            </Label>
            {children}
        </div>
    );
}

/* ─── Toggle ─── */
function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
    return (
        <div className="flex flex-col items-start gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
            <button
                type="button"
                onClick={() => onChange(!checked)}
                className={cn(
                    'relative h-6 w-11 rounded-full transition-colors duration-200',
                    checked ? 'bg-[#147da2]' : 'bg-slate-200'
                )}
            >
                <span
                    className={cn(
                        'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200',
                        checked && 'translate-x-5'
                    )}
                />
            </button>
            <span className={cn('text-[11px] font-bold uppercase tracking-wider', checked ? 'text-[#147da2]' : 'text-slate-400')}>
                {checked ? 'Enabled' : 'Disabled'}
            </span>
        </div>
    );
}

export default function LabConfiguration({ lab }: Props) {
    const [isEditing, setIsEditing] = useState(false);
    const [showGst, setShowGst] = useState(false);
    const logoInputRef = useRef<HTMLInputElement>(null);
    const qrInputRef = useRef<HTMLInputElement>(null);
    const signatureInputRef = useRef<HTMLInputElement>(null);

    // File previews
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [qrPreview, setQrPreview] = useState<string | null>(null);
    const [signaturePreview, setSignaturePreview] = useState<string | null>(null);

    const form = useForm({
        name: lab?.name ?? '',
        phone: lab?.phone ?? '',
        email: lab?.email ?? '',
        website: lab?.website ?? '',
        established_year: lab?.established_year ?? '',
        address: lab?.address ?? '',
        city: lab?.city ?? '',
        state: lab?.state ?? '',
        pincode: lab?.pincode ?? '',
        nearest_location: lab?.nearest_location ?? '',
        payment_receive_account: lab?.payment_receive_account ?? 'cash',
        online_booking_available: lab?.online_booking_available ?? false,
        home_sample_collection: lab?.home_sample_collection ?? false,
        gst_number: lab?.gst_number ?? '',
        lab_license_number: lab?.lab_license_number ?? '',
        lab_director_name: lab?.lab_director_name ?? '',
        technician_name: lab?.technician_name ?? '',
        technician_qualification: lab?.technician_qualification ?? '',
        technician_license_number: lab?.technician_license_number ?? '',
        logo: null as File | null,
        upi_qr_code: null as File | null,
        technician_signature: null as File | null,
    });

    const handleFileChange = (
        field: 'logo' | 'upi_qr_code' | 'technician_signature',
        setPreview: (v: string | null) => void,
    ) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setData(field, file);
            const reader = new FileReader();
            reader.onload = (ev) => setPreview(ev.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/lab/configuration', {
            forceFormData: true,
            onSuccess: () => {
                setIsEditing(false);
                setLogoPreview(null);
                setQrPreview(null);
                setSignaturePreview(null);
            },
        });
    };

    const inputCls = 'h-10 border-slate-200 bg-white text-sm shadow-sm focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20';
    const readonlyCls = 'h-10 border-slate-200 bg-slate-50 text-sm text-slate-600 cursor-default';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Lab Configuration" />

            <div className="flex h-full flex-1 flex-col bg-slate-50/50">
                {/* Page Header */}
                <div className="bg-white border-b border-slate-200 px-6 py-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-[#147da2]/10 flex items-center justify-center text-[#147da2]">
                            <Building2 className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Lab Configuration</h1>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Manage your laboratory's profile and settings</p>
                        </div>
                    </div>

                    {!isEditing ? (
                        <Button
                            type="button"
                            className="h-10 px-6 bg-[#147da2] hover:bg-[#106385] text-white font-bold text-xs uppercase tracking-wider shadow-sm"
                            onClick={() => setIsEditing(true)}
                        >
                            <Pencil className="h-3.5 w-3.5 mr-2" />
                            Edit Configuration
                        </Button>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="h-10 px-5 text-xs font-bold uppercase tracking-wider"
                                onClick={() => {
                                    setIsEditing(false);
                                    form.reset();
                                    setLogoPreview(null);
                                    setQrPreview(null);
                                    setSignaturePreview(null);
                                }}
                            >
                                <X className="h-3.5 w-3.5 mr-1.5" />
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                form="lab-config-form"
                                className="h-10 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm"
                                disabled={form.processing}
                            >
                                <Check className="h-3.5 w-3.5 mr-1.5" />
                                Save Changes
                            </Button>
                        </div>
                    )}
                </div>

                {/* Form Content */}
                <form id="lab-config-form" onSubmit={submit} className="p-6 space-y-6">
                    {/* ─── 1. Basic Information ─── */}
                    <ConfigSection icon={Building2} title="Basic Information">
                        <div className="space-y-6">
                            {/* Logo */}
                            <div className="flex items-start gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Lab Logo</Label>
                                    <div className="h-20 p-3 w-20 border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
                                        {(logoPreview || lab?.logo_url) ? (
                                            <img
                                                src={logoPreview || lab?.logo_url || ''}
                                                alt="Lab Logo"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <Upload className="h-6 w-6 text-slate-300" />
                                        )}
                                    </div>
                                    {isEditing && (
                                        <>
                                            <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange('logo', setLogoPreview)} />
                                            <Button type="button" variant="outline" size="sm" className="text-xs" onClick={() => logoInputRef.current?.click()}>
                                                Change Logo
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Fields Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <Field label="Laboratory Name" required>
                                    <Input
                                        value={form.data.name}
                                        onChange={(e) => form.setData('name', e.target.value)}
                                        className={isEditing ? inputCls : readonlyCls}
                                        readOnly={!isEditing}
                                    />
                                    {form.errors.name && <p className="text-xs text-rose-500 mt-1">{form.errors.name}</p>}
                                </Field>

                                <Field label="Email Address" required>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                                        </span>
                                        <Input
                                            type="email"
                                            value={form.data.email}
                                            onChange={(e) => form.setData('email', e.target.value)}
                                            className={cn(isEditing ? inputCls : readonlyCls, 'pl-9')}
                                            readOnly={!isEditing}
                                        />
                                    </div>
                                </Field>

                                <Field label="Phone Number" required>
                                    <Input
                                        type="tel"
                                        value={form.data.phone}
                                        onChange={(e) => form.setData('phone', e.target.value)}
                                        className={isEditing ? inputCls : readonlyCls}
                                        readOnly={!isEditing}
                                    />
                                </Field>

                                <Field label="Website">
                                    <Input
                                        value={form.data.website}
                                        onChange={(e) => form.setData('website', e.target.value)}
                                        className={isEditing ? inputCls : readonlyCls}
                                        readOnly={!isEditing}
                                        placeholder="https://www.example.com"
                                    />
                                </Field>

                                <Field label="Established Year">
                                    <Input
                                        type="number"
                                        min={1900}
                                        max={new Date().getFullYear()}
                                        value={form.data.established_year}
                                        onChange={(e) => form.setData('established_year', e.target.value)}
                                        className={isEditing ? inputCls : readonlyCls}
                                        readOnly={!isEditing}
                                    />
                                </Field>
                            </div>
                        </div>
                    </ConfigSection>

                    {/* ─── 2. Address Information ─── */}
                    <ConfigSection icon={MapPin} title="Address Information" color="bg-amber-500">
                        <div className="space-y-5">
                            <Field label="Complete Address" required>
                                <textarea
                                    value={form.data.address}
                                    onChange={(e) => form.setData('address', e.target.value)}
                                    className={cn(
                                        'min-h-20 w-full border px-4 py-3 text-sm outline-none transition',
                                        isEditing
                                            ? 'border-slate-200 bg-white shadow-sm focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20'
                                            : 'border-slate-200 bg-slate-50 text-slate-600 cursor-default'
                                    )}
                                    readOnly={!isEditing}
                                />
                            </Field>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <Field label="City" required>
                                    <Input
                                        value={form.data.city}
                                        onChange={(e) => form.setData('city', e.target.value)}
                                        className={isEditing ? inputCls : readonlyCls}
                                        readOnly={!isEditing}
                                    />
                                </Field>

                                <Field label="State" required>
                                    <Input
                                        value={form.data.state}
                                        onChange={(e) => form.setData('state', e.target.value)}
                                        className={isEditing ? inputCls : readonlyCls}
                                        readOnly={!isEditing}
                                    />
                                </Field>

                                <Field label="Pincode" required>
                                    <Input
                                        value={form.data.pincode}
                                        onChange={(e) => form.setData('pincode', e.target.value)}
                                        className={isEditing ? inputCls : readonlyCls}
                                        readOnly={!isEditing}
                                        maxLength={10}
                                    />
                                </Field>

                                <Field label="Nearest Location">
                                    <Input
                                        value={form.data.nearest_location}
                                        onChange={(e) => form.setData('nearest_location', e.target.value)}
                                        className={isEditing ? inputCls : readonlyCls}
                                        readOnly={!isEditing}
                                    />
                                </Field>
                            </div>
                        </div>
                    </ConfigSection>

                    {/* ─── 3. Payment Information ─── */}
                    <ConfigSection icon={CreditCard} title="Payment Information" color="bg-green-600">
                        <div className="space-y-6">
                            <div>
                                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 block">Payment Receive Account</Label>
                                <div className="flex items-center gap-4">
                                    {(['cash', 'direct'] as const).map((option) => (
                                        <label
                                            key={option}
                                            className={cn(
                                                'flex items-center gap-2 cursor-pointer px-4 py-2 border text-sm font-semibold transition',
                                                form.data.payment_receive_account === option
                                                    ? 'border-[#147da2] bg-[#147da2]/5 text-[#147da2]'
                                                    : 'border-slate-200 text-slate-500 hover:border-slate-300',
                                                !isEditing && 'pointer-events-none'
                                            )}
                                        >
                                            <input
                                                type="radio"
                                                name="payment_receive_account"
                                                value={option}
                                                checked={form.data.payment_receive_account === option}
                                                onChange={(e) => form.setData('payment_receive_account', e.target.value)}
                                                className="accent-[#147da2]"
                                                disabled={!isEditing}
                                            />
                                            {option === 'cash' ? 'Cash' : 'Direct'}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">UPI QR Code</Label>
                                <div className="h-36 w-36 border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
                                    {(qrPreview || lab?.upi_qr_code_url) ? (
                                        <img
                                            src={qrPreview || lab?.upi_qr_code_url || ''}
                                            alt="UPI QR Code"
                                            className="h-full w-full object-contain p-2"
                                        />
                                    ) : (
                                        <div className="text-center p-4">
                                            <CreditCard className="h-6 w-6 text-slate-300 mx-auto" />
                                            <span className="text-[10px] text-slate-400 mt-1 block">No QR</span>
                                        </div>
                                    )}
                                </div>
                                {isEditing && (
                                    <>
                                        <input ref={qrInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange('upi_qr_code', setQrPreview)} />
                                        <Button type="button" variant="outline" size="sm" className="text-xs" onClick={() => qrInputRef.current?.click()}>
                                            Upload QR Code
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </ConfigSection>

                    {/* ─── 4. Booking Information ─── */}
                    <ConfigSection icon={Calendar} title="Booking Information" color="bg-violet-600">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <Toggle
                                label="Online Booking Available"
                                checked={form.data.online_booking_available}
                                onChange={(v) => isEditing && form.setData('online_booking_available', v)}
                            />
                            <Toggle
                                label="Home Sample Collection Facility"
                                checked={form.data.home_sample_collection}
                                onChange={(v) => isEditing && form.setData('home_sample_collection', v)}
                            />
                        </div>
                    </ConfigSection>

                    {/* ─── 5. Legal Information ─── */}
                    <ConfigSection icon={Scale} title="Legal Information" color="bg-slate-700">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <Field label="GST Number">
                                <div className="relative">
                                    <Input
                                        type={showGst ? 'text' : 'password'}
                                        value={form.data.gst_number}
                                        onChange={(e) => form.setData('gst_number', e.target.value)}
                                        className={cn(isEditing ? inputCls : readonlyCls, 'pr-10')}
                                        readOnly={!isEditing}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                                        onClick={() => setShowGst(!showGst)}
                                    >
                                        {showGst ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </Field>

                            <Field label="Lab License Number" required>
                                <Input
                                    value={form.data.lab_license_number}
                                    onChange={(e) => form.setData('lab_license_number', e.target.value)}
                                    className={isEditing ? inputCls : readonlyCls}
                                    readOnly={!isEditing}
                                />
                            </Field>

                            <Field label="Lab Director Name" required>
                                <Input
                                    value={form.data.lab_director_name}
                                    onChange={(e) => form.setData('lab_director_name', e.target.value)}
                                    className={isEditing ? inputCls : readonlyCls}
                                    readOnly={!isEditing}
                                />
                            </Field>
                        </div>
                    </ConfigSection>

                    {/* ─── 6. Technician Information ─── */}
                    <ConfigSection icon={Stethoscope} title="Technician Information" color="bg-rose-600">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <Field label="Lab Technician Name" required>
                                <Input
                                    value={form.data.technician_name}
                                    onChange={(e) => form.setData('technician_name', e.target.value)}
                                    className={isEditing ? inputCls : readonlyCls}
                                    readOnly={!isEditing}
                                />
                            </Field>

                            <Field label="Qualification" required>
                                <Input
                                    value={form.data.technician_qualification}
                                    onChange={(e) => form.setData('technician_qualification', e.target.value)}
                                    className={isEditing ? inputCls : readonlyCls}
                                    readOnly={!isEditing}
                                />
                            </Field>

                            <Field label="Technician License Number">
                                <Input
                                    value={form.data.technician_license_number}
                                    onChange={(e) => form.setData('technician_license_number', e.target.value)}
                                    className={isEditing ? inputCls : readonlyCls}
                                    readOnly={!isEditing}
                                />
                            </Field>

                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Technician Signature <span className="text-rose-500">*</span>
                                </Label>
                                <div className="h-28 w-full max-w-xs border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
                                    {(signaturePreview || lab?.technician_signature_url) ? (
                                        <img
                                            src={signaturePreview || lab?.technician_signature_url || ''}
                                            alt="Technician Signature"
                                            className="max-h-full max-w-full object-contain p-2"
                                        />
                                    ) : (
                                        <div className="text-center">
                                            <Upload className="h-6 w-6 text-slate-300 mx-auto" />
                                            <span className="text-[10px] text-slate-400 mt-1 block">Upload Signature</span>
                                        </div>
                                    )}
                                </div>
                                {isEditing && (
                                    <>
                                        <input ref={signatureInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange('technician_signature', setSignaturePreview)} />
                                        <Button type="button" variant="outline" size="sm" className="text-xs" onClick={() => signatureInputRef.current?.click()}>
                                            Upload Signature
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </ConfigSection>
                </form>
            </div>
        </AppLayout>
    );
}
