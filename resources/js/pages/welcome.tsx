import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, BarChart3, FlaskConical, ShieldCheck, WalletCards } from 'lucide-react';
import { dashboard, login } from '@/routes';

export default function Welcome() {
    const { auth } = usePage().props;

    const features = [
        {
            icon: FlaskConical,
            title: 'End-to-End Billing Flow',
            description: 'Test-wise, package-wise, referral, and collection center billing in one workflow.',
        },
        {
            icon: WalletCards,
            title: 'Smart Wallet Engine',
            description: 'Lab, doctor, and collection center wallet credit/debit entries with ledger trail.',
        },
        {
            icon: ShieldCheck,
            title: 'ACID-Safe Transactions',
            description: 'Every bill is atomic with events for barcode, notifications, and reporting jobs.',
        },
        {
            icon: BarChart3,
            title: 'Actionable Lab Analytics',
            description: 'Revenue trends, bill operations, and patient throughput from one dashboard.',
        },
    ];

    return (
        <>
            <Head title="PathLabs Billing Software" />

            <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#d8f3ff,_#f7fbff_45%,_#ffffff_70%)] text-slate-900">
                <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6">
                    <div>
                        <p className="text-2xl font-bold tracking-tight text-[#075985]">PathLabs</p>
                        <p className="text-xs font-medium uppercase tracking-[0.25em] text-slate-500">Pathology + Radiology Billing Cloud</p>
                    </div>

                    {auth.user ? (
                        <Link href={dashboard()} className="rounded-lg bg-[#0f87af] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0c7395]">
                            Open Dashboard
                        </Link>
                    ) : (
                        <Link href={login()} className="rounded-lg bg-[#0f87af] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0c7395]">
                            Login
                        </Link>
                    )}
                </header>

                <main className="mx-auto grid w-full max-w-7xl gap-8 px-6 pb-16 pt-6 lg:grid-cols-[1.1fr_0.9fr]">
                    <section className="space-y-6">
                        <span className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-700">
                            Built for Labs, Centers, Doctors, Front Desk
                        </span>

                        <h1 className="max-w-2xl text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
                            Scale your pathology and radiology billing with confidence.
                        </h1>

                        <p className="max-w-xl text-base leading-relaxed text-slate-600">
                            Unified billing, wallets, commissions, sample barcode workflows, and panel-level operations in a single platform.
                        </p>

                        <div className="flex flex-wrap items-center gap-3">
                            <Link
                                href={auth.user ? dashboard() : login()}
                                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                            >
                                {auth.user ? 'Go to App' : 'Start with Demo Accounts'}
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <span className="text-sm text-slate-500">Live-ready multi-tenant architecture</span>
                        </div>

                        <div className="grid gap-4 pt-4 sm:grid-cols-2">
                            {features.map((feature) => (
                                <article key={feature.title} className="rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-sm backdrop-blur">
                                    <feature.icon className="h-5 w-5 text-[#0f87af]" />
                                    <h2 className="mt-3 text-sm font-semibold text-slate-900">{feature.title}</h2>
                                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{feature.description}</p>
                                </article>
                            ))}
                        </div>
                    </section>

                    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-cyan-100/50">
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-slate-900">Operational Snapshot</h2>
                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Cloud Active</span>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-xl bg-[#0f87af] p-4 text-white">
                                <p className="text-xs uppercase tracking-wide text-white/80">Avg Bill Time</p>
                                <p className="mt-2 text-2xl font-bold">48s</p>
                            </div>
                            <div className="rounded-xl bg-slate-900 p-4 text-white">
                                <p className="text-xs uppercase tracking-wide text-white/80">Sample Tracking</p>
                                <p className="mt-2 text-2xl font-bold">100%</p>
                            </div>
                            <div className="rounded-xl bg-orange-500 p-4 text-white">
                                <p className="text-xs uppercase tracking-wide text-white/80">Wallet Posting</p>
                                <p className="mt-2 text-2xl font-bold">Realtime</p>
                            </div>
                            <div className="rounded-xl bg-emerald-600 p-4 text-white">
                                <p className="text-xs uppercase tracking-wide text-white/80">Panel Roles</p>
                                <p className="mt-2 text-2xl font-bold">5+</p>
                            </div>
                        </div>

                        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-sm font-semibold text-slate-800">Includes ready demo credentials</p>
                            <p className="mt-1 text-sm text-slate-600">Admin, Lab, Collection Center, Doctor, and Front Desk login shortcuts are available on the login page.</p>
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}
