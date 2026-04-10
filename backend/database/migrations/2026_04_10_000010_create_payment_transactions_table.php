<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('provider', 32)->default('fedapay');
            $table->unsignedBigInteger('fedapay_transaction_id')->nullable();
            $table->string('fedapay_reference')->nullable();
            $table->string('payment_token')->nullable();
            $table->text('checkout_url')->nullable();
            $table->string('mode', 64)->nullable();
            $table->unsignedBigInteger('amount');
            $table->string('currency', 3)->default('XOF');
            $table->string('status', 64)->default('pending');
            $table->string('last_error_code')->nullable();
            $table->json('raw_payload')->nullable();
            $table->timestamp('initiated_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['order_id', 'created_at']);
            $table->index(['order_id', 'status']);
            $table->index('fedapay_transaction_id');
            $table->index('fedapay_reference');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_transactions');
    }
};
