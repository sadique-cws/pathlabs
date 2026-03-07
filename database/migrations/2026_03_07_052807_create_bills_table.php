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
        Schema::create('bills', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('lab_id')->constrained()->cascadeOnDelete();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignId('doctor_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('collection_center_id')->nullable()->constrained()->nullOnDelete();
            $table->string('bill_number')->unique();
            $table->dateTime('billing_at');
            $table->decimal('test_total', 10, 2)->default(0);
            $table->decimal('package_total', 10, 2)->default(0);
            $table->decimal('gross_total', 10, 2)->default(0);
            $table->decimal('discount_amount', 10, 2)->default(0);
            $table->decimal('service_charge', 10, 2)->default(15);
            $table->decimal('net_total', 10, 2)->default(0);
            $table->string('status', 30)->default('generated');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['lab_id', 'billing_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bills');
    }
};
