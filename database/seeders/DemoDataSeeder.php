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
use Illuminate\Support\Facades\DB;

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
            [
                'name' => 'Main Warehouse',
                'city' => 'City Center',
                'state' => 'State',
                'country' => 'Country'
            ],
            [
                'name' => 'North Branch',
                'city' => 'North District',
                'state' => 'State',
                'country' => 'Country'
            ],
            [
                'name' => 'South Depot',
                'city' => 'South Zone',
                'state' => 'State',
                'country' => 'Country'
            ],
            [
                'name' => 'Mobile Unit 1',
                'city' => 'Various',
                'state' => 'Various',
                'country' => 'Country'
            ]
        ];

        DB::transaction(function () use ($locations) {
            foreach ($locations as $location) {
                Location::firstOrCreate(
                    ['name' => $location['name']],
                    $location
                );
            }
        });
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
        \Log::info('Starting rental data seeding...');
        
        try {
            DB::transaction(function () {
                $customers = Customer::take(10)->get();
                $equipment = Equipment::take(10)->get();
                $locations = Location::all();
                $statuses = ['pending', 'active', 'completed', 'cancelled'];
                $now = Carbon::now();

                foreach ($customers as $customer) {
                    foreach (range(1, 3) as $i) {
                        $status = $statuses[array_rand($statuses)];
                        $startDate = $now->copy()->subDays(rand(1, 30));
                        $endDate = $startDate->copy()->addDays(rand(5, 60));

                        $rental = Rental::create([
                            'rental_number' => Rental::generateRentalNumber(),
                            'customer_id' => $customer->id,
                            'status' => $status,
                            'start_date' => $startDate,
                            'expected_end_date' => $endDate,
                            'actual_end_date' => $status === 'completed' ? $endDate : null,
                            'notes' => 'Demo rental data',
                            'subtotal' => rand(1000, 10000),
                            'tax_percentage' => 15,
                            'payment_status' => $status === 'completed' ? 'paid' : 'pending',
                            'payment_terms_days' => 30,
                            'has_timesheet' => rand(0, 1) === 1,
                            'has_operators' => rand(0, 1) === 1,
                            'deposit_amount' => rand(500, 2000),
                            'location_id' => $locations->random()->id,
                            'created_by' => 1,
                            'approved_by' => $status !== 'pending' ? 1 : null,
                            'approved_at' => $status !== 'pending' ? $startDate : null,
                            'completed_by' => $status === 'completed' ? 1 : null,
                            'completed_at' => $status === 'completed' ? $endDate : null,
                        ]);

                        // Calculate tax and total after creation
                        $rental->tax_amount = $rental->subtotal * ($rental->tax_percentage / 100);
                        $rental->total_amount = $rental->subtotal + $rental->tax_amount;
                        $rental->save();

                        // Add 1-3 rental items
                        foreach (range(1, rand(1, 3)) as $j) {
                            $selectedEquipment = $equipment->random();
                            $days = $startDate->diffInDays($endDate);
                            $rate = $selectedEquipment->daily_rate;
                            $totalAmount = $rate * $days;

                            $rental->rentalItems()->create([
                                'equipment_id' => $selectedEquipment->id,
                                'rate' => $rate,
                                'rate_type' => 'daily',
                                'days' => $days,
                                'discount_percentage' => 0,
                                'total_amount' => $totalAmount,
                                'notes' => 'Demo rental item',
                            ]);
                        }

                        // Free up memory
                        unset($rental);
                    }
                }
            });

            \Log::info('Rental data seeding completed successfully.');
        } catch (\Exception $e) {
            \Log::error('Error seeding rental data: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }
}
