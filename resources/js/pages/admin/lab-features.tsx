import { Head, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
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

type PermissionSection = {
    key: string;
    label: string;
    permissions: PermissionOption[];
};

type PermissionGroupTree = Record<string, PermissionSection[]>;

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Feature Control', href: '/admin/labs/features' },
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
};

function toLabel(value: string): string {
    return labelMap[value] ?? value.replace(/[_.]+/g, ' ').replace(/\b\w/g, (s) => s.toUpperCase());
}

function groupPermissionsBySection(permissionGroups: Record<string, PermissionOption[]>): PermissionGroupTree {
    return Object.fromEntries(
        Object.entries(permissionGroups).map(([groupKey, permissions]) => {
            const sections = permissions.reduce<Record<string, PermissionOption[]>>((carry, permission) => {
                const sectionKey = permission.slug.split('.')[0];
                if (carry[sectionKey] === undefined) {
                    carry[sectionKey] = [];
                }

                carry[sectionKey].push(permission);
                return carry;
            }, {});

            const sectionRows = Object.entries(sections).map(([sectionKey, sectionPermissions]) => ({
                key: sectionKey,
                label: toLabel(sectionKey),
                permissions: sectionPermissions,
            }));

            return [groupKey, sectionRows];
        }),
    );
}

function toggleMany(current: string[], slugs: string[], checked: boolean): string[] {
    if (checked) {
        return Array.from(new Set([...current, ...slugs]));
    }

    return current.filter((item) => !slugs.includes(item));
}

