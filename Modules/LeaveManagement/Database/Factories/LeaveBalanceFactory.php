<?php

namespace Modules\LeaveManagement\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Modules\LeaveManagement\Domain\Models\LeaveBalance;
use Modules\LeaveManagement\Domain\Models\LeaveType;
use Modules\Employee\Domain\Models\Employee;

class LeaveBalanceFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = LeaveBalance::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        $allocatedDays = $this->faker->numberBetween(10, 30);
        $usedDays = $this->faker->numberBetween(0, $allocatedDays);
        $remainingDays = $allocatedDays - $usedDays;

        return [
            'employee_id' => Employee::factory(),
            'leave_type_id' => LeaveType::factory(),
            'year' => $this->faker->numberBetween(date('Y') - 1, date('Y') + 1),
            'allocated_days' => $allocatedDays,
            'used_days' => $usedDays,
            'remaining_days' => $remainingDays,
            'carried_forward_days' => $this->faker->numberBetween(0, 5),
        ];
    }

    /**
     * Indicate that the leave balance is for the current year.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function currentYear()
    {
        return $this->state(function (array $attributes) {
            return [
                'year' => date('Y'),
            ];
        });
    }

    /**
     * Indicate that the leave balance is fully used.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function fullyUsed()
    {
        return $this->state(function (array $attributes) {
            $allocatedDays = $attributes['allocated_days'] ?? 20;

            return [
                'used_days' => $allocatedDays,
                'remaining_days' => 0,
            ];
        });
    }

    /**
     * Indicate that the leave balance is unused.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function unused()
    {
        return $this->state(function (array $attributes) {
            $allocatedDays = $attributes['allocated_days'] ?? 20;

            return [
                'used_days' => 0,
                'remaining_days' => $allocatedDays,
            ];
        });
    }

    /**
     * Indicate that the leave balance has carried forward days.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function withCarryForward()
    {
        return $this->state(function (array $attributes) {
            $carriedForwardDays = $this->faker->numberBetween(1, 10);
            $allocatedDays = ($attributes['allocated_days'] ?? 20) + $carriedForwardDays;
            $usedDays = $this->faker->numberBetween(0, $allocatedDays);

            return [
                'allocated_days' => $allocatedDays,
                'used_days' => $usedDays,
                'remaining_days' => $allocatedDays - $usedDays,
                'carried_forward_days' => $carriedForwardDays,
            ];
        });
    }

    /**
     * Indicate that the leave balance is for a specific employee and leave type.
     *
     * @param int $employeeId
     * @param int $leaveTypeId
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function forEmployeeAndType($employeeId, $leaveTypeId)
    {
        return $this->state(function (array $attributes) use ($employeeId, $leaveTypeId) {
            return [
                'employee_id' => $employeeId,
                'leave_type_id' => $leaveTypeId,
            ];
        });
    }
}
