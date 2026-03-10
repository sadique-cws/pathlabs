import { Link, usePage } from '@inertiajs/react';
import { 
    Bell, 
    Wifi,
    WifiOff,
    WifiLow,
    PlusCircle, 
    LayoutDashboard,
    Search,
    Stethoscope,
    Wallet,
    ChevronDown,
    UserCircle,
    LogOut,
    X
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

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

    useEffect(() => {
        if (!searchQuery.trim() || searchQuery.length < 2) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setIsSearching(true);
            try {
                const response = await fetch(`/lab/search?query=${encodeURIComponent(searchQuery)}`);
                const data = await response.json();
                setSearchResults(data);
                setShowResults(true);
            } catch (error) {
                console.error('Search failed', error);
            } finally {
                setIsSearching(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    // Handle outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.search-container')) {
                setShowResults(false);
            }
        };

        if (showResults) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showResults]);

    const getResultIcon = (type: string) => {
        switch (type) {
            case 'Patient': return <UserCircle className="h-4 w-4" />;
            case 'Bill': return <LayoutDashboard className="h-4 w-4" />;
            case 'Test': return <Search className="h-4 w-4" />;
            case 'Package': return <PlusCircle className="h-4 w-4" />;
            case 'Doctor': return <Stethoscope className="h-4 w-4" />;
            default: return <Search className="h-4 w-4" />;
        }
    };

    const ConnectivityIcon = connectivity === 'Strong' ? Wifi : connectivity === 'Weak' ? WifiLow : WifiOff;
    const connectionColor = connectivity === 'Strong' 
        ? 'text-emerald-400' 
        : connectivity === 'Weak' 
        ? 'text-amber-400' 
        : 'text-rose-400';

    return (
        <header className={cn(
            "fixed top-0 right-0 z-[60] flex items-center justify-between px-4 transition-all duration-300",
            "bg-[#147da2] text-white w-full",
            scrolled ? "h-12 shadow-md" : "h-14"
        )}>
            {/* Mobile Search Overlay */}
            {isMobileSearchOpen && (
                <div className="absolute inset-0 z-[100] bg-[#147da2] flex items-center px-4 gap-3 animate-in fade-in slide-in-from-top duration-200">
                    <div className="flex-1 flex items-center bg-white/10 border border-white/20 px-3 py-2">
                        <Search className={cn("h-4 w-4 text-white/60", isSearching && "animate-pulse")} />
                        <input
                            autoFocus
                            type="text"
                            placeholder="Find Patient, Bill, Test, Doctor..."
                            className="bg-transparent border-none outline-none ml-2 text-sm text-white placeholder:text-white/40 w-full"
                            value={searchQuery}
                            onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={() => setIsMobileSearchOpen(false)}
                        className="p-2 text-white/80 hover:text-white"
                    >
                        <X className="h-5 w-5" />
                    </button>
                    
                    {showResults && (
                        <div className="absolute top-14 left-0 w-full bg-white shadow-2xl border-b border-slate-200 overflow-hidden overflow-y-auto max-h-[80vh]">
                            {searchQueryResult()}
                        </div>
                    )}
                </div>
            )}
            <div className="flex items-center gap-4 flex-1">
                {withSidebarToggle && (
                    <SidebarTrigger className="text-white hover:bg-white/10 shrink-0" />
                )}
                
                <div className="hidden lg:flex items-center gap-6 ml-2">
                    {props.access?.is_impersonating && (
                        <Link 
                            href="/admin/switch-back" 
                            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 text-sm font-bold shadow-sm"
                        >
                            <UserCircle className="h-4 w-4" />
                            <span>Back to Admin Panel</span>
                        </Link>
                    )}
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
                    {permissions?.includes('doctor_portal.referred_patients') && (
                        <Link href="/doctor/referred-patients" className="flex items-center gap-2 text-sm font-medium hover:text-white/80 transition-colors">
                            <Stethoscope className="h-4 w-4" />
                            <span>Referred Patients</span>
                        </Link>
                    )}
                    {permissions?.includes('doctor_portal.appointments') && (
                        <Link href="/doctor/appointments" className="flex items-center gap-2 text-sm font-medium hover:text-white/80 transition-colors">
                            <PlusCircle className="h-4 w-4" />
                            <span>Appointments</span>
                        </Link>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 md:gap-5 lg:flex-1 justify-end lg:justify-center">
                <div className="search-container relative hidden lg:flex w-full max-w-[400px]">
                    <div className="flex items-center bg-white/10 hover:bg-white/20 transition-all border border-white/20 px-3 py-1.5 group w-full">
                        <Search className={cn("h-4 w-4 text-white/60 group-hover:text-white/80 transition-colors", isSearching && "animate-pulse")} />
                        <input
                            type="text"
                            placeholder="Find Patient, Bill, Test, Doctor..."
                            className="bg-transparent border-none outline-none ml-2 text-xs text-white placeholder:text-white/40 w-full"
                            value={searchQuery}
                            onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {showResults && (
                        <div className="absolute top-full left-0 w-full mt-1 bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="max-h-80 overflow-y-auto">
                                {searchQueryResult()}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-1.5 md:gap-3">
                    <button 
                        onClick={() => setIsMobileSearchOpen(true)}
                        className="p-2 hover:bg-white/10 transition-colors lg:hidden"
                    >
                        <Search className="h-5 w-5" />
                    </button>

                    {permissions?.includes('wallet.view') && (
                        <Link 
                            href="/lab/wallet" 
                            className="flex items-center gap-1.5 md:gap-2 bg-white/10 hover:bg-white/20 transition-all border border-white/10 px-2 md:px-3 py-1 text-xs md:text-sm font-semibold"
                        >
                            <div className="p-1 bg-emerald-500 ">
                                <Wallet className="h-3.5 w-3.5 text-white" />
                            </div>
                            <div className="flex flex-col items-start leading-none mr-1 md:mr-2">
                                <span className="hidden md:block text-[9px] uppercase tracking-wider opacity-60">Balance</span>
                                <span className="text-[11px] md:text-[13px]">₹{parseFloat(walletBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
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

    function searchQueryResult() {
        if (searchResults.length > 0) {
            return (
                <div className="py-2">
                    {searchResults.map((result: any, index: number) => (
                        <Link
                            key={index}
                            href={result.url}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors group"
                            onClick={() => {
                                setShowResults(false);
                                setIsMobileSearchOpen(false);
                            }}
                        >
                            <div className="flex h-8 w-8 items-center justify-center bg-[#147da2]/10 text-[#147da2] group-hover:bg-[#147da2] group-hover:text-white transition-colors shrink-0">
                                {getResultIcon(result.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{result.type}</span>
                                    <span className="text-[13px] font-bold text-slate-800 truncate">{result.title}</span>
                                </div>
                                <p className="text-[11px] text-slate-500 truncate">{result.subtitle}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            );
        }

        return (
            <div className="p-8 text-center bg-white">
                <div className="flex justify-center mb-2">
                    <Search className="h-8 w-8 text-slate-200" />
                </div>
                <p className="text-sm font-semibold text-slate-500">No results for "{searchQuery}"</p>
                <p className="text-xs text-slate-400 mt-1">Try another keyword</p>
            </div>
        );
    }
}
