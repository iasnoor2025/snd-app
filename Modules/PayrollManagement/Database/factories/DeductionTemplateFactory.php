<?php

namespace Modules\PayrollManagement\database\factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Modules\PayrollManagement\Models\DeductionTemplate;

class DeductionTemplateFactory extends Factory
{
    protected $model = DeductionTemplate::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->sentence(3),
            'description' => $this->faker->sentence(),
            'rules' => json_encode([]),
            'metadata' => null,
            'status' => 'draft',
            'created_by' => null,
            'updated_by' => null,
        ];
    }
} 