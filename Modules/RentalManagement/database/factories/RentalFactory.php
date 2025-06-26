<?php
namespace Modules\RentalManagement\database\factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Modules\RentalManagement\Domain\Models\Rental;

class RentalFactory extends Factory
{
    protected $model = Rental::class;

    public function definition(): array
    {
        return [
            'customer_name' => $this->faker->name,
            'start_date' => $this->faker->dateTimeBetween('now', '+1 week'),
            'end_date' => $this->faker->dateTimeBetween('+1 week', '+2 weeks'),
            'status' => $this->faker->randomElement(['pending', 'active', 'completed', 'cancelled']),
            'total_amount' => $this->faker->randomFloat(2, 50, 1000),
        ];
    }

    public function pending(): self
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
        ]);
    }

    public function active(): self
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'active',
        ]);
    }

    public function completed(): self
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
        ]);
    }

    public function cancelled(): self
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'cancelled',
        ]);
    }
}


