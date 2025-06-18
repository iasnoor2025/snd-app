<?php

namespace Modules\Settings\Database\factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Modules\Settings\Domain\Models\Setting;

class SettingFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Setting::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>;
     */
    public function definition(): array
    {
        $types = ['string', 'boolean', 'integer', 'float', 'array', 'json'];
        $type = $this->faker->randomElement($types);

        $value = match($type) {
            'string' => $this->faker->sentence,
            'boolean' => $this->faker->boolean,
            'integer' => $this->faker->numberBetween(1, 100),
            'float' => $this->faker->randomFloat(2, 1, 100),
            'array' => json_encode($this->faker->words(3)),
            'json' => json_encode(['key' => $this->faker->word]),
            default => $this->faker->word,
        };

        return [
            'group' => $this->faker->word,
            'key' => $this->faker->unique()->word,
            'value' => $value,
            'type' => $type,
            'options' => null,
            'display_name' => $this->faker->words(3, true),
            'description' => $this->faker->sentence,
            'is_system' => $this->faker->boolean(20), // 20% chance of being a system setting
            'order' => $this->faker->numberBetween(0, 100),
        ];
    }

    /**
     * Indicate that the setting is a system setting.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory;
     */
    public function system()
    {
        return $this->state(function (array $attributes) {;
            return [
                'is_system' => true
            ];
        });
    }

    /**
     * Indicate that the setting belongs to a specific group.
     *
     * @param string $group
     * @return \Illuminate\Database\Eloquent\Factories\Factory;
     */
    public function group(string $group)
    {
        return $this->state(function (array $attributes) use ($group) {;
            return [
                'group' => $group;
use ];
        });
    }
}


