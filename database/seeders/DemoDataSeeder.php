<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Modules\CustomerManagement\Domain\Models\Customer;
use Modules\EquipmentManagement\Domain\Models\Equipment;
use Modules\RentalManagement\Domain\Models\Rental;
use Modules\Core\Domain\Models\Category;
use Modules\Core\Domain\Models\Location;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Carbon\Carbon;

class DemoDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->createRolesAndPermissions();
        $this->createUsers();
        $this->createCategories();
        $this->createLocations();
        $this->createCustomers();
        $this->createEquipment();
        $this->createRentals();
    }

    private function createRolesAndPermissions()
    {
        // Create permissions
        $permissions = [
            'customers.view', 'customers.create', 'customers.edit', 'customers.delete',
            'equipment.view', 'equipment.create', 'equipment.edit', 'equipment.delete',
            'rentals.view', 'rentals.create', 'rentals.edit', 'rentals.delete',
            'users.view', 'users.create', 'users.edit', 'users.delete',
            'reports.view', 'settings.manage'
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        // Create roles
        $adminRole = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $managerRole = Role::firstOrCreate(['name' => 'manager', 'guard_name' => 'web']);
        $employeeRole = Role::firstOrCreate(['name' => 'employee', 'guard_name' => 'web']);

        // Assign permissions to roles
        $adminRole->givePermissionTo(Permission::all());
        $managerRole->givePermissionTo([
            'customers.view', 'customers.create', 'customers.edit',
            'equipment.view', 'equipment.create', 'equipment.edit',
            'rentals.view', 'rentals.create', 'rentals.edit',
            'reports.view'
        ]);
        $employeeRole->givePermissionTo([
            'customers.view', 'equipment.view', 'rentals.view'
        ]);
    }

    private function createUsers()
    {
        // Admin user
        $admin = User::firstOrCreate(
            ['email' => 'admin@ias.com'],
            [
                'name' => 'System Administrator',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'locale' => 'en'
            ]
        );
        $admin->assignRole('admin');

        // Manager user
        $manager = User::firstOrCreate(
            ['email' => 'manager@sndrentals.com'],
            [
                'name' => 'Rental Manager',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'locale' => 'en'
            ]
        );
        $manager->assignRole('manager');

        // Employee user
        $employee = User::firstOrCreate(
            ['email' => 'employee@sndrentals.com'],
            [
                'name' => 'Field Employee',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'locale' => 'en'
            ]
        );
        $employee->assignRole('employee');
    }

    private function createCategories()
    {
        $categories = [
            ['name' => 'Construction Equipment', 'description' => 'Heavy machinery for construction'],
            ['name' => 'Power Tools', 'description' => 'Electric and pneumatic tools'],
            ['name' => 'Generators', 'description' => 'Power generation equipment'],
            ['name' => 'Lifting Equipment', 'description' => 'Cranes, hoists, and lifting gear'],
            ['name' => 'Compressors', 'description' => 'Air compression equipment'],
            ['name' => 'Lighting', 'description' => 'Portable lighting solutions']
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(
                ['name' => $category['name']],
                $category
            );
        }
    }

    private function createLocations()
    {
        $locations = [
            ['name' => 'Main Warehouse', 'address' => '123 Industrial Blvd, City Center'],
            ['name' => 'North Branch', 'address' => '456 North Ave, North District'],
            ['name' => 'South Depot', 'address' => '789 South St, South Zone'],
            ['name' => 'Mobile Unit 1', 'address' => 'Various Locations']
        ];

        foreach ($locations as $location) {
            Location::firstOrCreate(
                ['name' => $location['name']],
                $location
            );
        }
    }

    private function createCustomers()
    {
        $customers = [
            [
                'company_name' => 'ABC Construction Ltd',
                'contact_person' => 'John Smith',
                'email' => 'john@abcconstruction.com',
                'phone' => '+1-555-0101',
                'address' => '100 Business Park Dr',
                'city' => 'Metro City',
                'state' => 'State',
                'postal_code' => '12345',
                'country' => 'Country',
                'is_active' => true,
                'credit_limit' => 50000.00,
                'payment_terms' => 'Net 30'
            ],
            [
                'company_name' => 'XYZ Builders Inc',
                'contact_person' => 'Sarah Johnson',
                'email' => 'sarah@xyzbuilders.com',
                'phone' => '+1-555-0102',
                'address' => '200 Commerce St',
                'city' => 'Metro City',
                'state' => 'State',
                'postal_code' => '12346',
                'country' => 'Country',
                'is_active' => true,
                'credit_limit' => 75000.00,
                'payment_terms' => 'Net 15'
            ],
            [
                'company_name' => 'Premier Contractors',
                'contact_person' => 'Mike Wilson',
                'email' => 'mike@premiercontractors.com',
                'phone' => '+1-555-0103',
                'address' => '300 Industrial Way',
                'city' => 'Metro City',
                'state' => 'State',
                'postal_code' => '12347',
                'country' => 'Country',
                'is_active' => true,
                'credit_limit' => 100000.00,
                'payment_terms' => 'Net 30'
            ]
        ];

        foreach ($customers as $customer) {
            Customer::firstOrCreate(
                ['email' => $customer['email']],
                $customer
            );
        }
    }

    private function createEquipment()
    {
        $constructionCategory = Category::where('name', 'Construction Equipment')->first();
        $powerToolsCategory = Category::where('name', 'Power Tools')->first();
        $generatorsCategory = Category::where('name', 'Generators')->first();
        $liftingCategory = Category::where('name', 'Lifting Equipment')->first();
        $mainWarehouse = Location::where('name', 'Main Warehouse')->first();
        $northBranch = Location::where('name', 'North Branch')->first();

        $equipment = [
            [
                'name' => 'Caterpillar 320 Excavator',
                'model' => 'CAT-320-2024',
                'serial_number' => 'CAT320240001',
                'door_number' => 'EX-001',
                'category_id' => $constructionCategory->id,
                'location_id' => $mainWarehouse->id,
                'status' => 'available',
                'daily_rate' => 450.00,
                'weekly_rate' => 2700.00,
                'monthly_rate' => 10800.00,
                'purchase_date' => '2024-01-15',
                'purchase_price' => 250000.00,
                'description' => '20-ton hydraulic excavator with GPS tracking'
            ],
            [
                'name' => 'JCB Backhoe Loader',
                'model' => 'JCB-3CX-2023',
                'serial_number' => 'JCB3CX230001',
                'door_number' => 'BL-002',
                'category_id' => $constructionCategory->id,
                'location_id' => $mainWarehouse->id,
                'status' => 'rented',
                'daily_rate' => 350.00,
                'weekly_rate' => 2100.00,
                'monthly_rate' => 8400.00,
                'purchase_date' => '2023-06-10',
                'purchase_price' => 180000.00,
                'description' => 'Versatile backhoe loader for multiple applications'
            ],
            [
                'name' => 'Hilti Hammer Drill',
                'model' => 'TE-6-A36',
                'serial_number' => 'HLT6A36001',
                'door_number' => 'HD-003',
                'category_id' => $powerToolsCategory->id,
                'location_id' => $northBranch->id,
                'status' => 'available',
                'daily_rate' => 25.00,
                'weekly_rate' => 150.00,
                'monthly_rate' => 600.00,
                'purchase_date' => '2024-03-01',
                'purchase_price' => 800.00,
                'description' => 'Cordless rotary hammer drill with SDS-plus chuck'
            ],
            [
                'name' => 'Honda Generator 7000W',
                'model' => 'EU7000iS',
                'serial_number' => 'HND7000001',
                'door_number' => 'GN-004',
                'category_id' => $generatorsCategory->id,
                'location_id' => $mainWarehouse->id,
                'status' => 'maintenance',
                'daily_rate' => 85.00,
                'weekly_rate' => 510.00,
                'monthly_rate' => 2040.00,
                'purchase_date' => '2023-09-15',
                'purchase_price' => 4500.00,
                'description' => 'Quiet inverter generator with electric start'
            ],
            [
                'name' => 'Genie Scissor Lift',
                'model' => 'GS-2632',
                'serial_number' => 'GNE2632001',
                'door_number' => 'SL-005',
                'category_id' => $liftingCategory->id,
                'location_id' => $northBranch->id,
                'status' => 'available',
                'daily_rate' => 180.00,
                'weekly_rate' => 1080.00,
                'monthly_rate' => 4320.00,
                'purchase_date' => '2023-11-20',
                'purchase_price' => 35000.00,
                'description' => '26ft electric scissor lift with platform extension'
            ]
        ];

        foreach ($equipment as $item) {
            Equipment::firstOrCreate(
                ['serial_number' => $item['serial_number']],
                $item
            );
        }
    }

    private function createRentals()
    {
        $customers = Customer::all();
        $equipment = Equipment::all();

        if ($customers->count() > 0 && $equipment->count() > 0) {
            // Active rental
            Rental::firstOrCreate(
                ['rental_number' => 'RENT-2024-00001'],
                [
                    'rental_number' => 'RENT-2024-00001',
                    'customer_id' => $customers->first()->id,
                    'start_date' => Carbon::now()->subDays(5),
                    'expected_end_date' => Carbon::now()->addDays(10),
                    'status' => 'active',
                    'total_amount' => 2250.00,
                    'notes' => 'Construction project at downtown site',
                    'created_by' => User::first()->id
                ]
            );

            // Completed rental
            Rental::firstOrCreate(
                ['rental_number' => 'RENT-2024-00002'],
                [
                    'rental_number' => 'RENT-2024-00002',
                    'customer_id' => $customers->skip(1)->first()->id,
                    'start_date' => Carbon::now()->subDays(20),
                    'expected_end_date' => Carbon::now()->subDays(5),
                    'actual_end_date' => Carbon::now()->subDays(5),
                    'status' => 'completed',
                    'total_amount' => 1750.00,
                    'notes' => 'Residential renovation project',
                    'created_by' => User::first()->id
                ]
            );

            // Pending rental
            Rental::firstOrCreate(
                ['rental_number' => 'RENT-2024-00003'],
                [
                    'rental_number' => 'RENT-2024-00003',
                    'customer_id' => $customers->skip(2)->first()->id,
                    'start_date' => Carbon::now()->addDays(3),
                    'expected_end_date' => Carbon::now()->addDays(17),
                    'status' => 'pending',
                    'total_amount' => 4200.00,
                    'notes' => 'Large commercial project - multiple equipment needed',
                    'created_by' => User::first()->id
                ]
            );
        }
    }
}
