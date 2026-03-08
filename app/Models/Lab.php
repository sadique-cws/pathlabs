<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphOne;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Lab extends Model
{
    /** @use HasFactory<\Database\Factories\LabFactory> */
    use HasFactory;

    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'code',
        'phone',
        'is_active',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function wallet(): MorphOne
    {
        return $this->morphOne(Wallet::class, 'walletable');
    }

    public function tests(): HasMany
    {
        return $this->hasMany(LabTest::class);
    }

    public function packages(): HasMany
    {
        return $this->hasMany(TestPackage::class);
    }

    public function doctors(): HasMany
    {
        return $this->hasMany(Doctor::class);
    }

    public function collectionCenters(): HasMany
    {
        return $this->hasMany(CollectionCenter::class);
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class)
            ->withPivot('is_enabled')
            ->withTimestamps();
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(LabSubscription::class);
    }

    public function currentSubscription(): HasOne
    {
        return $this->hasOne(LabSubscription::class)
            ->where('is_current', true)
            ->where('status', 'active');
    }
}
