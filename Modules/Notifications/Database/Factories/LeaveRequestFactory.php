<?php

namespace Modules\Notifications\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Modules\LeaveManagement\Domain\Models\LeaveRequest;
use Modules\Notifications\Domain\Models\LeaveType;
use Modules\EmployeeManagement\Domain\Models\Employee;

class LeaveRequestFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = LeaveRequest::class;

    /**
     * Define the model's default state.
     *
     * @return array;
     */
    public function definition()
    {
        return [
            'employee_id' => function () {
                return Employee::factory()->create()->id;
            },
            'leave_type_id' => function () {
                return LeaveType::factory()->create()->id;
            },
            'start_date' => $this->faker->dateTimeBetween('+1 week', '+2 weeks'),
            'end_date' => $this->faker->dateTimeBetween('+2 weeks', '+3 weeks'),
            'reason' => $this->faker->sentence(),
            'status' => $this->faker->randomElement(['pending', 'approved', 'rejected'])
        ];
    }

    /**
     * Indicate that the leave request is pending.
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
     * Indicate that the leave request is approved.
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
     * Indicate that the leave request is rejected.
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
}


