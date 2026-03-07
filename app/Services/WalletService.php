<?php

namespace App\Services;

use App\Events\WalletDebited;
use App\Exceptions\InsufficientWalletBalanceException;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use Illuminate\Database\Eloquent\Model;

class WalletService
{
    public function ensureWallet(Model $owner, int $labId): Wallet
    {
        return Wallet::query()->firstOrCreate([
            'walletable_type' => $owner::class,
            'walletable_id' => $owner->getKey(),
        ], [
            'lab_id' => $labId,
            'balance' => 0,
            'currency' => 'INR',
        ]);
    }

    public function debit(Wallet $wallet, float $amount, Model $reference, string $description): WalletTransaction
    {
        $lockedWallet = Wallet::query()->lockForUpdate()->findOrFail($wallet->id);

        if ((float) $lockedWallet->balance < $amount) {
            throw new InsufficientWalletBalanceException('Insufficient wallet balance for debit.');
        }

        $before = (float) $lockedWallet->balance;
        $after = $before - $amount;

        $lockedWallet->update([
            'balance' => $after,
        ]);

        $transaction = WalletTransaction::query()->create([
            'lab_id' => $lockedWallet->lab_id,
            'wallet_id' => $lockedWallet->id,
            'direction' => 'debit',
            'amount' => $amount,
            'balance_before' => $before,
            'balance_after' => $after,
            'reference_type' => $reference::class,
            'reference_id' => $reference->getKey(),
            'description' => $description,
        ]);

        event(new WalletDebited($transaction));

        return $transaction;
    }

    public function credit(Wallet $wallet, float $amount, Model $reference, string $description): WalletTransaction
    {
        $lockedWallet = Wallet::query()->lockForUpdate()->findOrFail($wallet->id);

        $before = (float) $lockedWallet->balance;
        $after = $before + $amount;

        $lockedWallet->update([
            'balance' => $after,
        ]);

        return WalletTransaction::query()->create([
            'lab_id' => $lockedWallet->lab_id,
            'wallet_id' => $lockedWallet->id,
            'direction' => 'credit',
            'amount' => $amount,
            'balance_before' => $before,
            'balance_after' => $after,
            'reference_type' => $reference::class,
            'reference_id' => $reference->getKey(),
            'description' => $description,
        ]);
    }
}
