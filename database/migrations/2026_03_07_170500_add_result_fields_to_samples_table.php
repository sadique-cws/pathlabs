<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('samples', function (Blueprint $table): void {
            $table->json('result_payload')->nullable()->after('status');
            $table->text('result_remarks')->nullable()->after('result_payload');
            $table->date('approval_date')->nullable()->after('result_remarks');
        });
    }

    public function down(): void
    {
        Schema::table('samples', function (Blueprint $table): void {
            $table->dropColumn(['result_payload', 'result_remarks', 'approval_date']);
        });
    }
};
