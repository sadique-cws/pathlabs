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
        Schema::table('labs', function (Blueprint $table): void {
            // Basic Information
            $table->string('logo_path')->nullable()->after('is_active');
            $table->string('email')->nullable()->after('logo_path');
            $table->string('website')->nullable()->after('email');
            $table->year('established_year')->nullable()->after('website');

            // Address Information
            $table->text('address')->nullable()->after('established_year');
            $table->string('city')->nullable()->after('address');
            $table->string('state')->nullable()->after('city');
            $table->string('pincode', 10)->nullable()->after('state');
            $table->string('nearest_location')->nullable()->after('pincode');

            // Payment Information
            $table->string('payment_receive_account')->default('cash')->after('nearest_location'); // cash, direct
            $table->string('upi_qr_code_path')->nullable()->after('payment_receive_account');

            // Booking Information
            $table->boolean('online_booking_available')->default(false)->after('upi_qr_code_path');
            $table->boolean('home_sample_collection')->default(false)->after('online_booking_available');

            // Legal Information
            $table->string('gst_number')->nullable()->after('home_sample_collection');
            $table->string('lab_license_number')->nullable()->after('gst_number');
            $table->string('lab_director_name')->nullable()->after('lab_license_number');

            // Technician Information
            $table->string('technician_name')->nullable()->after('lab_director_name');
            $table->string('technician_qualification')->nullable()->after('technician_name');
            $table->string('technician_license_number')->nullable()->after('technician_qualification');
            $table->string('technician_signature_path')->nullable()->after('technician_license_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('labs', function (Blueprint $table): void {
            $table->dropColumn([
                'logo_path',
                'email',
                'website',
                'established_year',
                'address',
                'city',
                'state',
                'pincode',
                'nearest_location',
                'payment_receive_account',
                'upi_qr_code_path',
                'online_booking_available',
                'home_sample_collection',
                'gst_number',
                'lab_license_number',
                'lab_director_name',
                'technician_name',
                'technician_qualification',
                'technician_license_number',
                'technician_signature_path',
            ]);
        });
    }
};
