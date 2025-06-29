<?php

namespace Modules\CustomerManagement\Database\factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Modules\CustomerManagement\Domain\Models\Customer;

class CustomerFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     */
    protected $model = Customer::class;

    /**
     * Define the model's default state.
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->name,
            'email' => $this->faker->unique()->safeEmail,
            'phone' => $this->faker->phoneNumber,
            // Add other fields as needed for your Customer model
        ];
    }
}

