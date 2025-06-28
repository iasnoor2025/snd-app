<?php

namespace Modules\Payroll\Database\factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Modules\Payroll\Domain\Models\Payroll;

class PayrollFactory extends Factory
{
    protected $model = Payroll::class;

    public function definition(): array
    {
        return [
            'employee_id' => 1, // Should be set in the seeder for real relationships
            'month' => $this->faker->numberBetween(1, 12),
            'year' => $this->faker->year(),
            'base_salary' => $this->faker->randomFloat(2, 1000, 5000),
            'overtime_amount' => $this->faker->randomFloat(2, 0, 500),
            'bonus_amount' => $this->faker->randomFloat(2, 0, 1000),
            'deduction_amount' => $this->faker->randomFloat(2, 0, 500),
            'advance_deduction' => $this->faker->randomFloat(2, 0, 200),
            'final_amount' => $this->faker->randomFloat(2, 1000, 5000),
            'total_worked_hours' => $this->faker->numberBetween(120, 200),
            'overtime_hours' => $this->faker->numberBetween(0, 20),
            'status' => $this->faker->randomElement(['pending', 'approved', 'paid', 'cancelled', 'processed']),
            'notes' => $this->faker->sentence(),
            'approved_by' => null,
            'approved_at' => null,
            'paid_by' => null,
            'paid_at' => null,
            'payment_method' => $this->faker->randomElement(['bank', 'cash', 'cheque']),
            'payment_reference' => $this->faker->uuid(),
            'payment_status' => $this->faker->randomElement(['pending', 'completed', 'failed', 'cancelled']),
            'payment_processed_at' => null,
        ];
    }
} 