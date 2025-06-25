<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use Modules\CustomerManagement\Domain\Models\Customer;
use Modules\EquipmentManagement\Domain\Models\Equipment;
use Modules\RentalManagement\Domain\Models\Rental;
use Modules\PayrollManagement\Domain\Models\PayrollRun;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Notification;
use Carbon\Carbon;

class RentalWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected $manager;
    protected $employee;
    protected $customer;
    protected $equipment;
    protected $password = 'Test@123456';

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create roles and permissions
        $this->setupRolesAndPermissions();

        // Create test users
        $this->manager = User::factory()->create([
            'email' => 'manager@example.com',
            'password' => Hash::make($this->password)
        ]);
        $this->manager->assignRole('rental_manager');

        $this->employee = User::factory()->create([
            'email' => 'employee@example.com',
            'password' => Hash::make($this->password)
        ]);
        $this->employee->assignRole('rental_employee');

        // Create test customer
        $this->customer = Customer::factory()->create([
            'name' => 'Test Customer',
            'email' => 'customer@example.com'
        ]);

        // Create test equipment
        $this->equipment = Equipment::factory()->create([
            'name' => 'Test Equipment',
            'status' => 'available'
        ]);
    }

    protected function setupRolesAndPermissions()
    {
        // Create roles
        $managerRole = Role::create(['name' => 'rental_manager']);
        $employeeRole = Role::create(['name' => 'rental_employee']);

        // Create permissions
        Permission::create(['name' => 'rental.view']);
        Permission::create(['name' => 'rental.create']);
        Permission::create(['name' => 'rental.update']);
        Permission::create(['name' => 'rental.approve']);
        Permission::create(['name' => 'rental.cancel']);
        Permission::create(['name' => 'equipment.view']);
        Permission::create(['name' => 'equipment.update']);
        Permission::create(['name' => 'customer.view']);

        // Assign permissions to roles
        $managerRole->givePermissionTo([
            'rental.view', 'rental.create', 'rental.update',
            'rental.approve', 'rental.cancel',
            'equipment.view', 'equipment.update',
            'customer.view'
        ]);

        $employeeRole->givePermissionTo([
            'rental.view', 'rental.create',
            'equipment.view',
            'customer.view'
        ]);
    }

    /** @test */
    public function complete_rental_workflow()
    {
        Notification::fake();
        Event::fake();

        // Step 1: Employee creates rental request
        $employeeToken = $this->employee->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $employeeToken])
            ->postJson('/api/rentals', [
                'customer_id' => $this->customer->id,
                'equipment_id' => $this->equipment->id,
                'start_date' => now()->addDay(),
                'end_date' => now()->addDays(7),
                'purpose' => 'Construction project',
                'delivery_location' => '123 Site Street'
            ]);

        $response->assertStatus(201);
        $rentalId = $response->json('data.id');

        // Step 2: Manager reviews and approves rental
        $managerToken = $this->manager->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $managerToken])
            ->postJson("/api/rentals/{$rentalId}/approve", [
                'notes' => 'Equipment availability confirmed'
            ]);

        $response->assertStatus(200);

        // Step 3: Equipment status is updated
        $this->assertDatabaseHas('equipment', [
            'id' => $this->equipment->id,
            'status' => 'rented'
        ]);

        // Step 4: Customer receives equipment
        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $managerToken])
            ->postJson("/api/rentals/{$rentalId}/handover", [
                'condition_notes' => 'Equipment in good condition',
                'meter_reading' => '1000',
                'fuel_level' => 'full'
            ]);

        $response->assertStatus(200);

        // Step 5: Monitor rental during active period
        $this->travel(3)->days();

        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $managerToken])
            ->postJson("/api/rentals/{$rentalId}/inspection", [
                'status' => 'in_use',
                'condition' => 'good',
                'notes' => 'Regular usage observed'
            ]);

        $response->assertStatus(200);

        // Step 6: Process rental return
        $this->travel(4)->days();

        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $managerToken])
            ->postJson("/api/rentals/{$rentalId}/return", [
                'condition_notes' => 'Minor wear and tear',
                'meter_reading' => '1500',
                'fuel_level' => 'three_quarters',
                'damages' => [],
                'additional_charges' => []
            ]);

        $response->assertStatus(200);

        // Step 7: Generate invoice
        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $managerToken])
            ->postJson("/api/rentals/{$rentalId}/invoice");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'invoice_number',
                    'total_amount',
                    'due_date'
                ]
            ]);

        // Step 8: Verify final states
        $this->assertDatabaseHas('equipment', [
            'id' => $this->equipment->id,
            'status' => 'available'
        ]);

        $this->assertDatabaseHas('rentals', [
            'id' => $rentalId,
            'status' => 'completed'
        ]);

        // Verify notifications
        Notification::assertSentTo(
            $this->customer,
            'RentalApproved'
        );

        Notification::assertSentTo(
            $this->customer,
            'RentalCompleted'
        );

        // Verify events
        Event::assertDispatched('rental.created');
        Event::assertDispatched('rental.approved');
        Event::assertDispatched('rental.completed');
    }

    /** @test */
    public function rental_cancellation_workflow()
    {
        Event::fake();

        // Create rental request
        $employeeToken = $this->employee->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $employeeToken])
            ->postJson('/api/rentals', [
                'customer_id' => $this->customer->id,
                'equipment_id' => $this->equipment->id,
                'start_date' => now()->addDays(2),
                'end_date' => now()->addDays(9)
            ]);

        $rentalId = $response->json('data.id');

        // Customer requests cancellation
        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $employeeToken])
            ->postJson("/api/rentals/{$rentalId}/cancel", [
                'reason' => 'Project delayed',
                'notes' => 'Requesting full refund'
            ]);

        $response->assertStatus(200);

        // Manager processes cancellation
        $managerToken = $this->manager->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $managerToken])
            ->postJson("/api/rentals/{$rentalId}/process-cancellation", [
                'approved' => true,
                'refund_amount' => 1000,
                'notes' => 'Full refund approved'
            ]);

        $response->assertStatus(200);

        // Verify states
        $this->assertDatabaseHas('equipment', [
            'id' => $this->equipment->id,
            'status' => 'available'
        ]);

        $this->assertDatabaseHas('rentals', [
            'id' => $rentalId,
            'status' => 'cancelled'
        ]);

        Event::assertDispatched('rental.cancelled');
    }

    /** @test */
    public function rental_extension_workflow()
    {
        Notification::fake();

        // Create and approve rental
        $managerToken = $this->manager->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $managerToken])
            ->postJson('/api/rentals', [
                'customer_id' => $this->customer->id,
                'equipment_id' => $this->equipment->id,
                'start_date' => now(),
                'end_date' => now()->addDays(7)
            ]);

        $rentalId = $response->json('data.id');

        $this->withHeaders(['Authorization' => 'Bearer ' . $managerToken])
            ->postJson("/api/rentals/{$rentalId}/approve");

        // Request extension
        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $managerToken])
            ->postJson("/api/rentals/{$rentalId}/extend", [
                'new_end_date' => now()->addDays(14),
                'reason' => 'Project timeline extended'
            ]);

        $response->assertStatus(200);

        // Verify extension
        $this->assertDatabaseHas('rentals', [
            'id' => $rentalId,
            'end_date' => now()->addDays(14)->format('Y-m-d')
        ]);

        Notification::assertSentTo(
            $this->customer,
            'RentalExtensionApproved'
        );
    }

    /** @test */
    public function rental_with_maintenance_workflow()
    {
        Event::fake();

        // Create and approve rental
        $managerToken = $this->manager->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $managerToken])
            ->postJson('/api/rentals', [
                'customer_id' => $this->customer->id,
                'equipment_id' => $this->equipment->id,
                'start_date' => now(),
                'end_date' => now()->addDays(14)
            ]);

        $rentalId = $response->json('data.id');

        $this->withHeaders(['Authorization' => 'Bearer ' . $managerToken])
            ->postJson("/api/rentals/{$rentalId}/approve");

        // Report maintenance issue
        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $managerToken])
            ->postJson("/api/rentals/{$rentalId}/maintenance", [
                'issue_type' => 'mechanical',
                'description' => 'Engine overheating',
                'severity' => 'high'
            ]);

        $response->assertStatus(200);

        // Process maintenance
        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $managerToken])
            ->postJson("/api/rentals/{$rentalId}/maintenance/resolve", [
                'resolution' => 'Replaced coolant and fan belt',
                'cost' => 500,
                'downtime_hours' => 24
            ]);

        $response->assertStatus(200);

        // Verify maintenance records
        $this->assertDatabaseHas('equipment_maintenance_logs', [
            'equipment_id' => $this->equipment->id,
            'type' => 'mechanical',
            'status' => 'resolved'
        ]);

        Event::assertDispatched('maintenance.reported');
        Event::assertDispatched('maintenance.resolved');
    }

    /** @test */
    public function rental_with_damage_workflow()
    {
        Event::fake();

        // Create and approve rental
        $managerToken = $this->manager->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $managerToken])
            ->postJson('/api/rentals', [
                'customer_id' => $this->customer->id,
                'equipment_id' => $this->equipment->id,
                'start_date' => now(),
                'end_date' => now()->addDays(7)
            ]);

        $rentalId = $response->json('data.id');

        $this->withHeaders(['Authorization' => 'Bearer ' . $managerToken])
            ->postJson("/api/rentals/{$rentalId}/approve");

        // Report damage during rental
        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $managerToken])
            ->postJson("/api/rentals/{$rentalId}/damage", [
                'type' => 'physical',
                'description' => 'Dented exterior panel',
                'severity' => 'medium',
                'images' => ['damage1.jpg', 'damage2.jpg']
            ]);

        $response->assertStatus(200);

        // Process damage claim
        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $managerToken])
            ->postJson("/api/rentals/{$rentalId}/damage/assess", [
                'repair_cost' => 1500,
                'customer_liability' => 1000,
                'insurance_coverage' => 500,
                'resolution_notes' => 'Customer agreed to pay liability'
            ]);

        $response->assertStatus(200);

        // Verify damage records
        $this->assertDatabaseHas('rental_damage_reports', [
            'rental_id' => $rentalId,
            'status' => 'assessed',
            'repair_cost' => 1500
        ]);

        Event::assertDispatched('damage.reported');
        Event::assertDispatched('damage.assessed');
    }
} 