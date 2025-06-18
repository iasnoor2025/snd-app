<?php
namespace Modules\RentalManagement\database\seeders;

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
