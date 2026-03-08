import { Head, useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

type StaffMember = {
    id: number;
    name: string;
    email: string;
    is_approver: boolean;
    qualification: string | null;
    signature_url: string | null;
    roles: string[];
};

type Props = {
    staff: StaffMember[];
};

export default function StaffIndex({ staff }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Configuration', href: '/lab/configuration' },
        { title: 'Lab Staff & Approvers', href: '/lab/staff' },
    ];

    const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Lab Staff & Approvers" />

            <div className="min-h-full bg-slate-50/80 p-0">
                <div className="sawtooth border-b border-slate-200 bg-white p-6">
                    <h1 className="text-lg font-semibold text-slate-800">Lab Staff & Approvers</h1>
                    <p className="mt-1 text-sm text-slate-500">Manage internal lab staff and designate who can approve test reports.</p>
                </div>

                <div className="sawtooth mt-4 border-y border-0 border-slate-200 bg-white p-4">
                    <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
                        <table className="w-full text-left min-w-[700px]">
                            <thead className="border-b border-slate-200 bg-slate-50/70 text-sm font-semibold text-slate-700">
                                <tr>
                                    <th className="px-3 py-3">User</th>
                                    <th className="px-3 py-3">Role</th>
                                    <th className="px-3 py-3">Approver Status</th>
                                    <th className="px-3 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {staff.map((member) => (
                                    <tr key={member.id} className="border-b border-slate-100 text-sm text-slate-700">
                                        <td className="px-3 py-3">
                                            <p className="font-semibold text-slate-800">{member.name}</p>
                                            <p className="text-xs text-slate-500">{member.email}</p>
                                        </td>
                                        <td className="px-3 py-3">
                                            <div className="flex flex-wrap gap-1">
                                                {member.roles.map((role) => (
                                                    <span key={role} className="inline-flex rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                                                        {role}
                                                    </span>
                                                ))}
                                                {member.roles.length === 0 && <span className="text-slate-400 text-xs italic">No roles assigned</span>}
                                            </div>
                                        </td>
                                        <td className="px-3 py-3">
                                            {member.is_approver ? (
                                                <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-xs bg-emerald-50 px-2 py-1 inline-flex rounded border border-emerald-200">
                                                    <span>✓</span> Approver
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 text-xs italic">Staff</span>
                                            )}
                                        </td>
                                        <td className="px-3 py-3 text-right">
                                            <button 
                                                onClick={() => setEditingStaff(member)}
                                                className="inline-flex h-8 items-center border border-slate-200 bg-white px-3 text-xs font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors"
                                            >
                                                Configure Approver
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {editingStaff && (
                <ApproverModal 
                    member={editingStaff} 
                    onClose={() => setEditingStaff(null)} 
                />
            )}
        </AppLayout>
    );
}

function ApproverModal({ member, onClose }: { member: StaffMember, onClose: () => void }) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(member.signature_url);

    const form = useForm({
        is_approver: member.is_approver,
        qualification: member.qualification ?? '',
        signature: null as File | null,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(`/lab/staff/${member.id}`, {
            onSuccess: () => {
                onClose();
            },
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setData('signature', file);
            const reader = new FileReader();
            reader.onload = (ev) => setPreview(ev.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
            <div className="w-full max-w-md bg-white shadow-xl flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-800">Configure Staff Member</h2>
                        <p className="text-xs text-slate-500 mt-0.5">{member.name} ({member.email})</p>
                    </div>
                    <button onClick={onClose} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="overflow-y-auto p-5">
                    <form id="approver-form" onSubmit={submit} className="space-y-4">
                        <label className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/50 transition">
                            <input 
                                type="checkbox" 
                                className="mt-1 h-4 w-4 rounded border-slate-300 text-[#147da2] focus:ring-[#147da2]"
                                checked={form.data.is_approver}
                                onChange={(e) => form.setData('is_approver', e.target.checked)}
                            />
                            <div>
                                <span className="block text-sm font-semibold text-slate-800">Has Report Approval Access?</span>
                                <span className="block text-xs text-slate-500 mt-0.5">Allow this user to verify and approve lab test results. Their signature will be printed on the final PDF report.</span>
                            </div>
                        </label>

                        {form.data.is_approver && (
                            <div className="space-y-4 border-t border-slate-100 pt-4 mt-4">
                                <div>
                                    <label className="mb-1 block text-sm font-semibold text-slate-700">Digital Signature</label>
                                    <div className="h-28 w-full border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:bg-slate-50 transition" onClick={() => fileInputRef.current?.click()}>
                                        {preview ? (
                                            <img src={preview} alt="Signature Preview" className="max-h-full max-w-full object-contain p-2" />
                                        ) : (
                                            <div className="text-center">
                                                <Upload className="h-6 w-6 text-slate-400 mx-auto" />
                                                <span className="text-[10px] text-slate-500 mt-1 block font-medium uppercase tracking-wider">Upload PNG/JPG</span>
                                            </div>
                                        )}
                                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                    </div>
                                    <p className="mt-1.5 text-[11px] text-slate-500">This signature will appear at the bottom right of the patient report next to the qualification.</p>
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-semibold text-slate-700">Qualification & Designation</label>
                                    <input 
                                        type="text"
                                        className="h-10 w-full border border-slate-200 px-3 text-sm outline-none transition focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20"
                                        placeholder="e.g. MBBS, MD Pathology"
                                        value={form.data.qualification}
                                        onChange={(e) => form.setData('qualification', e.target.value)}
                                        required={form.data.is_approver}
                                    />
                                    <p className="mt-1.5 text-[11px] text-slate-500">Printed below the approver's name.</p>
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 flex justify-end gap-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition">
                        Cancel
                    </button>
                    <button type="submit" form="approver-form" disabled={form.processing} className="bg-[#147da2] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#106385] disabled:opacity-50">
                        {form.processing ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}
