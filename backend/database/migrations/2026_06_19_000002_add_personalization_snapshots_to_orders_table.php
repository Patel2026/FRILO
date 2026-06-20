<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->json('selected_color_palette')->nullable()->after('price');
            $table->json('selected_font_pairing')->nullable()->after('selected_color_palette');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'selected_color_palette',
                'selected_font_pairing',
            ]);
        });
    }
};
