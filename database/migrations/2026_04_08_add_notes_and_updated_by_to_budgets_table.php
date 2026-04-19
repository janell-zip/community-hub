<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('budgets', function (Blueprint $table) {
            $table->text('notes')->nullable()->after('allocated_amount');
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete()->after('notes');
        });
    }

    public function down(): void
    {
        Schema::table('budgets', function (Blueprint $table) {
            $table->dropColumn('notes');
            $table->dropForeignKeyIfExists(['updated_by']);
            $table->dropColumn('updated_by');
        });
    }
};
