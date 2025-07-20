<?php
namespace Modules\EmployeeManagement\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Modules\EmployeeManagement\Domain\Models\Employee;

class EmployeeFactory extends Factory
{
    protected $model = Employee::class;

    public function definition(): array
    {
        return [
            'user_id' => null, // to be set in seeder
            'employee_id' => 'EMP-' . str_pad($this->faker->unique()->numberBetween(1, 9999), 4, '0', STR_PAD_LEFT),
            'file_number' => 'EMP-' . str_pad($this->faker->unique()->numberBetween(1, 9999), 4, '0', STR_PAD_LEFT),
            'first_name' => $this->faker->firstName(),
            'middle_name' => $this->faker->optional()->firstName(),
            'last_name' => $this->faker->lastName(),
            'email' => $this->faker->unique()->safeEmail(),
            'phone' => $this->faker->phoneNumber(),
            'address' => $this->faker->address(),
            'city' => $this->faker->city(),
            'nationality' => $this->faker->country(),
            'designation_id' => 1, // to be set in seeder
            'department_id' => 1, // to be set in seeder
            'supervisor' => $this->faker->optional()->name(),
            'hourly_rate' => $this->faker->randomFloat(2, 20, 100),
            'basic_salary' => $this->faker->randomFloat(2, 3000, 10000),
            'food_allowance' => $this->faker->randomFloat(2, 200, 1000),
            'housing_allowance' => $this->faker->randomFloat(2, 500, 2000),
            'transport_allowance' => $this->faker->randomFloat(2, 200, 1000),
            'absent_deduction_rate' => $this->faker->randomFloat(2, 0, 100),
            'overtime_rate_multiplier' => $this->faker->randomFloat(2, 1, 2),
            'overtime_fixed_rate' => $this->faker->randomFloat(2, 0, 100),
            'bank_name' => $this->faker->company(),
            'bank_account_number' => $this->faker->bankAccountNumber(),
            'bank_iban' => $this->faker->iban(),
            'contract_hours_per_day' => $this->faker->numberBetween(6, 12),
            'contract_days_per_month' => $this->faker->numberBetween(26, 30),
            'hire_date' => $this->faker->date(),
            'status' => $this->faker->randomElement(['active', 'inactive', 'on_leave', 'terminated']),
            'current_location' => $this->faker->city(),
            'emergency_contact_name' => $this->faker->name(),
            'emergency_contact_phone' => $this->faker->phoneNumber(),
            'emergency_contact_relationship' => $this->faker->randomElement(['Spouse', 'Parent', 'Sibling', 'Friend']),
            'notes' => $this->faker->optional()->sentence(),
            'advance_salary_eligible' => $this->faker->boolean(),
            'advance_salary_approved_this_month' => $this->faker->boolean(),
            'date_of_birth' => $this->faker->date(),
            'iqama_number' => $this->faker->unique()->numerify('##########'),
            'iqama_expiry' => $this->faker->optional()->date(),
            'iqama_cost' => $this->faker->optional()->randomFloat(2, 100, 1000),
            'passport_number' => $this->faker->unique()->bothify('??#######'),
            'passport_expiry' => $this->faker->optional()->date(),
            'driving_license_number' => $this->faker->optional()->bothify('??#######'),
            'driving_license_expiry' => $this->faker->optional()->date(),
            'driving_license_cost' => $this->faker->optional()->randomFloat(2, 100, 1000),
            'operator_license_number' => $this->faker->optional()->bothify('??#######'),
            'operator_license_expiry' => $this->faker->optional()->date(),
            'operator_license_cost' => $this->faker->optional()->randomFloat(2, 100, 1000),
            'tuv_certification_number' => $this->faker->optional()->bothify('??#######'),
            'tuv_certification_expiry' => $this->faker->optional()->date(),
            'tuv_certification_cost' => $this->faker->optional()->randomFloat(2, 100, 1000),
            'spsp_license_number' => $this->faker->optional()->bothify('??#######'),
            'spsp_license_expiry' => $this->faker->optional()->date(),
            'spsp_license_cost' => $this->faker->optional()->randomFloat(2, 100, 1000),
            'driving_license_file' => $this->faker->optional()->filePath(),
            'operator_license_file' => $this->faker->optional()->filePath(),
            'tuv_certification_file' => $this->faker->optional()->filePath(),
            'spsp_license_file' => $this->faker->optional()->filePath(),
            'passport_file' => $this->faker->optional()->filePath(),
            'iqama_file' => $this->faker->optional()->filePath(),
            'custom_certifications' => $this->faker->optional()->randomElements([
                ['name' => 'Safety Training', 'number' => $this->faker->bothify('ST#######')],
                ['name' => 'First Aid', 'number' => $this->faker->bothify('FA#######')],
                ['name' => 'Heavy Equipment', 'number' => $this->faker->bothify('HE#######')]
            ], $this->faker->numberBetween(0, 3)),
            'is_operator' => $this->faker->boolean(),
            'access_restricted_until' => $this->faker->optional()->dateTime(),
            'access_start_date' => $this->faker->optional()->date(),
            'access_end_date' => $this->faker->optional()->date(),
            'access_restriction_reason' => $this->faker->optional()->sentence(),
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


