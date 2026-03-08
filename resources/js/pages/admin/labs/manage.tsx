import { Head, useForm, Link } from '@inertiajs/react';
import { 
    Plus, 
    Search, 
    Building2, 
    Users, 
    CreditCard, 
    Settings, 
    Eye, 
    Pencil, 
    Trash2,
    Calendar,
    ChevronDown
} from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

type Lab = {
    id: number;
    name: string;
    code: string;
    phone: string | null;
    is_active: boolean;
    users_count: number;
    tests_count: number;
    current_plan: string;
    subscription_status: string;
    bills_used: number;
    bill_limit: number;
    created_at: string;
};

type Plan = {
    id: number;
    name: string;
    type: string;
};

type Props = {
    labs: Lab[];
    plans: Plan[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Master', href: '#' },
    { title: 'Manage Laboratories', href: '/admin/labs' },
];

export default function ManageLabs({ labs, plans }: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isAssignPlanOpen, setIsAssignPlanOpen] = useState(false);
    const [selectedLab, setSelectedLab] = useState<Lab | null>(null);

    const { data: planData, setData: setPlanData, post: postPlan, processing: planProcessing } = useForm({
        subscription_plan_id: '',
    });

    const filteredLabs = useMemo(() => {
        return labs.filter(lab => 
            lab.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lab.code.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [labs, searchQuery]);

    const activeLabsCount = labs.filter(l => l.is_active).length;
    const inactiveLabsCount = labs.length - activeLabsCount;

    const handleAssignPlan = (lab: Lab) => {
        setSelectedLab(lab);
        setIsAssignPlanOpen(true);
    };

    const submitAssignPlan = (e: React.FormEvent) => {
        e.preventDefault();
        postPlan(`/admin/labs/${selectedLab?.id}/assign-plan`, {
            onSuccess: () => setIsAssignPlanOpen(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Laboratories" />

            <div className="flex h-full flex-1 flex-col bg-slate-50/50">
                {/* Modern Header Section */}
                <div className="sawtooth bg-white border-b border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-[#147da2]/10 flex items-center justify-center text-[#147da2]">
                            <Building2 className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Manage Laboratories</h1>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total registered labs and clinics</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input 
                                placeholder="Quick Search..." 
                                className="pl-9 h-10 border-slate-200 focus:border-[#147da2] bg-slate-50/50"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button className="h-10 bg-[#147da2] hover:bg-[#106385] font-bold text-xs uppercase tracking-widest shadow-none">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Lab
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                    <StatBox title="Total Labs" value={labs.length.toString()} icon={Building2} />
                    <StatBox title="Active Labs" value={activeLabsCount.toString()} icon={Users} color="text-emerald-600" />
                    <StatBox title="Inactive Labs" value={inactiveLabsCount.toString()} icon={Building2} color="text-rose-600" isLast />
                </div>

                {/* Main Content Area */}
                <div className="sawtooth bg-white p-5 border-y border-slate-200">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-[13px] font-bold uppercase tracking-widest text-slate-800 flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-[#147da2]" />
                            Laboratory Directory
                        </h2>
                    </div>

                    <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead>
                                <tr className="text-[10px] uppercase tracking-widest text-slate-400 font-bold border-b border-slate-100">
                                    <th className="px-3 py-3">Lab Details</th>
                                    <th className="px-3 py-3">Subscription Plan</th>
                                    <th className="px-3 py-3">Usage Stats</th>
                                    <th className="px-3 py-3">Status</th>
                                    <th className="px-3 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLabs.map((lab) => (
                                    <tr key={lab.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-3 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-800">{lab.name}</span>
                                                <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-400 italic">ID: {lab.code}</span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-slate-700">{lab.current_plan}</span>
                                                <span className={cn(
                                                    "text-[10px] font-black uppercase tracking-widest mt-0.5",
                                                    lab.subscription_status === 'active' ? 'text-emerald-500' : 'text-slate-400'
                                                )}>
                                                    • {lab.subscription_status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-slate-800 italic">
                                                    {lab.bills_used} / {lab.bill_limit || '∞'}
                                                </span>
                                                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-tighter">Bills Processed</span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-4">
                                            <span className={cn(
                                                "px-2 py-0.5 text-[9px] font-black uppercase tracking-widest inline-flex",
                                                lab.is_active ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                                            )}>
                                                {lab.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-3 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link href={`/admin/labs/${lab.id}/switch`} method="post" as="button">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-[#147da2] hover:bg-[#147da2]/5">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Button>
                                                
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900">
                                                            <Settings className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-56 shadow-2xl border-slate-200">
                                                        <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Settings</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem asChild className="cursor-pointer">
                                                            <Link 
                                                                href={`/admin/labs/${lab.id}/switch`} 
                                                                method="post" 
                                                                as="button"
                                                                className="w-full flex items-center text-xs font-bold"
                                                            >
                                                                <Eye className="mr-2 h-4 w-4 text-[#147da2]" />
                                                                View Lab Interface
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleAssignPlan(lab)} className="cursor-pointer text-xs font-bold">
                                                            <CreditCard className="mr-2 h-4 w-4 text-emerald-500" />
                                                            Assign/Upgrade Plan
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild className="cursor-pointer text-xs font-bold">
                                                            <Link href="/admin/labs/features">
                                                                <Settings className="mr-2 h-4 w-4 text-amber-500" />
                                                                Manage Features
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-rose-600 cursor-pointer text-xs font-bold focus:bg-rose-50">
                                                            <Trash2 className="mr-2 h-4 w-4 text-rose-500" />
                                                            Delete Laboratory
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Assign Plan Dialog - Modernized */}
            <Dialog open={isAssignPlanOpen} onOpenChange={setIsAssignPlanOpen}>
                <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-none shadow-3xl">
                    <div className="bg-[#147da2] p-6 text-white relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                        <DialogTitle className="text-xl font-bold tracking-tight">Assign Subscription Plan</DialogTitle>
                        <DialogDescription className="text-white/70 text-xs mt-1">
                            Set or upgrade the billing plan for <span className="font-bold text-white uppercase italic">{selectedLab?.name}</span>.
                        </DialogDescription>
                    </div>

                    <form onSubmit={submitAssignPlan} className="p-6 bg-white">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="plan" className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Available Plans</Label>
                                <Select 
                                    value={planData.subscription_plan_id} 
                                    onValueChange={(val) => setPlanData('subscription_plan_id', val)}
                                >
                                    <SelectTrigger id="plan" className="h-11 border-slate-200 bg-slate-50/50">
                                        <SelectValue placeholder="Choose a strategic plan..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {plans.map(plan => (
                                            <SelectItem key={plan.id} value={plan.id.toString()}>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold">{plan.name}</span>
                                                    <span className="text-[9px] font-black uppercase text-slate-400 italic px-1.5 py-0.5 bg-slate-100">
                                                        {plan.type === 'subscription' ? 'Prepaid' : 'Per Bill'}
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="mt-8 flex gap-3">
                            <Button type="button" variant="ghost" onClick={() => setIsAssignPlanOpen(false)} className="flex-1 font-bold text-xs uppercase tracking-widest text-slate-400">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={planProcessing} className="flex-1 bg-[#147da2] hover:bg-[#106385] font-bold text-xs uppercase tracking-widest shadow-xl">
                                {planProcessing ? 'Processing...' : 'Apply Plan'}
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
            <p className={cn("mt-2 text-2xl font-black italic", color)}>{value}</p>
        </div>
    );
}
