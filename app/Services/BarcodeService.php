<?php

namespace App\Services;

class BarcodeService
{
    public function generate(int $labId, int $billId, int $sampleId): string
    {
        return sprintf('LAB%d-%d-%d', $labId, $billId, $sampleId);
    }
}
