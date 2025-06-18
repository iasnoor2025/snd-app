<?php
namespace Modules\EmployeeManagement\database\factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Modules\EmployeeManagement\Domain\Models\Employee;

class EmployeeFactory extends Factory
{
    protected $model = Employee::class;

    public function definition(): array
    {
        return [
            'file_number' => 'EMP-' . str_pad($this->faker->unique()->numberBetween(1, 9999), 4, '0', STR_PAD_LEFT),
            'first_name' => $this->faker->firstName(),
            'middle_name' => $this->faker->optional()->firstName(),
            'last_name' => $this->faker->lastName(),
            'email' => $this->faker->unique()->safeEmail(),
            'phone' => $this->faker->phoneNumber(),
            'position_id' => 1,
            'department_id' => 1,
            'date_of_birth' => $this->faker->date(),
            'iqama_number' => $this->faker->unique()->numerify('##########'),
            'passport_number' => $this->faker->unique()->bothify('??#######'),
            'driving_license_number' => $this->faker->optional()->bothify('??#######'),
            'tuv_certification_number' => $this->faker->optional()->bothify('??#######'),
            'custom_certifications' => $this->faker->optional()->randomElements([
                ['name' => 'Safety Training', 'number' => $this->faker->bothify('ST#######')],
                ['name' => 'First Aid', 'number' => $this->faker->bothify('FA#######')],
                ['name' => 'Heavy Equipment', 'number' => $this->faker->bothify('HE#######')]
            ], $this->faker->numberBetween(0, 3)),
            'emergency_contact_name' => $this->faker->name(),
            'emergency_contact_phone' => $this->faker->phoneNumber(),
            'emergency_contact_relationship' => $this->faker->randomElement(['Spouse', 'Parent', 'Sibling', 'Friend']),
            'bank_name' => $this->faker->company(),
            'bank_account_number' => $this->faker->bankAccountNumber(),
            'bank_iban' => $this->faker->iban(),
            'hourly_rate' => $this->faker->randomFloat(2, 20, 100),
            'basic_salary' => $this->faker->randomFloat(2, 3000, 10000),
            'food_allowance' => $this->faker->randomFloat(2, 200, 1000),
            'housing_allowance' => $this->faker->randomFloat(2, 500, 2000),
            'transport_allowance' => $this->faker->randomFloat(2, 200, 1000),
            'is_operator' => $this->faker->boolean(),
            'status' => $this->faker->randomElement(['active', 'inactive', 'on_leave', 'terminated'])
        ];
    }

    public function active(): self
    {
        return $this->state(function (array $attributes) {;
            return [
                'status' => 'active'
            ];
        });
    }

    public function inactive(): self
    {
        return $this->state(function (array $attributes) {;
            return [
                'status' => 'inactive'
            ];
        });
    }

    public function onLeave(): self
    {
        return $this->state(function (array $attributes) {;
            return [
                'status' => 'on_leave'
            ];
        });
    }

    public function terminated(): self
    {
        return $this->state(function (array $attributes) {;
            return [
                'status' => 'terminated'
            ];
        });
    }

    public function operator(): self
    {
        return $this->state(function (array $attributes) {;
            return [
                'is_operator' => true
            ];
        });
    }
}


