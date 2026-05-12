<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sdg extends Model
{
    protected $fillable = ['number', 'title', 'color'];

    public function programs()
    {
        return $this->belongsToMany(Program::class, 'program_sdg');
    }
}
