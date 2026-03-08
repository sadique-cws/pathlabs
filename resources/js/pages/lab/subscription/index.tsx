import { Head, useForm } from '@inertiajs/react';
import { 
    CreditCard, 
    CheckCircle2, 
    ShieldCheck, 
    Calendar, 
    Zap, 
    Clock, 
    ArrowRight,
    History,
    AlertCircle,
    Plus
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
};

type LabSubscription = {
    id: number;
    subscription_plan_id: number;
    status: string;
    starts_at: string;
    ends_at: string | null;
    bill_limit: number | null;
    bills_used: number;
    is_current: boolean;
    plan: SubscriptionPlan;
};

type Props = {
    currentSubscription: LabSubscription | null;
    availablePlans: SubscriptionPlan[];
    history: LabSubscription[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Settings', href: '#' },
    { title: 'My Subscription', href: '/lab/subscription' },
];

import { router } from '@inertiajs/react';

export default function MySubscription({ currentSubscription, availablePlans, history }: Props) {
    const { processing } = useForm();

    const handleSubscribe = (planId: number) => {
        if (confirm('Are you sure you want to switch to this plan?')) {
            router.post('/lab/subscription', { 
                subscription_plan_id: planId 
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Subscription" />

            <div className="p-6 max-w-7xl mx-auto">
                <div className="mb-10">
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        <ShieldCheck className="h-7 w-7 text-[#147da2]" />
                        Subscription & Billing
                    </h1>
                    <p className="text-slate-500 mt-1">Manage your lab plan and billing history</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Active Plan Detail */}
                    <div className="lg:col-span-2 space-y-8">
                        {currentSubscription ? (
                            <div className="bg-[#147da2] text-white p-8 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                                
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 mb-2">
                                                ACTIVE PLAN
                                            </Badge>
                                            <h2 className="text-3xl font-black">{currentSubscription.plan.name}</h2>
                                        </div>
                                        <Zap className="h-12 w-12 text-white/40" />
                                    </div>

                                    <div className="grid sm:grid-cols-3 gap-8 mb-8 pb-8 border-b border-white/10">
                                        <div>
                                            <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-2">Billing Cycle</p>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-white/40" />
                                                <span className="font-bold">
                                                    {currentSubscription.plan.type === 'pay_as_you_go' ? 'Pay As You Go' : `${currentSubscription.plan.duration_months} Months`}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-2">Bill Limit</p>
                                            <div className="flex items-center gap-2">
                                                <CreditCard className="h-4 w-4 text-white/40" />
                                                <span className="font-bold">
                                                    {currentSubscription.bills_used} / {currentSubscription.bill_limit || '∞'} Bills
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-2">Expiry Date</p>
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-white/40" />
                                                <span className="font-bold">
                                                    {currentSubscription.ends_at ? new Date(currentSubscription.ends_at).toLocaleDateString() : 'Never'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-white/70">
                                            Current Usage: <span className="text-white font-bold">{Math.round((currentSubscription.bills_used / (currentSubscription.bill_limit || 1)) * 100)}%</span>
                                        </div>
                                        <Button variant="outline" className="bg-white text-[#147da2] hover:bg-white/90 border-none px-8 font-bold">
                                            Recharge / Topup
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-slate-100 border-2 border-dashed border-slate-300 p-12 text-center rounded-none">
                                <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-slate-800">No Active Subscription</h3>
                                <p className="text-slate-500 mt-1 mb-6">Choose a plan below to start processing bills.</p>
                            </div>
                        )}

                        {/* Available Plans */}
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <Plus className="h-5 w-5 text-[#147da2]" />
                                Available Plans
                            </h3>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {availablePlans.map((plan) => (
                                    <div key={plan.id} className={cn(
                                        "bg-white border border-slate-200 p-6 flex flex-col justify-between hover:border-[#147da2] transition-colors",
                                        currentSubscription?.subscription_plan_id === plan.id && "border-2 border-[#147da2] bg-[#147da2]/5"
                                    )}>
                                        <div>
                                            <div className="flex items-start justify-between">
                                                <h4 className="font-bold text-slate-800">{plan.name}</h4>
                                                {currentSubscription?.subscription_plan_id === plan.id && (
                                                    <CheckCircle2 className="h-5 w-5 text-[#147da2]" />
                                                )}
                                            </div>
                                            <div className="mt-4 mb-6">
                                                <span className="text-2xl font-black text-slate-900">₹{plan.price}</span>
                                                <span className="text-slate-400 text-xs ml-1 font-medium">
                                                    {plan.type === 'pay_as_you_go' ? '/ bill' : `/ ${plan.duration_months} mo`}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-500 mb-6 line-clamp-2">{plan.description || 'Flexible billing for your diagnostics center.'}</p>
                                        </div>
                                        <Button 
                                            className={cn(
                                                "w-full rounded-none font-bold",
                                                currentSubscription?.subscription_plan_id === plan.id 
                                                    ? "bg-slate-100 text-slate-400 cursor-not-allowed hover:bg-slate-100" 
                                                    : "bg-slate-900 hover:bg-black text-white"
                                            )}
                                            disabled={currentSubscription?.subscription_plan_id === plan.id || processing}
                                            onClick={() => handleSubscribe(plan.id)}
                                        >
                                            {currentSubscription?.subscription_plan_id === plan.id ? 'Current Plan' : 'Select Plan'}
                                            {currentSubscription?.subscription_plan_id !== plan.id && <ArrowRight className="ml-2 h-4 w-4" />}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* History Sidebar */}
                    <div className="bg-white border border-slate-200 p-6 h-fit">
                        <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2 uppercase tracking-wider">
                            <History className="h-4 w-4 text-[#147da2]" />
                            History
                        </h3>
                        <div className="space-y-6">
                            {history.length > 0 ? history.map((sub, i) => (
                                <div key={sub.id} className="relative pl-5 border-l-2 border-slate-100 pb-2 last:pb-0">
                                    <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-white border-2 border-slate-200" />
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-slate-800">{sub.plan.name}</span>
                                        <span className="text-[10px] text-slate-400 font-medium">
                                            {new Date(sub.starts_at).toLocaleDateString()}
                                        </span>
                                        <Badge variant="outline" className="w-fit text-[9px] h-4 mt-1 capitalize border-slate-100">
                                            {sub.status}
                                        </Badge>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-xs text-slate-400 italic">No previous records.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
