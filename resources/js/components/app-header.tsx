import { Link, usePage } from '@inertiajs/react';
import { Eye, FileText, Menu, ReceiptIndianRupee, Wifi, WifiOff, Wallet, Bell, Search, PlusCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/components/ui/sidebar';
import type { BreadcrumbItem, User } from '@/types';

type Props = {
    breadcrumbs?: BreadcrumbItem[];
    withSidebarToggle?: boolean;
};

type Connectivity = 'strong' | 'weak' | 'offline';

const quickActions = [
    { title: 'New Lab Bill', href: '/lab/billing/create', permission: 'billing.create', icon: PlusCircle },
    { title: 'Manage Bills', href: '/lab/billing/manage', permission: 'billing.manage', icon: FileText },
    { title: 'Result Entry', href: '/lab/test-reports/result-entry', permission: 'reports.result_entry', icon: ReceiptIndianRupee },
];

function SidebarToggleButton() {
    const { toggleSidebar } = useSidebar();

    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all active:scale-95"
            onClick={toggleSidebar}
        >
            <Menu className="h-5 w-5" />
        </Button>
    );
}

export function AppHeader({ breadcrumbs = [], withSidebarToggle = false }: Props) {
    const page = usePage();
    const { wallet, access } = page.props as {
        auth: { user: User };
        wallet?: { balance?: number | null };
        access?: { permissions?: string[] };
    };
    const permissions = access?.permissions ?? [];

    const [connectivity, setConnectivity] = useState<Connectivity>('strong');
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);

        const evaluateConnectivity = (): void => {
            if (!navigator.onLine) {
                setConnectivity('offline');
                return;
            }
            const browserNavigator = navigator as any;
            const network = browserNavigator.connection;
            if (!network) {
                setConnectivity('strong');
                return;
            }
            const weakTypes = ['slow-2g', '2g', '3g'];
            const weakByType = network.effectiveType !== undefined && weakTypes.includes(network.effectiveType);
            const weakBySpeed = network.downlink !== undefined && network.downlink < 1;
            setConnectivity(weakByType || weakBySpeed ? 'weak' : 'strong');
        };

        evaluateConnectivity();
        window.addEventListener('online', evaluateConnectivity);
        window.addEventListener('offline', evaluateConnectivity);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('online', evaluateConnectivity);
            window.removeEventListener('offline', evaluateConnectivity);
        };
    }, []);

    const balanceValue = Number(wallet?.balance ?? 0);
    const connectionIcon = connectivity === 'offline' ? WifiOff : Wifi;
    const connectionColor = connectivity === 'strong' 
        ? 'text-emerald-400' 
        : connectivity === 'weak' 
            ? 'text-amber-400' 
            : 'text-rose-400';

    const ConnectivityIcon = connectionIcon;

    return (
        <>
            <header className={cn(
                "fixed inset-x-0 top-0 z-50 transition-all duration-300",
                scrolled 
                    ? "bg-[#147da2]/95 backdrop-blur-md h-12 border-b border-[#0d708e] shadow-lg" 
                    : "bg-[#147da2] h-14"
            )}>
                <div className="mx-auto flex h-full items-center px-4 max-w-[1600px]">
                    <div className="flex items-center gap-2">
                        {withSidebarToggle && <SidebarToggleButton />}
                        
                        <div className="hidden h-6 w-[1px] bg-white/20 mx-2 md:block" />

                        <nav className="hidden items-center gap-1 md:flex">
                            {quickActions
                                .filter((item) => permissions.includes(item.permission))
                                .map((item) => (
                                    <Link 
                                        key={item.title} 
                                        href={item.href} 
                                        className="group relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-white/90 hover:bg-white/10 hover:text-white transition-all"
                                    >
                                        <item.icon className="h-4 w-4 opacity-70 group-hover:opacity-100" />
                                        {item.title}
                                    </Link>
                                ))}
                        </nav>
                    </div>

                    <div className="ml-auto flex items-center gap-2 md:gap-4">
                        {/* Search Bar - Aesthetic Only for now */}
                        <div className="hidden lg:flex relative items-center">
                            <Search className="absolute left-3 h-4 w-4 text-white/50" />
                            <input 
                                placeholder="Search everything..." 
                                className="h-9 w-48 rounded-full bg-white/10 pl-9 pr-4 text-xs text-white placeholder:text-white/40 border border-white/10 focus:bg-white/20 focus:w-64 transition-all outline-none"
                            />
                        </div>

                        {/* Wallet Section */}
                        <Link 
                            href="/lab/wallet"
                            className="flex items-center gap-2 overflow-hidden rounded-full bg-white/10 hover:bg-white/20 p-1 pr-4 transition-all border border-white/10 group shadow-inner"
                        >
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm group-hover:scale-110 transition-transform">
                                <Wallet className="h-3.5 w-3.5" />
                            </div>
                            <div className="flex flex-col items-start leading-none">
                                <span className="text-[10px] uppercase font-bold text-white/60 tracking-tighter">Balance</span>
                                <span className="text-sm font-bold text-white">₹{balanceValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                        </Link>

                        <div className="flex items-center gap-2 border-l border-white/20 pl-2 md:pl-4">
                            <button className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-all relative">
                                <Bell className="h-5 w-5" />
                                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500 border-2 border-[#147da2]" />
                            </button>
                            
                            <ConnectivityIcon 
                                className={cn('h-5 w-5 transition-colors drop-shadow-sm', connectionColor)} 
                                title={`Connection: ${connectivity}`}
                            />
                        </div>
                    </div>
                </div>
            </header>
            
            <div className={scrolled ? "h-12" : "h-14"} />

            {breadcrumbs.length > 0 && (
                <div className="sticky top-[48px] md:top-[56px] z-40 border-b bg-white/80 backdrop-blur-sm shadow-sm transition-all duration-300">
                    <div className="mx-auto flex h-9 items-center px-4 max-w-[1600px] text-[12px] font-medium text-slate-500">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
        </>
    );
}
