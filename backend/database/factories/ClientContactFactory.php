<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ClientContactFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id'     => User::factory(),
            'name'        => $this->faker->name(),
            'company'     => $this->faker->optional()->company(),
            'phone'       => $this->faker->optional()->phoneNumber(),
            'whatsapp'    => null,
            'email'       => $this->faker->optional()->safeEmail(),
            'notes'       => null,
            'acquired_at' => $this->faker->optional()->date(),
        ];
    }
}
