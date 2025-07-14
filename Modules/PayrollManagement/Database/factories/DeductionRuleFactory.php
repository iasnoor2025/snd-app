<?php

namespace Modules\PayrollManagement\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Modules\PayrollManagement\Models\DeductionRule;

class DeductionRuleFactory extends Factory
{
    protected $model = DeductionRule::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->words(2, true),
            'description' => $this->faker->sentence(),
            'type' => $this->faker->randomElement(['fixed', 'percentage', 'custom']),
            'calculation_method' => $this->faker->randomElement(['manual', 'automatic']),
            'amount' => $this->faker->randomFloat(2, 10, 1000),
            'percentage' => $this->faker->randomFloat(2, 1, 100),
            'frequency' => $this->faker->randomElement(['monthly', 'yearly', 'one-time']),
            'effective_from' => $this->faker->dateTimeBetween('-1 year', 'now'),
            'effective_until' => null,
            'requires_approval' => $this->faker->boolean(),
            'auto_apply' => $this->faker->boolean(),
            'employee_category' => $this->faker->randomElement(['staff', 'manager', 'executive']),
            'status' => $this->faker->randomElement(['draft', 'active', 'inactive']),
            'base_amount_type' => $this->faker->randomElement(['gross', 'net']),
            'metadata' => json_encode(['note' => $this->faker->sentence()]),
            'created_by' => null,
            'updated_by' => null,
        ];
    }
}
