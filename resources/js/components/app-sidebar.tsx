import { Link, usePage } from '@inertiajs/react';
import {
    Building2,
    CalendarClock,
    ChevronDown,
    ChevronRight,
    CreditCard,
    FileCheck2,
    FileText,
    HandCoins,
    LogOut,
    ShoppingCart,
    Stethoscope,
    UserRound,
    Users,
} from 'lucide-react';
import { type ComponentType, useEffect, useState } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';
import { logout } from '@/routes';
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
        title: 'Billing',
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
            { title: 'Add Patient', href: '/lab/patients/add', permission: 'patients.add', matchPrefix: '/lab/patients/add' },
            { title: 'Manage Patients', href: '/lab/patients/manage', permission: 'patients.manage', matchPrefix: '/lab/patients/manage' },
            { title: 'Patient Records', href: '/lab/coming-soon', permission: 'patient_services.records', matchPrefix: '/lab/patient-services/records' },
        ],
    },
    {
        key: 'referral-doctors',
        title: 'Lab Doctors',
        icon: Stethoscope,
        items: [
            { title: 'Add Lab Doctor', href: '/lab/doctors/add', permission: 'doctors.add', matchPrefix: '/lab/doctors/add' },
            { title: 'Manage Lab Doctors', href: '/lab/doctors/manage', permission: 'doctors.manage', matchPrefix: '/lab/doctors/manage' },
            { title: 'Lab Doctor Records', href: '/lab/coming-soon', permission: 'doctor_desk.records', matchPrefix: '/lab/doctor-desk/records' },
        ],
    },
    {
        key: 'clinical-master',
        title: 'Clinical Master',
        icon: CreditCard,
        items: [
            { title: 'Test Groups', href: '/lab/clinical-master/test-groups', permission: 'clinical_master.manage_groups', matchPrefix: '/lab/clinical-master/test-groups' },
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
            { title: 'Sample Management', href: '/lab/test-reports/result-entry', permission: 'reports.sample_management', matchPrefix: '/lab/test-reports/sample-management' },
            { title: 'Result Entry', href: '/lab/test-reports/result-entry', permission: 'reports.result_entry', matchPrefix: '/lab/test-reports/result-entry' },
            { title: 'Report Formats', href: '/lab/coming-soon', permission: 'reports.report_formats', matchPrefix: '/lab/test-reports/report-formats' },
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
        title: 'Settings',
        icon: Building2,
        items: [
            { title: 'Configuration', href: '/lab/configuration', permission: 'front_desk.access', matchPrefix: '/lab/configuration' },
            { title: 'Lab Staff & Approvers', href: '/lab/staff', permission: 'front_desk.access', matchPrefix: '/lab/staff' },
            { title: 'My Subscription', href: '/lab/subscription', permission: 'front_desk.access', matchPrefix: '/lab/subscription' },
            { title: 'Lab Appearance', href: '/settings/appearance', permission: 'front_desk.access', matchPrefix: '/settings/appearance' },
        ],
    },
];

const doctorPortalSections: MenuSection[] = [
    {
        key: 'doctor-overview',
        title: 'Doctor Dashboard',
        icon: Stethoscope,
        items: [
            { title: 'Dashboard', href: '/doctor/dashboard', permission: 'doctor_portal.access', matchPrefix: '/doctor/dashboard' },
            { title: 'Referred Patients', href: '/doctor/referred-patients', permission: 'doctor_portal.referred_patients', matchPrefix: '/doctor/referred-patients' },
        ],
    },
    {
        key: 'doctor-appointments',
        title: 'Appointments',
        icon: CalendarClock,
        items: [
            { title: 'Schedule & Calendar', href: '/doctor/appointments', permission: 'doctor_portal.appointments', matchPrefix: '/doctor/appointments' },
            { title: 'Leave Management', href: '/doctor/leaves', permission: 'doctor_portal.leave_management', matchPrefix: '/doctor/leaves' },
        ],
    },
    {
        key: 'doctor-finance',
        title: 'Commission',
        icon: HandCoins,
        items: [
            { title: 'Gift Commission', href: '/doctor/commissions', permission: 'doctor_portal.commissions', matchPrefix: '/doctor/commissions' },
        ],
    },
    {
        key: 'doctor-reports',
        title: 'Reports',
        icon: FileText,
        items: [
            { title: 'Report Queue', href: '/doctor/reports', permission: 'doctor_portal.reports', matchPrefix: '/doctor/reports' },
        ],
    },
];

