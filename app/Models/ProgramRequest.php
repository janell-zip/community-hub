<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProgramRequest extends Model
{
    protected $fillable = [
        'program_id',
        'requested_by',
        'type',
        'status',
        'notes',
        'actioned_by',
        'actioned_at',
        'rejection_reason',
    ];

    protected $casts = [
        'actioned_at' => 'datetime',
    ];

    public function program()
    {
        return $this->belongsTo(Program::class);
    }

    public function requester()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function actioner()
    {
        return $this->belongsTo(User::class, 'actioned_by');
    }
}