<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('contact_requests', function (Blueprint $table) {
            $table->string('order_reference', 32)->nullable()->after('company');
            $table->index('order_reference');
        });
    }

    public function down(): void
    {
        Schema::table('contact_requests', function (Blueprint $table) {
            $table->dropIndex(['order_reference']);
            $table->dropColumn('order_reference');
        });
    }
};
