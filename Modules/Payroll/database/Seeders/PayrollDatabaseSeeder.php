<?php
namespace Modules\Payroll\database\Seeders;

use Illuminate\Database\Seeder;

class PayrollDatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->call(PayrollRunSeeder::class);

        // $this->call([
        //     // Add Payroll module specific seeders here
        // ]);
    }
}
