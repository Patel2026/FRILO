<?php

namespace App\Models;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'template_id',
        'status',
        'payment_status',
        'price',
        'paid_at',
        'preview_url',
        'client_feedback',
        'feedback_submitted_at',
        'site_url',
        'domain',
        'hosting_expires_at',
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
    ];

    protected $attributes = [
        'material_activity_received' => false,
        'material_logo_received' => false,
        'material_photos_received' => false,
        'material_texts_received' => false,
        'material_contacts_received' => false,
        'material_colors_received' => false,
        'production_template_adapted' => false,
        'production_content_integrated' => false,
        'production_preview_prepared' => false,
        'production_feedback_received' => false,
        'production_corrections_completed' => false,
        'quality_mobile_checked' => false,
        'quality_form_checked' => false,
        'quality_links_checked' => false,
        'quality_spelling_checked' => false,
        'quality_business_info_checked' => false,
        'quality_final_preview_validated' => false,
        'delivery_ssl_checked' => false,
        'delivery_form_checked' => false,
        'delivery_mobile_checked' => false,
        'client_reminder_count' => 0,
    ];

    protected $casts = [
        'status' => OrderStatus::class,
        'payment_status' => PaymentStatus::class,
        'price' => 'integer',
        'paid_at' => 'datetime',
        'feedback_submitted_at' => 'datetime',
        'hosting_expires_at' => 'date',
        'production_assigned_at' => 'datetime',
        'material_activity_received' => 'boolean',
        'material_logo_received' => 'boolean',
        'material_photos_received' => 'boolean',
        'material_texts_received' => 'boolean',
        'material_contacts_received' => 'boolean',
        'material_colors_received' => 'boolean',
        'production_template_adapted' => 'boolean',
        'production_content_integrated' => 'boolean',
        'production_preview_prepared' => 'boolean',
        'production_preview_sent_at' => 'datetime',
        'production_feedback_received' => 'boolean',
        'production_corrections_completed' => 'boolean',
        'quality_mobile_checked' => 'boolean',
        'quality_form_checked' => 'boolean',
        'quality_links_checked' => 'boolean',
        'quality_spelling_checked' => 'boolean',
        'quality_business_info_checked' => 'boolean',
        'quality_final_preview_validated' => 'boolean',
        'delivery_ssl_checked' => 'boolean',
        'delivery_form_checked' => 'boolean',
        'delivery_mobile_checked' => 'boolean',
        'last_client_reminder_at' => 'datetime',
        'client_reminder_count' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(Template::class)->withTrashed();
    }

    public function instruction(): HasOne
    {
        return $this->hasOne(OrderInstruction::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(PaymentTransaction::class);
    }

    public function options(): BelongsToMany
    {
        return $this->belongsToMany(OrderOption::class, 'order_order_option')
            ->withPivot(['name_snapshot', 'price_snapshot'])
            ->withTimestamps();
    }

    public function optionSelections(): HasMany
    {
        return $this->hasMany(OrderOptionSelection::class);
    }

    public function latestPayment(): HasOne
    {
        return $this->hasOne(PaymentTransaction::class)->latestOfMany();
    }

    public function templateReview(): HasOne
    {
        return $this->hasOne(TemplateReview::class);
    }

    public function productionCompletenessLabel(): string
    {
        return $this->hasCompleteClientMaterial() ? 'Complet' : 'A completer';
    }

    public function hasCompleteClientMaterial(): bool
    {
        return $this->material_activity_received
            && $this->material_logo_received
            && $this->material_photos_received
            && $this->material_texts_received
            && $this->material_contacts_received
            && $this->material_colors_received;
    }

    public function missingQualityChecks(): array
    {
        $checks = [
            'quality_mobile_checked' => 'Mobile responsive',
            'quality_form_checked' => 'Formulaire de contact',
            'quality_links_checked' => 'Liens importants',
            'quality_spelling_checked' => 'Orthographe',
            'quality_business_info_checked' => 'Informations client',
            'quality_final_preview_validated' => 'Preview finale',
        ];

        return collect($checks)
            ->filter(fn (string $label, string $field) => ! $this->{$field})
            ->values()
            ->all();
    }

    public function productionSlaLabel(): string
    {
        if ($this->status === \App\Enums\OrderStatus::Completed) {
            return 'Livre';
        }

        if ($this->status === \App\Enums\OrderStatus::Cancelled) {
            return 'Annule';
        }

        $hours = $this->created_at?->diffInHours(now()) ?? 0;

        if ($hours >= 48) {
            return 'En retard';
        }

        if ($hours >= 36) {
            return 'Attention';
        }

        return 'Dans les temps';
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }
}
