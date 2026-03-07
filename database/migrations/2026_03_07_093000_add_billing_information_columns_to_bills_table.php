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
        Schema::table('bills', function (Blueprint $table): void {
            $table->string('sample_collected_from', 100)->nullable()->after('billing_at');
            $table->string('insurance_details', 255)->nullable()->after('sample_collected_from');
            $table->json('service_other_charges')->nullable()->after('insurance_details');
            $table->decimal('service_other_total', 10, 2)->default(0)->after('service_other_charges');
            $table->string('offer', 120)->nullable()->after('service_other_total');
            $table->decimal('doctor_discount_amount', 10, 2)->default(0)->after('discount_amount');
            $table->string('doctor_discount_type', 20)->default('fixed')->after('doctor_discount_amount');
            $table->decimal('center_discount_amount', 10, 2)->default(0)->after('doctor_discount_type');
            $table->string('center_discount_type', 20)->default('fixed')->after('center_discount_amount');
            $table->string('previous_reports', 255)->nullable()->after('offer');
            $table->string('agent_referrer', 150)->nullable()->after('previous_reports');
            $table->decimal('payment_amount', 10, 2)->default(0)->after('net_total');
            $table->boolean('urgent')->default(false)->after('payment_amount');
            $table->boolean('soft_copy_only')->default(false)->after('urgent');
            $table->boolean('send_message')->default(true)->after('soft_copy_only');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bills', function (Blueprint $table): void {
            $table->dropColumn([
                'sample_collected_from',
                'insurance_details',
                'service_other_charges',
                'service_other_total',
                'offer',
                'doctor_discount_amount',
                'doctor_discount_type',
                'center_discount_amount',
                'center_discount_type',
                'previous_reports',
                'agent_referrer',
                'payment_amount',
                'urgent',
                'soft_copy_only',
                'send_message',
            ]);
        });
    }
};
