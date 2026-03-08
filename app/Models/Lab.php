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
            ->where('is_current', true);
    }

    public function getEffectiveSubscription()
    {
        $sub = $this->currentSubscription()->with('plan')->first();

        if ($sub && $sub->status === 'active' && $sub->ends_at && $sub->ends_at->isPast() && $sub->plan->type !== 'pay_as_you_go') {
            // Auto-shift to Pay As You Go (ID 1)
            \Illuminate\Support\Facades\DB::transaction(function () use ($sub) {
                /** @var \App\Models\LabSubscription $sub */
                $sub->update(['status' => 'expired', 'is_current' => false]);

                $payAsYouGo = SubscriptionPlan::find(1);
                if ($payAsYouGo) {
                    LabSubscription::create([
                        'lab_id' => $this->id,
                        'subscription_plan_id' => $payAsYouGo->id,
                        'status' => 'active',
                        'starts_at' => now(),
                        'ends_at' => null,
                        'bill_limit' => $payAsYouGo->bill_limit,
                        'bills_used' => 0,
                        'is_current' => true,
                    ]);
                }
            });

            return $this->currentSubscription()->with('plan')->first();
        }

        return $sub;
    }

    public function getSubscriptionReminder(): ?string
    {
        $sub = $this->currentSubscription()->with('plan')->first();

        if ($sub && $sub->status === 'active' && $sub->ends_at && $sub->plan->type !== 'pay_as_you_go') {
            $daysLeft = (int) now()->diffInDays($sub->ends_at, false);
            if ($daysLeft >= 0 && $daysLeft <= 5) {
                return "Your strategy '{$sub->plan->name}' expires in {$daysLeft} days. Please renew to avoid shifting to Pay As You Go.";
            }
        }

        return null;
    }
}
