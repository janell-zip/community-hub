<?php

namespace App\Models;

use App\Models\BudgetItem;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class Budget extends Model
{
    protected $fillable = [
        'program_id',
        'allocated_amount',
        'notes',
        'updated_by',
    ];

    protected $casts = [
        'allocated_amount' => 'decimal:2',
    ];

    public function program()
    {
        return $this->belongsTo(Program::class);
    }

    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function items()
    {
        return $this->hasMany(BudgetItem::class)->orderBy('order');
    }

    public function getGrandTotalAttribute(): float
    {
        return $this->items->sum('total');
    }
}