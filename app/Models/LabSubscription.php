<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LabSubscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'lab_id',
        'subscription_plan_id',
        'status',
        'starts_at',
        'ends_at',
        'bill_limit',
        'bills_used',
        'is_current',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'is_current' => 'boolean',
    ];

    public function plan(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlan::class, 'subscription_plan_id');
    }

    public function lab(): BelongsTo
    {
        return $this->belongsTo(Lab::class);
    }
}
