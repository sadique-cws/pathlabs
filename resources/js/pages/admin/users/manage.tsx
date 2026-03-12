import { Head, router } from '@inertiajs/react';
import { Search, Settings2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import type { BreadcrumbItem } from '@/types';

type RoleOption = {
    id: number;
    name: string;
    slug: string;
};

type PermissionOption = {
    id: number;
    name: string;
    slug: string;
};

type LabOption = {
    id: number;
    name: string;
    code: string;
};

type UserRow = {
    id: number;
    name: string;
    email: string;
    lab: {
        id: number | null;
        name: string | null;
        code: string | null;
    };
    roles: Array<{ slug: string; name: string }>;
    direct_permissions: string[];
};

type Props = {
    users: UserRow[];
    roles: RoleOption[];
    permissionGroups: Record<string, PermissionOption[]>;
    labs: LabOption[];
    filters: {
        search?: string | null;
        lab_id?: number | null;
        role_slug?: string | null;
        permission_slug?: string | null;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Master', href: '#' },
    { title: 'Manage Users', href: '/admin/users/manage' },
];

function formatGroupLabel(group: string): string {
    return group.replace(/[_.]+/g, ' ').replace(/\b\w/g, (segment) => segment.toUpperCase());
}

export default function AdminManageUsers({ users, roles, permissionGroups, labs, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [selectedLabId, setSelectedLabId] = useState<number | ''>(filters.lab_id ?? '');
    const [selectedRoleSlug, setSelectedRoleSlug] = useState(filters.role_slug ?? '');
    const [selectedPermissionSlug, setSelectedPermissionSlug] = useState(filters.permission_slug ?? '');
    const [expandedUserId, setExpandedUserId] = useState<number | null>(null);

    const [userRoles, setUserRoles] = useState<Record<number, string[]>>(
        Object.fromEntries(users.map((user) => [user.id, user.roles.map((role) => role.slug)])),
    );
    const [userPermissions, setUserPermissions] = useState<Record<number, string[]>>(
        Object.fromEntries(users.map((user) => [user.id, user.direct_permissions])),
    );

    const allPermissions = useMemo(() => Object.values(permissionGroups).flat(), [permissionGroups]);

    const applyFilters = (): void => {
        router.get(
            '/admin/users/manage',
            {
                search: search.trim() !== '' ? search.trim() : undefined,
                lab_id: selectedLabId === '' ? undefined : selectedLabId,
                role_slug: selectedRoleSlug !== '' ? selectedRoleSlug : undefined,
                permission_slug: selectedPermissionSlug !== '' ? selectedPermissionSlug : undefined,
            },
            { preserveScroll: true, replace: true },
        );
    };

    const resetFilters = (): void => {
        setSearch('');
        setSelectedLabId('');
        setSelectedRoleSlug('');
        setSelectedPermissionSlug('');
        router.get('/admin/users/manage', {}, { preserveScroll: true, replace: true });
    };

    const toggleUserRole = (userId: number, roleSlug: string, checked: boolean): void => {
        setUserRoles((current) => ({
            ...current,
            [userId]: checked
                ? Array.from(new Set([...(current[userId] ?? []), roleSlug]))
                : (current[userId] ?? []).filter((slug) => slug !== roleSlug),
        }));
    };

    const toggleUserPermission = (userId: number, permissionSlug: string, checked: boolean): void => {
        setUserPermissions((current) => ({
            ...current,
            [userId]: checked
                ? Array.from(new Set([...(current[userId] ?? []), permissionSlug]))
                : (current[userId] ?? []).filter((slug) => slug !== permissionSlug),
        }));
    };

    const saveUserRoles = (userId: number): void => {
        router.put(
            `/admin/users/${userId}/roles`,
            {
                role_slugs: userRoles[userId] ?? [],
            },
            { preserveScroll: true },
        );
    };

    const saveUserPermissions = (userId: number): void => {
        router.put(
            `/admin/users/${userId}/permissions`,
            {
                permission_slugs: userPermissions[userId] ?? [],
            },
            { preserveScroll: true },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Users" />

            <div className="space-y-4 p-4 md:p-6">
                <div className="border border-slate-200 bg-white p-4">
                    <div className="grid gap-3 md:grid-cols-5">
                        <div className="relative md:col-span-2">
                            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <input
                                className="h-9 w-full border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search user by name/email"
                            />
                        </div>

                        <select
                            className="h-9 border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20"
                            value={selectedLabId}
                            onChange={(event) => setSelectedLabId(event.target.value === '' ? '' : Number(event.target.value))}
                        >
                            <option value="">All Labs</option>
                            {labs.map((lab) => (
                                <option key={lab.id} value={lab.id}>
                                    {lab.name}
                                </option>
                            ))}
                        </select>

                        <select
                            className="h-9 border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20"
                            value={selectedRoleSlug}
                            onChange={(event) => setSelectedRoleSlug(event.target.value)}
                        >
                            <option value="">All Roles</option>
                            {roles.map((role) => (
                                <option key={role.slug} value={role.slug}>
                                    {role.name}
                                </option>
                            ))}
                        </select>

                        <select
                            className="h-9 border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20"
                            value={selectedPermissionSlug}
                            onChange={(event) => setSelectedPermissionSlug(event.target.value)}
                        >
                            <option value="">All Permissions</option>
                            {allPermissions.map((permission) => (
                                <option key={permission.slug} value={permission.slug}>
                                    {permission.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                        <Button type="button" size="sm" onClick={applyFilters}>
                            Apply Filters
                        </Button>
                        <Button type="button" size="sm" variant="outline" onClick={resetFilters}>
                            Reset
                        </Button>
                    </div>
                </div>

                <div className="overflow-hidden border border-slate-200 bg-white">
                    <div className="grid grid-cols-12 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <div className="col-span-4">User</div>
                        <div className="col-span-2">Lab</div>
                        <div className="col-span-3">Roles</div>
                        <div className="col-span-2">Direct Permissions</div>
                        <div className="col-span-1 text-right">Action</div>
                    </div>

                    {users.map((user) => (
                        <div key={user.id} className="border-b border-slate-100 last:border-b-0">
                            <div className="grid grid-cols-12 items-center gap-2 px-4 py-3">
                                <div className="col-span-4 min-w-0">
                                    <p className="truncate text-sm font-medium text-slate-800">{user.name}</p>
                                    <p className="truncate text-xs text-slate-500">{user.email}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-sm text-slate-700">{user.lab.name ?? '-'}</p>
                                    <p className="text-xs text-slate-500">{user.lab.code ?? '-'}</p>
                                </div>
                                <div className="col-span-3 flex flex-wrap gap-1">
                                    {userRoles[user.id]?.map((roleSlug) => {
                                        const role = roles.find((item) => item.slug === roleSlug);
                                        if (!role) {
                                            return null;
                                        }

                                        return (
                                            <Badge key={`${user.id}-${role.slug}`} variant="secondary" className="border border-slate-200 bg-slate-50 text-[11px]">
                                                {role.name}
                                            </Badge>
                                        );
                                    })}
                                </div>
                                <div className="col-span-2 text-sm text-slate-700">
                                    {userPermissions[user.id]?.length ?? 0} assigned
                                </div>
                                <div className="col-span-1 text-right">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-8 text-xs"
                                        onClick={() => setExpandedUserId(expandedUserId === user.id ? null : user.id)}
                                    >
                                        <Settings2 className="mr-1 h-3.5 w-3.5" />
                                        View
                                    </Button>
                                </div>
                            </div>

                            {expandedUserId === user.id && (
                                <div className="space-y-4 border-t border-slate-100 bg-slate-50/60 px-4 py-4">
                                    <div className="space-y-2">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Roles</p>
                                        <div className="flex flex-wrap gap-2">
                                            {roles.map((role) => (
                                                <label
                                                    key={`${user.id}-role-${role.slug}`}
                                                    className={`flex cursor-pointer items-center gap-2 border px-3 py-1.5 text-sm ${
                                                        (userRoles[user.id] ?? []).includes(role.slug)
                                                            ? 'border-[#147da2] bg-[#147da2]/5 text-[#147da2]'
                                                            : 'border-slate-200 bg-white text-slate-600'
                                                    }`}
                                                >
                                                    <Checkbox
                                                        checked={(userRoles[user.id] ?? []).includes(role.slug)}
                                                        onCheckedChange={(checked) => toggleUserRole(user.id, role.slug, checked === true)}
                                                    />
                                                    <span>{role.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                        <Button type="button" size="sm" variant="outline" className="h-8 text-xs" onClick={() => saveUserRoles(user.id)}>
                                            Save Roles
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Direct Permissions</p>
                                        <div className="grid gap-2 lg:grid-cols-3">
                                            {Object.entries(permissionGroups).map(([groupKey, groupPermissions]) => (
                                                <div key={`${user.id}-${groupKey}`} className="border border-slate-200 bg-white p-2">
                                                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                                        {formatGroupLabel(groupKey)}
                                                    </p>
                                                    <div className="space-y-1">
                                                        {groupPermissions.map((permission) => (
                                                            <label key={`${user.id}-${permission.slug}`} className="flex items-center gap-2 text-xs text-slate-600">
                                                                <Checkbox
                                                                    checked={(userPermissions[user.id] ?? []).includes(permission.slug)}
                                                                    onCheckedChange={(checked) =>
                                                                        toggleUserPermission(user.id, permission.slug, checked === true)
                                                                    }
                                                                />
                                                                <span>{permission.name}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <Button type="button" size="sm" variant="outline" className="h-8 text-xs" onClick={() => saveUserPermissions(user.id)}>
                                            Save Permissions
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
