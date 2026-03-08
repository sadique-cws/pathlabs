import { Head, router } from '@inertiajs/react';
import { ChevronDown, ChevronRight, Search, Shield, ShieldCheck, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import type { BreadcrumbItem } from '@/types';

type RoleOption = {
    id: number;
    name: string;
    slug: string;
    is_system: boolean;
    permissions: string[];
};

type PermissionOption = {
    id: number;
    name: string;
    slug: string;
};

type LabUser = {
    id: number;
    name: string;
    email: string;
    roles: string[];
};

type LabFeatureRow = {
    id: number;
    name: string;
    code: string;
    permissions: string[];
    users: LabUser[];
};

type Props = {
    labs: LabFeatureRow[];
    permissionGroups: Record<string, PermissionOption[]>;
    roles: RoleOption[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Permission Management', href: '/admin/labs/features' },
];

const labelMap: Record<string, string> = {
    front_desk: 'Front Desk',
    billing: 'Billing',
    patients: 'Patients',
    doctors: 'Doctors',
    reports: 'Test Reports',
    clinical_master: 'Clinical Master',
    patient_services: 'Patient Services',
    doctor_desk: 'Lab Doctor Desk',
    procurement: 'Procurement',
    dashboard: 'Dashboard',
    admin: 'Admin',
    samples: 'Samples',
    test_result: 'Test Results',
};

function toLabel(value: string): string {
    return labelMap[value] ?? value.replace(/[_.]+/g, ' ').replace(/\b\w/g, (s) => s.toUpperCase());
}

/* ─── Role presets ─── */
const ROLE_PRESETS: Record<string, { label: string; description: string; slugs: string[] }> = {
    front_desk: {
        label: 'Front Desk Staff',
        description: 'Billing, patient registration, sample management',
        slugs: [
            'dashboard.view', 'front_desk.access',
            'billing.create', 'billing.view', 'billing.manage',
            'patients.add', 'patients.view', 'patients.manage',
            'samples.manage',
        ],
    },
    lab_tech: {
        label: 'Lab Technician',
        description: 'Test results, sample management, reports',
        slugs: [
            'dashboard.view',
            'test_result.entry', 'reports.result_entry',
            'reports.test_units', 'reports.test_methods',
            'reports.sample_management', 'samples.manage',
        ],
    },
    doctor: {
        label: 'Doctor / Pathologist',
        description: 'View reports, approve results, manage patients',
        slugs: [
            'dashboard.view',
            'patients.view', 'patients.manage',
            'test_result.entry', 'reports.result_entry',
            'reports.test_units', 'reports.test_methods',
            'billing.view',
        ],
    },
    full_access: {
        label: 'Full Access',
        description: 'All permissions enabled',
        slugs: [], // special: selects all
    },
};

type Tab = 'roles' | 'labs' | 'users';

function toggleMany(current: string[], slugs: string[], checked: boolean): string[] {
    if (checked) {
        return Array.from(new Set([...current, ...slugs]));
    }
    return current.filter((item) => !slugs.includes(item));
}

/* ─── Collapsible Permission Group ─── */
function PermissionGroup({
    groupKey,
    permissions,
    selectedSlugs,
    onToggle,
    onToggleAll,
}: {
    groupKey: string;
    permissions: PermissionOption[];
    selectedSlugs: string[];
    onToggle: (slug: string, checked: boolean) => void;
    onToggleAll: (slugs: string[], checked: boolean) => void;
}) {
    const [expanded, setExpanded] = useState(false);
    const allSlugs = permissions.map((p) => p.slug);
    const selectedCount = allSlugs.filter((s) => selectedSlugs.includes(s)).length;
    const allSelected = selectedCount === allSlugs.length && allSlugs.length > 0;
    const someSelected = selectedCount > 0 && selectedCount < allSlugs.length;

    return (
        <div className=" border-b first:border-t border-slate-200 bg-white overflow-hidden">
            <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50/80"
            >
                {expanded ? (
                    <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                ) : (
                    <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
                )}
                <div
                    className="shrink-0"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Checkbox
                        checked={allSelected}
                        className={someSelected ? 'data-[state=unchecked]:bg-[#147da2]/20 data-[state=unchecked]:border-[#147da2]' : ''}
                        onCheckedChange={(checked) => onToggleAll(allSlugs, checked === true)}
                    />
                </div>
                <span className="text-sm font-medium text-slate-700 flex-1">{toLabel(groupKey)}</span>
                <span className={`text-xs font-medium px-2 py-0.5  ${
                    selectedCount === allSlugs.length
                        ? 'bg-[#147da2]/10 text-[#147da2]'
                        : selectedCount > 0
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-slate-100 text-slate-400'
                }`}>
                    {selectedCount}/{allSlugs.length}
                </span>
            </button>
            {expanded && (
                <div className="border-t border-slate-100 px-4 py-3">
                    <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                        {permissions.map((permission) => (
                            <label
                                key={permission.slug}
                                className="flex items-center gap-2.5  border border-slate-100 bg-slate-50/50 px-3 py-2 text-sm cursor-pointer transition hover:bg-slate-50"
                            >
                                <Checkbox
                                    checked={selectedSlugs.includes(permission.slug)}
                                    onCheckedChange={(checked) => onToggle(permission.slug, checked === true)}
                                />
                                <span className="text-slate-700">{permission.name}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function AdminLabFeatures({ labs, permissionGroups, roles }: Props) {
    const [activeTab, setActiveTab] = useState<Tab>('roles');
    const [search, setSearch] = useState('');
    const [selectedLabId, setSelectedLabId] = useState<number | null>(labs[0]?.id ?? null);
    const [selectedRoleId, setSelectedRoleId] = useState<number | null>(roles[0]?.id ?? null);

    const [labPermissions, setLabPermissions] = useState<Record<number, string[]>>(
        Object.fromEntries(labs.map((lab) => [lab.id, lab.permissions])),
    );
    const [userRoles, setUserRoles] = useState<Record<number, string[]>>(
        Object.fromEntries(labs.flatMap((lab) => lab.users.map((user) => [user.id, user.roles]))),
    );
    const [rolePermissions, setRolePermissions] = useState<Record<number, string[]>>(
        Object.fromEntries(roles.map((role) => [role.id, role.permissions])),
    );

    const allPermissionSlugs = useMemo(
        () => Object.values(permissionGroups).flat().map((p) => p.slug),
        [permissionGroups],
    );

    const filteredGroups = useMemo(() => {
        const q = search.toLowerCase().trim();
        if (q === '') return permissionGroups;
        const result: Record<string, PermissionOption[]> = {};
        for (const [group, perms] of Object.entries(permissionGroups)) {
            const filtered = perms.filter(
                (p) => p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q) || toLabel(group).toLowerCase().includes(q),
            );
            if (filtered.length > 0) result[group] = filtered;
        }
        return result;
    }, [permissionGroups, search]);

    /* ─── Role handlers ─── */
    const toggleRolePermission = (roleId: number, slug: string, checked: boolean) => {
        setRolePermissions((c) => ({
            ...c,
            [roleId]: checked
                ? Array.from(new Set([...(c[roleId] ?? []), slug]))
                : (c[roleId] ?? []).filter((s) => s !== slug),
        }));
    };
    const toggleRoleGroup = (roleId: number, slugs: string[], checked: boolean) => {
        setRolePermissions((c) => ({
            ...c,
            [roleId]: toggleMany(c[roleId] ?? [], slugs, checked),
        }));
    };
    const applyPreset = (roleId: number, presetKey: string) => {
        const preset = ROLE_PRESETS[presetKey];
        if (!preset) return;
        if (presetKey === 'full_access') {
            setRolePermissions((c) => ({ ...c, [roleId]: [...allPermissionSlugs] }));
        } else {
            setRolePermissions((c) => ({ ...c, [roleId]: [...preset.slugs] }));
        }
    };
    const saveRolePerms = (role: RoleOption) => {
        router.put(`/admin/roles/${role.id}/permissions`, {
            permission_slugs: rolePermissions[role.id] ?? [],
        });
    };

    /* ─── Lab handlers ─── */
    const toggleLabPermission = (labId: number, slug: string, checked: boolean) => {
        setLabPermissions((c) => ({
            ...c,
            [labId]: checked
                ? Array.from(new Set([...(c[labId] ?? []), slug]))
                : (c[labId] ?? []).filter((s) => s !== slug),
        }));
    };
    const toggleLabGroup = (labId: number, slugs: string[], checked: boolean) => {
        setLabPermissions((c) => ({
            ...c,
            [labId]: toggleMany(c[labId] ?? [], slugs, checked),
        }));
    };
    const saveLabPerms = (lab: LabFeatureRow) => {
        router.put(`/admin/labs/${lab.id}/features`, {
            permission_slugs: labPermissions[lab.id] ?? [],
        });
    };

    /* ─── User handlers ─── */
    const toggleUserRole = (userId: number, roleSlug: string, checked: boolean) => {
        setUserRoles((c) => ({
            ...c,
            [userId]: checked
                ? Array.from(new Set([...(c[userId] ?? []), roleSlug]))
                : (c[userId] ?? []).filter((s) => s !== roleSlug),
        }));
    };
    const saveUserRoles2 = (user: LabUser) => {
        router.put(`/admin/users/${user.id}/roles`, {
            role_slugs: userRoles[user.id] ?? [],
        });
    };

    const selectedRole = roles.find((r) => r.id === selectedRoleId);
    const selectedLab = labs.find((l) => l.id === selectedLabId);

    const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
        { key: 'roles', label: 'Role Permissions', icon: <ShieldCheck className="h-4 w-4" /> },
        { key: 'labs', label: 'Lab Features', icon: <Shield className="h-4 w-4" /> },
        { key: 'users', label: 'User Roles', icon: <Users className="h-4 w-4" /> },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Permission Management" />

            <div className="min-h-full bg-slate-50/80 p-0">
                {/* Tab bar */}
                <div className="flex items-center border-b border-slate-200 bg-white">
                    {tabs.map((t) => (
                        <button
                            key={t.key}
                            type="button"
                            onClick={() => setActiveTab(t.key)}
                            className={`flex gap-1 items-center border-r border-slate-200 cursor-pointer px-4 py-2 text-sm font-medium transition-colors ${
                                activeTab === t.key
                                    ? 'bg-[#147da2] text-white'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                            }`}
                        >
                            {t.icon}
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* ═══════════ ROLE PERMISSIONS TAB ═══════════ */}
                {activeTab === 'roles' && (
                    <div className="grid lg:grid-cols-[280px_1fr]">
                        {/* Role list sidebar */}
                        <div className=" border-b border-r border-slate-200 bg-white p-3">
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Roles</p>
                            <div className="space-y-1">
                                {roles.map((role) => {
                                    const permCount = (rolePermissions[role.id] ?? []).length;
                                    return (
                                        <button
                                            key={role.id}
                                            type="button"
                                            onClick={() => setSelectedRoleId(role.id)}
                                            className={`cursor-pointer flex w-full items-center justify-between  px-3 py-2.5 text-left text-sm transition ${
                                                selectedRoleId === role.id
                                                    ? 'bg-[#147da2]/10 text-[#147da2] font-medium'
                                                    : 'text-slate-700 hover:bg-slate-50'
                                            }`}
                                        >
                                            <span>{role.name}</span>
                                            <span className={`text-xs px-1.5 py-0.5  ${
                                                permCount > 0 ? 'bg-[#147da2]/10 text-[#147da2]' : 'bg-slate-100 text-slate-400'
                                            }`}>
                                                {permCount}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Role permission editor */}
                        {selectedRole && (
                            <div className="space-y-0">
                                {/* Header */}
                                <div className="flex items-center justify-between  border-b border-slate-200 bg-white px-5 py-4">
                                    <div>
                                        <h2 className="text-base font-semibold text-slate-800">{selectedRole.name}</h2>
                                        <p className="text-xs text-slate-400">{selectedRole.slug} · {(rolePermissions[selectedRole.id] ?? []).length} permissions assigned</p>
                                    </div>
                                    <Button type="button" className="bg-[#147da2] hover:bg-[#106385]" onClick={() => saveRolePerms(selectedRole)}>
                                        Save Permissions
                                    </Button>
                                </div>

                                {/* Quick presets */}
                                <div className=" bg-white">
                                    <p className="m-3 text-xs font-medium uppercase tracking-wide text-slate-500">Quick Presets</p>
                                    <div className="grid sm:grid-cols-2 lg:grid-cols-4">
                                        {Object.entries(ROLE_PRESETS).map(([key, preset]) => (
                                            <button
                                                key={key}
                                                type="button"
                                                onClick={() => applyPreset(selectedRole.id, key)}
                                                className=" cursor-pointer border-r border-t border-slate-200 px-3 py-2.5 text-left transition hover:bg-[#147da2]/5"
                                            >
                                                <span className="block text-sm font-medium text-slate-700">{preset.label}</span>
                                                <span className="block mt-0.5 text-xs text-slate-400">{preset.description}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Search */}
                                <div className="relative">
                                    <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                    <input
                                        className="h-9 w-full  border-t border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20"
                                        placeholder="Search permissions…"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>

                                {/* Permission groups */}
                                <div className="space-y-0">
                                    {Object.entries(filteredGroups).map(([groupKey, perms]) => (
                                        <PermissionGroup
                                            key={`${selectedRole.id}-${groupKey}`}
                                            groupKey={groupKey}
                                            permissions={perms}
                                            selectedSlugs={rolePermissions[selectedRole.id] ?? []}
                                            onToggle={(slug, checked) => toggleRolePermission(selectedRole.id, slug, checked)}
                                            onToggleAll={(slugs, checked) => toggleRoleGroup(selectedRole.id, slugs, checked)}
                                        />
                                    ))}
                                    {Object.keys(filteredGroups).length === 0 && (
                                        <p className="py-8 text-center text-sm text-slate-400">No permissions match your search</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ═══════════ LAB FEATURES TAB ═══════════ */}
                {activeTab === 'labs' && (
                    <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
                        {/* Lab list sidebar */}
                        <div className=" border border-slate-200 bg-white p-3">
                            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Labs</p>
                            <div className="space-y-1">
                                {labs.map((lab) => {
                                    const permCount = (labPermissions[lab.id] ?? []).length;
                                    return (
                                        <button
                                            key={lab.id}
                                            type="button"
                                            onClick={() => setSelectedLabId(lab.id)}
                                            className={`flex w-full items-center justify-between  px-3 py-2.5 text-left text-sm transition ${
                                                selectedLabId === lab.id
                                                    ? 'bg-[#147da2]/10 text-[#147da2] font-medium'
                                                    : 'text-slate-700 hover:bg-slate-50'
                                            }`}
                                        >
                                            <div>
                                                <span className="block">{lab.name}</span>
                                                <span className="block text-xs text-slate-400">{lab.code}</span>
                                            </div>
                                            <span className={`text-xs px-1.5 py-0.5  ${
                                                permCount > 0 ? 'bg-[#147da2]/10 text-[#147da2]' : 'bg-slate-100 text-slate-400'
                                            }`}>
                                                {permCount}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Lab permission editor */}
                        {selectedLab && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between  border border-slate-200 bg-white px-5 py-4">
                                    <div>
                                        <h2 className="text-base font-semibold text-slate-800">{selectedLab.name}</h2>
                                        <p className="text-xs text-slate-400">{selectedLab.code} · {(labPermissions[selectedLab.id] ?? []).length} features enabled</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setLabPermissions((c) => ({ ...c, [selectedLab.id]: [...allPermissionSlugs] }));
                                            }}
                                        >
                                            Enable All
                                        </Button>
                                        <Button type="button" className="bg-[#147da2] hover:bg-[#106385]" onClick={() => saveLabPerms(selectedLab)}>
                                            Save Features
                                        </Button>
                                    </div>
                                </div>

                                {/* Search */}
                                <div className="relative">
                                    <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                    <input
                                        className="h-9 w-full  border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20"
                                        placeholder="Search features…"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    {Object.entries(filteredGroups).map(([groupKey, perms]) => (
                                        <PermissionGroup
                                            key={`${selectedLab.id}-${groupKey}`}
                                            groupKey={groupKey}
                                            permissions={perms}
                                            selectedSlugs={labPermissions[selectedLab.id] ?? []}
                                            onToggle={(slug, checked) => toggleLabPermission(selectedLab.id, slug, checked)}
                                            onToggleAll={(slugs, checked) => toggleLabGroup(selectedLab.id, slugs, checked)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ═══════════ USER ROLES TAB ═══════════ */}
                {activeTab === 'users' && (
                    <div className="space-y-4">
                        {/* Search users */}
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <input
                                className="h-9 w-full  border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20"
                                placeholder="Search users by name or email…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        {labs.map((lab) => {
                            const labUsers = lab.users.filter((u) => {
                                const q = search.toLowerCase().trim();
                                if (q === '') return true;
                                return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
                            });

                            if (labUsers.length === 0) return null;

                            return (
                                <div key={lab.id} className=" border border-slate-200 bg-white overflow-hidden">
                                    <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-3">
                                        <h3 className="text-sm font-semibold text-slate-700">{lab.name}</h3>
                                        <p className="text-xs text-slate-400">{lab.code} · {labUsers.length} user{labUsers.length !== 1 ? 's' : ''}</p>
                                    </div>
                                    <div className="divide-y divide-slate-100">
                                        {labUsers.map((user) => (
                                            <div key={user.id} className="flex items-center justify-between gap-4 px-5 py-4">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-slate-800 truncate">{user.name}</p>
                                                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                                                </div>
                                                <div className="flex items-center gap-4 shrink-0">
                                                    <div className="flex flex-wrap gap-2">
                                                        {roles.map((role) => (
                                                            <label
                                                                key={`${user.id}-${role.slug}`}
                                                                className={`flex items-center gap-2  border px-3 py-1.5 text-sm cursor-pointer transition ${
                                                                    (userRoles[user.id] ?? []).includes(role.slug)
                                                                        ? 'border-[#147da2] bg-[#147da2]/5 text-[#147da2]'
                                                                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                                                }`}
                                                            >
                                                                <Checkbox
                                                                    id={`${user.id}-${role.slug}`}
                                                                    checked={(userRoles[user.id] ?? []).includes(role.slug)}
                                                                    onCheckedChange={(checked) => toggleUserRole(user.id, role.slug, checked === true)}
                                                                />
                                                                <span>{role.name}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 text-xs"
                                                        onClick={() => saveUserRoles2(user)}
                                                    >
                                                        Save
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
