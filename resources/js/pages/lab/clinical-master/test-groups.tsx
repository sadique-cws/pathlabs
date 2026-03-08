import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Edit2, Plus, Search, Trash2, Lock } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Pagination } from '@/components/pagination';
import type { BreadcrumbItem } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type TestGroupRow = {
    id: number;
    name: string;
    is_system: boolean;
    is_active: boolean;
    created_at: string;
    can_edit: boolean;
};

type PaginationData = {
    current_page: number;
    last_page: number;
    total: number;
};

type Props = {
    testGroups: TestGroupRow[];
    pagination: PaginationData;
    filters: { search: string };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Clinical Master', href: '/lab/clinical-master/test-groups' },
    { title: 'Manage Test Groups', href: '/lab/clinical-master/test-groups' },
];

export default function ManageTestGroups({ testGroups, pagination, filters }: Props) {
    const page = usePage();
    const flash = page.props.flash as { success?: string; error?: string };
    
    const [search, setSearch] = useState(filters.search || '');
    const [isFilterChanged, setIsFilterChanged] = useState(false);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<TestGroupRow | null>(null);

    const form = useForm({
        name: '',
        is_active: true,
    });

    useEffect(() => {
        if (isFilterChanged) {
            const delayDebounceFn = setTimeout(() => {
                applyFilters();
            }, 300);
            return () => clearTimeout(delayDebounceFn);
        }
    }, [search]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setIsFilterChanged(true);
    };

    const applyFilters = () => {
        router.get(
            '/lab/clinical-master/test-groups',
            { search },
            { preserveState: true, replace: true }
        );
        setIsFilterChanged(false);
    };

    const openModal = (group: TestGroupRow | null = null) => {
        setEditingGroup(group);
        if (group) {
            form.setData({
                name: group.name,
                is_active: group.is_active,
            });
        } else {
            form.reset();
        }
        form.clearErrors();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingGroup(null);
        form.reset();
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        
        if (editingGroup) {
            form.put(`/lab/clinical-master/test-groups/${editingGroup.id}`, {
                onSuccess: () => closeModal(),
            });
        } else {
            form.post('/lab/clinical-master/test-groups', {
                onSuccess: () => closeModal(),
            });
        }
    };

    const deleteGroup = (group: TestGroupRow) => {
        if (confirm(`Are you sure you want to delete test group: ${group.name}?`)) {
            router.delete(`/lab/clinical-master/test-groups/${group.id}`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Test Groups" />

            <div className="min-h-full bg-slate-50/80 p-0">
                {flash?.success && (
                    <div className="mb-0 sawtooth border-b border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="mb-0 sawtooth border-b border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        {flash.error}
                    </div>
                )}
                {Object.keys(page.props.errors || {}).length > 0 && (
                    <div className="mb-0 sawtooth border-b border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        {Object.values(page.props.errors)[0]}
                    </div>
                )}

                <div className="sawtooth border-b border-slate-200 bg-white">
                    <div className="p-4 border-b border-slate-100">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search test groups..."
                                    className="h-9 w-full border border-slate-200 pl-9 pr-3 text-sm outline-none transition focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20"
                                    value={search}
                                    onChange={handleSearchChange}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => openModal()}
                                className="flex items-center gap-1.5 bg-[#147da2] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#106385]"
                            >
                                <Plus className="h-4 w-4" />
                                Add Test Group
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className="border-b border-slate-200 bg-slate-50/80 uppercase tracking-wide text-slate-500">
                                <tr>
                                    <th className="px-4 py-3 font-semibold w-16 text-center">ID</th>
                                    <th className="px-4 py-3 font-semibold">Name</th>
                                    <th className="px-4 py-3 font-semibold text-center">Status</th>
                                    <th className="px-4 py-3 font-semibold text-center">System</th>
                                    <th className="px-4 py-3 font-semibold w-40">Created Date</th>
                                    <th className="w-[100px] px-4 py-3 text-right font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {testGroups.length > 0 ? (
                                    testGroups.map((g) => (
                                        <tr key={g.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                                            <td className="px-4 py-3 text-center text-slate-500 text-xs">{g.id}</td>
                                            <td className="px-4 py-3 font-medium text-slate-700">{g.name}</td>
                                            <td className="px-4 py-3 text-center">
                                                {g.is_active ? (
                                                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                                                        Inactive
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {g.is_system ? (
                                                    <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-blue-600 border border-blue-100">
                                                        <Lock className="h-2.5 w-2.5" />
                                                        System
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-600 border border-slate-200">
                                                        Lab
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-slate-500 text-sm whitespace-nowrap">
                                                {g.created_at}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {g.can_edit ? (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => openModal(g)}
                                                                className="text-slate-400 hover:text-[#147da2]"
                                                                title="Edit Group"
                                                            >
                                                                <Edit2 className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => deleteGroup(g)}
                                                                className="text-slate-400 hover:text-red-500"
                                                                title="Delete Group"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <div title="System records cannot be edited">
                                                            <Lock className="h-4 w-4 text-slate-300" />
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                                            No test groups found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {pagination.total > 50 && (
                        <Pagination
                            totalItems={pagination.total}
                            pageSize={50}
                            currentPage={pagination.current_page}
                            onPageChange={(p) =>
                                router.get('/lab/clinical-master/test-groups', { page: p, search }, { preserveState: true })
                            }
                            from={(pagination.current_page - 1) * 50 + 1}
                            to={Math.min(pagination.current_page * 50, pagination.total)}
                        />
                    )}
                </div>
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{editingGroup ? 'Edit Test Group' : 'Add Test Group'}</DialogTitle>
                    </DialogHeader>
                    
                    <form onSubmit={submit} className="flex flex-col gap-4 mt-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-slate-700">Group Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                className="h-9 w-full border border-slate-200 px-3 py-1.5 text-sm outline-none transition focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20"
                                value={form.data.name}
                                onChange={(e) => form.setData('name', e.target.value)}
                                required
                            />
                            {form.errors.name && <p className="text-xs text-red-500">{form.errors.name}</p>}
                        </div>

                        {editingGroup && !editingGroup.is_system && (
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-semibold text-slate-700">Status</label>
                                <select
                                    className="h-9 w-full border border-slate-200 px-3 py-1.5 text-sm outline-none transition focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20"
                                    value={form.data.is_active ? '1' : '0'}
                                    onChange={(e) => form.setData('is_active', e.target.value === '1')}
                                >
                                    <option value="1">Active</option>
                                    <option value="0">Inactive</option>
                                </select>
                            </div>
                        )}

                        <div className="mt-2 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={form.processing}
                                className="bg-[#147da2] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#106385] disabled:opacity-50"
                            >
                                {editingGroup ? 'Save Changes' : 'Add Test Group'}
                            </button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
