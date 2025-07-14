<?php

namespace Modules\PayrollManagement\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Modules\PayrollManagement\Models\TaxRule;

class TaxRuleFactory extends Factory
{
    protected $model = TaxRule::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->word(),
            'description' => $this->faker->sentence(),
            'calculation_method' => $this->faker->randomElement(['flat_rate', 'progressive', 'threshold_based']),
            'rate' => $this->faker->randomFloat(2, 1, 30),
            'employee_category' => $this->faker->randomElement(['staff', 'manager', 'executive']),
            'effective_from' => $this->faker->dateTimeBetween('-2 years', 'now'),
            'effective_until' => null,
            'status' => 'active',
            'metadata' => null,
        ];
    }
}
