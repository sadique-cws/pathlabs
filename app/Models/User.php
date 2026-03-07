<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'lab_id',
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    public function lab(): BelongsTo
    {
        return $this->belongsTo(Lab::class);
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class)->withTimestamps();
    }

    public function hasRole(string $roleSlug): bool
    {
        return $this->roles()
            ->where('slug', $roleSlug)
            ->exists();
    }

    /**
     * @return array<int, string>
     */
    public function permissionSlugs(?int $labId = null): array
    {
        if (Permission::query()->count() === 0) {
            $defaults = $this->defaultPermissionSlugs();

            if ($this->hasRole('admin') || $this->hasRole('super_admin')) {
                return $defaults;
            }

            return array_values(array_filter(
                $defaults,
                fn (string $slug): bool => $slug !== 'admin.labs.features',
            ));
        }

        if ($this->hasRole('super_admin') || $this->hasRole('admin')) {
            return Permission::query()->pluck('slug')->all();
        }

        $rolePermissionSlugs = Permission::query()
            ->whereHas('roles.users', function ($query): void {
                $query->where('users.id', $this->id);
            })
            ->pluck('slug')
            ->all();

        if ($rolePermissionSlugs === []) {
            return Permission::query()
                ->where('slug', '!=', 'admin.labs.features')
                ->pluck('slug')
                ->all();
        }

        if ($labId === null || $labId <= 0) {
            return array_values(array_unique($rolePermissionSlugs));
        }

        $enabledLabSlugs = Permission::query()
            ->whereHas('labs', function ($query) use ($labId): void {
                $query
                    ->where('labs.id', $labId)
                    ->where('lab_permission.is_enabled', true);
            })
            ->pluck('slug')
            ->all();

        return array_values(array_unique(array_values(array_intersect($rolePermissionSlugs, $enabledLabSlugs))));
    }

    public function canAccessFeature(string $permissionSlug, ?int $labId = null): bool
    {
        return in_array($permissionSlug, $this->permissionSlugs($labId), true);
    }

    /**
     * @return array<int, string>
     */
    private function defaultPermissionSlugs(): array
    {
        return [
            'dashboard.view',
            'front_desk.access',
            'billing.create',
            'billing.view',
            'billing.edit',
            'billing.manage',
            'samples.manage',
            'patients.add',
            'patients.view',
            'patients.edit',
            'patients.manage',
            'doctors.add',
            'doctors.view',
            'doctors.edit',
            'doctors.manage',
            'test_result.entry',
            'reports.test_units',
            'reports.test_methods',
            'reports.sample_management',
            'reports.result_entry',
            'admin.labs.features',
        ];
    }
}
