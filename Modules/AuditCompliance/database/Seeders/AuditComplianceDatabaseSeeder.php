<?php
namespace Modules\AuditCompliance\database\Seeders;

use Illuminate\Database\Seeder;

class AuditComplianceDatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->call(ActivityLogSeeder::class);
    }
}
