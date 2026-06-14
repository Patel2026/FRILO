<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('preview_url', 500)->nullable()->after('price');
            $table->text('client_feedback')->nullable()->after('preview_url');
            $table->timestamp('feedback_submitted_at')->nullable()->after('client_feedback');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['preview_url', 'client_feedback', 'feedback_submitted_at']);
        });
    }
};
