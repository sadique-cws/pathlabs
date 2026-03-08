import { Head, useForm } from '@inertiajs/react';
import { Plus, Pencil, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { BreadcrumbItem } from '@/types';

type SubscriptionPlan = {
    id: number;
    name: string;
    type: 'pay_as_you_go' | 'subscription';
    price: string;
    duration_months: number | null;
    bill_limit: number | null;
    description: string | null;
    is_active: boolean;
};

type Props = {
    plans: SubscriptionPlan[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '#' },
    { title: 'Subscription Plans', href: '/admin/plans' },
];

export default function SubscriptionPlans({ plans }: Props) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

    const { data, setData, post, put, delete: destroy, processing, reset, errors } = useForm({
        name: '',
        type: 'subscription' as 'pay_as_you_go' | 'subscription',
        price: '',
        duration_months: '',
        bill_limit: '',
        description: '',
        is_active: true,
    });

    const openCreateDialog = () => {
        setEditingPlan(null);
        reset();
        setIsDialogOpen(true);
    };

    const openEditDialog = (plan: SubscriptionPlan) => {
        setEditingPlan(plan);
        setData({
            name: plan.name,
            type: plan.type,
            price: plan.price,
            duration_months: plan.duration_months?.toString() ?? '',
            bill_limit: plan.bill_limit?.toString() ?? '',
            description: plan.description ?? '',
            is_active: plan.is_active,
        });
        setIsDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingPlan) {
            put(`/admin/plans/${editingPlan.id}`, {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    reset();
                },
            });
        } else {
            post('/admin/plans', {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this plan?')) {
            destroy(`/admin/plans/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Subscription Plans" />

            <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Subscription Plans</h1>
                        <p className="text-slate-500 mt-1">Manage pricing strategies for all laboratories</p>
                    </div>
                    <Button onClick={openCreateDialog} className="bg-[#147da2] hover:bg-[#106385]">
                        <Plus className="h-4 w-4 mr-2" />
                        Create New Plan
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                        <div key={plan.id} className="bg-white border border-slate-200 overflow-hidden group hover:border-[#147da2] hover:shadow-lg transition-all">
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <Badge className={plan.type === 'subscription' ? 'bg-[#147da2]' : 'bg-emerald-500'}>
                                            {plan.type === 'subscription' ? 'Prepaid Plan' : 'Pay As You Go'}
                                        </Badge>
                                        <h3 className="text-lg font-bold text-slate-800 mt-3">{plan.name}</h3>
                                    </div>
                                    {plan.is_active ? (
                                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                    ) : (
                                        <XCircle className="h-5 w-5 text-rose-500" />
                                    )}
                                </div>

                                <div className="mb-6">
                                    <span className="text-3xl font-black text-slate-900">₹{plan.price}</span>
                                    <span className="text-slate-500 text-sm ml-1">
                                        {plan.type === 'pay_as_you_go' ? '/ bill' : `/ ${plan.duration_months} months`}
                                    </span>
                                </div>

                                <div className="space-y-3 mb-8">
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <div className="h-1.5 w-1.5 rounded-full bg-[#147da2]" />
                                        <span>Limit: {plan.bill_limit ? `${plan.bill_limit} Bills` : 'Unlimited'}</span>
                                    </div>
                                    <p className="text-sm text-slate-500 leading-relaxed min-h-[40px]">
                                        {plan.description || 'No description provided.'}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                                    <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditDialog(plan)}>
                                        <Pencil className="h-3.5 w-3.5 mr-2" />
                                        Edit
                                    </Button>
                                    <Button variant="outline" size="sm" className="text-rose-600 hover:bg-rose-50 hover:text-rose-700" onClick={() => handleDelete(plan.id)}>
                                        <Trash2 className="h-3.5 w-3.5 mr-2" />
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                        <form onSubmit={handleSubmit}>
                            <DialogHeader>
                                <DialogTitle>{editingPlan ? 'Edit Plan' : 'Create Subscription Plan'}</DialogTitle>
                                <DialogDescription>
                                    Define the terms for this recurring or usage-based pricing plan.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Plan Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g. Standard Monthly"
                                    />
                                    {errors.name && <p className="text-xs text-rose-500">{errors.name}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="type">Plan Type</Label>
                                        <Select
                                            value={data.type}
                                            onValueChange={(value: any) => setData('type', value)}
                                        >
                                            <SelectTrigger id="type">
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="subscription">Subscription</SelectItem>
                                                <SelectItem value="pay_as_you_go">Pay As You Go</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.type && <p className="text-xs text-rose-500">{errors.type}</p>}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="price">Price (₹)</Label>
                                        <Input
                                            id="price"
                                            type="number"
                                            step="0.01"
                                            value={data.price}
                                            onChange={(e) => setData('price', e.target.value)}
                                            placeholder="0.00"
                                        />
                                        {errors.price && <p className="text-xs text-rose-500">{errors.price}</p>}
                                    </div>
                                </div>

                                {data.type === 'subscription' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="duration">Duration (Months)</Label>
                                            <Input
                                                id="duration"
                                                type="number"
                                                value={data.duration_months}
                                                onChange={(e) => setData('duration_months', e.target.value)}
                                                placeholder="1"
                                            />
                                            {errors.duration_months && <p className="text-xs text-rose-500">{errors.duration_months}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="limit">Bill Limit</Label>
                                            <Input
                                                id="limit"
                                                type="number"
                                                value={data.bill_limit}
                                                onChange={(e) => setData('bill_limit', e.target.value)}
                                                placeholder="100"
                                            />
                                            {errors.bill_limit && <p className="text-xs text-rose-500">{errors.bill_limit}</p>}
                                        </div>
                                    </div>
                                )}

                                <div className="grid gap-2">
                                    <Label htmlFor="description">Description</Label>
                                    <textarea
                                        id="description"
                                        className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="What's included in this plan?"
                                    />
                                    {errors.description && <p className="text-xs text-rose-500">{errors.description}</p>}
                                </div>

                                <div className="flex items-center gap-2 mt-2">
                                    <Checkbox
                                        id="active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', checked === true)}
                                    />
                                    <Label htmlFor="active" className="text-sm font-medium cursor-pointer">Mark plan as active and available</Label>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing} className="bg-[#147da2] hover:bg-[#106385]">
                                    {editingPlan ? 'Update Plan' : 'Create Plan'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}

function Checkbox({ id, checked, onCheckedChange }: { id: string, checked: boolean, onCheckedChange: (checked: boolean) => void }) {
    return (
        <input
            type="checkbox"
            id={id}
            checked={checked}
            onChange={(e) => onCheckedChange(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-[#147da2] focus:ring-[#147da2]"
        />
    );
}
