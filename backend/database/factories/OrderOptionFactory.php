<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class OrderOptionFactory extends Factory
{
    public function definition(): array
    {
        $name = $this->faker->unique()->words(3, true);

        return [
            'name' => ucfirst($name),
            'slug' => Str::slug($name).'-'.$this->faker->uuid(),
            'description' => $this->faker->optional()->sentence(),
            'persona_hint' => $this->faker->optional()->words(3, true),
            'price' => $this->faker->numberBetween(5000, 50000),
            'is_active' => true,
            'sort_order' => $this->faker->numberBetween(0, 100),
        ];
    }
}
