<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('barangays', function (Blueprint $table) {
            $table->string('city')->default('Tuguegarao City')->after('name');
            $table->string('province')->default('Cagayan')->after('city');
        });
    }

    public function down(): void
    {
        Schema::table('barangays', function (Blueprint $table) {
            $table->dropColumn(['city', 'province']);
        });
    }
};