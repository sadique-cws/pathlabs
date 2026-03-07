<?php

namespace App\Listeners;

use App\Events\BillCreated;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

class GenerateBillPdf implements ShouldQueue
{
    public function handle(BillCreated $event): void
    {
        Log::info('Bill PDF generation queued', [
            'bill_id' => $event->bill->id,
            'bill_number' => $event->bill->bill_number,
        ]);
    }
}
