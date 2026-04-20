<?php

namespace App\Providers;

use App\Models\ContactRequest;
use App\Models\FaqItem;
use App\Models\Order;
use App\Models\PaymentTransaction;
use App\Models\PlatformSettingRevision;
use App\Models\Sector;
use App\Models\Template;
use App\Models\TemplateReview;
use App\Models\User;
use App\Policies\ContactRequestPolicy;
use App\Policies\FaqItemPolicy;
use App\Policies\NotificationPolicy;
use App\Policies\OrderPolicy;
use App\Policies\PaymentPolicy;
use App\Policies\PlatformSettingPolicy;
use App\Policies\SectorPolicy;
use App\Policies\TemplatePolicy;
use App\Policies\TemplateReviewPolicy;
use App\Policies\UserPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Notifications\DatabaseNotification;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        ContactRequest::class          => ContactRequestPolicy::class,
        FaqItem::class                 => FaqItemPolicy::class,
        Order::class                   => OrderPolicy::class,
        PaymentTransaction::class      => PaymentPolicy::class,
        PlatformSettingRevision::class => PlatformSettingPolicy::class,
        Sector::class                  => SectorPolicy::class,
        Template::class                => TemplatePolicy::class,
        TemplateReview::class          => TemplateReviewPolicy::class,
        User::class                    => UserPolicy::class,
        DatabaseNotification::class    => NotificationPolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();
    }
}
