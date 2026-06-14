<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class PublicPageFactory extends Factory
{
    public function definition(): array
    {
        $name = ucfirst($this->faker->unique()->words(3, true));
        $key = Str::slug($name).'-'.$this->faker->unique()->numberBetween(1, 100000);

        return [
            'key' => $key,
            'route_pattern' => '/'.Str::slug($name),
            'name' => $name,
            'seo_title' => $this->faker->optional()->sentence(6),
            'seo_description' => $this->faker->optional()->sentence(14),
            'is_indexable' => true,
        ];
    }
}