const collectionCenterSections: MenuSection[] = [
    {
        key: 'cc-dashboard',
        title: 'Collection Center',
        icon: Building2,
        items: [
            { title: 'Dashboard', href: '/cc/dashboard', permission: 'dashboard.view', matchPrefix: '/cc/dashboard' },
            { title: 'Price List', href: '/cc/price-list', permission: 'billing.create', matchPrefix: '/cc/price-list' },
            { title: 'Wallet & Earnings', href: '/cc/wallet', permission: 'wallet.view', matchPrefix: '/cc/wallet' },
        ],
    },
    {
        key: 'cc-billing',
        title: 'Billing',
        icon: CreditCard,
        items: [
            { title: 'New Bill', href: '/cc/billing/create', permission: 'billing.create', matchPrefix: '/cc/billing/create' },
            { title: 'Manage Bills', href: '/cc/billing/manage', permission: 'billing.manage', matchPrefix: '/cc/billing/manage' },
            { title: 'Manage Samples', href: '/cc/billing/samples', permission: 'samples.manage', matchPrefix: '/cc/billing/samples' },
        ],
    },
    {
        key: 'cc-patients',
        title: 'Patients',
        icon: Users,
        items: [
            { title: 'Add Patient', href: '/cc/patients/add', permission: 'patients.add', matchPrefix: '/cc/patients/add' },
            { title: 'Manage Patients', href: '/cc/patients/manage', permission: 'patients.manage', matchPrefix: '/cc/patients/manage' },
        ],
    },
    {
        key: 'cc-doctors',
        title: 'Referral Doctors',
        icon: Stethoscope,
        items: [
            { title: 'Add Referral Doctor', href: '/cc/doctors/add', permission: 'doctors.add', matchPrefix: '/cc/doctors/add' },
            { title: 'Manage Referral Doctors', href: '/cc/doctors/manage', permission: 'doctors.manage', matchPrefix: '/cc/doctors/manage' },
        ],
    },
];

function SidebarLogo({ currentLabName }: { currentLabName?: string | null }) {
    return (
        <div className="flex items-center gap-3 px-3 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-[#147da2]">
                <AppLogoIcon className="h-5 w-5 fill-white" />
            </div>
            <div className="min-w-0">
                <p className="truncate text-base font-semibold leading-none text-slate-900">Pathlog</p>
                <p className="mt-0.5 truncate text-[11px] text-slate-500">{currentLabName || 'Healthcare Management'}</p>
            </div>
        </div>
    );
}

