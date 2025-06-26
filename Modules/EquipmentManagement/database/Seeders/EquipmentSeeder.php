<?php

namespace Modules\EquipmentManagement\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\EquipmentManagement\Domain\Models\Equipment;

class EquipmentSeeder extends Seeder
{
    public function run()
    {
        $equipment = [
            [
                'name' => ['en' => 'Excavator 320'],
                'description' => ['en' => 'Heavy duty excavator for construction'],
                'manufacturer' => 'Caterpillar',
                'model_number' => 'CAT-320',
                'serial_number' => 'EX320-001',
                'status' => 'available',
                'daily_rate' => 500,
                'weekly_rate' => 3000,
                'monthly_rate' => 10000,
                'unit' => 'unit',
                'is_active' => true,
            ],
            [
                'name' => ['en' => 'Bulldozer D6'],
                'description' => ['en' => 'Medium size bulldozer for earthmoving'],
                'manufacturer' => 'Caterpillar',
                'model_number' => 'CAT-D6',
                'serial_number' => 'BD-D6-001',
                'status' => 'available',
                'daily_rate' => 600,
                'weekly_rate' => 3500,
                'monthly_rate' => 12000,
                'unit' => 'unit',
                'is_active' => true,
            ],
            [
                'name' => ['en' => 'Crane LTM'],
                'description' => ['en' => 'Mobile crane for heavy lifting'],
                'manufacturer' => 'Liebherr',
                'model_number' => 'LTM-1100',
                'serial_number' => 'CR-LTM-001',
                'status' => 'available',
                'daily_rate' => 800,
                'weekly_rate' => 4500,
                'monthly_rate' => 15000,
                'unit' => 'unit',
                'is_active' => true,
            ],
        ];

        foreach ($equipment as $item) {
            Equipment::create($item);
        }
    }
}
