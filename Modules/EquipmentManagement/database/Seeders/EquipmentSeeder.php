<?php

namespace Modules\EquipmentManagement\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\EquipmentManagement\Domain\Models\Equipment;

class EquipmentSeeder extends Seeder
{
    public function run()
    {
        $equipment = Equipment::create([
            'name' => 'Excavator X100',
            'status' => 'available',
            'is_active' => true,
        ]);
        echo "Created equipment: {$equipment->id}\n";
    }
}
