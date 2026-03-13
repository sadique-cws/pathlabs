<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table
                ->foreignId('collection_center_id')
                ->nullable()
                ->after('lab_id')
                ->constrained()
                ->nullOnDelete();
        });

        Schema::table('doctors', function (Blueprint $table) {
            $table
                ->foreignId('collection_center_id')
                ->nullable()
                ->after('lab_id')
                ->constrained()
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->dropConstrainedForeignId('collection_center_id');
        });

        Schema::table('doctors', function (Blueprint $table) {
            $table->dropConstrainedForeignId('collection_center_id');
        });
    }
};
