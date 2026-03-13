<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphOne;

class CollectionCenter extends Model
{
    /** @use HasFactory<\Database\Factories\CollectionCenterFactory> */
    use HasFactory;

    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'lab_id',
        'name',
        'phone',
        'address',
        'commission_type',
        'commission_value',
        'price_margin_type',
        'price_margin_value',
        'is_active',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'commission_value' => 'decimal:2',
            'price_margin_value' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public function lab(): BelongsTo
    {
        return $this->belongsTo(Lab::class);
    }

    public function wallet(): MorphOne
    {
        return $this->morphOne(Wallet::class, 'walletable');
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function bills(): HasMany
    {
        return $this->hasMany(Bill::class);
    }

    public function patients(): HasMany
    {
        return $this->hasMany(Patient::class);
    }

    public function doctors(): HasMany
    {
        return $this->hasMany(Doctor::class);
    }

    public function sellingPrice(float $basePrice): float
    {
        if ($this->price_margin_type === 'percent') {
            return round($basePrice + (($basePrice * (float) $this->price_margin_value) / 100), 2);
        }

        return round($basePrice + (float) $this->price_margin_value, 2);
    }
}
