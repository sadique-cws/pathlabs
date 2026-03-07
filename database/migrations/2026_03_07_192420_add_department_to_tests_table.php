<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tests', function (Blueprint $table): void {
            $table->string('department', 50)->default('pathology')->after('sample_type');
        });

        // Also add approved_by to samples so we track which doctor approved
        Schema::table('samples', function (Blueprint $table): void {
            $table->unsignedBigInteger('approved_by')->nullable()->after('approval_date');
        });
    }

    public function down(): void
    {
        Schema::table('tests', function (Blueprint $table): void {
            $table->dropColumn('department');
        });

        Schema::table('samples', function (Blueprint $table): void {
            $table->dropColumn('approved_by');
        });
    }
};
