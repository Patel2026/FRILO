<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('templates', function (Blueprint $table) {
            $table->json('color_palettes')->nullable()->after('preview_gallery');
            $table->json('font_pairings')->nullable()->after('color_palettes');
            $table->string('default_color_palette', 80)->nullable()->after('font_pairings');
            $table->string('default_font_pairing', 80)->nullable()->after('default_color_palette');
        });
    }

    public function down(): void
    {
        Schema::table('templates', function (Blueprint $table) {
            $table->dropColumn([
                'color_palettes',
                'font_pairings',
                'default_color_palette',
                'default_font_pairing',
            ]);
        });
    }
};
