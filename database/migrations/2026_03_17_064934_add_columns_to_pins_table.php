<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pins', function (Blueprint $table) {
            $table->string('site_name')->after('id');
            $table->foreignId('category_id')->constrained()->onDelete('cascade')->after('site_name');
            $table->foreignId('barangay_id')->nullable()->constrained()->onDelete('set null')->after('category_id');
            $table->enum('status', ['active', 'proposed', 'under-construction', 'needs-assessment', 'inactive'])->default('active')->after('barangay_id');
            $table->text('description')->nullable()->after('status');
            $table->decimal('latitude', 10, 7)->after('description');
            $table->decimal('longitude', 10, 7)->after('latitude');
        });
    }

    public function down(): void
    {
        Schema::table('pins', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
            $table->dropForeign(['barangay_id']);
            $table->dropColumn(['site_name', 'category_id', 'barangay_id', 'status', 'description', 'latitude', 'longitude']);
        });
    }
};