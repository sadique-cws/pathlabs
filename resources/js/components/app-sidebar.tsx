import { Link, usePage } from '@inertiajs/react';
import {
    Building2,
    ChevronDown,
    ChevronRight,
    CreditCard,
    FileCheck2,
    LogOut,
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
        key: 'clinical-master',
        title: 'Clinical Master',
        icon: CreditCard,
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
        ],
    },
    {
        key: 'lab-doctor-desk',
        title: 'Lab Doctor Desk',
        icon: Stethoscope,
        items: [
            { title: 'Add Doctor', href: '/lab/doctors/add', permission: 'doctors.manage', matchPrefix: '/lab/doctors/add' },
            { title: 'Doctor List', href: '/lab/doctors/manage', permission: 'doctors.manage', matchPrefix: '/lab/doctors/manage' },
        ],
    },
    {
        key: 'test-reports',
        title: 'Test Reports',
        icon: FileCheck2,
        items: [
            { title: 'Test Units', href: '/lab/test-reports/test-units', permission: 'reports.test_units', matchPrefix: '/lab/test-reports/test-units' },
            { title: 'Test Methods', href: '/lab/test-reports/test-methods', permission: 'reports.test_methods', matchPrefix: '/lab/test-reports/test-methods' },
            { title: 'Sample Management', href: '/lab/test-reports/sample-management', permission: 'reports.sample_management', matchPrefix: '/lab/test-reports/sample-management' },
            { title: 'Result Entry', href: '/lab/test-reports/result-entry', permission: 'reports.result_entry', matchPrefix: '/lab/test-reports/result-entry' },
        ],
    },
];

function SidebarLogo() {
    return (
        <div className="flex items-center gap-2 px-2 pt-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-50">
                <AppLogoIcon className="h-7 w-7 text-[#2790b2]" />
            </div>
            <div>
                <p className="text-lg font-bold leading-5 text-slate-900">Pathlog</p>
                <p className="text-xs text-slate-500">Healthcare Management</p>
            </div>
        </div>
    );
}

function PermissionMenuSection({ section, permissions }: { section: MenuSection; permissions: string[] }) {
    const { currentUrl } = useCurrentUrl();
    const [open, setOpen] = useState(false);
    const SectionIcon = section.icon;
    const visibleItems = section.items.filter((item) => permissions.includes(item.permission));

    useEffect(() => {
        setOpen(visibleItems.some((item) => currentUrl.startsWith(item.matchPrefix)));
    }, [currentUrl]);

    if (visibleItems.length === 0) {
        return null;
    }

    return (
        <div className="space-y-2">
            <div className="px-2">
                <button type="button" onClick={() => setOpen((current) => !current)} className="flex w-full items-center justify-between rounded-xl bg-[#dfe9ef] px-3 py-2">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#b8d3e2] text-[#197ca1]">
                            <SectionIcon className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium text-slate-700">{section.title}</span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-[#197ca1]" />
                </button>
            </div>

            {open && (
                <div className="pl-9">
                    <div className="border-l border-slate-200 pl-4">
                        <ul className="space-y-2 text-sm text-slate-600">
                            {visibleItems.map((item) => (
                                <li key={item.href}>
                                    <Link href={item.href} className="flex items-center gap-3 hover:text-[#197ca1]">
                                        <span className="h-2 w-2 rounded-full bg-slate-300" />
                                        {item.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}

function SidebarUserFooter() {
    const { auth } = usePage().props as { auth: { user: User } };

    return (
        <div className="flex items-center gap-2 border-t border-slate-200 bg-white px-2 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2f83a5] text-white">
                <UserRound className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800">{auth.user.name}</p>
                <p className="truncate text-xs text-slate-500">{auth.user.email}</p>
            </div>
            <Link href={logout()} as="button" className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <LogOut className="h-4 w-4" />
            </Link>
        </div>
    );
}

export function AppSidebar() {
    const page = usePage();
    const permissions = (page.props.access as { permissions?: string[] } | undefined)?.permissions ?? [];
    const canAccessAdmin = permissions.includes('admin.labs.features');
    const canAccessFrontDesk = permissions.includes('front_desk.access') || frontDeskSections.some((section) => section.items.some((item) => permissions.includes(item.permission)));

    return (
        <Sidebar collapsible="offcanvas" variant="sidebar" className="top-14 h-[calc(100svh-3.5rem)] border-r border-slate-200 bg-[#f6f8fa]">
            <SidebarHeader className="border-b border-slate-200 pb-3">
                <SidebarLogo />
                <div className="mt-3 border-t border-slate-200 pt-3" />
                {canAccessFrontDesk && (
                    <div className="px-2">
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#e1e9ee] text-[#197ca1]">
                                <Building2 className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-xs font-bold tracking-widest text-[#197ca1]">FRONT DESK</p>
                                <div className="mt-1 h-[2px] w-14 bg-[#7fb3c9]" />
                            </div>
                        </div>
                    </div>
                )}
            </SidebarHeader>

            <SidebarContent className="space-y-4 py-4">
                {canAccessFrontDesk && frontDeskSections.map((section) => (
                    <PermissionMenuSection key={section.key} section={section} permissions={permissions} />
                ))}

                {canAccessAdmin && (
                    <div className="px-2">
                        <Link href="/admin/labs/features" className="flex items-center justify-between rounded-xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200">
                            <span>Admin Feature Control</span>
                            <ChevronRight className="h-4 w-4 text-slate-400" />
                        </Link>
                    </div>
                )}
            </SidebarContent>

            <SidebarFooter className="p-0">
                <SidebarUserFooter />
            </SidebarFooter>
        </Sidebar>
    );
}