function PermissionMenuSection({ section, permissions, isAdmin }: { section: MenuSection; permissions: string[]; isAdmin: boolean }) {
    const { currentUrl } = useCurrentUrl();
    const [open, setOpen] = useState(false);
    const SectionIcon = section.icon;

    const visibleItems = section.items.filter((item) => {
        const hasPermission = permissions.includes(item.permission);
        if (!hasPermission) {
            return false;
        }

        if (isAdmin && item.title === 'My Subscription') {
            return false;
        }

        return true;
    });

    useEffect(() => {
        const isChildActive = visibleItems.some((item) => currentUrl.startsWith(item.matchPrefix));
        if (isChildActive) {
            setOpen(true);
        }
    }, [currentUrl, visibleItems]);

    if (visibleItems.length === 0) {
        return null;
    }

    const isActive = visibleItems.some((item) => currentUrl.startsWith(item.matchPrefix));

    return (
        <div className="mb-1 px-2.5">
            <button
                type="button"
                onClick={() => setOpen((current) => !current)}
                className={cn(
                    'flex w-full items-center justify-between border border-transparent px-2.5 py-2 text-left transition-colors',
                    isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50',
                )}
            >
                <div className="flex items-center gap-2">
                    <SectionIcon className={cn('h-4 w-4', isActive ? 'text-[#147da2]' : 'text-slate-400')} />
                    <span className="text-[13px] font-medium">{section.title}</span>
                </div>
                <ChevronDown className={cn('h-3.5 w-3.5 text-slate-400 transition-transform', open ? 'rotate-0' : '-rotate-90')} />
            </button>

            {open && (
                <div className="ml-5 border-l border-slate-100 pl-3">
                    <ul className="space-y-0.5 py-1">
                        {visibleItems.map((item) => {
                            const itemActive = currentUrl.startsWith(item.matchPrefix);
                            return (
                                <li key={item.href + item.title}>
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            'block px-2 py-1.5 text-[12px] transition-colors',
                                            itemActive ? 'bg-[#147da2] text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800',
                                        )}
                                    >
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
        <div className="mt-auto border-t border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-[#147da2]">
                    <UserRound className="h-4 w-4 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-slate-800">{auth.user.name}</p>
                    <p className="truncate text-[11px] text-slate-500">{auth.user.email}</p>
                </div>
                <Link href={logout()} as="button" className="flex h-8 w-8 items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500" title="Logout">
                    <LogOut className="h-4 w-4" />
                </Link>
            </div>
        </div>
    );
}

export function AppSidebar() {
    const page = usePage();
    const { currentUrl } = useCurrentUrl();
    const access = page.props.access as { permissions?: string[]; is_admin?: boolean } | undefined;
    const currentPanel = page.props.currentPanel as { key?: string } | undefined;
    const permissions = access?.permissions ?? [];
    const isAdmin = access?.is_admin ?? false;
    const isCollectionCenterPanel = currentPanel?.key === 'collection_center';
    const isDoctorPanel = currentPanel?.key === 'doctor';
    const isAdminPanel = currentPanel?.key === 'admin';

    const canAccessAdmin = permissions.includes('admin.labs.features') || isAdmin;
    const canAccessFrontDesk =
        permissions.includes('front_desk.access') ||
        frontDeskSections.some((section) => section.items.some((item) => permissions.includes(item.permission)));
    const canAccessDoctorPortal =
        permissions.includes('doctor_portal.access') ||
        doctorPortalSections.some((section) => section.items.some((item) => permissions.includes(item.permission)));
    const canAccessCollectionCenter = collectionCenterSections.some((section) => section.items.some((item) => permissions.includes(item.permission)));

    const currentLab = page.props.currentLab as { id: number; name: string | null } | undefined;
    const currentCollectionCenter = page.props.currentCollectionCenter as { name?: string | null } | undefined;

    return (
        <Sidebar collapsible="offcanvas" variant="sidebar" className="top-14 h-[calc(100svh-3.5rem)] border-r border-slate-200 bg-white">
            <SidebarHeader className="border-b border-slate-200 bg-white pb-2">
                <SidebarLogo currentLabName={isCollectionCenterPanel ? currentCollectionCenter?.name ?? currentLab?.name : currentLab?.name} />
                <div className="px-3 pb-1">
                    <div className="inline-flex items-center gap-2 border border-slate-200 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#147da2]">
                        <Building2 className="h-3 w-3" />
                        {isCollectionCenterPanel
                            ? 'Partner CC'
                            : isDoctorPanel
                              ? 'Doctor Desk'
                              : isAdminPanel
                                ? 'Admin Desk'
                                : 'Front Desk'}
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent className="space-y-1 py-2">
                {isCollectionCenterPanel && canAccessCollectionCenter && collectionCenterSections.map((section) => (
                    <PermissionMenuSection key={section.key} section={section} permissions={permissions} isAdmin={isAdmin} />
                ))}

                {!isCollectionCenterPanel && canAccessFrontDesk && frontDeskSections.map((section) => (
                    <PermissionMenuSection key={section.key} section={section} permissions={permissions} isAdmin={isAdmin} />
                ))}

                {!isCollectionCenterPanel && canAccessDoctorPortal && doctorPortalSections.map((section) => (
                    <PermissionMenuSection key={section.key} section={section} permissions={permissions} isAdmin={isAdmin} />
                ))}

                {!isCollectionCenterPanel && canAccessAdmin && (
                    <div className="mt-3 px-2.5">
                        <div className="mb-1.5 px-2.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Admin</div>
                        <Link
                            href="/admin/labs"
                            className={cn(
                                'flex items-center justify-between border border-transparent px-2.5 py-2 text-[13px] font-medium text-slate-600 transition-colors',
                                currentUrl.startsWith('/admin/labs') && !currentUrl.includes('/features')
                                    ? 'bg-slate-100 text-slate-900'
                                    : 'hover:bg-slate-50',
                            )}
                        >
                            <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-slate-400" />
                                <span>Manage Labs</span>
                            </div>
                            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                        </Link>

                        <Link
                            href="/admin/labs/features"
                            className={cn(
                                'flex items-center justify-between border border-transparent px-2.5 py-2 text-[13px] font-medium text-slate-600 transition-colors',
                                currentUrl.startsWith('/admin/labs/features') ? 'bg-slate-100 text-slate-900' : 'hover:bg-slate-50',
                            )}
                        >
                            <div className="flex items-center gap-2">
                                <FileCheck2 className="h-4 w-4 text-slate-400" />
                                <span>Feature Matrix</span>
                            </div>
                            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                        </Link>

                        <Link
                            href="/admin/users/manage"
                            className={cn(
                                'flex items-center justify-between border border-transparent px-2.5 py-2 text-[13px] font-medium text-slate-600 transition-colors',
                                currentUrl.startsWith('/admin/users/manage') ? 'bg-slate-100 text-slate-900' : 'hover:bg-slate-50',
                            )}
                        >
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-slate-400" />
                                <span>Manage Users</span>
                            </div>
                            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                        </Link>

                        <Link
                            href="/admin/plans"
                            className={cn(
                                'flex items-center justify-between border border-transparent px-2.5 py-2 text-[13px] font-medium text-slate-600 transition-colors',
                                currentUrl.startsWith('/admin/plans') ? 'bg-slate-100 text-slate-900' : 'hover:bg-slate-50',
                            )}
                        >
                            <div className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-slate-400" />
                                <span>Plans</span>
                            </div>
                            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                        </Link>

                        <Link
                            href="/admin/doctors"
                            className={cn(
                                'flex items-center justify-between border border-transparent px-2.5 py-2 text-[13px] font-medium text-slate-600 transition-colors',
                                currentUrl.startsWith('/admin/doctors') ? 'bg-slate-100 text-slate-900' : 'hover:bg-slate-50',
                            )}
                        >
                            <div className="flex items-center gap-2">
                                <Stethoscope className="h-4 w-4 text-slate-400" />
                                <span>Manage Doctors</span>
                            </div>
                            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                        </Link>
                    </div>
                )}
            </SidebarContent>

            <SidebarFooter className="mt-auto p-0">
                <SidebarUserFooter />
            </SidebarFooter>
        </Sidebar>
    );
}
