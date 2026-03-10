import { Head, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

type Leave = {
    id: number;
    leave_date: string;
    reason: string | null;
};

type Props = {
    leaves: Leave[];
};

export default function DoctorLeaves({ leaves }: Props) {
    const page = usePage();
    const flash = page.props.flash as { success?: string };

    const leaveForm = useForm({
        leave_date: '',
        reason: '',
    });

    return (
        <AppLayout>
            <Head title="Doctor Leaves" />
            <div className="min-h-full bg-white p-4">
                {flash?.success && <div className="mb-3 border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{flash.success}</div>}

                <h1 className="text-3xl font-semibold text-slate-900">Leave Management</h1>
                <p className="mt-1 text-sm text-slate-600">Add leave dates and manage your availability.</p>

                <form className="mt-4 grid gap-3 border border-slate-200 p-4 md:grid-cols-3" onSubmit={(event) => { event.preventDefault(); leaveForm.post('/doctor/leaves'); }}>
                    <input type="date" className="border border-slate-200 px-2 py-2 text-sm" value={leaveForm.data.leave_date} onChange={(event) => leaveForm.setData('leave_date', event.target.value)} />
                    <input className="border border-slate-200 px-2 py-2 text-sm" placeholder="Reason" value={leaveForm.data.reason} onChange={(event) => leaveForm.setData('reason', event.target.value)} />
                    <button className="bg-[#147da2] px-3 py-2 text-sm font-semibold text-white" type="submit">Add Leave</button>
                </form>

                <div className="mt-4 border border-slate-200">
                    <table className="w-full text-left">
                        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                            <tr>
                                <th className="px-3 py-2">Leave Date</th>
                                <th className="px-3 py-2">Reason</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaves.map((leave) => (
                                <tr key={leave.id} className="border-b border-slate-100 text-sm">
                                    <td className="px-3 py-2">{leave.leave_date}</td>
                                    <td className="px-3 py-2">{leave.reason ?? '-'}</td>
                                </tr>
                            ))}
                            {leaves.length === 0 && (
                                <tr>
                                    <td colSpan={2} className="px-3 py-8 text-center text-sm text-slate-500">No leave entries found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
