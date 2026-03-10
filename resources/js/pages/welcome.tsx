import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, Building2, CalendarCheck2, FlaskConical, ShoppingBag, Stethoscope } from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import { dashboard, login } from '@/routes';

export default function Welcome() {
    const { auth } = usePage().props as { auth: { user?: unknown } };

    const modules = [
        {
            title: 'Pathlogy & Radiology Billing',
            desc: 'Multi-tenant billing with package/test wise flow, barcode generation, and wallet-linked commissions.',
            icon: FlaskConical,
        },
        {
            title: 'Doctor Appointment System',
            desc: 'Doctor schedules, reschedule/leave handling, referral tracking, and specialist listing.',
            icon: CalendarCheck2,
        },
        {
            title: 'Doctor Referral Network',
            desc: 'Doctors can refer patients to partner labs and earn configurable gift commissions.',
            icon: Stethoscope,
        },
        {
            title: 'MedixMall Integration',
            desc: 'Connected ecosystem with medixmall.com for pathology raw materials, medical devices, and medicines.',
            icon: ShoppingBag,
        },
    ];

    return (
        <div className="min-h-screen bg-white text-slate-900">
            <Head title="Dr Mitra - Medical Ecosystem" />

            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center bg-[#147da2]">
                            <AppLogoIcon className="h-5 w-5 fill-white" />
                        </div>
                        <div>
                            <p className="text-lg font-semibold leading-none">Dr Mitra</p>
                            <p className="mt-0.5 text-xs text-slate-500">Pathlog + Doctor + MedixMall Ecosystem</p>
                        </div>
                    </div>

                    {auth.user ? (
                        <Link href={dashboard()} className="border border-[#147da2] bg-[#147da2] px-4 py-2 text-sm font-medium text-white">
                            Open Dashboard
                        </Link>
                    ) : (
                        <Link href={login()} className="border border-[#147da2] bg-[#147da2] px-4 py-2 text-sm font-medium text-white">
                            Login
                        </Link>
                    )}
                </div>
            </header>

            <main className="mx-auto w-full max-w-7xl px-6 py-10">
                <section className="border border-slate-200 bg-slate-50 px-6 py-10">
                    <div className="max-w-3xl">
                        <p className="inline-flex items-center gap-2 border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-slate-600">
                            <Building2 className="h-3.5 w-3.5" />
                            Medical Ecosystem Platform
                        </p>
                        <h1 className="mt-4 text-4xl font-semibold leading-tight text-slate-900">
                            One platform for diagnostics, doctor appointments, referrals, and healthcare commerce.
                        </h1>
                        <p className="mt-3 text-sm leading-6 text-slate-600">
                            Dr Mitra powers pathology and radiology labs, specialist doctors, and medical supply operations in a connected and permission-driven workflow.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <Link
                                href={auth.user ? dashboard() : login()}
                                className="inline-flex items-center gap-2 border border-[#147da2] bg-[#147da2] px-4 py-2 text-sm font-medium text-white"
                            >
                                {auth.user ? 'Go to Portal' : 'Start with Login'}
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <Link href="/public/doctors" className="inline-flex items-center gap-2 border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700">
                                Book Doctor Appointment
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <a
                                href="https://medixmall.com"
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
                            >
                                Visit MedixMall
                                <ArrowRight className="h-4 w-4" />
                            </a>
                        </div>
                    </div>
                </section>

                <section className="mt-6 grid gap-4 md:grid-cols-2">
                    {modules.map((module) => {
                        const Icon = module.icon;
                        return (
                            <article key={module.title} className="border border-slate-200 bg-white p-5">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center border border-slate-200 bg-slate-50">
                                        <Icon className="h-4 w-4 text-[#147da2]" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-semibold text-slate-900">{module.title}</h2>
                                        <p className="mt-1 text-sm leading-6 text-slate-600">{module.desc}</p>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </section>
            </main>
        </div>
    );
}
