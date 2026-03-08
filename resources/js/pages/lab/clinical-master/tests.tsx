import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Edit2, Plus, Search, Trash2, Lock } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Pagination } from '@/components/pagination';
import type { BreadcrumbItem } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

type TestRow = {
    id: number;
    name: string;
    code: string;
    sample_type: string;
    department: string;
    price: number;
    is_system: boolean;
    is_active: boolean;
    can_edit: boolean;
};

type PaginationData = {
    current_page: number;
    last_page: number;
    total: number;
};

type Props = {
    tests: TestRow[];
    pagination: PaginationData;
    filters: { search: string };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Clinical Master', href: '/lab/clinical-master/tests' },
    { title: 'Manage Tests', href: '/lab/clinical-master/tests' },
];

export default function ManageTests({ tests, pagination, filters }: Props) {
    const page = usePage();
    const flash = page.props.flash as { success?: string };
    
    const [search, setSearch] = useState(filters.search || '');
    const [isFilterChanged, setIsFilterChanged] = useState(false);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTest, setEditingTest] = useState<TestRow | null>(null);

    const form = useForm({
        name: '',
        code: '',
        sample_type: '',
        department: '',
        price: 0,
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
            '/lab/clinical-master/tests',
            { search },
            { preserveState: true, replace: true }
        );
        setIsFilterChanged(false);
    };

    const openModal = (test: TestRow | null = null) => {
        setEditingTest(test);
        if (test) {
            form.setData({
                name: test.name,
                code: test.code,
                sample_type: test.sample_type === '-' ? '' : test.sample_type,
                department: test.department === '-' ? '' : test.department,
                price: test.price,
            });
        } else {
            form.reset();
        }
        form.clearErrors();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingTest(null);
        form.reset();
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        
        if (editingTest) {
            form.put(`/lab/clinical-master/tests/${editingTest.id}`, {
                onSuccess: () => closeModal(),
            });
        } else {
            form.post('/lab/clinical-master/tests', {
                onSuccess: () => closeModal(),
            });
        }
    };

    const deleteTest = (test: TestRow) => {
        if (confirm(`Are you sure you want to delete test: ${test.name}?`)) {
            router.delete(`/lab/clinical-master/tests/${test.id}`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Tests" />

            <div className="min-h-full bg-slate-50/80 p-0">
                {flash?.success && (
                    <div className="mb-0 sawtooth border-b border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                        {flash.success}
                    </div>
                )}

                <div className="sawtooth border-b border-slate-200 bg-white">
                    <div className="p-4 border-b border-slate-100">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search tests..."
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
                                Add Test
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className="border-b border-slate-200 bg-slate-50/80 uppercase tracking-wide text-slate-500">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Test Name</th>
                                    <th className="px-4 py-3 font-semibold">Code</th>
                                    <th className="px-4 py-3 font-semibold">Department</th>
                                    <th className="px-4 py-3 font-semibold">Sample</th>
                                    <th className="px-4 py-3 font-semibold">Price</th>
                                    <th className="px-4 py-3 font-semibold">Type</th>
                                    <th className="w-[100px] px-4 py-3 text-right font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tests.length > 0 ? (
                                    tests.map((t) => (
                                        <tr key={t.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                                            <td className="px-4 py-3 font-medium text-slate-700">{t.name}</td>
                                            <td className="px-4 py-3 text-slate-600 font-mono text-xs">{t.code}</td>
                                            <td className="px-4 py-3 text-slate-600">{t.department}</td>
                                            <td className="px-4 py-3 text-slate-600">{t.sample_type}</td>
                                            <td className="px-4 py-3 text-slate-700 font-semibold">₹{t.price}</td>
                                            <td className="px-4 py-3">
                                                {t.is_system ? (
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
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {t.can_edit ? (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => openModal(t)}
                                                                className="text-slate-400 hover:text-[#147da2]"
                                                                title="Edit test"
                                                            >
                                                                <Edit2 className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => deleteTest(t)}
                                                                className="text-slate-400 hover:text-red-500"
                                                                title="Delete test"
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
                                        <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                                            No tests found.
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
                                router.get('/lab/clinical-master/tests', { page: p, search }, { preserveState: true })
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
                        <DialogTitle>{editingTest ? 'Edit Test' : 'Add Test'}</DialogTitle>
                    </DialogHeader>
                    
                    <form onSubmit={submit} className="flex flex-col gap-4 mt-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-slate-700">Test Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                className="h-9 w-full border border-slate-200 px-3 py-1.5 text-sm outline-none transition focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20"
                                value={form.data.name}
                                onChange={(e) => form.setData('name', e.target.value)}
                                required
                            />
                            {form.errors.name && <p className="text-xs text-red-500">{form.errors.name}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-slate-700">Test Code <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    className="h-9 w-full border border-slate-200 px-3 py-1.5 text-sm outline-none transition focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20"
                                    value={form.data.code}
                                    onChange={(e) => form.setData('code', e.target.value)}
                                    required
                                />
                                {form.errors.code && <p className="text-xs text-red-500">{form.errors.code}</p>}
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-slate-700">Price (₹) <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    className="h-9 w-full border border-slate-200 px-3 py-1.5 text-sm outline-none transition focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20"
                                    value={form.data.price}
                                    onChange={(e) => form.setData('price', parseFloat(e.target.value))}
                                    required
                                />
                                {form.errors.price && <p className="text-xs text-red-500">{form.errors.price}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-slate-700">Department</label>
                                <input
                                    type="text"
                                    className="h-9 w-full border border-slate-200 px-3 py-1.5 text-sm outline-none transition focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20"
                                    value={form.data.department}
                                    placeholder="e.g. Hematology"
                                    onChange={(e) => form.setData('department', e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-slate-700">Sample Type</label>
                                <input
                                    type="text"
                                    className="h-9 w-full border border-slate-200 px-3 py-1.5 text-sm outline-none transition focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20"
                                    value={form.data.sample_type}
                                    placeholder="e.g. EDTA Blood"
                                    onChange={(e) => form.setData('sample_type', e.target.value)}
                                />
                            </div>
                        </div>

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
                                {editingTest ? 'Save Changes' : 'Add Test'}
                            </button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
