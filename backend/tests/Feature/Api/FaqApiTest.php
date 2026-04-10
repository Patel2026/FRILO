<?php

namespace Tests\Feature\Api;

use App\Models\FaqItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FaqApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_faq_endpoint_returns_only_published_items_sorted_by_order(): void
    {
        FaqItem::create([
            'question' => 'Question masquee',
            'answer' => 'Cette reponse ne doit jamais apparaitre publiquement.',
            'sort_order' => 5,
            'is_published' => false,
        ]);

        FaqItem::create([
            'question' => 'Question B',
            'answer' => 'Reponse B visible publiquement.',
            'sort_order' => 20,
            'is_published' => true,
        ]);

        FaqItem::create([
            'question' => 'Question A',
            'answer' => 'Reponse A visible publiquement.',
            'sort_order' => 10,
            'is_published' => true,
        ]);

        $response = $this->getJson('/api/faqs');

        $response
            ->assertOk()
            ->assertJsonCount(2)
            ->assertJsonPath('0.question', 'Question A')
            ->assertJsonPath('1.question', 'Question B');
    }

    public function test_public_faq_endpoint_honors_limit_parameter(): void
    {
        foreach ([10, 20, 30] as $index => $sortOrder) {
            FaqItem::create([
                'question' => 'Question limite '.($index + 1),
                'answer' => 'Reponse limite '.($index + 1),
                'sort_order' => $sortOrder,
                'is_published' => true,
            ]);
        }

        $this->getJson('/api/faqs?limit=2')
            ->assertOk()
            ->assertJsonCount(2)
            ->assertJsonPath('0.question', 'Question limite 1')
            ->assertJsonPath('1.question', 'Question limite 2');
    }
}
