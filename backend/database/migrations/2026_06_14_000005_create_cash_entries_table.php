<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cash_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type', 20);
            $table->unsignedInteger('amount');
            $table->string('label', 200);
            $table->date('entry_date');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'entry_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cash_entries');
    }
};
