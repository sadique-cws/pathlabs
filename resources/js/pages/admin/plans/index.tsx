import { Head, useForm } from '@inertiajs/react';
import { Plus, Pencil, Trash2, CheckCircle2, XCircle, CreditCard, Layers, Zap } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
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
import { cn } from '@/lib/utils';
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
    { title: 'Admin Master', href: '#' },
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

            <div className="flex h-full flex-1 flex-col bg-slate-50/50">
                {/* Modern Header Section */}
                <div className="sawtooth bg-white border-b border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-[#147da2]/10 flex items-center justify-center text-[#147da2]">
                            <CreditCard className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Subscription Plans</h1>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Manage billing and tier structures</p>
                        </div>
                    </div>
                    
                    <Button onClick={openCreateDialog} className="h-10 bg-[#147da2] hover:bg-[#106385] font-bold text-xs uppercase tracking-widest shadow-none">
                        <Plus className="h-4 w-4 mr-2" />
                        New Strategy
                    </Button>
                </div>

                {/* Categories Grid (Stats) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                    <StatBox title="Active Plans" value={plans.filter(p => p.is_active).length.toString()} icon={Layers} color="text-[#147da2]" />
                    <StatBox title="PAYG Plans" value={plans.filter(p => p.type === 'pay_as_you_go').length.toString()} icon={Zap} color="text-amber-500" />
                    <StatBox title="Total Revenue Models" value={plans.length.toString()} icon={CheckCircle2} isLast />
                </div>

                {/* Plans Table Area */}
                <div className="sawtooth bg-white p-5 border-y border-slate-200">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-[13px] font-bold uppercase tracking-widest text-slate-800 flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-[#147da2]" />
                            Defined Billing Tiers
                        </h2>
                    </div>

                    <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead>
                                <tr className="text-[10px] uppercase tracking-widest text-slate-400 font-bold border-b border-slate-100">
                                    <th className="px-3 py-3">Strategy Name</th>
                                    <th className="px-3 py-3">Pricing Structure</th>
                                    <th className="px-3 py-3">Limits & Terms</th>
                                    <th className="px-3 py-3">Visibility</th>
                                    <th className="px-3 py-3 text-right">Settings</th>
                                </tr>
                            </thead>
                            <tbody>
                                {plans.map((plan) => (
                                    <tr key={plan.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-3 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-800">{plan.name}</span>
                                                <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-400">
                                                    {plan.type === 'subscription' ? 'Tiered Prepaid' : 'Instant Pay-per-use'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-xl font-black text-slate-900 leading-none">₹{plan.price}</span>
                                                <span className="text-[9px] font-bold uppercase tracking-widest text-[#147da2] mt-1">
                                                    {plan.type === 'pay_as_you_go' ? 'per bill generated' : `valid for ${plan.duration_months} months`}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-slate-700">
                                                    {plan.bill_limit ? `${plan.bill_limit} Bills Included` : 'Unlimited Processing'}
                                                </span>
                                                <span className="text-[10px] font-medium text-slate-400 leading-tight max-w-[200px] truncate" title={plan.description || ''}>
                                                    {plan.description || 'No strategy notes...'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-4">
                                            <div className="flex items-center gap-1.5">
                                                {plan.is_active ? (
                                                    <div className="flex items-center gap-1">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Active</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Hidden</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-3 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 text-slate-400 hover:text-[#147da2] hover:bg-[#147da2]/5"
                                                    onClick={() => openEditDialog(plan)}
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                                    onClick={() => handleDelete(plan.id)}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {plans.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-3 py-10 text-center text-slate-400 font-medium uppercase tracking-widest text-[10px]">
                                            No billing strategies defined yet. Click "New Strategy" to begin.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Strategy Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none shadow-3xl">
                    <div className="bg-[#147da2] p-6 text-white relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                        <DialogTitle className="text-xl font-bold tracking-tight">
                            {editingPlan ? 'Refine Strategy' : 'Define New Strategy'}
                        </DialogTitle>
                        <DialogDescription className="text-white/70 text-xs mt-1">
                            Set parameters for laboratory billing and tiers.
                        </DialogDescription>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 bg-white">
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Strategic Name</Label>
                                <Input
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g. Enterprise Monthly"
                                    className="h-10 border-slate-200 bg-slate-50/50"
                                />
                                {errors.name && <p className="text-[10px] font-bold text-rose-500 uppercase">{errors.name}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Model Type</Label>
                                    <Select
                                        value={data.type}
                                        onValueChange={(value: any) => setData('type', value)}
                                    >
                                        <SelectTrigger className="h-10 border-slate-200 bg-slate-50/50">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="subscription">Tiered Prepaid</SelectItem>
                                            <SelectItem value="pay_as_you_go">Instant Pay-per-use</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Execution Price (₹)</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={data.price}
                                        onChange={(e) => setData('price', e.target.value)}
                                        placeholder="0.00"
                                        className="h-10 border-slate-200 bg-slate-50/50 font-bold"
                                    />
                                </div>
                            </div>

                            {data.type === 'subscription' && (
                                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-1">
                                    <div className="grid gap-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Duration (Months)</Label>
                                        <Input
                                            type="number"
                                            value={data.duration_months}
                                            onChange={(e) => setData('duration_months', e.target.value)}
                                            placeholder="1"
                                            className="h-10 border-slate-200"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Processing Limit</Label>
                                        <Input
                                            type="number"
                                            value={data.bill_limit}
                                            onChange={(e) => setData('bill_limit', e.target.value)}
                                            placeholder="100"
                                            className="h-10 border-slate-200"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="grid gap-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Strategy Description</Label>
                                <textarea
                                    className="flex min-h-[80px] w-full border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium placeholder:text-slate-400 outline-none focus:border-[#147da2] transition-colors"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Internal notes on this tier strategy..."
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <Checkbox
                                    id="active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', checked)}
                                />
                                <Label htmlFor="active" className="text-[11px] font-bold uppercase tracking-tighter text-slate-500 cursor-pointer">
                                    Publish strategy to market
                                </Label>
                            </div>
                        </div>

                        <div className="mt-8 flex gap-3">
                            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="flex-1 font-bold text-xs uppercase tracking-widest text-slate-400">
                                Abort
                            </Button>
                            <Button type="submit" disabled={processing} className="flex-1 bg-[#147da2] hover:bg-[#106385] font-bold text-xs uppercase tracking-widest shadow-xl">
                                {processing ? 'Processing...' : editingPlan ? 'Refine Strategy' : 'Deploy Strategy'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

function StatBox({ title, value, icon: Icon, color = "text-slate-900", isLast = false }: { title: string, value: string, icon: any, color?: string, isLast?: boolean }) {
    return (
        <div className={cn(
            "sawtooth bg-white p-5 border-y border-r border-t-0 border-slate-200",
            isLast && "border-r-0"
        )}>
            <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{title}</p>
                <div className="h-8 w-8 flex items-center justify-center bg-slate-50 text-slate-400">
                    <Icon className="h-4 w-4" />
                </div>
            </div>
            <p className={cn("mt-2 text-2xl font-black", color)}>{value}</p>
        </div>
    );
}

function Checkbox({ id, checked, onCheckedChange }: { id: string, checked: boolean, onCheckedChange: (checked: boolean) => void }) {
    return (
        <input
            type="checkbox"
            id={id}
            checked={checked}
            onChange={(e) => onCheckedChange(e.target.checked)}
            className="h-4 w-4 rounded-none border-slate-300 text-[#147da2] focus:ring-[#147da2] cursor-pointer"
        />
    );
}
