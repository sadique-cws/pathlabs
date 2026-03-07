<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Bill extends Model
{
    /** @use HasFactory<\Database\Factories\BillFactory> */
    use HasFactory;

    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'lab_id',
        'patient_id',
        'doctor_id',
        'collection_center_id',
        'bill_number',
        'billing_at',
        'sample_collected_from',
        'insurance_details',
        'service_other_charges',
        'service_other_total',
        'offer',
        'test_total',
        'package_total',
        'gross_total',
        'discount_amount',
        'doctor_discount_amount',
        'doctor_discount_type',
        'center_discount_amount',
        'center_discount_type',
        'service_charge',
        'net_total',
        'payment_amount',
        'urgent',
        'soft_copy_only',
        'send_message',
        'previous_reports',
        'agent_referrer',
        'status',
        'notes',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'billing_at' => 'datetime',
            'test_total' => 'decimal:2',
            'package_total' => 'decimal:2',
            'gross_total' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'doctor_discount_amount' => 'decimal:2',
            'center_discount_amount' => 'decimal:2',
            'service_charge' => 'decimal:2',
            'service_other_total' => 'decimal:2',
            'net_total' => 'decimal:2',
            'payment_amount' => 'decimal:2',
            'service_other_charges' => 'array',
            'urgent' => 'boolean',
            'soft_copy_only' => 'boolean',
            'send_message' => 'boolean',
        ];
    }

    public function lab(): BelongsTo
    {
        return $this->belongsTo(Lab::class);
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class);
    }

    public function collectionCenter(): BelongsTo
    {
        return $this->belongsTo(CollectionCenter::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(BillItem::class);
    }

    public function samples(): HasMany
    {
        return $this->hasMany(Sample::class);
    }
}
