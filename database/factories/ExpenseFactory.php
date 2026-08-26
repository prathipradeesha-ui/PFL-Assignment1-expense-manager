<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class ExpenseFactory extends Factory
{
    public function definition(): array
    {
        return [
            'date' => $this->faker->dateTimeBetween('-3 months', 'now')->format('Y-m-d'),
            'cost_gbp' => $this->faker->randomFloat(2, 5, 500),
            'description' => $this->faker->sentence(4),
            'expense_type' => $this->faker->randomElement(['travel', 'food', 'other']),
        ];
    }
}
