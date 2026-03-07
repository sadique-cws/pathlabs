<?php

namespace App\Http\Controllers\Lab;

use App\Http\Controllers\Controller;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class WalletController extends Controller
{
    public function index(Request $request): Response
    {
        $labId = (int) $request->attributes->get('lab_id');
        $user = $request->user();

        $wallet = Wallet::firstOrCreate(
            [
                'lab_id' => $labId,
                'walletable_type' => \App\Models\Lab::class,
                'walletable_id' => $labId,
            ],
            [
                'balance' => 0,
                'currency' => 'INR',
            ]
        );

        $transactions = WalletTransaction::query()
            ->where('wallet_id', $wallet->id)
            ->latest()
            ->paginate(20);

        return Inertia::render('lab/wallet/index', [
            'wallet' => $wallet,
            'transactions' => $transactions,
            'razorpayKey' => config('services.razorpay.key_id'),
        ]);
    }

    public function topup(Request $request)
    {
        // Placeholder for Razorpay verification logic
        // In a real app, verify signature and then update wallet

        $request->validate([
            'amount' => 'required|numeric|min:1',
            'razorpay_payment_id' => 'required|string',
        ]);

        $labId = (int) $request->attributes->get('lab_id');
        $wallet = Wallet::where('lab_id', $labId)->firstOrFail();

        $amount = $request->input('amount');

        DB::transaction(function () use ($wallet, $amount, $request) {
            $balanceBefore = $wallet->balance;
            $wallet->increment('balance', $amount);

            WalletTransaction::create([
                'lab_id' => $wallet->lab_id,
                'wallet_id' => $wallet->id,
                'direction' => 'in',
                'amount' => $amount,
                'balance_before' => $balanceBefore,
                'balance_after' => $wallet->balance,
                'reference_type' => 'razorpay',
                'reference_id' => $request->input('razorpay_payment_id'),
                'description' => 'Wallet Top-up via Razorpay',
            ]);
        });

        return back()->with('success', 'Wallet topped up successfully!');
    }
}
