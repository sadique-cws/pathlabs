import { Link, usePage } from '@inertiajs/react';
import {
    Building2,
    ChevronDown,
    ChevronRight,
    CreditCard,
    FileCheck2,
    LogOut,
    ShoppingCart,
    Stethoscope,
    UserRound,
    Users,
} from 'lucide-react';
import { type ComponentType, useEffect, useState } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
} from '@/components/ui/sidebar';
import { logout } from '@/routes';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';
import type { User } from '@/types';

type MenuItem = {
    title: string;
    href: string;
    permission: string;
    matchPrefix: string;
};

type MenuSection = {
    key: string;
    title: string;
    icon: ComponentType<{ className?: string }>;
    items: MenuItem[];
};

const frontDeskSections: MenuSection[] = [
    {
        key: 'billing',
        title: 'Billing & Front Desk',
        icon: Building2,
        items: [
            { title: 'New Bill', href: '/lab/billing/create', permission: 'billing.create', matchPrefix: '/lab/billing/create' },
            { title: 'Manage Bills', href: '/lab/billing/manage', permission: 'billing.manage', matchPrefix: '/lab/billing/manage' },
            { title: 'Manage Samples', href: '/lab/billing/samples', permission: 'samples.manage', matchPrefix: '/lab/billing/samples' },
        ],
    },
    {
        key: 'patient-services',
        title: 'Patient Services',
        icon: Users,
        items: [
            { title: 'Add Patient', href: '/lab/patients/add', permission: 'patients.manage', matchPrefix: '/lab/patients/add' },
            { title: 'Manage Patients', href: '/lab/patients/manage', permission: 'patients.manage', matchPrefix: '/lab/patients/manage' },
            { title: 'Patient Records', href: '/lab/coming-soon', permission: 'patient_services.records', matchPrefix: '/lab/patient-services/records' },
        ],
    },
    {
        key: 'referral-doctors',
        title: 'Referral Doctors',
        icon: Stethoscope,
        items: [
            { title: 'Add Doctor', href: '/lab/doctors/add', permission: 'doctors.manage', matchPrefix: '/lab/doctors/add' },
            { title: 'Manage Doctors', href: '/lab/doctors/manage', permission: 'doctors.manage', matchPrefix: '/lab/doctors/manage' },
            { title: 'Doctor Records', href: '/lab/coming-soon', permission: 'doctor_desk.records', matchPrefix: '/lab/doctor-desk/records' },
        ],
    },
    {
        key: 'clinical-master',
        title: 'Clinical Master',
        icon: CreditCard,
        items: [
            { title: 'Test Groups', href: '/lab/clinical-master/test-groups', permission: 'clinical_master.manage_tests', matchPrefix: '/lab/clinical-master/test-groups' },
            { title: 'Manage Tests', href: '/lab/clinical-master/tests', permission: 'clinical_master.manage_tests', matchPrefix: '/lab/clinical-master/tests' },
            { title: 'Manage Packages', href: '/lab/clinical-master/packages', permission: 'clinical_master.manage_packages', matchPrefix: '/lab/clinical-master/packages' },
        ],
    },
    {
        key: 'test-reports',
        title: 'Test Reports',
        icon: FileCheck2,
        items: [
            { title: 'Test Units', href: '/lab/test-reports/test-units', permission: 'reports.test_units', matchPrefix: '/lab/test-reports/test-units' },
            { title: 'Test Methods', href: '/lab/test-reports/test-methods', permission: 'reports.test_methods', matchPrefix: '/lab/test-reports/test-methods' },
            { title: 'Test Parameters', href: '/lab/test-reports/parameters', permission: 'clinical_master.manage_tests', matchPrefix: '/lab/test-reports/parameters' },
            { title: 'Report Formats', href: '/lab/coming-soon', permission: 'reports.report_formats', matchPrefix: '/lab/test-reports/report-formats' },
            { title: 'Result Entry', href: '/lab/test-reports/result-entry', permission: 'reports.result_entry', matchPrefix: '/lab/test-reports/result-entry' },
            { title: 'Job Sheets', href: '/lab/coming-soon', permission: 'reports.job_sheets', matchPrefix: '/lab/test-reports/job-sheets' },
            { title: 'Performance Metrics', href: '/lab/coming-soon', permission: 'reports.performance_metrics', matchPrefix: '/lab/test-reports/performance-metrics' },
            { title: 'Lab Overview', href: '/lab/coming-soon', permission: 'reports.lab_overview', matchPrefix: '/lab/test-reports/lab-overview' },
        ],
    },
    {
        key: 'procurement',
        title: 'Procurement',
        icon: ShoppingCart,
        items: [
            { title: 'Vendor Directory', href: '/lab/coming-soon', permission: 'procurement.vendors', matchPrefix: '/lab/procurement/vendors' },
            { title: 'Purchase Orders', href: '/lab/coming-soon', permission: 'procurement.orders', matchPrefix: '/lab/procurement/orders' },
        ],
    },
    {
        key: 'settings-plan',
        title: 'Settings & Plan',
        icon: Building2,
        items: [
            { title: 'Configuration', href: '/lab/configuration', permission: 'front_desk.access', matchPrefix: '/lab/configuration' },
            { title: 'Lab Staff & Approvers', href: '/lab/staff', permission: 'front_desk.access', matchPrefix: '/lab/staff' },
            { title: 'My Subscription', href: '/lab/subscription', permission: 'front_desk.access', matchPrefix: '/lab/subscription' },
            { title: 'Lab Appearance', href: '/settings/appearance', permission: 'front_desk.access', matchPrefix: '/settings/appearance' },
        ],
    },
];

