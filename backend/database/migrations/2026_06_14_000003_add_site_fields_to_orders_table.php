<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('site_url')->nullable()->after('feedback_submitted_at');
            $table->string('domain')->nullable()->after('site_url');
            $table->date('hosting_expires_at')->nullable()->after('domain');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['site_url', 'domain', 'hosting_expires_at']);
        });
    }
};
