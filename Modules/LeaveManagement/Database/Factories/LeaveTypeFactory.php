<?php

namespace Modules\LeaveManagement\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Modules\LeaveManagement\Domain\Models\LeaveType;

class LeaveTypeFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = LeaveType::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'name' => $this->faker->randomElement(['Annual Leave', 'Sick Leave', 'Maternity Leave', 'Paternity Leave', 'Emergency Leave']),
            'description' => $this->faker->sentence(),
            'max_days' => $this->faker->numberBetween(5, 30),
            'requires_approval' => $this->faker->boolean(80), // 80% chance of requiring approval
            'is_paid' => $this->faker->boolean(70), // 70% chance of being paid
            'is_active' => $this->faker->boolean(90), // 90% chance of being active
            'allow_carry_forward' => $this->faker->boolean(30), // 30% chance of allowing carry forward
            'carry_forward_max_days' => $this->faker->numberBetween(0, 10),
            'notice_days' => $this->faker->numberBetween(1, 30),
            'gender_specific' => $this->faker->randomElement([null, 'male', 'female']),
            'applicable_after_months' => $this->faker->numberBetween(0, 12),
            'color' => $this->faker->hexColor(),
        ];
    }

    /**
     * Indicate that the leave type requires approval.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function requiresApproval()
    {
        return $this->state(function (array $attributes) {
            return [
                'requires_approval' => true,
            ];
        });
    }

    /**
     * Indicate that the leave type is paid.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function paid()
    {
        return $this->state(function (array $attributes) {
            return [
                'is_paid' => true,
            ];
        });
    }

    /**
     * Indicate that the leave type is inactive.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function inactive()
    {
        return $this->state(function (array $attributes) {
            return [
                'is_active' => false,
            ];
        });
    }

    /**
     * Indicate that the leave type allows carry forward.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function allowCarryForward()
    {
        return $this->state(function (array $attributes) {
            return [
                'allow_carry_forward' => true,
                'carry_forward_max_days' => $this->faker->numberBetween(5, 15),
            ];
        });
    }
}
