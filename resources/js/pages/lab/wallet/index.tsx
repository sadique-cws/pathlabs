import { Head, router, usePage } from '@inertiajs/react';
import { CreditCard, History, IndianRupee, Landmark, Plus } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

type Transaction = {
    id: number;
    direction: 'in' | 'out';
    amount: string;
    balance_before: string;
    balance_after: string;
    reference_type: string;
    reference_id: string;
    description: string;
    created_at: string;
};

type Props = {
    wallet: {
        id: number;
        balance: string;
        currency: string;
    };
    transactions: {
        data: Transaction[];
        links: any[];
        total: number;
    };
    razorpayKey: string;
};

export default function WalletIndex({ wallet, transactions, razorpayKey }: Props) {
    const [amount, setAmount] = useState('500');
    const [isProcessing, setIsProcessing] = useState(false);
    const { access } = usePage<any>().props;
    const canTopUp = access.permissions.includes('wallet.topup');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Wallet', href: '/lab/wallet' },
    ];

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleTopUp = async () => {
        const value = parseFloat(amount);
        if (isNaN(value) || value <= 0) return;

        setIsProcessing(true);
        const res = await loadRazorpay();

        if (!res) {
            alert('Razorpay SDK failed to load. Are you online?');
            setIsProcessing(false);
            return;
        }

        const options = {
            key: razorpayKey,
            amount: value * 100, // amount in the smallest currency unit
            currency: 'INR',
            name: 'Pathlabs Wallet',
            description: 'Wallet Top-up',
            handler: function (response: any) {
                router.post('/lab/wallet/topup', {
                    amount: value,
                    razorpay_payment_id: response.razorpay_payment_id,
                }, {
                    onFinish: () => setIsProcessing(false)
                });
            },
            prefill: {
                name: '',
                email: '',
                contact: ''
            },
            theme: {
                color: '#147da2'
            }
        };

        const paymentObject = new (window as any).Razorpay(options);
        paymentObject.open();
        setIsProcessing(false);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Wallet" />

            <div className="mx-auto max-w-5xl p-4 md:p-6 space-y-6">
                <div className="grid gap-6 md:grid-cols-3">
                    {/* Balance Card */}
                    <div className="md:col-span-2  border border-slate-200 bg-white p-6 overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <IndianRupee size={120} />
                        </div>
                        <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Current Balance</h2>
                        <div className="mt-4 flex items-baseline gap-2">
                            <span className="text-4xl font-bold text-slate-900">₹{parseFloat(wallet.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            <span className="text-slate-400 font-medium">INR</span>
                        </div>
                        
                        {canTopUp && (
                            <div className="mt-8 flex items-center gap-4">
                                <div className="flex-1 max-w-[200px]">
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className="w-full h-10 pl-7 pr-3 border border-slate-200 outline-none focus:border-[#147da2] focus:ring-1 focus:ring-[#147da2]/20 transition"
                                            placeholder="Enter amount"
                                        />
                                    </div>
                                </div>
                                <Button
                                    onClick={handleTopUp}
                                    disabled={isProcessing}
                                    className="bg-[#147da2] hover:bg-[#0d708e] text-white flex gap-2"
                                >
                                    <Plus size={18} />
                                    Top-up Now
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Quick Stats */}
                    <div className=" border border-slate-200 bg-slate-50/50 p-6 shadow-sm flex flex-col justify-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2  bg-emerald-100 text-emerald-600">
                                <Landmark size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium uppercase tracking-tighter">Safe & Secure</p>
                                <p className="text-sm font-semibold text-slate-700">Encrypted Payments</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2  bg-blue-100 text-blue-600">
                                <CreditCard size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium uppercase tracking-tighter">Powered By</p>
                                <p className="text-sm font-semibold text-slate-700">Razorpay Gateway</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Transactions Table */}
                <div className=" border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="flex items-center gap-2 border-b border-slate-200 px-6 py-4">
                        <History size={20} className="text-[#147da2]" />
                        <h3 className="font-semibold text-slate-800">Transaction History</h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 whitespace-nowrap">Date & Time</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Description</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Reference</th>
                                    <th className="px-6 py-4 text-right whitespace-nowrap">Amount</th>
                                    <th className="px-6 py-4 text-right whitespace-nowrap">Balance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {transactions.data.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-slate-50/50 transition">
                                        <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                                            {new Date(tx.created_at).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-700">
                                            {tx.description}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600">
                                                {tx.reference_type}: {tx.reference_id}
                                            </span>
                                        </td>
                                        <td className={cn(
                                            "px-6 py-4 text-right font-bold whitespace-nowrap",
                                            tx.direction === 'in' ? 'text-emerald-600' : 'text-rose-600'
                                        )}>
                                            {tx.direction === 'in' ? '+' : '-'}₹{parseFloat(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 text-right text-slate-500 whitespace-nowrap">
                                            ₹{parseFloat(tx.balance_after).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                ))}
                                {transactions.data.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                                            No transactions found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
