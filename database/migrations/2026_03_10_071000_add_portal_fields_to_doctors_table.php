<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('doctors', function (Blueprint $table): void {
            $table->string('doctor_type', 30)->default('specialist')->after('email');
            $table->string('specialization', 120)->nullable()->after('doctor_type');
            $table->boolean('can_approve_reports')->default(false)->after('specialization');
        });
    }

    public function down(): void
    {
        Schema::table('doctors', function (Blueprint $table): void {
            $table->dropColumn(['doctor_type', 'specialization', 'can_approve_reports']);
        });
    }
};
