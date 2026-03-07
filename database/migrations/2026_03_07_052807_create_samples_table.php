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
        Schema::create('samples', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('lab_id')->constrained()->cascadeOnDelete();
            $table->foreignId('bill_id')->constrained()->cascadeOnDelete();
            $table->foreignId('bill_item_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('test_id')->constrained('tests')->cascadeOnDelete();
            $table->string('barcode')->nullable()->unique();
            $table->string('status', 30)->default('pending');
            $table->dateTime('collected_at')->nullable();
            $table->timestamps();

            $table->index(['lab_id', 'bill_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('samples');
    }
};
