<?php

namespace App\Providers;

use App\Models\CashEntry;
use App\Models\ClientContact;
use App\Models\ContactRequest;
use App\Models\ContentBlock;
use App\Models\ContentRevision;
use App\Models\Deadline;
use App\Models\FaqItem;
use App\Models\Order;
use App\Models\PaymentTransaction;
use App\Models\PlatformSettingRevision;
use App\Models\PublicPage;
use App\Models\PublicSection;
use App\Models\Sector;
use App\Models\Template;
use App\Models\TemplateReview;
use App\Models\User;
use App\Policies\CashEntryPolicy;
use App\Policies\ClientContactPolicy;
use App\Policies\ContentBlockPolicy;
use App\Policies\ContentRevisionPolicy;
use App\Policies\ContactRequestPolicy;
use App\Policies\DeadlinePolicy;
use App\Policies\FaqItemPolicy;
use App\Policies\NotificationPolicy;
use App\Policies\OrderPolicy;
use App\Policies\PaymentPolicy;
use App\Policies\PlatformSettingPolicy;
use App\Policies\PublicPagePolicy;
use App\Policies\PublicSectionPolicy;
use App\Policies\SectorPolicy;
use App\Policies\TemplatePolicy;
use App\Policies\TemplateReviewPolicy;
use App\Policies\UserPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Notifications\DatabaseNotification;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        CashEntry::class               => CashEntryPolicy::class,
        ClientContact::class           => ClientContactPolicy::class,
        ContactRequest::class          => ContactRequestPolicy::class,
        ContentBlock::class            => ContentBlockPolicy::class,
        ContentRevision::class         => ContentRevisionPolicy::class,
        Deadline::class                => DeadlinePolicy::class,
        FaqItem::class                 => FaqItemPolicy::class,
        Order::class                   => OrderPolicy::class,
        PaymentTransaction::class      => PaymentPolicy::class,
        PlatformSettingRevision::class => PlatformSettingPolicy::class,
        PublicPage::class              => PublicPagePolicy::class,
        PublicSection::class           => PublicSectionPolicy::class,
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
