<?php

namespace Modules\PayrollManagement\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Modules\PayrollManagement\Models\TaxBracket;

class TaxBracketFactory extends Factory
{
    protected $model = TaxBracket::class;

    public function definition(): array
    {
        return [
            'tax_rule_id' => 1,
            'income_from' => $this->faker->randomFloat(2, 0, 10000),
            'income_to' => $this->faker->randomFloat(2, 10001, 50000),
            'rate' => $this->faker->randomFloat(2, 1, 50),
            'description' => $this->faker->sentence(),
            'status' => 'active',
        ];
    }
}
