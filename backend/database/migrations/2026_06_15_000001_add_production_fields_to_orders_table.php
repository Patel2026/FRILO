<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('production_owner_name')->nullable()->after('hosting_expires_at');
            $table->dateTime('production_assigned_at')->nullable()->after('production_owner_name');

            $table->boolean('material_activity_received')->default(false)->after('production_assigned_at');
            $table->boolean('material_logo_received')->default(false)->after('material_activity_received');
            $table->boolean('material_photos_received')->default(false)->after('material_logo_received');
            $table->boolean('material_texts_received')->default(false)->after('material_photos_received');
            $table->boolean('material_contacts_received')->default(false)->after('material_texts_received');
            $table->boolean('material_colors_received')->default(false)->after('material_contacts_received');
            $table->text('material_missing_note')->nullable()->after('material_colors_received');

            $table->boolean('production_template_adapted')->default(false)->after('material_missing_note');
            $table->boolean('production_content_integrated')->default(false)->after('production_template_adapted');
            $table->boolean('production_preview_prepared')->default(false)->after('production_content_integrated');
            $table->dateTime('production_preview_sent_at')->nullable()->after('production_preview_prepared');
            $table->boolean('production_feedback_received')->default(false)->after('production_preview_sent_at');
            $table->boolean('production_corrections_completed')->default(false)->after('production_feedback_received');

            $table->boolean('quality_mobile_checked')->default(false)->after('production_corrections_completed');
            $table->boolean('quality_form_checked')->default(false)->after('quality_mobile_checked');
            $table->boolean('quality_links_checked')->default(false)->after('quality_form_checked');
            $table->boolean('quality_spelling_checked')->default(false)->after('quality_links_checked');
            $table->boolean('quality_business_info_checked')->default(false)->after('quality_spelling_checked');
            $table->boolean('quality_final_preview_validated')->default(false)->after('quality_business_info_checked');

            $table->boolean('delivery_ssl_checked')->default(false)->after('quality_final_preview_validated');
            $table->boolean('delivery_form_checked')->default(false)->after('delivery_ssl_checked');
            $table->boolean('delivery_mobile_checked')->default(false)->after('delivery_form_checked');
            $table->text('delivery_note')->nullable()->after('delivery_mobile_checked');

            $table->dateTime('last_client_reminder_at')->nullable()->after('delivery_note');
            $table->unsignedInteger('client_reminder_count')->default(0)->after('last_client_reminder_at');
            $table->string('last_client_reminder_reason')->nullable()->after('client_reminder_count');
            $table->text('internal_follow_up_note')->nullable()->after('last_client_reminder_reason');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'production_owner_name',
                'production_assigned_at',
                'material_activity_received',
                'material_logo_received',
                'material_photos_received',
                'material_texts_received',
                'material_contacts_received',
                'material_colors_received',
                'material_missing_note',
                'production_template_adapted',
                'production_content_integrated',
                'production_preview_prepared',
                'production_preview_sent_at',
                'production_feedback_received',
                'production_corrections_completed',
                'quality_mobile_checked',
                'quality_form_checked',
                'quality_links_checked',
                'quality_spelling_checked',
                'quality_business_info_checked',
                'quality_final_preview_validated',
                'delivery_ssl_checked',
                'delivery_form_checked',
                'delivery_mobile_checked',
                'delivery_note',
                'last_client_reminder_at',
                'client_reminder_count',
                'last_client_reminder_reason',
                'internal_follow_up_note',
            ]);
        });
    }
};
