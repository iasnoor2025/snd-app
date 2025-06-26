<?php
namespace Modules\RentalManagement\Database\Seeders;

use Illuminate\Database\Seeder;

class RentalDatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->call(RentalSeeder::class);
    }
}
