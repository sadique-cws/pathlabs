<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Patient extends Model
{
    /** @use HasFactory<\Database\Factories\PatientFactory> */
    use HasFactory;

    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'lab_id',
        'collection_center_id',
        'uhid',
        'title',
        'name',
        'phone',
        'alternative_phone',
        'gender',
        'date_of_birth',
        'age_years',
        'age_months',
        'age_days',
        'email',
        'address',
        'city',
        'landmark',
        'weight_kg',
        'height_cm',
        'state',
        'pin_code',
        'id_type',
        'discount_package',
        'discount_expiry_date',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'discount_expiry_date' => 'date',
            'weight_kg' => 'decimal:2',
            'height_cm' => 'decimal:2',
        ];
    }

    public function lab(): BelongsTo
    {
        return $this->belongsTo(Lab::class);
    }

    public function collectionCenter(): BelongsTo
    {
        return $this->belongsTo(CollectionCenter::class);
    }

    public function bills(): HasMany
    {
        return $this->hasMany(Bill::class);
    }
}
