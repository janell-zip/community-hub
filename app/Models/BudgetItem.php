<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BudgetItem extends Model
{
    protected $fillable = [
        'budget_id',
        'name',
        'quantity',
        'unit_price',
        'total',
        'order',
    ];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'total'      => 'decimal:2',
    ];
}