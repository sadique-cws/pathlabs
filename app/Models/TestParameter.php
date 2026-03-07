<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TestParameter extends Model
{
    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'test_id',
        'name',
        'unit',
        'normal_range',
    ];

    public function test()
    {
        return $this->belongsTo(LabTest::class, 'test_id');
    }
}
