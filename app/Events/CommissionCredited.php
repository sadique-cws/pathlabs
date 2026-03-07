<?php

namespace App\Events;

use App\Models\Bill;
use App\Models\WalletTransaction;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CommissionCredited
{
    use Dispatchable;
    use SerializesModels;

    public function __construct(
        public Bill $bill,
        public WalletTransaction $transaction,
        public string $beneficiaryType,
    ) {}
}
