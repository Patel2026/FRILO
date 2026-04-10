<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'mailgun' => [
        'domain' => env('MAILGUN_DOMAIN'),
        'secret' => env('MAILGUN_SECRET'),
        'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
    ],

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'fedapay' => [
        'secret_key' => env('FEDAPAY_SECRET_KEY'),
        'base_url' => env('FEDAPAY_BASE_URL', env('FEDAPAY_ENVIRONMENT', 'sandbox') === 'live'
            ? 'https://api.fedapay.com/v1'
            : 'https://sandbox-api.fedapay.com/v1'),
        'currency' => env('FEDAPAY_CURRENCY', 'XOF'),
        'callback_url' => env('FEDAPAY_CALLBACK_URL'),
        'webhook_secret' => env('FEDAPAY_WEBHOOK_SECRET'),
        'webhook_tolerance' => (int) env('FEDAPAY_WEBHOOK_TOLERANCE', 300),
    ],

];
