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
                <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
                    <div>
                        <span className="inline-flex rounded-md bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-600">
                            Professional Lab Management
                        </span>
                        <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
                            Modernize your <br />
                            <span className="text-[#147da2]">Lab Operations</span>.
                        </h1>
                        <p className="mt-8 text-lg text-slate-500 max-w-lg leading-relaxed">
                            A unified platform for diagnostic billing, wallet management, and laboratory reporting. 
                            Built for accuracy, speed, and security.
                        </p>
                        
                        <div className="mt-10 flex flex-wrap items-center gap-4">
                            <Link
                                href={auth.user ? dashboard() : login()}
                                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-bold text-white hover:bg-slate-800 transition-colors shadow-sm"
                            >
                                {auth.user ? 'Go to Dashboard' : 'Get Started'}
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <span className="text-sm font-medium text-slate-400">Trusted by modern diagnostic centers</span>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        {features.map((feature, idx) => (
                            <div key={idx} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-6 hover:border-slate-200 transition-colors">
                                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-slate-100 shadow-sm">
                                    <feature.icon className="h-5 w-5 text-[#147da2]" />
                                </div>
                                <h3 className="text-base font-bold text-slate-900">{feature.title}</h3>
                                <p className="mt-1 text-sm text-slate-500 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
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
