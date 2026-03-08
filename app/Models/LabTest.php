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
        'test_group_id',
        'sample_type',
        'department',
        'price',
        'referral_commission_value',
        'referral_commission_type',
        'collection_center_commission_value',
        'collection_center_commission_type',
        'is_active',
        'is_system',
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
            'is_system' => 'boolean',
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

    public function parameters(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(TestParameter::class, 'test_id');
    }

    public function testGroup(): BelongsTo
    {
        return $this->belongsTo(TestGroup::class, 'test_group_id');
    }
}
