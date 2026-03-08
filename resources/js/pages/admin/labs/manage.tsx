import { Head, useForm, Link } from '@inertiajs/react';
import { 
    Plus, 
    Search, 
    MoreVertical, 
    Building2, 
    Users, 
    CreditCard, 
    Settings, 
    Eye, 
    Pencil, 
    Trash2,
    Calendar,
    ArrowUpRight,
    MapPin
} from 'lucide-react';
import { useState, useMemo } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
    { title: 'Admin', href: '#' },
    { title: 'Manage Labs', href: '/admin/labs' },
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

            <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                            <Building2 className="h-7 w-7 text-[#147da2]" />
                            Manage Laboratories
                        </h1>
                        <p className="text-slate-500 mt-1">View and manage all registered laboratories</p>
                    </div>
                    <Button className="bg-[#147da2] hover:bg-[#106385]">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Laboratory
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard title="Total Labs" value={labs.length.toString()} icon={Building2} />
                    <StatCard title="Active Labs" value={activeLabsCount.toString()} icon={Users} color="text-emerald-500" />
                    <StatCard title="Inactive Labs" value={inactiveLabsCount.toString()} icon={Building2} color="text-rose-500" />
                </div>

                {/* Filters */}
                <div className="bg-white border border-slate-200 p-4 mb-6">
                    <div className="relative max-w-xl">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input 
                            placeholder="Search labs by name, code, or phone..." 
                            className="pl-10 h-10 border-slate-200 focus:border-[#147da2]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Labs Table */}
                <div className="bg-white border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-200">
                                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Lab Name</th>
                                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Plan & Subscription</th>
                                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Usage</th>
                                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Created On</th>
                                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Status</th>
                                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredLabs.map((lab) => (
                                    <tr key={lab.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-bold text-slate-800">{lab.name}</div>
                                                <div className="text-xs text-slate-400 font-medium">CODE: {lab.code}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-slate-700">{lab.current_plan}</span>
                                                <Badge variant="outline" className={cn(
                                                    "w-fit text-[10px] h-5 mt-1 capitalize",
                                                    lab.subscription_status === 'active' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-slate-400 bg-slate-50'
                                                )}>
                                                    {lab.subscription_status}
                                                </Badge>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <div className="text-sm font-bold text-slate-700">
                                                    {lab.bills_used} / {lab.bill_limit || '∞'}
                                                </div>
                                                <div className="text-[10px] text-slate-400 font-medium">Bills Processed</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <Calendar className="h-3.5 w-3.5 opacity-40" />
                                                {lab.created_at}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge className={cn(
                                                "rounded-none px-2 py-0.5 text-[10px] font-bold uppercase",
                                                lab.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                            )}>
                                                {lab.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-[#147da2]">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-[#147da2]">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="outline" className="h-8 w-8 p-0 border-slate-200">
                                                            <Settings className="h-4 w-4 text-[#147da2]" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-56">
                                                        <DropdownMenuLabel>Laboratory Settings</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => handleAssignPlan(lab)}>
                                                            <CreditCard className="mr-2 h-4 w-4" />
                                                            <span>Assign/Upgrade Plan</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link href="/admin/labs/features">
                                                                <Settings className="mr-2 h-4 w-4" />
                                                                <span>Manage Features</span>
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <Users className="mr-2 h-4 w-4" />
                                                            <span>Manage Users</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-rose-600">
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            <span>Delete Laboratory</span>
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

                {/* Assign Plan Dialog */}
                <Dialog open={isAssignPlanOpen} onOpenChange={setIsAssignPlanOpen}>
                    <DialogContent className="sm:max-w-[450px]">
                        <form onSubmit={submitAssignPlan}>
                            <DialogHeader>
                                <DialogTitle>Assign Subscription Plan</DialogTitle>
                                <DialogDescription>
                                    Assign a new billing plan to <span className="font-bold text-slate-900">{selectedLab?.name}</span>.
                                    This will override any existing active plan.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="plan">Select Plan</Label>
                                    <Select 
                                        value={planData.subscription_plan_id} 
                                        onValueChange={(val) => setPlanData('subscription_plan_id', val)}
                                    >
                                        <SelectTrigger id="plan">
                                            <SelectValue placeholder="Choose a plan..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {plans.map(plan => (
                                                <SelectItem key={plan.id} value={plan.id.toString()}>
                                                    {plan.name} ({plan.type === 'subscription' ? 'Prepaid' : 'Usage Based'})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsAssignPlanOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={planProcessing} className="bg-[#147da2] hover:bg-[#106385]">
                                    Assign Plan Now
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}

function StatCard({ title, value, icon: Icon, color = "text-slate-900" }: { title: string, value: string, icon: any, color?: string }) {
    return (
        <div className="bg-white border border-slate-200 p-6 flex items-center justify-between group hover:border-[#147da2] transition-colors">
            <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{title}</p>
                <h4 className={cn("text-2xl font-black", color)}>{value}</h4>
            </div>
            <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-[#147da2] group-hover:bg-[#147da2] group-hover:text-white transition-all">
                <Icon className="h-6 w-6" />
            </div>
        </div>
    );
}
