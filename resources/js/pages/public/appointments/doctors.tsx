import { Head, Link } from '@inertiajs/react';
import { Search, Stethoscope } from 'lucide-react';
import { useMemo, useState } from 'react';

type DoctorRow = {
    id: number;
    name: string;
    phone: string | null;
    email: string | null;
    specialization: string;
    doctor_type: string;
    consultation_fee: number;
    lab_name: string;
    lab_location: string;
};

type Props = {
    doctors: DoctorRow[];
};

export default function PublicDoctors({ doctors }: Props) {
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        const keyword = search.trim().toLowerCase();
        if (keyword === '') {
            return doctors;
        }

        return doctors.filter((doctor) =>
            [doctor.name, doctor.specialization, doctor.lab_name, doctor.lab_location, doctor.phone ?? '']
                .join(' ')
                .toLowerCase()
                .includes(keyword),
        );
    }, [doctors, search]);

    return (
        <div className="min-h-screen bg-slate-50">
            <Head title="Book Doctor Appointment" />

            <main className="mx-auto w-full max-w-6xl px-4 py-8">
                <div className="border border-slate-200 bg-white p-5">
                    <h1 className="text-2xl font-semibold text-slate-900">Book Appointment</h1>
                    <p className="mt-1 text-sm text-slate-600">Select doctor, choose slot, and complete booking with payment.</p>

                    <div className="mt-4 flex items-center gap-2 border border-slate-200 bg-slate-50 px-3 py-2">
                        <Search className="h-4 w-4 text-slate-500" />
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search doctor, specialization, lab..."
                            className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                        />
                    </div>
                </div>

                <section className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {filtered.map((doctor) => (
                        <article key={doctor.id} className="border border-slate-200 bg-white p-4">
                            <div className="flex items-start gap-3">
                                <div className="flex h-8 w-8 items-center justify-center border border-slate-200 bg-slate-50">
                                    <Stethoscope className="h-4 w-4 text-[#147da2]" />
                                </div>
                                <div>
                                    <p className="text-base font-semibold text-slate-900">{doctor.name}</p>
                                    <p className="text-sm text-slate-600">{doctor.specialization}</p>
                                    <p className="mt-1 text-xs text-slate-500">{doctor.lab_name}</p>
                                    <p className="text-xs text-slate-500">{doctor.lab_location}</p>
                                </div>
                            </div>

                            <div className="mt-4 border-t border-slate-100 pt-3 text-sm text-slate-700">
                                <p>Consultation Fee: <span className="font-semibold">₹{doctor.consultation_fee.toFixed(2)}</span></p>
                                <p>Phone: {doctor.phone ?? '-'}</p>
                            </div>

                            <div className="mt-4">
                                <Link
                                    href={`/public/doctors/${doctor.id}/book`}
                                    className="inline-flex items-center border border-[#147da2] bg-[#147da2] px-4 py-2 text-sm font-medium text-white"
                                >
                                    Book Now
                                </Link>
                            </div>
                        </article>
                    ))}
                </section>
            </main>
        </div>
    );
}
