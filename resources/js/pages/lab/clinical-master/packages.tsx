import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Edit2, Plus, Search, Trash2, Lock, X } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Pagination } from '@/components/pagination';
import type { BreadcrumbItem } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

type TestOption = {
    id: number;
    name: string;
    price: number;
};

type PackageRow = {
    id: number;
    name: string;
    code: string;
    price: number;
    is_system: boolean;
    is_active: boolean;
    test_ids: number[];
    test_names: string[];
    can_edit: boolean;
};

type PaginationData = {
    current_page: number;
    last_page: number;
    total: number;
};

type Props = {
    packages: PackageRow[];
    availableTests: TestOption[];
    pagination: PaginationData;
    filters: { search: string };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Clinical Master', href: '/lab/clinical-master/packages' },
    { title: 'Manage Packages', href: '/lab/clinical-master/packages' },
];

export default function ManagePackages({ packages, availableTests, pagination, filters }: Props) {
    const page = usePage();
    const flash = page.props.flash as { success?: string };
    
    const [search, setSearch] = useState(filters.search || '');
    const [isFilterChanged, setIsFilterChanged] = useState(false);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPackage, setEditingPackage] = useState<PackageRow | null>(null);

    const form = useForm({
        name: '',
        code: '',
        price: 0,
        test_ids: [] as number[],
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
            '/lab/clinical-master/packages',
            { search },
            { preserveState: true, replace: true }
        );
        setIsFilterChanged(false);
    };

    const openModal = (pkg: PackageRow | null = null) => {
        setEditingPackage(pkg);
        if (pkg) {
            form.setData({
                name: pkg.name,
                code: pkg.code,
                price: pkg.price,
                test_ids: pkg.test_ids,
            });
        } else {
            form.reset();
        }
        form.clearErrors();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingPackage(null);
        form.reset();
    };

    const toggleTest = (testId: number) => {
        const current = [...form.data.test_ids];
        const index = current.indexOf(testId);
        if (index > -1) {
            current.splice(index, 1);
        } else {
            current.push(testId);
        }
        form.setData('test_ids', current);
        
        // Auto-calculate suggested price if adding for first time
        if (form.data.price === 0) {
            const totalPrice = availableTests
                .filter(t => current.includes(t.id))
                .reduce((sum, t) => sum + parseFloat(t.price.toString()), 0);
            form.setData({
                ...form.data,
                test_ids: current,
                price: totalPrice
            });
        }
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        
        if (editingPackage) {
            form.put(`/lab/clinical-master/packages/${editingPackage.id}`, {
                onSuccess: () => closeModal(),
            });
        } else {
            form.post('/lab/clinical-master/packages', {
                onSuccess: () => closeModal(),
            });
        }
    };

    const deletePackage = (pkg: PackageRow) => {
        if (confirm(`Are you sure you want to delete package: ${pkg.name}?`)) {
            router.delete(`/lab/clinical-master/packages/${pkg.id}`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Packages" />

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
                                    placeholder="Search packages..."
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
                                Add Package
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className="border-b border-slate-200 bg-slate-50/80 uppercase tracking-wide text-slate-500">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Package Name</th>
                                    <th className="px-4 py-3 font-semibold">Code</th>
                                    <th className="px-4 py-3 font-semibold">Included Tests</th>
                                    <th className="px-4 py-3 font-semibold">Price</th>
                                    <th className="px-4 py-3 font-semibold">Type</th>
                                    <th className="w-[100px] px-4 py-3 text-right font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {packages.length > 0 ? (
                                    packages.map((p) => (
                                        <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                                            <td className="px-4 py-3 font-medium text-slate-700">{p.name}</td>
                                            <td className="px-4 py-3 text-slate-600 font-mono text-xs">{p.code}</td>
                                            <td className="px-4 py-3 text-slate-600">
                                                <div className="flex flex-wrap gap-1 max-w-xs">
                                                    {p.test_names.map((name, idx) => (
                                                        <span key={idx} className="bg-slate-100 px-1.5 py-0.5 text-[10px] rounded text-slate-500">
                                                            {name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-slate-700 font-semibold">₹{p.price}</td>
                                            <td className="px-4 py-3">
                                                {p.is_system ? (
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
                                                    {p.can_edit ? (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => openModal(p)}
                                                                className="text-slate-400 hover:text-[#147da2]"
                                                                title="Edit package"
                                                            >
                                                                <Edit2 className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => deletePackage(p)}
                                                                className="text-slate-400 hover:text-red-500"
                                                                title="Delete package"
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
                                            No packages found.
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
                                router.get('/lab/clinical-master/packages', { page: p, search }, { preserveState: true })
                            }
                            from={(pagination.current_page - 1) * 50 + 1}
                            to={Math.min(pagination.current_page * 50, pagination.total)}
                        />
                    )}
                </div>
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{editingPackage ? 'Edit Package' : 'Add Package'}</DialogTitle>
                    </DialogHeader>
                    
                    <form onSubmit={submit} className="flex flex-col gap-4 mt-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-slate-700">Package Name <span className="text-red-500">*</span></label>
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
                                <label className="text-sm font-semibold text-slate-700">Package Code <span className="text-red-500">*</span></label>
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

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-slate-700">Included Tests <span className="text-red-500">*</span></label>
                            <div className="border border-slate-200 bg-slate-50/30 p-2 overflow-y-auto max-h-48 scrollbar-thin scrollbar-thumb-slate-200">
                                <div className="grid grid-cols-1 gap-1">
                                    {availableTests.map((test) => (
                                        <label key={test.id} className="flex items-center gap-2 p-1 hover:bg-white transition cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                className="h-3.5 w-3.5 border-slate-300 rounded-none text-[#147da2] focus:ring-[#147da2]"
                                                checked={form.data.test_ids.includes(test.id)}
                                                onChange={() => toggleTest(test.id)}
                                            />
                                            <span className="text-xs text-slate-600 group-hover:text-slate-900">{test.name}</span>
                                            <span className="ml-auto text-[10px] text-slate-400">₹{test.price}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            {form.errors.test_ids && <p className="text-xs text-red-500">{form.errors.test_ids}</p>}
                            <p className="text-[10px] text-slate-400">
                                Selected: {form.data.test_ids.length} tests. Sum of individual prices: ₹{
                                    availableTests.filter(t => form.data.test_ids.includes(t.id)).reduce((sum, t) => sum + parseFloat(t.price.toString()), 0)
                                }
                            </p>
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
                                {editingPackage ? 'Save Changes' : 'Add Package'}
                            </button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
