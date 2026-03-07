<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class LabTest extends Model
{
    /** @use HasFactory<\Database\Factories\LabTestFactory> */
    use HasFactory;

    protected $table = 'tests';

    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'lab_id',
        'name',
        'code',
        'sample_type',
        'price',
        'referral_commission_value',
        'referral_commission_type',
        'collection_center_commission_value',
        'collection_center_commission_type',
        'is_active',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'referral_commission_value' => 'decimal:2',
            'collection_center_commission_value' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public function lab(): BelongsTo
    {
        return $this->belongsTo(Lab::class);
    }

    public function packages(): BelongsToMany
    {
        return $this->belongsToMany(TestPackage::class, 'test_package_test', 'test_id', 'test_package_id')
            ->withTimestamps();
    }
}
