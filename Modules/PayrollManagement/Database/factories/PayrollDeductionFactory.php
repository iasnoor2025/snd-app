<?php

namespace Modules\PayrollManagement\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Modules\PayrollManagement\Models\PayrollDeduction;

class PayrollDeductionFactory extends Factory
{
    protected $model = PayrollDeduction::class;

    public function definition(): array
    {
        return [
            'payroll_id' => 1, // Should be set in the seeder for real relationships
            'rule_id' => 1, // Should be set in the seeder for real relationships
            'amount' => $this->faker->randomFloat(2, 10, 1000),
            'status' => $this->faker->randomElement(['pending', 'approved', 'rejected']),
            'approved_by' => null,
            'approved_at' => null,
            'notes' => $this->faker->sentence(),
            'metadata' => json_encode(['note' => $this->faker->sentence()]),
            'created_by' => null,
            'updated_by' => null,
        ];
    }
}
