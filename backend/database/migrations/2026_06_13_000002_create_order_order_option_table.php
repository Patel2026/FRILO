<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_order_option', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('order_option_id')->nullable()->constrained('order_options')->nullOnDelete();
            $table->string('name_snapshot');
            $table->unsignedInteger('price_snapshot');
            $table->timestamps();

            $table->unique(['order_id', 'order_option_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_order_option');
    }
};
