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
        Schema::table('patients', function (Blueprint $table): void {
            $table->string('alternative_phone', 20)->nullable()->after('phone');
            $table->string('discount_package', 120)->nullable()->after('id_type');
            $table->date('discount_expiry_date')->nullable()->after('discount_package');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table): void {
            $table->dropColumn([
                'alternative_phone',
                'discount_package',
                'discount_expiry_date',
            ]);
        });
    }
};
