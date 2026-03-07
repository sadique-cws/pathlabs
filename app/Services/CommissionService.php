<?php

namespace App\Services;

use App\Events\CommissionCredited;
use App\Models\Bill;
use App\Models\CollectionCenter;
use App\Models\Doctor;
use App\Models\DoctorCommission;

class CommissionService
{
    public function __construct(private WalletService $walletService) {}

    public function creditDoctorCommission(Bill $bill, float $commissionBase): void
    {
        if ($bill->doctor_id === null) {
            return;
        }

        /** @var Doctor $doctor */
        $doctor = $bill->doctor()->firstOrFail();
        $amount = $this->calculateAmount($doctor->commission_type, (float) $doctor->commission_value, $commissionBase);

        if ($amount <= 0) {
            return;
        }

        $wallet = $this->walletService->ensureWallet($doctor, $bill->lab_id);
        $transaction = $this->walletService->credit($wallet, $amount, $bill, 'Referral commission credited');

        DoctorCommission::query()->create([
            'lab_id' => $bill->lab_id,
            'doctor_id' => $doctor->id,
            'bill_id' => $bill->id,
            'amount' => $amount,
            'status' => 'credited',
            'credited_at' => now(),
        ]);

        event(new CommissionCredited($bill, $transaction, 'doctor'));
    }

    public function creditCollectionCenterCommission(Bill $bill, float $commissionBase): void
    {
        if ($bill->collection_center_id === null) {
            return;
        }

        /** @var CollectionCenter $collectionCenter */
        $collectionCenter = $bill->collectionCenter()->firstOrFail();
        $amount = $this->calculateAmount(
            $collectionCenter->commission_type,
            (float) $collectionCenter->commission_value,
            $commissionBase,
        );

        if ($amount <= 0) {
            return;
        }

        $wallet = $this->walletService->ensureWallet($collectionCenter, $bill->lab_id);
        $transaction = $this->walletService->credit($wallet, $amount, $bill, 'Collection center commission credited');

        event(new CommissionCredited($bill, $transaction, 'collection_center'));
    }

    private function calculateAmount(string $type, float $value, float $base): float
    {
        if ($type === 'fixed') {
            return round($value, 2);
        }

        return round(($base * $value) / 100, 2);
    }
}
