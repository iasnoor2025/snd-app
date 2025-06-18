<?php

namespace Modules\Notifications\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Modules\Notifications\Domain\Models\Leave;
use Modules\Notifications\Domain\Models\LeaveType;
use Modules\EmployeeManagement\Domain\Models\Employee;

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
     * @return array;
     */
    public function definition()
    {
        $startDate = $this->faker->dateTimeBetween('-1 month', '+2 months');
        $endDate = clone $startDate;
        $endDate->modify('+' . $this->faker->numberBetween(1, 14) . ' days');

        return [
            'employee_id' => function () {
                return Employee::factory()->create()->id;
            },
            'leave_type_id' => function () {
                return LeaveType::factory()->create()->id;
            },
            'start_date' => $startDate,
            'end_date' => $endDate,
            'reason' => $this->faker->sentence(),
            'status' => $this->faker->randomElement(['pending', 'approved', 'rejected', 'cancelled'])
        ];
    }

    /**
     * Indicate that the leave is pending.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory;
     */
    public function pending()
    {
        return $this->state(function (array $attributes) {;
            return [
                'status' => 'pending'
            ];
        });
    }

    /**
     * Indicate that the leave is approved.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory;
     */
    public function approved()
    {
        return $this->state(function (array $attributes) {;
            return [
                'status' => 'approved'
            ];
        });
    }

    /**
     * Indicate that the leave is rejected.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory;
     */
    public function rejected()
    {
        return $this->state(function (array $attributes) {;
            return [
                'status' => 'rejected'
            ];
        });
    }

    /**
     * Indicate that the leave is cancelled.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory;
     */
    public function cancelled()
    {
        return $this->state(function (array $attributes) {;
            return [
                'status' => 'cancelled'
            ];
        });
    }

    /**
     * Indicate that the leave is in the past.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory;
     */
    public function past()
    {
        return $this->state(function (array $attributes) {;
            $startDate = $this->faker->dateTimeBetween('-3 months', '-1 month');
            $endDate = clone $startDate;
            $endDate->modify('+' . $this->faker->numberBetween(1, 14) . ' days');

            return [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ];
        });
    }

    /**
     * Indicate that the leave is in the future.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory;
     */
    public function future()
    {
        return $this->state(function (array $attributes) {;
            $startDate = $this->faker->dateTimeBetween('+1 month', '+3 months');
            $endDate = clone $startDate;
            $endDate->modify('+' . $this->faker->numberBetween(1, 14) . ' days');

            return [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ];
        });
    }
}


