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
        Schema::create('test_groups', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('lab_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->boolean('is_active')->default(true);
            $table->boolean('is_system')->default(false);
            $table->timestamps();

            $table->unique(['lab_id', 'name']);
        });

        // Let's add a test_group_id to tests table to associate them.
        Schema::table('tests', function (Blueprint $table): void {
            $table->foreignId('test_group_id')->nullable()->constrained('test_groups')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tests', function (Blueprint $table): void {
            $table->dropForeign(['test_group_id']);
            $table->dropColumn('test_group_id');
        });

        Schema::dropIfExists('test_groups');
    }
};
