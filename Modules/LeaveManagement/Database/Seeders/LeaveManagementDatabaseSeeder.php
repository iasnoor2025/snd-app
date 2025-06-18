<?php

namespace Modules\LeaveManagement\Database\Seeders;

use Illuminate\Database\Seeder;

class LeaveManagementDatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->call(LeaveTypeSeeder::class);
    }
}
