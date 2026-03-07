<?php

namespace App\Events;

use App\Models\Sample;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SampleCreated
{
    use Dispatchable;
    use SerializesModels;

    public function __construct(public Sample $sample) {}
}
