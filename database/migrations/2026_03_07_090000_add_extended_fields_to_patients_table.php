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
            $table->string('title', 20)->nullable()->after('uhid');
            $table->date('date_of_birth')->nullable()->after('gender');
            $table->string('landmark')->nullable()->after('city');
            $table->decimal('weight_kg', 6, 2)->nullable()->after('landmark');
            $table->decimal('height_cm', 6, 2)->nullable()->after('weight_kg');
            $table->string('id_type', 50)->nullable()->after('pin_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table): void {
            $table->dropColumn(['title', 'date_of_birth', 'landmark', 'weight_kg', 'height_cm', 'id_type']);
        });
    }
};
