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
        Schema::create('patients', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('lab_id')->constrained()->cascadeOnDelete();
            $table->string('uhid')->nullable();
            $table->string('name');
            $table->string('phone', 20);
            $table->string('gender', 20)->nullable();
            $table->unsignedTinyInteger('age_years')->nullable();
            $table->unsignedTinyInteger('age_months')->nullable();
            $table->unsignedTinyInteger('age_days')->nullable();
            $table->string('email')->nullable();
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('pin_code', 20)->nullable();
            $table->timestamps();

            $table->index(['lab_id', 'phone']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patients');
    }
};
