<?php
namespace Modules\ProjectManagement\database\seeders;

use Illuminate\Database\Seeder;

class ProjectManagementDatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->call(ProjectSeeder::class);
    }
}
