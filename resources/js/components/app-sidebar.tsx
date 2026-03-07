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
        <div className="flex items-center gap-3 px-3 py-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#147da2]">
                <AppLogoIcon className="h-5 w-5 fill-white" />
            </div>
            <div>
                <p className="text-[15px] font-semibold leading-tight text-slate-800">Pathlog</p>
                <p className="text-[11px] font-medium text-slate-400">Healthcare Management</p>
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

    const isActive = visibleItems.some((item) => currentUrl.startsWith(item.matchPrefix));

    return (
        <div className="px-3">
            <button
                type="button"
                onClick={() => setOpen((current) => !current)}
                className={`flex w-full items-center justify-between rounded-md px-3 py-2 transition-colors ${
                    isActive
                        ? 'bg-[#eef6f9] text-[#147da2]'
                        : 'text-slate-600 hover:bg-slate-50'
                }`}
            >
                <div className="flex items-center gap-2.5">
                    <SectionIcon className={`h-[18px] w-[18px] ${isActive ? 'text-[#147da2]' : 'text-slate-400'}`} />
                    <span className="text-[13px] font-medium">{section.title}</span>
                </div>
                <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform ${
                        open ? 'rotate-0' : '-rotate-90'
                    } ${isActive ? 'text-[#147da2]' : 'text-slate-400'}`}
                />
            </button>

            {open && (
                <div className="ml-4 mt-0.5 border-l border-slate-200 pl-4">
                    <ul className="space-y-0.5 py-1">
                        {visibleItems.map((item) => {
                            const itemActive = currentUrl.startsWith(item.matchPrefix);
                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className={`block rounded-md px-2.5 py-1.5 text-[13px] transition-colors ${
                                            itemActive
                                                ? 'bg-[#147da2] font-medium text-white'
                                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                                        }`}
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
        <div className="flex items-center gap-3 border-t border-slate-100 px-4 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#147da2] text-white">
                <UserRound className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-slate-700">{auth.user.name}</p>
                <p className="truncate text-[11px] text-slate-400">{auth.user.email}</p>
            </div>
            <Link
                href={logout()}
                as="button"
                className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                title="Logout"
            >
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
        <Sidebar collapsible="offcanvas" variant="sidebar" className="top-14 h-[calc(100svh-3.5rem)] border-r border-slate-100 bg-white">
            <SidebarHeader className="border-b border-slate-100 pb-3">
                <SidebarLogo />
                {canAccessFrontDesk && (
                    <div className="mt-2 px-3">
                        <div className="flex items-center gap-2">
                            <Building2 className="h-3.5 w-3.5 text-[#147da2]" />
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#147da2]">
                                Front Desk
                            </span>
                        </div>
                    </div>
                )}
            </SidebarHeader>

            <SidebarContent className="space-y-1 py-3">
                {canAccessFrontDesk && frontDeskSections.map((section) => (
                    <PermissionMenuSection key={section.key} section={section} permissions={permissions} />
                ))}

                {canAccessAdmin && (
                    <div className="px-3">
                        <Link
                            href="/admin/labs/features"
                            className="flex items-center justify-between rounded-md px-3 py-2 text-[13px] font-medium text-slate-600 transition-colors hover:bg-slate-50"
                        >
                            <span>Admin Feature Control</span>
                            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
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
