import { Head } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type TestRow = {
    id: number;
    name: string;
    department: string | null;
    sample_type: string | null;
    retail_price: number;
    b2b_price: number;
    selling_price: number;
};

type PackageRow = {
    id: number;
    name: string;
    tests: string[];
    retail_price: number;
    b2b_price: number;
    selling_price: number;
};

type Props = {
    collectionCenter: {
        name: string;
        margin_type: string;
        margin_value: number;
    };
    tests: TestRow[];
    packages: PackageRow[];
};

export default function CollectionCenterPriceList({ collectionCenter, tests, packages }: Props) {
    const [search, setSearch] = useState('');
    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Price List', href: '/cc/price-list' }];

    const filteredTests = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (query === '') {
            return tests;
        }

        return tests.filter((test) => `${test.name} ${test.department ?? ''} ${test.sample_type ?? ''}`.toLowerCase().includes(query));
    }, [search, tests]);

    const filteredPackages = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (query === '') {
            return packages;
        }

        return packages.filter((item) => `${item.name} ${item.tests.join(' ')}`.toLowerCase().includes(query));
    }, [packages, search]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="CC Price List" />

            <div className="space-y-5 bg-slate-50/80">
                <section className="border border-slate-200 bg-white p-5">
                    <h1 className="text-2xl font-semibold text-slate-900">B2B Price List</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Center: {collectionCenter.name}. Margin applied: {collectionCenter.margin_type === 'percent' ? `${collectionCenter.margin_value}%` : `₹${collectionCenter.margin_value.toFixed(2)}`}.
                    </p>

                    <div className="mt-4">
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search test or package..."
                            className="h-10 w-full border border-slate-200 px-3 text-sm outline-none focus:border-[#147da2]"
                        />
                    </div>
                </section>

                <section className="border border-slate-200 bg-white">
                    <div className="border-b border-slate-200 px-5 py-4">
                        <h2 className="text-lg font-semibold text-slate-900">Tests</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className="border-b border-slate-200 bg-slate-50/80 text-slate-500">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Test</th>
                                    <th className="px-4 py-3 font-semibold">Department</th>
                                    <th className="px-4 py-3 font-semibold">Sample</th>
                                    <th className="px-4 py-3 font-semibold">Lab Retail</th>
                                    <th className="px-4 py-3 font-semibold">Admin B2B</th>
                                    <th className="px-4 py-3 font-semibold">CC Sell Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTests.map((test) => (
                                    <tr key={test.id} className="border-b border-slate-100 last:border-0">
                                        <td className="px-4 py-3 font-medium text-slate-900">{test.name}</td>
                                        <td className="px-4 py-3">{test.department ?? '-'}</td>
                                        <td className="px-4 py-3">{test.sample_type ?? '-'}</td>
                                        <td className="px-4 py-3">₹{test.retail_price.toFixed(2)}</td>
                                        <td className="px-4 py-3">₹{test.b2b_price.toFixed(2)}</td>
                                        <td className="px-4 py-3 font-semibold text-[#147da2]">₹{test.selling_price.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="border border-slate-200 bg-white">
                    <div className="border-b border-slate-200 px-5 py-4">
                        <h2 className="text-lg font-semibold text-slate-900">Packages</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className="border-b border-slate-200 bg-slate-50/80 text-slate-500">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Package</th>
                                    <th className="px-4 py-3 font-semibold">Included Tests</th>
                                    <th className="px-4 py-3 font-semibold">Lab Retail</th>
                                    <th className="px-4 py-3 font-semibold">Admin B2B</th>
                                    <th className="px-4 py-3 font-semibold">CC Sell Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPackages.map((item) => (
                                    <tr key={item.id} className="border-b border-slate-100 last:border-0">
                                        <td className="px-4 py-3 font-medium text-slate-900">{item.name}</td>
                                        <td className="px-4 py-3 text-slate-600">{item.tests.join(', ') || '-'}</td>
                                        <td className="px-4 py-3">₹{item.retail_price.toFixed(2)}</td>
                                        <td className="px-4 py-3">₹{item.b2b_price.toFixed(2)}</td>
                                        <td className="px-4 py-3 font-semibold text-[#147da2]">₹{item.selling_price.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
