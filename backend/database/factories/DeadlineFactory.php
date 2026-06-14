<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class DeadlineFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id'     => null,
            'title'       => $this->faker->sentence(3),
            'description' => $this->faker->optional()->sentence(),
            'due_date'    => $this->faker->dateTimeBetween('now', '+6 months')->format('Y-m-d'),
            'is_system'   => false,
        ];
    }
}
