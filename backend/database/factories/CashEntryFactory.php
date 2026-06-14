<?php

namespace Database\Factories;

use App\Enums\CashEntryType;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CashEntryFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id'    => User::factory(),
            'type'       => $this->faker->randomElement(CashEntryType::cases())->value,
            'amount'     => $this->faker->numberBetween(1000, 200000),
            'label'      => $this->faker->sentence(3),
            'entry_date' => $this->faker->dateTimeBetween('first day of this month', 'last day of this month')->format('Y-m-d'),
            'notes'      => null,
        ];
    }
}
