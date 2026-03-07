import { Head, Link, usePage } from '@inertiajs/react';
import { 
    ArrowRight, 
    FlaskConical, 
    WalletCards, 
    ShieldCheck, 
    BarChart3
} from 'lucide-react';
import { dashboard, login } from '@/routes';
import AppLogoIcon from '@/components/app-logo-icon';

export default function Welcome() {
    const { auth } = usePage().props;

    const features = [
        {
            icon: FlaskConical,
            title: 'End-to-End Billing',
            description: 'Streamlined test and package billing workflows.',
        },
        {
            icon: WalletCards,
            title: 'Wallet System',
            description: 'Automated credit/debit trails for all users.',
        },
        {
            icon: ShieldCheck,
            title: 'Secure Reports',
            description: 'Encrypted reporting and audit trails.',
        },
        {
            icon: BarChart3,
            title: 'Lab Analytics',
            description: 'Real-time revenue and patient insights.',
        },
    ];

    return (
        <div className="min-h-screen bg-white text-slate-900">
            <Head title="PathLabs - Diagnostic Cloud" />

            {/* Simple Header */}
            <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#147da2]">
                        <AppLogoIcon className="size-5 fill-current text-white" />
                    </div>
                    <div>
                        <p className="text-xl font-bold tracking-tight text-slate-900">PathLabs</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#147da2]">Diagnostic Cloud</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {auth.user ? (
                        <Link href={dashboard()} className="rounded-lg bg-[#147da2] px-4 py-2 text-sm font-semibold text-white hover:bg-[#106385] transition-colors">
                            Dashboard
                        </Link>
                    ) : (
                        <Link href={login()} className="rounded-lg bg-[#147da2] px-4 py-2 text-sm font-semibold text-white hover:bg-[#106385] transition-colors">
                            Login
                        </Link>
                    )}
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
                <div className="relative isolate overflow-hidden rounded-3xl border border-slate-100 bg-slate-900 px-6 py-24 shadow-2xl sm:px-24 xl:py-32">
                    <img
                        src="/images/hero_bg.png"
                        alt=""
                        className="absolute inset-0 -z-10 h-full w-full object-cover opacity-30 grayscale"
                    />
                    <div className="mx-auto max-w-2xl text-center">
                        <span className="inline-flex rounded-md bg-[#147da2]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#147da2]">
                            Professional Lab Management
                        </span>
                        <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-6xl">
                            Modernize your <span className="text-[#147da2]">Lab Operations</span>.
                        </h1>
                        <p className="mt-6 text-lg leading-8 text-slate-300">
                            A unified platform for diagnostic billing, wallet management, and laboratory reporting. 
                            Built for accuracy, speed, and security.
                        </p>
                        <div className="mt-10 flex items-center justify-center gap-x-6">
                            <Link
                                href={auth.user ? dashboard() : login()}
                                className="rounded-xl bg-[#147da2] px-6 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-[#106385] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#147da2] transition-all"
                            >
                                {auth.user ? 'Go to Dashboard' : 'Get Started'}
                            </Link>
                            <Link href="#" className="text-sm font-semibold leading-6 text-white">
                                Learn more <span aria-hidden="true">→</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Simple Stats Row */}
                <div className="mt-24 grid grid-cols-2 gap-8 border-t border-slate-100 pt-12 text-center sm:grid-cols-4">
                    <div className="space-y-1">
                        <p className="text-3xl font-bold text-slate-900">48s</p>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Avg Billing Time</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-3xl font-bold text-slate-900">100%</p>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sample Tracking</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-3xl font-bold text-slate-900">Realtime</p>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Wallet Sync</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-3xl font-bold text-slate-900">99.9%</p>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cloud Uptime</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
