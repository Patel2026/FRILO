<?php

namespace Database\Factories;

use App\Models\PublicPage;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class PublicSectionFactory extends Factory
{
    public function definition(): array
    {
        $name = ucfirst($this->faker->unique()->words(2, true));

        return [
            'public_page_id' => PublicPage::factory(),
            'key' => Str::slug($name).'-'.$this->faker->unique()->numberBetween(1, 100000),
            'name' => $name,
            'position' => $this->faker->numberBetween(0, 100),
            'is_visible' => true,
            'content' => [
                'title' => $this->faker->sentence(5),
                'body' => $this->faker->paragraph(),
            ],
        ];
    }
}
