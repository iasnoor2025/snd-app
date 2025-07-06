<?php

namespace Modules\RentalManagement\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\RentalManagement\Domain\Models\RentalItem;
use Modules\RentalManagement\Domain\Models\Rental;
use Modules\EquipmentManagement\Domain\Models\Equipment;

class RentalItemSeeder extends Seeder
{
    public function run()
    {
        $rental = Rental::first();
        $equipment = Equipment::first();
        if (!$rental || !$equipment) {
            echo "Missing rental or equipment, skipping rental item seeding.\n";
            return;
        }
        $item = RentalItem::create([
            'rental_id' => $rental->id,
            'equipment_id' => $equipment->id,
            'rate' => 100.00,
            'rate_type' => 'daily',
            'discount_percentage' => 0,
            'total_amount' => 100.00,
        ]);
        echo "Created rental item: {$item->id}\n";
    }
}
