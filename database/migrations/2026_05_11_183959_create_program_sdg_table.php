<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('program_sdg', function (Blueprint $table) {
            $table->foreignId('program_id')->constrained()->cascadeOnDelete();
            $table->foreignId('sdg_id')->constrained()->cascadeOnDelete();
            $table->primary(['program_id', 'sdg_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('program_sdg');
    }
};
