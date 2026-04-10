<?php

namespace App\Providers;

use App\Models\FaqItem;
use App\Models\Order;
use App\Models\TemplateReview;
use App\Policies\FaqItemPolicy;
use App\Policies\OrderPolicy;
use App\Policies\TemplateReviewPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        FaqItem::class => FaqItemPolicy::class,
        Order::class => OrderPolicy::class,
        TemplateReview::class => TemplateReviewPolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();
    }
}
