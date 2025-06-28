<?php

namespace Modules\PayrollManagement\database\factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Modules\PayrollManagement\Models\DeductionCondition;

class DeductionConditionFactory extends Factory
{
    protected $model = DeductionCondition::class;

    public function definition(): array
    {
        return [
            // 'deduction_rule_id' must be provided by the seeder
            'field' => $this->faker->randomElement(['salary', 'age', 'years_of_service']),
            'operator' => $this->faker->randomElement(['=', '>', '<', '>=', '<=', '!=']),
            'value' => json_encode([$this->faker->numberBetween(1, 10)]),
            'amount' => $this->faker->randomFloat(2, 10, 1000),
            'percentage' => $this->faker->randomFloat(2, 1, 100),
            'metadata' => json_encode(['note' => $this->faker->sentence()]),
            'created_by' => null,
            'updated_by' => null,
        ];
    }
} 