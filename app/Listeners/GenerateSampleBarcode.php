<?php

namespace App\Listeners;

use App\Events\SampleCreated;
use App\Services\BarcodeService;
use Illuminate\Contracts\Queue\ShouldQueue;

class GenerateSampleBarcode implements ShouldQueue
{
    public function __construct(private BarcodeService $barcodeService) {}

    public function handle(SampleCreated $event): void
    {
        $sample = $event->sample;

        if ($sample->barcode !== null && $sample->barcode !== '') {
            return;
        }

        $sample->update([
            'barcode' => $this->barcodeService->generate($sample->lab_id, $sample->bill_id, $sample->id),
        ]);
    }
}
