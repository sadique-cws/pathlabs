<?php

namespace App\Listeners;

use App\Events\BillCreated;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

class SendBillingNotification implements ShouldQueue
{
    public function handle(BillCreated $event): void
    {
        Log::info('Billing notification queued', [
            'bill_id' => $event->bill->id,
            'patient_id' => $event->bill->patient_id,
        ]);
    }
}
