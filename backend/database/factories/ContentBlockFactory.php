<?php

namespace Database\Factories;

use App\Models\ContentBlock;
use App\Models\PublicPage;
use Illuminate\Database\Eloquent\Factories\Factory;

class ContentBlockFactory extends Factory
{
    public function definition(): array
    {
        return [
            'public_page_id' => PublicPage::factory(),
            'anchor_section_key' => null,
            'position' => $this->faker->numberBetween(0, 100),
            'layout' => $this->faker->randomElement(ContentBlock::LAYOUTS),
            'content' => [
                'heading' => $this->faker->sentence(5),
                'body' => $this->faker->paragraph(),
            ],
            'settings' => [
                'theme' => $this->faker->randomElement(['light', 'dark']),
            ],
            'is_visible' => true,
        ];
    }
}
