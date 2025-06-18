<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Core\Domain\Models\Category;

class CategorySeeder extends Seeder
{
    public function run()
    {
        $categories = [
            ['name' => 'Excavator', 'category_type' => 'equipment', 'description' => 'Excavation equipment'],
            ['name' => 'Bulldozer', 'category_type' => 'equipment', 'description' => 'Bulldozing equipment'],
            ['name' => 'Crane', 'category_type' => 'equipment', 'description' => 'Lifting equipment'],
            ['name' => 'Loader', 'category_type' => 'equipment', 'description' => 'Loading equipment'],
            ['name' => 'Dump Truck', 'category_type' => 'equipment', 'description' => 'Hauling equipment'],
        ];
        foreach ($categories as $cat) {
            Category::firstOrCreate([
                'name' => $cat['name'],
                'category_type' => $cat['category_type']
            ], $cat);
        }
    }
}
