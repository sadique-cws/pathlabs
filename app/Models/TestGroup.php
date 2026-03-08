<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TestGroup extends Model
{
    protected $fillable = [
        'lab_id',
        'name',
        'is_active',
        'is_system',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'is_system' => 'boolean',
        ];
    }

    public function lab(): BelongsTo
    {
        return $this->belongsTo(Lab::class);
    }

    public function tests(): HasMany
    {
        return $this->hasMany(LabTest::class, 'test_group_id');
    }
}
