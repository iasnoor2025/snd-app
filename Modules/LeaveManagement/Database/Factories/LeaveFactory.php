<?php

namespace Modules\LeaveManagement\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Modules\LeaveManagement\Domain\Models\Leave;
use Modules\LeaveManagement\Domain\Models\LeaveType;
use Modules\Employee\Domain\Models\Employee;
use Modules\Core\Domain\Models\User;
use Carbon\Carbon;

class LeaveFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Leave::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        $startDate = $this->faker->dateTimeBetween('now', '+3 months');
        $endDate = $this->faker->dateTimeBetween($startDate, $startDate->format('Y-m-d') . ' +2 weeks');

        return [
            'employee_id' => Employee::factory(),
            'leave_type_id' => LeaveType::factory(),
            'start_date' => $startDate,
            'end_date' => $endDate,
            'reason' => $this->faker->sentence(),
            'status' => $this->faker->randomElement(['pending', 'approved', 'rejected']),
            'half_day' => $this->faker->boolean(20), // 20% chance of being half day
            'emergency' => $this->faker->boolean(10), // 10% chance of being emergency
            'attachment' => $this->faker->optional()->filePath(),
            'applied_at' => $this->faker->dateTimeBetween('-1 month', 'now'),
        ];
    }

    /**
     * Indicate that the leave is pending.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function pending()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'pending',
                'approved_at' => null,
                'approved_by' => null,
                'rejected_at' => null,
                'rejected_by' => null,
                'rejection_reason' => null,
            ];
        });
    }

    /**
     * Indicate that the leave is approved.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function approved()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'approved',
                'approved_at' => $this->faker->dateTimeBetween($attributes['applied_at'] ?? '-1 week', 'now'),
                'approved_by' => User::factory(),
                'rejected_at' => null,
                'rejected_by' => null,
                'rejection_reason' => null,
            ];
        });
    }

    /**
     * Indicate that the leave is rejected.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function rejected()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'rejected',
                'approved_at' => null,
                'approved_by' => null,
                'rejected_at' => $this->faker->dateTimeBetween($attributes['applied_at'] ?? '-1 week', 'now'),
                'rejected_by' => User::factory(),
                'rejection_reason' => $this->faker->sentence(),
            ];
        });
    }

    /**
     * Indicate that the leave is a half day.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function halfDay()
    {
        return $this->state(function (array $attributes) {
            return [
                'half_day' => true,
                'start_date' => $this->faker->dateTimeBetween('now', '+1 month'),
                'end_date' => $attributes['start_date'] ?? $this->faker->dateTimeBetween('now', '+1 month'),
            ];
        });
    }

    /**
     * Indicate that the leave is an emergency.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function emergency()
    {
        return $this->state(function (array $attributes) {
            return [
                'emergency' => true,
                'reason' => 'Emergency: ' . $this->faker->sentence(),
            ];
        });
    }

    /**
     * Indicate that the leave is in the past.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function past()
    {
        return $this->state(function (array $attributes) {
            $startDate = $this->faker->dateTimeBetween('-3 months', '-1 week');
            $endDate = $this->faker->dateTimeBetween($startDate, $startDate->format('Y-m-d') . ' +1 week');

            return [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'applied_at' => $this->faker->dateTimeBetween('-4 months', $startDate),
            ];
        });
    }
}
