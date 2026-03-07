import { Link, usePage } from '@inertiajs/react';
import { Eye, FileText, Menu, ReceiptIndianRupee, Wifi, WifiOff } from 'lucide-react';
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
    { title: '+ Lab Bill', href: '/lab/billing/create', permission: 'billing.create' },
    { title: '+ CC Bill', href: '/lab/billing/create', permission: 'billing.create' },
    { title: 'Manage Bills', href: '/lab/billing/manage', permission: 'billing.manage' },
    { title: 'Test Result Entry', href: '/lab/billing/create', permission: 'test_result.entry' },
    { title: 'Admin Features', href: '/admin/labs/features', permission: 'admin.labs.features' },
];

function SidebarToggleButton() {
    const { toggleSidebar } = useSidebar();

    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-lg border border-white/40 text-white hover:bg-white/10 hover:text-white"
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

    useEffect(() => {
        const evaluateConnectivity = (): void => {
            if (!navigator.onLine) {
                setConnectivity('offline');
                return;
            }

            const browserNavigator = navigator as Navigator & {
                connection?: { effectiveType?: string; downlink?: number };
            };
            const network = browserNavigator.connection;

            if (network === undefined) {
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
            window.removeEventListener('online', evaluateConnectivity);
            window.removeEventListener('offline', evaluateConnectivity);
        };
    }, []);

    const walletLabel = useMemo(() => {
        const balance = Number(wallet?.balance ?? 0);

        return `₹***${balance.toFixed(2)}`;
    }, [wallet?.balance]);

    const connectionIcon = connectivity === 'offline' ? WifiOff : Wifi;
    const connectionColor = connectivity === 'strong'
        ? 'text-emerald-600'
        : connectivity === 'weak'
            ? 'text-amber-500'
            : 'text-rose-500';

    const ConnectivityIcon = connectionIcon;

    return (
        <>
            <header className="border-b border-[#0d708e] bg-[#147da2] text-white">
                <div className="flex h-14 items-center px-4">
                    <div className="mr-5">
                        {withSidebarToggle ? <SidebarToggleButton /> : null}
                    </div>

                    <nav className="hidden items-center gap-6 lg:flex">
                        {quickActions
                            .filter((item) => permissions.includes(item.permission))
                            .map((item) => (
                            <Link key={item.title} href={item.href} className="text-[16px] font-medium text-white/95 transition hover:text-white">
                                {item.title}
                            </Link>
                            ))}
                    </nav>

                    <div className="ml-auto flex items-center gap-3">
                        <div className="flex items-center overflow-hidden rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">
                            <div className="flex items-center gap-1 px-3 py-1.5">
                                <ReceiptIndianRupee className="h-4 w-4" />
                                {walletLabel}
                            </div>
                            <div className="border-l border-emerald-300 px-3 py-1.5">
                                <Eye className="h-4 w-4" />
                            </div>
                        </div>

                        <ConnectivityIcon className={cn('h-5 w-5', connectionColor)} />
                        <FileText className="h-5 w-5 text-white" />
                    </div>
                </div>
            </header>

            {breadcrumbs.length > 0 && (
                <div className="border-b bg-white">
                    <div className="flex h-10 items-center px-4 text-sm text-slate-500">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
        </>
    );
}