export default function AdminLabFeatures({ labs, permissionGroups, roles }: Props) {
    const [labPermissions, setLabPermissions] = useState<Record<number, string[]>>(
        Object.fromEntries(labs.map((lab) => [lab.id, lab.permissions])),
    );
    const [userRoles, setUserRoles] = useState<Record<number, string[]>>(
        Object.fromEntries(labs.flatMap((lab) => lab.users.map((user) => [user.id, user.roles]))),
    );
    const [rolePermissions, setRolePermissions] = useState<Record<number, string[]>>(
        Object.fromEntries(roles.map((role) => [role.id, role.permissions])),
    );

    const permissionTree = useMemo(() => groupPermissionsBySection(permissionGroups), [permissionGroups]);
    const groupEntries = useMemo(() => Object.entries(permissionTree), [permissionTree]);

    const toggleLabPermission = (labId: number, permissionSlug: string, checked: boolean): void => {
        setLabPermissions((current) => {
            const currentValues = current[labId] ?? [];
            const nextValues = checked
                ? Array.from(new Set([...currentValues, permissionSlug]))
                : currentValues.filter((value) => value !== permissionSlug);

            return {
                ...current,
                [labId]: nextValues,
            };
        });
    };

    const toggleLabSection = (labId: number, permissionSlugs: string[], checked: boolean): void => {
        setLabPermissions((current) => ({
            ...current,
            [labId]: toggleMany(current[labId] ?? [], permissionSlugs, checked),
        }));
    };

    const toggleRolePermission = (roleId: number, permissionSlug: string, checked: boolean): void => {
        setRolePermissions((current) => {
            const currentValues = current[roleId] ?? [];
            const nextValues = checked
                ? Array.from(new Set([...currentValues, permissionSlug]))
                : currentValues.filter((value) => value !== permissionSlug);

            return {
                ...current,
                [roleId]: nextValues,
            };
        });
    };

    const toggleRoleSection = (roleId: number, permissionSlugs: string[], checked: boolean): void => {
        setRolePermissions((current) => ({
            ...current,
            [roleId]: toggleMany(current[roleId] ?? [], permissionSlugs, checked),
        }));
    };

    const toggleUserRole = (userId: number, roleSlug: string, checked: boolean): void => {
        setUserRoles((current) => {
            const currentValues = current[userId] ?? [];
            const nextValues = checked
                ? Array.from(new Set([...currentValues, roleSlug]))
                : currentValues.filter((value) => value !== roleSlug);

            return {
                ...current,
                [userId]: nextValues,
            };
        });
    };

    const saveLabPermissions = (lab: LabFeatureRow): void => {
        router.put(`/admin/labs/${lab.id}/features`, {
            permission_slugs: labPermissions[lab.id] ?? [],
        });
    };

    const saveRolePermissions = (role: RoleOption): void => {
        router.put(`/admin/roles/${role.id}/permissions`, {
            permission_slugs: rolePermissions[role.id] ?? [],
        });
    };

    const saveUserRoles = (user: LabUser): void => {
        router.put(`/admin/users/${user.id}/roles`, {
            role_slugs: userRoles[user.id] ?? [],
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Feature Control" />

            <div className="space-y-4 p-4 md:p-6">
                <Card>
                    <CardHeader className="border-b">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Role Permission Templates</CardTitle>
                                <p className="text-muted-foreground mt-1 text-sm">Role = group of permissions. Manage permissions once and reuse for users.</p>
                            </div>
                            <Badge variant="outline">Role-wise Access</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                        {roles.map((role) => (
                            <div key={role.id} className="space-y-3 rounded-lg border p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <h3 className="text-base font-semibold">{role.name}</h3>
                                        <p className="text-muted-foreground text-xs">{role.slug}</p>
                                    </div>
                                    <Button type="button" onClick={() => saveRolePermissions(role)}>Save Role Permissions</Button>
                                </div>

                                {groupEntries.map(([groupKey, sections]) => (
                                    <div key={`${role.id}-${groupKey}`} className="space-y-2 rounded-lg border p-3">
                                        <h4 className="text-sm font-semibold uppercase">{toLabel(groupKey)}</h4>
                                        {sections.map((section) => {
                                            const sectionSlugs = section.permissions.map((permission) => permission.slug);
                                            const selectedCount = sectionSlugs.filter((slug) => (rolePermissions[role.id] ?? []).includes(slug)).length;
                                            const sectionChecked = selectedCount > 0 && selectedCount === sectionSlugs.length;

                                            return (
                                                <div key={`${role.id}-${groupKey}-${section.key}`} className="space-y-2 rounded-md border border-slate-200 p-3">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div className="flex items-center gap-2">
                                                            <Checkbox
                                                                checked={sectionChecked}
                                                                onCheckedChange={(checked) => toggleRoleSection(role.id, sectionSlugs, checked === true)}
                                                            />
                                                            <span className="text-sm font-medium">{section.label}</span>
                                                        </div>
                                                        <span className="text-xs text-slate-500">{selectedCount}/{sectionSlugs.length}</span>
                                                    </div>
                                                    <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                                                        {section.permissions.map((permission) => (
                                                            <label key={`${role.id}-${permission.slug}`} className="flex items-center gap-2 rounded border border-slate-100 px-2 py-1.5">
                                                                <Checkbox
                                                                    checked={(rolePermissions[role.id] ?? []).includes(permission.slug)}
                                                                    onCheckedChange={(checked) => toggleRolePermission(role.id, permission.slug, checked === true)}
                                                                />
                                                                <span className="text-sm">{permission.name}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {labs.map((lab) => (
                    <Card key={lab.id}>
                        <CardHeader className="border-b">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>{lab.name}</CardTitle>
                                    <p className="text-muted-foreground mt-1 text-sm">{lab.code}</p>
                                </div>
                                <Button type="button" onClick={() => saveLabPermissions(lab)}>Save Lab Features</Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-semibold">Lab Feature Permissions</h3>
                                    <Badge variant="outline">Group + Section + Action</Badge>
                                </div>
                                {groupEntries.map(([groupKey, sections]) => (
                                    <div key={`${lab.id}-${groupKey}`} className="space-y-2 rounded-lg border p-3">
                                        <h4 className="text-sm font-semibold uppercase">{toLabel(groupKey)}</h4>
                                        {sections.map((section) => {
                                            const sectionSlugs = section.permissions.map((permission) => permission.slug);
                                            const selectedCount = sectionSlugs.filter((slug) => (labPermissions[lab.id] ?? []).includes(slug)).length;
                                            const sectionChecked = selectedCount > 0 && selectedCount === sectionSlugs.length;

                                            return (
                                                <div key={`${lab.id}-${groupKey}-${section.key}`} className="space-y-2 rounded-md border border-slate-200 p-3">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div className="flex items-center gap-2">
                                                            <Checkbox
                                                                checked={sectionChecked}
                                                                onCheckedChange={(checked) => toggleLabSection(lab.id, sectionSlugs, checked === true)}
                                                            />
                                                            <span className="text-sm font-medium">{section.label}</span>
                                                        </div>
                                                        <span className="text-xs text-slate-500">{selectedCount}/{sectionSlugs.length}</span>
                                                    </div>
                                                    <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                                                        {section.permissions.map((permission) => (
                                                            <label key={`${lab.id}-${permission.slug}`} className="flex items-center gap-2 rounded border border-slate-100 px-2 py-1.5">
                                                                <Checkbox
                                                                    checked={(labPermissions[lab.id] ?? []).includes(permission.slug)}
                                                                    onCheckedChange={(checked) => toggleLabPermission(lab.id, permission.slug, checked === true)}
                                                                />
                                                                <span className="text-sm">{permission.name}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-semibold">User Role Assignment ({lab.users.length})</h3>
                                    <Badge variant="secondary">User-wise</Badge>
                                </div>
                                <div className="space-y-3">
                                    {lab.users.map((user) => (
                                        <div key={user.id} className="rounded-lg border p-4">
                                            <div className="mb-3 flex items-center justify-between gap-3">
                                                <div>
                                                    <p className="font-medium">{user.name}</p>
                                                    <p className="text-muted-foreground text-sm">{user.email}</p>
                                                </div>
                                                <Button type="button" variant="outline" onClick={() => saveUserRoles(user)}>
                                                    Save User Roles
                                                </Button>
                                            </div>
                                            <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
                                                {roles.map((role) => (
                                                    <div key={`${user.id}-${role.slug}`} className="flex items-center gap-2">
                                                        <Checkbox
                                                            id={`${user.id}-${role.slug}`}
                                                            checked={(userRoles[user.id] ?? []).includes(role.slug)}
                                                            onCheckedChange={(checked) => toggleUserRole(user.id, role.slug, checked === true)}
                                                        />
                                                        <Label htmlFor={`${user.id}-${role.slug}`}>{role.name}</Label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </AppLayout>
    );
}
