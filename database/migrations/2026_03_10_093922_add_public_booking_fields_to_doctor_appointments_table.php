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
        Schema::table('doctor_appointments', function (Blueprint $table) {
            $table->string('appointment_code', 30)->nullable()->after('id');
            $table->uuid('public_token')->nullable()->after('appointment_code');
            $table->date('appointment_date')->nullable()->after('patient_phone');
            $table->string('slot_time', 20)->nullable()->after('appointment_date');
            $table->string('patient_email')->nullable()->after('patient_phone');
            $table->string('patient_gender', 20)->nullable()->after('patient_email');
            $table->unsignedSmallInteger('patient_age')->nullable()->after('patient_gender');
            $table->string('patient_address', 255)->nullable()->after('patient_age');
            $table->decimal('consultation_fee', 10, 2)->default(0)->after('status');
            $table->string('payment_status', 30)->default('pending')->after('consultation_fee');
            $table->string('payment_method', 30)->nullable()->after('payment_status');
            $table->string('payment_reference', 120)->nullable()->after('payment_method');
            $table->string('receipt_barcode', 60)->nullable()->after('payment_reference');
            $table->timestamp('cancelled_at')->nullable()->after('receipt_barcode');
            $table->string('cancel_reason', 255)->nullable()->after('cancelled_at');

            $table->unique('appointment_code');
            $table->unique('public_token');
            $table->index(['doctor_id', 'appointment_date', 'slot_time']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('doctor_appointments', function (Blueprint $table) {
            $table->dropUnique(['appointment_code']);
            $table->dropUnique(['public_token']);
            $table->dropIndex(['doctor_id', 'appointment_date', 'slot_time']);
            $table->dropColumn([
                'appointment_code',
                'public_token',
                'appointment_date',
                'slot_time',
                'patient_email',
                'patient_gender',
                'patient_age',
                'patient_address',
                'consultation_fee',
                'payment_status',
                'payment_method',
                'payment_reference',
                'receipt_barcode',
                'cancelled_at',
                'cancel_reason',
            ]);
        });
    }
};
