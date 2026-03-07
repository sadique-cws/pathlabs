<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Permission extends Model
{
    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'slug',
        'group',
        'description',
    ];

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class)->withTimestamps();
    }

    public function labs(): BelongsToMany
    {
        return $this->belongsToMany(Lab::class)
            ->withPivot('is_enabled')
            ->withTimestamps();
    }
}
