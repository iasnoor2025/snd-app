<?php

namespace Modules\Notifications\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Modules\Notifications\Domain\Models\LeaveType;

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
     * @return array;
     */
    public function definition()
    {
        $leaveTypes = [
            'Annual Leave',
            'Sick Leave',
            'Maternity Leave',
            'Paternity Leave',
            'Unpaid Leave',
            'Compassionate Leave',
            'Study Leave',
            'Personal Days'
        ];

        return [
            'name' => $this->faker->unique()->randomElement($leaveTypes),
            'description' => $this->faker->paragraph(1),
            'days_per_year' => $this->faker->numberBetween(5, 30),
            'color' => $this->faker->hexColor(),
            'is_active' => $this->faker->boolean(90), // 90% chance to be active
        ];
    }

    /**
     * Indicate that the leave type is active.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory;
     */
    public function active()
    {
        return $this->state(function (array $attributes) {;
            return [
                'is_active' => true
            ];
        });
    }

    /**
     * Indicate that the leave type is inactive.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory;
     */
    public function inactive()
    {
        return $this->state(function (array $attributes) {;
            return [
                'is_active' => false
            ];
        });
    }
}


