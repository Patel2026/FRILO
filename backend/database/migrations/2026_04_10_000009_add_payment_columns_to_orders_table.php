<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('payment_status', 32)->default('awaiting_payment')->after('status');
            $table->timestamp('paid_at')->nullable()->after('price');

            $table->index(['payment_status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['payment_status', 'created_at']);
            $table->dropColumn(['payment_status', 'paid_at']);
        });
    }
};
