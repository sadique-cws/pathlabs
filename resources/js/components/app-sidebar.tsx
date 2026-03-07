import { Link, usePage } from '@inertiajs/react';
import {
    Building2,
    ChevronDown,
    ChevronRight,
    CreditCard,
    LogOut,
    Stethoscope,
    UserRound,
    Users,
} from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { logout } from '@/routes';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { User } from '@/types';

function SidebarLogo() {
    return (
        <div className="flex items-center gap-3 px-3 pt-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-md bg-slate-50">
                <AppLogoIcon className="h-10 w-10 text-[#2790b2]" />
            </div>
            <div>
                <p className="text-5 font-bold leading-5 text-slate-900">Pathlog</p>
                <p className="text-sm text-slate-500">Healthcare Management</p>
            </div>
        </div>
    );
}

function BillingSection() {
    const { isCurrentOrParentUrl } = useCurrentUrl();
    const page = usePage();
    const permissions = (page.props.access as { permissions?: string[] } | undefined)?.permissions ?? [];
    const billOpen = isCurrentOrParentUrl('/lab/billing');
    const canCreateBill = permissions.includes('billing.create');
    const canManageBills = permissions.includes('billing.manage');
    const canManageSamples = permissions.includes('samples.manage');

    if (!canCreateBill && !canManageBills && !canManageSamples) {
        return null;
    }

    return (
        <div className="space-y-3">
            <div className="px-3">
                <div className="flex items-center justify-between rounded-3xl bg-[#dfe9ef] px-4 py-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#b8d3e2] text-[#197ca1]">
                            <CreditCard className="h-5 w-5" />
                        </div>
                        <span className="text-[18px] font-medium text-slate-700">Billing (B2C)</span>
                    </div>
                    <ChevronDown className="h-5 w-5 text-[#197ca1]" />
                </div>
            </div>

            {billOpen && (
                <div className="pl-14">
                    <div className="border-l border-slate-200 pl-8">
                        <ul className="space-y-4 text-[18px] text-slate-600">
                            {canCreateBill && (
                                <li>
                                <Link href="/lab/billing/create" className="flex items-center gap-4 hover:text-[#197ca1]">
                                    <span className="h-3 w-3 rounded-full bg-slate-300" />
                                    New Bill
                                </Link>
                                </li>
                            )}
                            {canManageBills && (
                                <li>
                                <Link href="/lab/billing/manage" className="flex items-center gap-4 hover:text-[#197ca1]">
                                    <span className="h-3 w-3 rounded-full bg-slate-300" />
                                    Manage Bills
                                </Link>
                                </li>
                            )}
                            {canManageSamples && (
                                <li>
                                <Link href="/lab/billing/create" className="flex items-center gap-4 hover:text-[#197ca1]">
                                    <span className="h-3 w-3 rounded-full bg-slate-300" />
                                    Manage Samples
                                </Link>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}

function DoctorSection() {
    const page = usePage();
    const permissions = (page.props.access as { permissions?: string[] } | undefined)?.permissions ?? [];
    const canManageDoctors = permissions.includes('doctors.manage');

    if (!canManageDoctors) {
        return null;
    }

    return (
        <div className="space-y-3">
            <div className="px-3">
                <div className="flex items-center justify-between rounded-3xl bg-[#dfe9ef] px-4 py-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#b8d3e2] text-[#197ca1]">
                            <Stethoscope className="h-5 w-5" />
                        </div>
                        <span className="text-[18px] font-medium text-slate-700">Referral Doctors</span>
                    </div>
                    <ChevronDown className="h-5 w-5 text-[#197ca1]" />
                </div>
            </div>
            <div className="pl-14">
                <div className="border-l border-slate-200 pl-8">
                    <Link href="/lab/billing/create" className="flex items-center gap-4 text-[18px] text-slate-600 hover:text-[#197ca1]">
                        <span className="h-3 w-3 rounded-full bg-slate-300" />
                        Add Doctor
                    </Link>
                </div>
            </div>
        </div>
    );
}

function SidebarUserFooter() {
    const { auth } = usePage().props as { auth: { user: User } };

    return (
        <div className="flex items-center gap-3 border-t border-slate-200 bg-white px-3 py-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2f83a5] text-white">
                <UserRound className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="truncate text-[18px] font-semibold text-slate-800">{auth.user.name}</p>
                <p className="truncate text-[15px] text-slate-500">{auth.user.email}</p>
            </div>
            <Link
                href={logout()}
                as="button"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600"
            >
                <LogOut className="h-5 w-5" />
            </Link>
        </div>
    );
}

export function AppSidebar() {
    const page = usePage();
    const permissions = (page.props.access as { permissions?: string[] } | undefined)?.permissions ?? [];
    const { isCurrentOrParentUrl } = useCurrentUrl();
    const isPatientsActive = isCurrentOrParentUrl('/lab/patients');
    const canManagePatients = permissions.includes('patients.manage');
    const canAccessAdmin = permissions.includes('admin.labs.features');

    return (
        <Sidebar collapsible="offcanvas" variant="sidebar" className="top-14 h-[calc(100svh-3.5rem)] w-[340px] border-r border-slate-200 bg-[#f6f8fa]">
            <SidebarHeader className="border-b border-slate-200 pb-5">
                <SidebarLogo />
                <div className="mt-4 border-t border-slate-200 pt-5" />
                <div className="px-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e1e9ee] text-[#197ca1]">
                            <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[17px] font-bold tracking-widest text-[#197ca1]">FRONT DESK</p>
                            <div className="mt-2 h-[3px] w-24 bg-[#7fb3c9]" />
                        </div>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent className="space-y-7 py-5">
                <BillingSection />

                {canManagePatients && (
                    <div className="px-3">
                        <Link
                            href="/lab/billing/create"
                            className={cn(
                                'flex items-center justify-between rounded-3xl px-4 py-3 text-[18px] font-medium text-slate-700 hover:bg-slate-100',
                                isPatientsActive && 'bg-slate-100 text-[#197ca1]',
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#efeff4] text-slate-500">
                                    <Users className="h-5 w-5" />
                                </div>
                                Patients
                            </div>
                            <ChevronRight className="h-5 w-5 text-slate-400" />
                        </Link>
                    </div>
                )}

                <DoctorSection />

                {canAccessAdmin && (
                    <div className="px-3">
                        <Link href="/admin/labs/features" className="flex items-center justify-between rounded-3xl bg-slate-100 px-4 py-3 text-[18px] font-medium text-slate-700 hover:bg-slate-200">
                            <span>Admin Feature Control</span>
                            <ChevronRight className="h-5 w-5 text-slate-400" />
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
