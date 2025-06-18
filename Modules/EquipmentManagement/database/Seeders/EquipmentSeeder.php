<?php

namespace Modules\EquipmentManagement\database\seeders;

use Illuminate\Database\Seeder;
use Modules\EquipmentManagement\Domain\Models\Equipment;

class EquipmentSeeder extends Seeder
{
    public function run()
    {
        $equipment = [
            [
                'name' => 'Excavator ZX200',
                'description' => 'Hydraulic excavator',
                'unit' => 'unit',
                'default_unit_cost' => 500,
                'is_active' => true,
                'model_number' => 'ZX200',
                'manufacturer' => null,
                'serial_number' => 'EXC-001',
                'status' => 'available',
                'daily_rate' => 100,
                'weekly_rate' => 600,
                'monthly_rate' => 2200,
            ],
            [
                'name' => 'Bulldozer D6',
                'description' => 'Caterpillar bulldozer',
                'unit' => 'unit',
                'default_unit_cost' => 700,
                'is_active' => true,
                'model_number' => 'D6',
                'manufacturer' => null,
                'serial_number' => 'BULL-002',
                'status' => 'maintenance',
                'daily_rate' => 150,
                'weekly_rate' => 900,
                'monthly_rate' => 3500,
            ],
            [
                'name' => 'Crane CK1600',
                'description' => 'Crawler crane',
                'unit' => 'unit',
                'default_unit_cost' => 1200,
                'is_active' => true,
                'model_number' => 'CK1600',
                'manufacturer' => null,
                'serial_number' => 'CRN-003',
                'status' => 'rented',
                'daily_rate' => 300,
                'weekly_rate' => 1800,
                'monthly_rate' => 7000,
            ],
        ];
        foreach ($equipment as $data) {
            Equipment::updateOrCreate([
                'serial_number' => $data['serial_number'],
            ], $data);
        }
    }
}
