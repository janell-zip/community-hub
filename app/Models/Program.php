<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Program extends Model
{
    protected $fillable = [
        'title',
        'description',
        'location',
        'pin_id',
        'category',
        'status',
        'start_at',
        'end_at',
    ];

    protected $casts = [
        'start_at' => 'datetime',
        'end_at'   => 'datetime',
    ];

    public static array $categories = [
        'health'          => ['label' => 'Health',          'color' => '#c0392b'],
        'education'       => ['label' => 'Education',       'color' => '#2980b9'],
        'infrastructure'  => ['label' => 'Infrastructure',  'color' => '#e67e22'],
        'livelihood'      => ['label' => 'Livelihood',      'color' => '#27ae60'],
        'disaster-risk'   => ['label' => 'Disaster Risk',   'color' => '#8e44ad'],
        'social-services' => ['label' => 'Social Services', 'color' => '#16a085'],
    ];

    public function pin()
    {
        return $this->belongsTo(Pin::class);
    }
    
    public function budget()
    {
        return $this->hasOne(Budget::class);
    }

    public function requests()
    {
        return $this->hasMany(ProgramRequest::class);
    }

    public function pendingRequests()
    {
        return $this->hasMany(ProgramRequest::class)->where('status', 'pending');
    }
    
    public static array $statuses = [
        'proposed'  => ['label' => 'Proposed',  'color' => '#b5830a'],
        'approved'  => ['label' => 'Approved',  'color' => '#2980b9'],
        'ongoing'   => ['label' => 'Ongoing',   'color' => '#27ae60'],
        'completed' => ['label' => 'Completed', 'color' => '#16a085'],
        'cancelled' => ['label' => 'Cancelled', 'color' => '#c0392b'],
    ];
}