function SidebarLogo({ currentLabName }: { currentLabName?: string | null }) {
    return (
        <div className="flex items-center gap-3 px-3 py-1.5 group cursor-default">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center bg-[#147da2] transition-transform duration-500 group-hover:scale-105">
                <AppLogoIcon className="h-6 w-6 fill-white" />
                <div className="absolute -inset-0.5 animate-pulse rounded-none border border-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
            <div className="flex flex-col">
                <p className="text-[16px] font-bold tracking-tight text-[#147da2]">PATH<span className="text-slate-900">LABS</span></p>
                <div className="flex items-center gap-1">
                    <div className="h-1 w-1 rounded-full bg-emerald-500" />
                    <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-400 max-w-[120px] truncate">
                        {currentLabName || 'Diagnostic Suite'}
                    </p>
                </div>
            </div>
        </div>
    );
}

function PermissionMenuSection({ section, permissions, isAdmin }: { section: MenuSection; permissions: string[]; isAdmin: boolean }) {
    const { currentUrl } = useCurrentUrl();
    const [open, setOpen] = useState(false);
    const SectionIcon = section.icon;
    
    // Filter items based on permissions AND exclude specific items for admins if needed
    const visibleItems = section.items.filter((item) => {
        const hasPermission = permissions.includes(item.permission);
        if (!hasPermission) return false;

        // Hide "My Subscription" for total admins as they manage plans globally
        if (isAdmin && item.title === 'My Subscription') return false;

        return true;
    });

    useEffect(() => {
        const isChildActive = visibleItems.some((item) => currentUrl.startsWith(item.matchPrefix));
        if (isChildActive) setOpen(true);
    }, [currentUrl]);

    if (visibleItems.length === 0) {
        return null;
    }

    const isActive = visibleItems.some((item) => currentUrl.startsWith(item.matchPrefix));

    return (
        <div className="mb-1 px-3">
            <button
                type="button"
                onClick={() => setOpen((current) => !current)}
                className={cn(
                    "group flex w-full items-center justify-between px-3 py-2.5 transition-all duration-200 border border-transparent",
                    isActive 
                        ? "bg-[#147da2]/5 text-[#147da2] border-[#147da2]/10" 
                        : "text-slate-600 hover:bg-slate-50 hover:text-[#147da2]"
                )}
            >
                <div className="flex items-center gap-2.5">
                    <div className={cn(
                        "flex h-7 w-7 items-center justify-center transition-transform duration-200 group-hover:scale-110",
                        isActive ? "text-[#147da2]" : "text-slate-400"
                    )}>
                        <SectionIcon className="h-[18px] w-[18px]" />
                    </div>
                    <span className="text-[13px] font-semibold tracking-tight">{section.title}</span>
                </div>
                <ChevronDown
                    className={cn(
                        "h-3.5 w-3.5 transition-all duration-300",
                        open ? "rotate-0" : "-rotate-90",
                        isActive ? "text-[#147da2]" : "text-slate-400"
                    )}
                />
            </button>

            {open && (
                <div className="ml-[1.7rem] overflow-hidden border-l border-slate-100 mt-0.5">
                    <ul className="space-y-0.5 py-1.5 pl-3">
                        {visibleItems.map((item) => {
                            const itemActive = currentUrl.startsWith(item.matchPrefix);
                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            "relative flex items-center px-3 py-1.5 text-[12.5px] transition-all duration-200",
                                            itemActive
                                                ? "bg-[#147da2] font-semibold text-white shadow-sm"
                                                : "text-slate-500 hover:text-[#147da2] hover:bg-[#147da2]/5"
                                        )}
                                    >
                                        {itemActive && <div className="absolute left-0 top-0 h-full w-1 bg-white/30" />}
                                        {item.title}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
}

function SidebarUserFooter() {
    const { auth } = usePage().props as { auth: { user: User } };

    return (
        <div className="sawtooth relative mt-auto border-t border-slate-200 bg-slate-50/50 p-4 transition-colors hover:bg-white">
            <div className="flex items-center gap-3">
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center bg-[#147da2] shadow-sm overflow-hidden group">
                    <UserRound className="h-5 w-5 text-white transition-transform duration-300 group-hover:scale-110" />
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-bold text-slate-800 leading-none mb-1">{auth.user.name}</p>
                    <p className="truncate text-[10.5px] font-medium text-slate-400 uppercase tracking-tighter">{auth.user.email}</p>
                </div>
                <Link
                    href={logout()}
                    as="button"
                    className="flex h-9 w-9 items-center justify-center text-slate-400 transition-all duration-200 hover:bg-red-50 hover:text-red-500 hover:scale-105 active:scale-95"
                    title="Logout"
                >
                    <LogOut className="h-4 w-4" />
                </Link>
            </div>
        </div>
    );
}

export function AppSidebar() {
    const page = usePage();
    const { currentUrl } = useCurrentUrl();
    const access = (page.props.access as { permissions?: string[]; is_admin?: boolean } | undefined);
    const permissions = access?.permissions ?? [];
    const isAdmin = access?.is_admin ?? false;
    const canAccessAdmin = permissions.includes('admin.labs.features') || isAdmin;
    const canAccessFrontDesk = permissions.includes('front_desk.access') || frontDeskSections.some((section) => section.items.some((item) => permissions.includes(item.permission)));

    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const currentLab = (page.props.currentLab as { id: number; name: string | null } | undefined);

    return (
        <Sidebar 
            collapsible="offcanvas" 
            variant="sidebar" 
            className={cn(
                "transition-all duration-300 border-r border-slate-200 bg-white",
                scrolled ? "top-12 h-[calc(100svh-3rem)]" : "top-14 h-[calc(100svh-3.5rem)]"
            )}
        >
            <SidebarHeader className="border-b border-slate-100 bg-slate-50/30 pb-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#147da2]/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
                <SidebarLogo currentLabName={currentLab?.name} />
                {canAccessFrontDesk && (
                    <div className="mt-2 px-[1.1rem]">
                        <div className="flex items-center gap-2 py-1 px-2 bg-[#147da2]/5 border border-[#147da2]/10 rounded-none w-fit">
                            <Building2 className="h-3 w-3 text-[#147da2]" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#147da2]">
                                Front Desk Operations
                            </span>
                        </div>
                    </div>
                )}
            </SidebarHeader>

            <SidebarContent className="space-y-1.5 py-4 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                {canAccessFrontDesk && frontDeskSections.map((section) => (
                    <PermissionMenuSection key={section.key} section={section} permissions={permissions} isAdmin={isAdmin} />
                ))}

                {canAccessAdmin && (
                    <div className="mt-4 px-3">
                        <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Admin Controls</div>
                        <Link
                            href="/admin/labs"
                            className={cn(
                                "flex items-center justify-between px-3 py-2.5 text-[13px] font-semibold text-slate-600 transition-all duration-200 border border-transparent",
                                currentUrl.startsWith('/admin/labs') && !currentUrl.includes('/features')
                                    ? "bg-[#147da2]/5 text-[#147da2] border-[#147da2]/10"
                                    : "hover:bg-slate-50 hover:text-[#147da2]"
                            )}
                        >
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-7 w-7 items-center justify-center text-slate-400 group-hover:text-[#147da2]">
                                    <Building2 className="h-[18px] w-[18px]" />
                                </div>
                                <span>Manage Laboratories</span>
                            </div>
                            <ChevronRight className="h-3.5 w-3.5 opacity-50" />
                        </Link>

                        <Link
                            href="/admin/labs/features"
                            className={cn(
                                "flex items-center justify-between px-3 py-2.5 text-[13px] font-semibold text-slate-600 transition-all duration-200 border border-transparent",
                                currentUrl.startsWith('/admin/labs/features')
                                    ? "bg-[#147da2]/5 text-[#147da2] border-[#147da2]/10"
                                    : "hover:bg-slate-50 hover:text-[#147da2]"
                            )}
                        >
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-7 w-7 items-center justify-center text-slate-400 group-hover:text-[#147da2]">
                                    <FileCheck2 className="h-[18px] w-[18px]" />
                                </div>
                                <span>Lab Feature Matrix</span>
                            </div>
                            <ChevronRight className="h-3.5 w-3.5 opacity-50" />
                        </Link>

                        <Link
                            href="/admin/plans"
                            className={cn(
                                "flex items-center justify-between px-3 py-2.5 text-[13px] font-semibold text-slate-600 transition-all duration-200 border border-transparent",
                                currentUrl.startsWith('/admin/plans')
                                    ? "bg-[#147da2]/5 text-[#147da2] border-[#147da2]/10"
                                    : "hover:bg-slate-50 hover:text-[#147da2]"
                            )}
                        >
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-7 w-7 items-center justify-center text-slate-400 group-hover:text-[#147da2]">
                                    <CreditCard className="h-[18px] w-[18px]" />
                                </div>
                                <span>Subscription Plans</span>
                            </div>
                            <ChevronRight className="h-3.5 w-3.5 opacity-50" />
                        </Link>
                    </div>
                )}
            </SidebarContent>

            <SidebarFooter className="p-0 mt-auto">
                <SidebarUserFooter />
            </SidebarFooter>
        </Sidebar>
    );
}
