import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Edit2, Plus, Search, Trash2 } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type TestOption = {
    id: number;
    name: string;
    code: string;
};

type ParameterRow = {
    id: number;
    test_id: number;
    test_name: string;
    test_code: string;
    name: string;
    unit: string;
    normal_range: string;
};

type PaginationData = {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};

type Props = {
    parameters: ParameterRow[];
    tests: TestOption[];
    pagination: PaginationData;
    filters: { search: string; test_id: string };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Test Reports', href: '/lab/test-reports/parameters' },
    { title: 'Test Parameters', href: '/lab/test-reports/parameters' },
];

export default function ManageParameters({ parameters, tests, pagination, filters }: Props) {
    const page = usePage();
    const flash = page.props.flash as { success?: string };
    
    const [search, setSearch] = useState(filters.search || '');
    const [selectedTest, setSelectedTest] = useState(filters.test_id || '');
    const [isFilterChanged, setIsFilterChanged] = useState(false);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingParameter, setEditingParameter] = useState<ParameterRow | null>(null);

    const form = useForm({
        test_id: '',
        name: '',
        unit: '',
        normal_range: '',
    });

    useEffect(() => {
        if (isFilterChanged) {
            const delayDebounceFn = setTimeout(() => {
                applyFilters();
            }, 300);
            return () => clearTimeout(delayDebounceFn);
        }
    }, [search, selectedTest]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setIsFilterChanged(true);
    };

    const handleTestChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedTest(e.target.value);
        setIsFilterChanged(true);
    };

    const applyFilters = () => {
        router.get(
            '/lab/test-reports/parameters',
            { search, test_id: selectedTest },
            { preserveState: true, replace: true }
        );
        setIsFilterChanged(false);
    };

    const openModal = (parameter: ParameterRow | null = null) => {
        setEditingParameter(parameter);
        if (parameter) {
            form.setData({
                test_id: parameter.test_id.toString(),
                name: parameter.name,
                unit: parameter.unit === '-' ? '' : parameter.unit,
                normal_range: parameter.normal_range === '-' ? '' : parameter.normal_range,
            });
        } else {
            form.reset();
            form.setData('test_id', selectedTest || (tests[0]?.id.toString() ?? ''));
        }
        form.clearErrors();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingParameter(null);
        form.reset();
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        
        if (editingParameter) {
            form.put(`/lab/test-reports/parameters/${editingParameter.id}`, {
                onSuccess: () => closeModal(),
            });
        } else {
            form.post('/lab/test-reports/parameters', {
                onSuccess: () => closeModal(),
            });
        }
    };

    const deleteParameter = (parameter: ParameterRow) => {
        if (confirm(`Are you sure you want to delete parameter: ${parameter.name}?`)) {
            router.delete(`/lab/test-reports/parameters/${parameter.id}`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Test Parameters" />

            <div className="min-h-full bg-slate-50/80 p-0">
                {flash?.success && (
                    <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                        {flash.success}
                    </div>
                )}

                <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                    <button
                        type="button"
                        onClick={() => openModal()}
                        className="flex items-center gap-1.5 rounded-md bg-[#147da2] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#106385] ml-auto"
                    >
                        <Plus className="h-4 w-4" />
                        Add Parameter
                    </button>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white">
                    <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-1 items-center gap-3">
                            <div className="relative max-w-sm flex-1">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search parameters or tests..."
                                    className="h-9 w-full rounded-md border border-slate-200 pl-9 pr-3 text-sm outline-none transition focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20"
                                    value={search}
                                    onChange={handleSearchChange}
                                />
                            </div>
                            <select
                                className="h-9 w-48 rounded-md border border-slate-200 px-3 py-1.5 text-sm outline-none transition focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20"
                                value={selectedTest}
                                onChange={handleTestChange}
                            >
                                <option value="">All Tests</option>
                                {tests.map((test) => (
                                    <option key={test.id} value={test.id}>
                                        {test.name} ({test.code})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-slate-200 bg-slate-50/80 uppercase tracking-wide text-slate-500">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Test Name</th>
                                    <th className="px-4 py-3 font-semibold">Parameter</th>
                                    <th className="px-4 py-3 font-semibold">Unit</th>
                                    <th className="px-4 py-3 font-semibold">Normal Range</th>
                                    <th className="w-[100px] px-4 py-3 text-right font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {parameters.length > 0 ? (
                                    parameters.map((p) => (
                                        <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                                            <td className="px-4 py-3 font-medium text-slate-700">
                                                {p.test_name} <span className="ml-1 text-xs text-slate-400">({p.test_code})</span>
                                            </td>
                                            <td className="px-4 py-3 text-slate-700">{p.name}</td>
                                            <td className="px-4 py-3 text-slate-600">{p.unit}</td>
                                            <td className="px-4 py-3 text-slate-600">{p.normal_range}</td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => openModal(p)}
                                                        className="rounded text-slate-400 hover:text-[#147da2]"
                                                        title="Edit parameter"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => deleteParameter(p)}
                                                        className="rounded text-slate-400 hover:text-red-500"
                                                        title="Delete parameter"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                                            No parameters found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {pagination.total > pagination.per_page && (
                        <div className="border-t border-slate-200 px-4 py-3 text-right sm:px-6 text-sm text-slate-500">
                            Showing page {pagination.current_page} of {pagination.last_page} ({pagination.total} total)
                            <div className="mt-2 flex justify-end gap-2">
                                {pagination.current_page > 1 && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            router.get(`/lab/test-reports/parameters?page=${pagination.current_page - 1}&search=${search}&test_id=${selectedTest}`)
                                        }
                                        className="rounded border border-slate-200 px-3 py-1 hover:bg-slate-50"
                                    >
                                        Previous
                                    </button>
                                )}
                                {pagination.current_page < pagination.last_page && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            router.get(`/lab/test-reports/parameters?page=${pagination.current_page + 1}&search=${search}&test_id=${selectedTest}`)
                                        }
                                        className="rounded border border-slate-200 px-3 py-1 hover:bg-slate-50"
                                    >
                                        Next
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{editingParameter ? 'Edit Parameter' : 'Add Parameter'}</DialogTitle>
                    </DialogHeader>
                    
                    <form onSubmit={submit} className="flex flex-col gap-4 mt-4">
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="test_id" className="text-sm font-semibold text-slate-700">Lab Test <span className="text-red-500">*</span></label>
                            <select
                                id="test_id"
                                className="h-9 w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm outline-none transition focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20"
                                value={form.data.test_id}
                                onChange={(e) => form.setData('test_id', e.target.value)}
                                required
                            >
                                <option value="" disabled>Select a test</option>
                                {tests.map((test) => (
                                    <option key={test.id} value={test.id}>
                                        {test.name} ({test.code})
                                    </option>
                                ))}
                            </select>
                            {form.errors.test_id && <p className="text-xs text-red-500">{form.errors.test_id}</p>}
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="name" className="text-sm font-semibold text-slate-700">Parameter Name <span className="text-red-500">*</span></label>
                            <input
                                id="name"
                                type="text"
                                className="h-9 w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm outline-none transition focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20"
                                value={form.data.name}
                                onChange={(e) => form.setData('name', e.target.value)}
                                required
                            />
                            {form.errors.name && <p className="text-xs text-red-500">{form.errors.name}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="unit" className="text-sm font-semibold text-slate-700">Unit</label>
                                <input
                                    id="unit"
                                    type="text"
                                    className="h-9 w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm outline-none transition focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20"
                                    value={form.data.unit}
                                    placeholder="e.g. g/dL"
                                    onChange={(e) => form.setData('unit', e.target.value)}
                                />
                                {form.errors.unit && <p className="text-xs text-red-500">{form.errors.unit}</p>}
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="normal_range" className="text-sm font-semibold text-slate-700">Normal Range</label>
                                <input
                                    id="normal_range"
                                    type="text"
                                    className="h-9 w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm outline-none transition focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20"
                                    value={form.data.normal_range}
                                    placeholder="e.g. 13.5 - 17.5"
                                    onChange={(e) => form.setData('normal_range', e.target.value)}
                                />
                                {form.errors.normal_range && <p className="text-xs text-red-500">{form.errors.normal_range}</p>}
                            </div>
                        </div>

                        <div className="mt-2 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={form.processing}
                                className="rounded-md bg-[#147da2] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#106385] disabled:opacity-50"
                            >
                                {editingParameter ? 'Save Changes' : 'Add Parameter'}
                            </button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
