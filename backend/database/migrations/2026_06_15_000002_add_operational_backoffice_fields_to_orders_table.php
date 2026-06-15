<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table): void {
            $table->foreignId('client_manager_id')->nullable()->after('production_assigned_at')->constrained('users')->nullOnDelete();
            $table->foreignId('technician_id')->nullable()->after('client_manager_id')->constrained('users')->nullOnDelete();
            $table->foreignId('quality_validator_id')->nullable()->after('technician_id')->constrained('users')->nullOnDelete();
            $table->boolean('delivery_access_transferred')->default(false)->after('delivery_mobile_checked');
            $table->text('last_client_reminder_message')->nullable()->after('last_client_reminder_reason');
            $table->string('hosting_renewal_status', 32)->default('unpaid')->after('hosting_expires_at');
            $table->dateTime('hosting_renewal_paid_at')->nullable()->after('hosting_renewal_status');
            $table->dateTime('hosting_renewal_last_reminder_at')->nullable()->after('hosting_renewal_paid_at');
            $table->unsignedInteger('hosting_renewal_reminder_count')->default(0)->after('hosting_renewal_last_reminder_at');
            $table->text('hosting_renewal_note')->nullable()->after('hosting_renewal_reminder_count');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table): void {
            $table->dropForeign(['client_manager_id']);
            $table->dropForeign(['technician_id']);
            $table->dropForeign(['quality_validator_id']);
            $table->dropColumn([
                'client_manager_id',
                'technician_id',
                'quality_validator_id',
                'delivery_access_transferred',
                'last_client_reminder_message',
                'hosting_renewal_status',
                'hosting_renewal_paid_at',
                'hosting_renewal_last_reminder_at',
                'hosting_renewal_reminder_count',
                'hosting_renewal_note',
            ]);
        });
    }
};
