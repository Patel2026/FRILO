<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('fedapay_customer_id')->nullable()->after('avatar');
            $table->index('fedapay_customer_id');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['fedapay_customer_id']);
            $table->dropColumn('fedapay_customer_id');
        });
    }
};
