<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Barangay extends Model
{
    protected $fillable = ['name', 'city', 'province', 'coordinates'];

    protected $casts = [
        'coordinates' => 'array',
    ];

    public function pins()
    {
        return $this->hasMany(Pin::class);
    }
}