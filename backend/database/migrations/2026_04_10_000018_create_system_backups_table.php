<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('system_backups', function (Blueprint $table) {
            $table->id();
            $table->string('filename');
            $table->string('storage_path');
            $table->string('database_driver', 20);
            $table->unsignedBigInteger('file_size_bytes')->default(0);
            $table->unsignedInteger('tables_count')->default(0);
            $table->unsignedBigInteger('rows_count')->default(0);
            $table->string('status', 20)->default('ready')->index();
            $table->text('note')->nullable();
            $table->json('meta')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('last_restored_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('last_restored_at')->nullable();
            $table->unsignedInteger('restore_count')->default(0);
            $table->timestamps();

            $table->index(['created_at', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('system_backups');
    }
};
