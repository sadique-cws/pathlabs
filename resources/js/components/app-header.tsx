import { Link, usePage } from '@inertiajs/react';
import { 
    Bell, 
    Wifi,
    WifiOff,
    WifiLow,
    PlusCircle, 
    LayoutDashboard,
    Search,
    Wallet,
    ChevronDown,
    UserCircle,
    LogOut
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useConnectivity } from '@/hooks/use-connectivity';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem, User } from '@/types';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { logout } from '@/routes';

interface Props {
    breadcrumbs?: BreadcrumbItem[];
    withSidebarToggle?: boolean;
}

export function AppHeader({ withSidebarToggle = false }: Props) {
    const { connectivity } = useConnectivity();
    const props = usePage().props as any;
    
    // Support both structures just in case
    const walletBalance = props.wallet?.balance ?? props.wallet_balance ?? 0;
    const permissions = props.access?.permissions ?? [];
    const auth = props.auth as { user: User };
    
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const ConnectivityIcon = connectivity === 'Strong' ? Wifi : connectivity === 'Weak' ? WifiLow : WifiOff;
    const connectionColor = connectivity === 'Strong' 
        ? 'text-emerald-400' 
        : connectivity === 'Weak' 
        ? 'text-amber-400' 
        : 'text-rose-400';

    return (
        <header className={cn(
            "fixed top-0 right-0 z-50 flex items-center justify-between px-4 transition-all duration-300",
            "bg-[#147da2] text-white w-full",
            scrolled ? "h-12 shadow-md" : "h-14"
        )}>
            <div className="flex items-center gap-4">
                {withSidebarToggle && (
                    <SidebarTrigger className="text-white hover:bg-white/10 shrink-0" />
                )}
                
                <div className="hidden lg:flex items-center gap-6 ml-2">
                    {permissions?.includes('billing.create') && (
                        <Link href="/lab/billing/create" className="flex items-center gap-2 text-sm font-medium hover:text-white/80 transition-colors">
                            <PlusCircle className="h-4 w-4" />
                            <span>New Lab Bill</span>
                        </Link>
                    )}
                    {permissions?.includes('billing.manage') && (
                        <Link href="/lab/billing/manage" className="flex items-center gap-2 text-sm font-medium hover:text-white/80 transition-colors">
                            <LayoutDashboard className="h-4 w-4" />
                            <span>Manage Bills</span>
                        </Link>
                    )}
                    {permissions?.includes('reports.result_entry') && (
                        <Link href="/lab/test-reports/result-entry" className="flex items-center gap-2 text-sm font-medium hover:text-white/80 transition-colors">
                            <Search className="h-4 w-4" />
                            <span>Result Entry</span>
                        </Link>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 md:gap-5">
                <div className="hidden md:flex items-center bg-white/10 hover:bg-white/20 transition-all border border-white/10  px-3 py-1.5 w-64 group">
                    <Search className="h-4 w-4 text-white/60 group-hover:text-white/80" />
                    <span className="ml-2 text-xs text-white/60 group-hover:text-white/80">Search everything...</span>
                </div>

                <div className="flex items-center gap-3">
                    {permissions?.includes('wallet.view') && (
                        <Link 
                            href="/lab/wallet" 
                            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-all border border-white/10  px-3 py-1 text-xs md:text-sm font-semibold"
                        >
                            <div className="p-1 bg-emerald-500 ">
                                <Wallet className="h-3.5 w-3.5 text-white" />
                            </div>
                            <div className="flex flex-col items-start leading-none mr-2">
                                <span className="text-[9px] uppercase tracking-wider opacity-60">Balance</span>
                                <span>₹{parseFloat(walletBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                        </Link>
                    )}
                    
                    <button className="relative p-2  hover:bg-white/10 transition-colors">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500  border-2 border-[#147da2]"></span>
                    </button>

                    <div className="h-6 w-[1px] bg-white/20 hidden md:block"></div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-2 p-1 pl-2  hover:bg-white/10 transition-all outline-none">
                                <div className="hidden md:block text-right mr-1">
                                    <p className="text-[12px] font-bold leading-tight truncate max-w-[120px]">{auth?.user?.name}</p>
                                    <p className="text-[10px] text-white/70 leading-tight">Lab Executive</p>
                                </div>
                                <div className="w-8 h-8  bg-white/20 flex items-center justify-center border border-white/30 text-white font-bold shrink-0">
                                    {auth?.user?.name?.charAt(0)}
                                </div>
                                <ChevronDown className="h-4 w-4 text-white/60" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 mt-1 shadow-xl">
                            <DropdownMenuLabel className="flex flex-col">
                                <span>{auth?.user?.name}</span>
                                <span className="text-xs font-normal text-slate-500">{auth?.user?.email}</span>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer">
                                <UserCircle className="mr-2 h-4 w-4" />
                                <span>My Profile</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer text-rose-600 focus:text-rose-600">
                                <Link href={logout()} as="button" className="flex items-center w-full">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Logout</span>
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="hidden md:flex items-center gap-2 ml-1">
                        <ConnectivityIcon 
                            className={cn('h-5 w-5 transition-colors', connectionColor)} 
                        />
                    </div>
                </div>
            </div>
        </header>
    );
}
