<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pin extends Model
{
    protected $fillable = [
        'site_name',
        'category_id',
        'barangay_id',
        'status',
        'description',
        'latitude',
        'longitude',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function barangay()
    {
        return $this->belongsTo(Barangay::class);
    }
}