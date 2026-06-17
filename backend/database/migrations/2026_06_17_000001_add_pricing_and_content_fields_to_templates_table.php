<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('templates', function (Blueprint $table) {
            $table->unsignedBigInteger('normal_price')->nullable()->after('price');
            $table->unsignedBigInteger('promo_price')->nullable()->after('normal_price');
            $table->json('target_audience')->nullable()->after('features');
            $table->json('included_features')->nullable()->after('target_audience');
        });

        DB::table('templates')
            ->whereNull('normal_price')
            ->update([
                'normal_price' => DB::raw('price'),
                'included_features' => DB::raw('features'),
            ]);
    }

    public function down(): void
    {
        Schema::table('templates', function (Blueprint $table) {
            $table->dropColumn([
                'normal_price',
                'promo_price',
                'target_audience',
                'included_features',
            ]);
        });
    }
};
