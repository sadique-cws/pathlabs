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
    Plus,
    Wallet,
    Globe,
    ExternalLink
} from 'lucide-react';
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
    razorpayKey: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Settings', href: '#' },
    { title: 'My Subscription', href: '/lab/subscription' },
];

import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function MySubscription({ currentSubscription, availablePlans, history, razorpayKey }: Props) {
    const { processing, post } = useForm({
        subscription_plan_id: '',
        payment_method: '',
        razorpay_payment_id: '',
    });
    
    const { wallet } = usePage<any>().props;
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);

    const handleSubscribePrompt = (plan: SubscriptionPlan) => {
        setSelectedPlan(plan);
        setIsPaymentOpen(true);
    };

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async (method: 'wallet' | 'online') => {
        if (!selectedPlan) return;

        if (method === 'wallet') {
            const balance = parseFloat(wallet.balance);
            const price = parseFloat(selectedPlan.price);

            if (balance < price) {
                alert('Insufficient wallet balance. Please top up first.');
                return;
            }

            if (confirm(`₹${price} will be deducted from your wallet. Continue?`)) {
                router.post('/lab/subscription', {
                    subscription_plan_id: selectedPlan.id,
                    payment_method: 'wallet'
                }, {
                    onSuccess: () => setIsPaymentOpen(false)
                });
            }
        } else {
            const res = await loadRazorpay();
            if (!res) {
                alert('Razorpay SDK failed to load.');
                return;
            }

            const options = {
                key: razorpayKey,
                amount: parseFloat(selectedPlan.price) * 100,
                currency: 'INR',
                name: 'Pathlabs Subscription',
                description: `Upgrade to ${selectedPlan.name}`,
                handler: function (response: any) {
                    router.post('/lab/subscription', {
                        subscription_plan_id: selectedPlan.id,
                        payment_method: 'online',
                        razorpay_payment_id: response.razorpay_payment_id,
                    }, {
                        onSuccess: () => setIsPaymentOpen(false)
                    });
                },
                theme: { color: '#147da2' }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.open();
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Subscription" />

            <div className="flex h-full flex-1 flex-col bg-slate-50/50">
                {/* Premium Header */}
                <div className="sawtooth bg-white border-b border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-[#147da2]/10 flex items-center justify-center text-[#147da2]">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Subscription & Billing</h1>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Manage your strategic tier and processing history</p>
                        </div>
                    </div>
                </div>

                {/* Metrics Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                    <StatBox 
                        title="Active Strategy" 
                        value={currentSubscription?.plan.name ?? 'No Plan'} 
                        icon={Zap} 
                        color="text-[#147da2]" 
                    />
                    <StatBox 
                        title="Processing Used" 
                        value={`${currentSubscription?.bills_used || 0} / ${currentSubscription?.bill_limit || '∞'}`} 
                        icon={CreditCard} 
                        color="text-amber-500" 
                    />
                    <StatBox 
                        title="Strategy Term" 
                        value={currentSubscription?.ends_at ? new Date(currentSubscription.ends_at).toLocaleDateString() : 'Lifetime'} 
                        icon={Calendar} 
                        isLast 
                    />
                </div>

                <div className="p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Active Plan Card - Premium View */}
                    <div className="lg:col-span-3 space-y-8">
                        {currentSubscription ? (
                            <div className="sawtooth bg-[#147da2] text-white p-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
                                
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <div className="bg-white/20 text-[9px] font-black tracking-[0.2em] px-2 py-0.5 inline-block mb-2 uppercase">
                                                Active Operational Strategy
                                            </div>
                                            <h2 className="text-4xl font-black tracking-tight">{currentSubscription.plan.name}</h2>
                                        </div>
                                        <Zap className="h-12 w-12 text-white/20" />
                                    </div>

                                    <div className="grid sm:grid-cols-3 gap-8 mb-8 pb-8 border-b border-white/10">
                                        <div>
                                            <p className="text-white/60 text-[10px] font-bold uppercase tracking-[0.1em] mb-2">Billing Cycle</p>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-white/40" />
                                                <span className="font-bold text-lg">
                                                    {currentSubscription.plan.type === 'pay_as_you_go' ? 'Pay-per-bill' : `${currentSubscription.plan.duration_months} Months`}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-white/60 text-[10px] font-bold uppercase tracking-[0.1em] mb-2">Processed Bills</p>
                                            <div className="flex items-center gap-2">
                                                <CreditCard className="h-4 w-4 text-white/40" />
                                                <span className="font-bold text-lg">
                                                    {currentSubscription.bills_used} / {currentSubscription.bill_limit || '∞'}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-white/60 text-[10px] font-bold uppercase tracking-[0.1em] mb-2">Terms Expiry</p>
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-white/40" />
                                                <span className="font-bold text-lg">
                                                    {currentSubscription.ends_at ? new Date(currentSubscription.ends_at).toLocaleDateString() : 'Permanent'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-white/70 text-[10px] font-bold uppercase tracking-widest">Strategy Utilization</span>
                                            <div className="h-2 w-48 bg-white/20 mt-2 relative overflow-hidden">
                                                <div 
                                                    className="absolute inset-y-0 left-0 bg-white" 
                                                    style={{ width: `${Math.min(100, (currentSubscription.bills_used / (currentSubscription.bill_limit || 1)) * 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-white font-black text-2xl">
                                                {Math.round((currentSubscription.bills_used / (currentSubscription.bill_limit || 1)) * 100)}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="sawtooth bg-white border border-slate-200 p-12 text-center">
                                <AlertCircle className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Deployment Required</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 mb-6">Choose a strategy below to activate lab processing.</p>
                            </div>
                        )}

                        {/* Available Plans Grid */}
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-800">
                                    Alternative Strategies
                                </h3>
                                <div className="h-px flex-1 bg-slate-100" />
                            </div>
                            
                            <div className="grid sm:grid-cols-2 gap-4">
                                {availablePlans.map((plan) => (
                                    <div key={plan.id} className={cn(
                                        "sawtooth bg-white border p-6 flex flex-col justify-between transition-all group",
                                        currentSubscription?.subscription_plan_id === plan.id 
                                            ? "border-[#147da2] bg-[#147da2]/5" 
                                            : "border-slate-200 hover:border-slate-400"
                                    )}>
                                        <div>
                                            <div className="flex items-start justify-between">
                                                <h4 className="font-black text-slate-800 uppercase tracking-tight">{plan.name}</h4>
                                                {currentSubscription?.subscription_plan_id === plan.id && (
                                                    <div className="h-6 w-6 bg-[#147da2] flex items-center justify-center">
                                                        <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="mt-4 mb-4">
                                                <span className="text-3xl font-black text-slate-900 leading-none tracking-tighter">₹{plan.price}</span>
                                                <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest ml-2">
                                                    {plan.type === 'pay_as_you_go' ? 'per bill' : `/ ${plan.duration_months} mo`}
                                                </span>
                                            </div>
                                            <p className="text-[11px] font-medium text-slate-500 mb-6 leading-relaxed">
                                                {plan.description || 'Enterprise-grade billing strategy for modern diagnostics.'}
                                            </p>
                                        </div>
                                        <Button 
                                            className={cn(
                                                "w-full h-11 font-black text-[10px] uppercase tracking-[0.2em] shadow-none",
                                                currentSubscription?.subscription_plan_id === plan.id 
                                                    ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                                                    : "bg-slate-900 hover:bg-black text-white"
                                            )}
                                            disabled={currentSubscription?.subscription_plan_id === plan.id || processing}
                                            onClick={() => handleSubscribePrompt(plan)}
                                        >
                                            {currentSubscription?.subscription_plan_id === plan.id ? 'Active Implementation' : 'Deploy This Strategy'}
                                            {currentSubscription?.subscription_plan_id !== plan.id && <ArrowRight className="ml-2 h-3.5 w-3.5" />}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Timeline History */}
                    <div className="lg:col-span-1">
                        <div className="sawtooth bg-white border border-slate-200 p-6 sticky top-6">
                            <h3 className="text-[11px] font-black text-slate-800 mb-8 flex items-center gap-2 uppercase tracking-[0.2em]">
                                <History className="h-4 w-4 text-[#147da2]" />
                                History
                            </h3>
                            <div className="space-y-8 relative before:absolute before:inset-y-0 before:left-[7px] before:w-[1px] before:bg-slate-100">
                                {history.length > 0 ? history.map((sub) => (
                                    <div key={sub.id} className="relative pl-8">
                                        <div className="absolute left-0 top-1 h-[15px] w-[15px] bg-white border-2 border-slate-200" />
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-slate-800 uppercase tracking-tight">{sub.plan.name}</span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                                                {new Date(sub.starts_at).toLocaleDateString()}
                                            </span>
                                            <div className={cn(
                                                "w-fit text-[9px] font-black uppercase tracking-widest px-2 py-0.5 mt-2",
                                                sub.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-400 border border-slate-100'
                                            )}>
                                                {sub.status}
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest py-10 text-center">No Strategy Records.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Selection Dialog */}
            <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
                <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden border-none shadow-3xl">
                    <div className="bg-[#147da2] p-6 text-white text-center relative">
                        <DialogTitle className="text-xl font-bold tracking-tight">Checkout Strategy</DialogTitle>
                        <DialogDescription className="text-white/70 text-xs mt-1">
                            Choose how you would like to fund this deployment.
                        </DialogDescription>
                    </div>

                    <div className="p-6 space-y-4 bg-white">
                        <div className="p-4 bg-slate-50 border border-slate-100 mb-6">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Selected Strategy</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#147da2]">Execution Fee</span>
                            </div>
                            <div className="flex justify-between items-end">
                                <span className="text-lg font-black text-slate-800">{selectedPlan?.name}</span>
                                <span className="text-2xl font-black text-slate-900 leading-none">₹{selectedPlan?.price}</span>
                            </div>
                        </div>

                        <div className="grid gap-3">
                            <button
                                onClick={() => handlePayment('wallet')}
                                className="w-full flex items-center justify-between p-4 border border-slate-200 hover:border-[#147da2] hover:bg-[#147da2]/5 transition group text-left"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-[#147da2] group-hover:bg-white transition">
                                        <Wallet className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-tight text-slate-800">Wallet Balance</p>
                                        <p className="text-[10px] font-bold text-slate-400">Available: ₹{wallet?.balance || '0.00'}</p>
                                    </div>
                                </div>
                                <ArrowRight className="h-4 w-4 text-slate-200 group-hover:text-[#147da2] group-hover:translate-x-1 transition" />
                            </button>

                            <button
                                onClick={() => handlePayment('online')}
                                className="w-full flex items-center justify-between p-4 border border-slate-200 hover:border-[#147da2] hover:bg-[#147da2]/5 transition group text-left"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-[#147da2] group-hover:bg-white transition">
                                        <Globe className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-tight text-slate-800">Online Payment</p>
                                        <p className="text-[10px] font-bold text-slate-400">Cards, UPI, Netbanking</p>
                                    </div>
                                </div>
                                <ArrowRight className="h-4 w-4 text-slate-200 group-hover:text-[#147da2] group-hover:translate-x-1 transition" />
                            </button>
                        </div>

                        <div className="pt-4 flex items-center justify-center">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300 flex items-center gap-2">
                                <ShieldCheck className="h-3 w-3" />
                                Secure Checkout Protocol
                            </p>
                        </div>
                    </div>

                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                        <Button
                            variant="ghost"
                            onClick={() => setIsPaymentOpen(false)}
                            className="text-[10px] font-black uppercase tracking-widest text-slate-400"
                        >
                            Abort Deployment
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

function StatBox({ title, value, icon: Icon, color = "text-slate-900", isLast = false }: { title: string, value: string, icon: any, color?: string, isLast?: boolean }) {
    return (
        <div className={cn(
            "sawtooth bg-white p-5 border-y border-r border-t-0 border-slate-200 flex flex-col justify-between",
            isLast && "border-r-0"
        )}>
            <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{title}</p>
                <div className="h-8 w-8 flex items-center justify-center bg-slate-50 text-slate-400">
                    <Icon className="h-4 w-4" />
                </div>
            </div>
            <p className={cn("mt-4 text-xl font-black tracking-tight truncate", color)}>{value}</p>
        </div>
    );
}
