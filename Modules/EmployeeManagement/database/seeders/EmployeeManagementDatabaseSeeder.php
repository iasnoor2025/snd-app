<?php
namespace Modules\EmployeeManagement\database\seeders;

use Illuminate\Database\Seeder;

class EmployeeManagementDatabaseSeeder extends Seeder
{
    /**
     * Indicates if the seeder should be run within a transaction.
     *
     * @var bool
     */
    public $withinTransaction = false;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->call([
            \Modules\EmployeeManagement\database\seeders\DepartmentSeeder::class,
            \Modules\EmployeeManagement\database\seeders\DesignationSeeder::class, 
            \Modules\EmployeeManagement\database\seeders\SalaryIncrementSeeder::class,
        ]);
    }
}
