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
        Schema::create('tests', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('lab_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('code');
            $table->string('sample_type')->nullable();
            $table->decimal('price', 10, 2);
            $table->decimal('referral_commission_value', 10, 2)->default(0);
            $table->string('referral_commission_type', 20)->default('percent');
            $table->decimal('collection_center_commission_value', 10, 2)->default(0);
            $table->string('collection_center_commission_type', 20)->default('percent');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['lab_id', 'code']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tests');
    }
};
