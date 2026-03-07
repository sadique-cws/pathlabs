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
    { title: 'Admin Feature Control', href: '/admin/labs/features' },
];

export default function AdminLabFeatures({ labs, permissionGroups, roles }: Props) {
    const [labPermissions, setLabPermissions] = useState<Record<number, string[]>>(
        Object.fromEntries(labs.map((lab) => [lab.id, lab.permissions])),
    );
    const [userRoles, setUserRoles] = useState<Record<number, string[]>>(
        Object.fromEntries(
            labs.flatMap((lab) => lab.users.map((user) => [user.id, user.roles])),
        ),
    );

    const groupEntries = useMemo(() => Object.entries(permissionGroups), [permissionGroups]);

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

    const saveUserRoles = (user: LabUser): void => {
        router.put(`/admin/users/${user.id}/roles`, {
            role_slugs: userRoles[user.id] ?? [],
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Feature Control" />

            <div className="space-y-4 p-4 md:p-6">
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
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-semibold">Lab Feature Permissions</h3>
                                    <Badge variant="outline">Feature Toggle</Badge>
                                </div>

                                {groupEntries.map(([groupName, permissions]) => (
                                    <div key={groupName} className="space-y-3 rounded-lg border p-4">
                                        <h4 className="text-sm font-semibold uppercase">{groupName}</h4>
                                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                            {permissions.map((permission) => {
                                                const isChecked = (labPermissions[lab.id] ?? []).includes(permission.slug);

                                                return (
                                                    <label key={permission.slug} className="flex items-center gap-2">
                                                        <Checkbox
                                                            checked={isChecked}
                                                            onCheckedChange={(checked) => toggleLabPermission(lab.id, permission.slug, checked === true)}
                                                        />
                                                        <span className="text-sm">{permission.name}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-semibold">User Role Permissions ({lab.users.length})</h3>
                                    <Badge variant="secondary">Role Assignment</Badge>
                                </div>

                                <div className="space-y-3">
                                    {lab.users.map((user) => (
                                        <div key={user.id} className="rounded-lg border p-4">
                                            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                                                <div>
                                                    <p className="font-medium">{user.name}</p>
                                                    <p className="text-muted-foreground text-sm">{user.email}</p>
                                                </div>
                                                <Button type="button" variant="outline" onClick={() => saveUserRoles(user)}>
                                                    Save User Roles
                                                </Button>
                                            </div>

                                            <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
                                                {roles.map((role) => {
                                                    const isChecked = (userRoles[user.id] ?? []).includes(role.slug);

                                                    return (
                                                        <div key={`${user.id}-${role.slug}`} className="flex items-center gap-2">
                                                            <Checkbox
                                                                id={`${user.id}-${role.slug}`}
                                                                checked={isChecked}
                                                                onCheckedChange={(checked) => toggleUserRole(user.id, role.slug, checked === true)}
                                                            />
                                                            <Label htmlFor={`${user.id}-${role.slug}`}>{role.name}</Label>
                                                        </div>
                                                    );
                                                })}
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
