<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tests', function (Blueprint $table) {
            $table->decimal('b2b_price', 10, 2)->nullable()->after('price');
        });

        Schema::table('test_packages', function (Blueprint $table) {
            $table->decimal('b2b_price', 10, 2)->nullable()->after('price');
        });
    }

    public function down(): void
    {
        Schema::table('tests', function (Blueprint $table) {
            $table->dropColumn('b2b_price');
        });

        Schema::table('test_packages', function (Blueprint $table) {
            $table->dropColumn('b2b_price');
        });
    }
};
