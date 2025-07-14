<?php

namespace Modules\PayrollManagement\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Modules\PayrollManagement\Models\TaxDeduction;

class TaxDeductionFactory extends Factory
{
    protected $model = TaxDeduction::class;

    public function definition(): array
    {
        return [
            'payroll_id' => 1, // Should be set in the seeder for real relationships
            'name' => $this->faker->word(),
            'description' => $this->faker->sentence(),
            'amount' => $this->faker->randomFloat(2, 5, 500),
            'type' => $this->faker->randomElement(['income_tax', 'social_security', 'other']),
            'status' => 'pending',
            'approved_by' => null,
            'approved_at' => null,
            'documentation' => null,
            'metadata' => null,
        ];
    }
}
