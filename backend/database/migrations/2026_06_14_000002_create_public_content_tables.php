<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('public_pages', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->string('route_pattern');
            $table->string('name');
            $table->string('seo_title')->nullable();
            $table->text('seo_description')->nullable();
            $table->boolean('is_indexable')->default(true);
            $table->timestamps();
        });

        Schema::create('public_sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('public_page_id')->constrained()->cascadeOnDelete();
            $table->string('key')->unique();
            $table->string('name');
            $table->unsignedInteger('position');
            $table->boolean('is_visible')->default(true);
            $table->json('content');
            $table->timestamps();
        });

        Schema::create('content_blocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('public_page_id')->constrained()->cascadeOnDelete();
            $table->string('anchor_section_key')->nullable();
            $table->unsignedInteger('position');
            $table->enum('layout', ['full_width', 'two_columns', 'media_text']);
            $table->json('content');
            $table->json('settings')->nullable();
            $table->boolean('is_visible')->default(true);
            $table->timestamps();
        });

        Schema::create('content_revisions', function (Blueprint $table) {
            $table->id();
            $table->morphs('revisionable');
            $table->string('event');
            $table->json('snapshot');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('content_revisions');
        Schema::dropIfExists('content_blocks');
        Schema::dropIfExists('public_sections');
        Schema::dropIfExists('public_pages');
    }
};
