<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Run the CoreTableSeeder to create and populate core module tables
        $this->call(CoreTableSeeder::class);

        // Run the Core module migrations manually
        $this->call(CoreModuleMigrator::class);

        // Run the PermissionSeeder first
        $this->call(PermissionSeeder::class);

        // Run the RoleSeeder to create roles
        $this->call(RoleSeeder::class);

        // Run the AdminUserSeeder to create admin role and user
        $this->call(AdminUserSeeder::class);

        // Seed all modules
        $this->call(\Modules\Settings\Database\Seeders\SettingsDatabaseSeeder::class);
        $this->call(\Modules\EmployeeManagement\database\seeders\EmployeeManagementDatabaseSeeder::class);
        $this->call(\Modules\CustomerManagement\Database\Seeders\CustomerManagementDatabaseSeeder::class);
        $this->call(\Modules\EquipmentManagement\database\Seeders\EquipmentManagementDatabaseSeeder::class);
        $this->call(\Modules\LeaveManagement\Database\Seeders\LeaveManagementDatabaseSeeder::class);
        $this->call(\Modules\ProjectManagement\database\seeders\ProjectManagementDatabaseSeeder::class);
        $this->call(\Modules\RentalManagement\database\seeders\RentalDatabaseSeeder::class);
        $this->call(\Modules\AuditCompliance\database\Seeders\AuditComplianceDatabaseSeeder::class);
        $this->call(\Modules\Notifications\Database\Seeders\NotificationsDatabaseSeeder::class);
        $this->call(\Modules\Payroll\database\Seeders\PayrollDatabaseSeeder::class);
        $this->call(\Modules\TimesheetManagement\Database\Seeders\TimesheetManagementDatabaseSeeder::class);
        $this->call(\Modules\Reporting\Database\Seeders\ReportingDatabaseSeeder::class);
        $this->call(\Modules\MobileBridge\Database\Seeders\MobileBridgeDatabaseSeeder::class);
        $this->call(\Modules\Localization\Database\Seeders\LocalizationDatabaseSeeder::class);

        // Create a test user if needed
        if (app()->environment('local', 'development')) {
            $testUser = User::factory()->create([
                'name' => 'Test User',
                'email' => 'test@example.com',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'remember_token' => Str::random(10),
            ]);

            // Assign a role to the test user
            $testUser->assignRole('user');
        }
    }
}
