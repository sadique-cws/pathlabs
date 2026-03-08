import { Head, Link } from '@inertiajs/react';
import { Eye, Pencil, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Pagination } from '@/components/pagination';
import type { BreadcrumbItem } from '@/types';

type PatientRow = {
    id: number;
    title: string;
    name: string;
    mobile: string;
    gender: string;
    age: number;
    city: string;
    address: string;
    package: string;
};

type Props = {
    patients: PatientRow[];
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Manage Patients',
        href: '/lab/patients/manage',
    },
];

const pageSizeOptions = [10, 20, 50];

export default function ManagePatients({ patients }: Props) {
    const [search, setSearch] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [page, setPage] = useState(1);

    const filteredPatients = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (query === '') {
            return patients;
        }

        return patients.filter((patient) => (
            `${patient.id} ${patient.title} ${patient.name} ${patient.mobile} ${patient.gender} ${patient.age} ${patient.city} ${patient.address}`
                .toLowerCase()
                .includes(query)
        ));
    }, [patients, search]);

    const totalItems = filteredPatients.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const currentPage = Math.min(page, totalPages);
    const from = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const to = Math.min(totalItems, currentPage * pageSize);

    const rows = useMemo(() => {
        const start = (currentPage - 1) * pageSize;

        return filteredPatients.slice(start, start + pageSize);
    }, [filteredPatients, currentPage, pageSize]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Patients" />

            <div className="min-h-full bg-slate-50/80 p-0">
                <div className="sawtooth border-b border-slate-200 bg-white">
                    <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <label className="relative w-full sm:max-w-md">
                            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <input
                                value={search}
                                onChange={(event) => {
                                    setSearch(event.target.value);
                                    setPage(1);
                                }}
                                placeholder="Search patients by name, phone, etc..."
                                className="h-9 w-full  border border-slate-200 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20"
                            />
                        </label>

                        <Link href="/lab/patients/add" className="inline-flex items-center justify-center  bg-[#147da2] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#106385] w-full sm:w-auto">
                            + Add Patient
                        </Link>
                    </div>

                    <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
                        <table className="min-w-[1000px] w-full text-left">
                            <thead className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                <tr>
                                    <th className="px-3 py-3">ID</th>
                                    <th className="px-3 py-3">Title</th>
                                    <th className="px-3 py-3">Name</th>
                                    <th className="px-3 py-3">Mobile</th>
                                    <th className="px-3 py-3">Gender</th>
                                    <th className="px-3 py-3">Age(Y)</th>
                                    <th className="px-3 py-3">City</th>
                                    <th className="px-3 py-3">Address</th>
                                    <th className="px-3 py-3">Package</th>
                                    <th className="px-3 py-3">Options</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((patient) => (
                                    <tr key={patient.id} className="border-b border-slate-100 text-sm text-slate-700">
                                        <td className="px-3 py-3">{patient.id}</td>
                                        <td className="px-3 py-3">{patient.title}</td>
                                        <td className="px-3 py-3 font-medium text-slate-800">{patient.name}</td>
                                        <td className="px-3 py-3">{patient.mobile}</td>
                                        <td className="px-3 py-3">{patient.gender}</td>
                                        <td className="px-3 py-3">{patient.age}</td>
                                        <td className="px-3 py-3">{patient.city}</td>
                                        <td className="px-3 py-3">{patient.address}</td>
                                        <td className="px-3 py-3">{patient.package}</td>
                                        <td className="px-3 py-3">
                                            <div className="flex items-center gap-2">
                                                <button type="button" className="p-1 text-slate-400 hover:bg-slate-100"><Eye className="h-4 w-4" /></button>
                                                <Link href={`/lab/patients/${patient.id}/edit`} className="p-1 text-slate-400 hover:bg-slate-100"><Pencil className="h-4 w-4" /></Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {rows.length === 0 && (
                                    <tr>
                                        <td colSpan={10} className="px-3 py-10 text-center text-sm text-slate-500">No patients found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <Pagination
                        totalItems={totalItems}
                        pageSize={pageSize}
                        currentPage={currentPage}
                        onPageChange={setPage}
                        onPageSizeChange={(size) => {
                            setPageSize(size);
                            setPage(1);
                        }}
                        from={from}
                        to={to}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
