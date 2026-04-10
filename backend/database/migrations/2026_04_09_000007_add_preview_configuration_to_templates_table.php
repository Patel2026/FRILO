<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('templates', function (Blueprint $table) {
            $table->json('preview_pages')->nullable()->after('preview_url');
            $table->json('preview_gallery')->nullable()->after('preview_pages');
        });
    }

    public function down(): void
    {
        Schema::table('templates', function (Blueprint $table) {
            $table->dropColumn(['preview_pages', 'preview_gallery']);
        });
    }
};
