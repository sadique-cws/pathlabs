<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tests', function (Blueprint $table) {
            $table->foreignId('lab_id')->nullable()->change();
            $table->boolean('is_system')->default(false)->after('lab_id');
        });

        Schema::table('test_packages', function (Blueprint $table) {
            $table->foreignId('lab_id')->nullable()->change();
            $table->boolean('is_system')->default(false)->after('lab_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tests', function (Blueprint $table) {
            $table->foreignId('lab_id')->nullable(false)->change();
            $table->dropColumn('is_system');
        });

        Schema::table('test_packages', function (Blueprint $table) {
            $table->foreignId('lab_id')->nullable(false)->change();
            $table->dropColumn('is_system');
        });
    }
};
