<?php

namespace App\Events;

use App\Models\WalletTransaction;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class WalletDebited
{
    use Dispatchable;
    use SerializesModels;

    public function __construct(public WalletTransaction $transaction) {}
}
