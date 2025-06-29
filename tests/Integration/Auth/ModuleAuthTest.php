<?php

namespace Tests\Integration\Auth;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\Hash;
use Modules\EmployeeManagement\Domain\Models\Employee;
use Modules\ProjectManagement\Domain\Models\Project;
use Modules\EquipmentManagement\Domain\Models\Equipment;
use Modules\PayrollManagement\Domain\Models\PayrollRun;
use Modules\RentalManagement\Domain\Models\Rental;
use Modules\CustomerManagement\Domain\Models\Customer;

class ModuleAuthTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $password = 'Test@123456';

    protected function setUp(): void
    {
        parent::setUp();

        // Create base user
        $this->user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make($this->password)
        ]);

        // Create module-specific permissions
        $this->createModulePermissions();
    }

    protected function createModulePermissions()
    {
        // Employee Management permissions
        Permission::create(['name' => 'employee.view']);
        Permission::create(['name' => 'employee.create']);
        Permission::create(['name' => 'employee.update']);
        Permission::create(['name' => 'employee.delete']);
        Permission::create(['name' => 'employee.manage_documents']);

        // Project Management permissions
        Permission::create(['name' => 'project.view']);
        Permission::create(['name' => 'project.create']);
        Permission::create(['name' => 'project.update']);
        Permission::create(['name' => 'project.delete']);
        Permission::create(['name' => 'project.manage_tasks']);

        // Equipment Management permissions
        Permission::create(['name' => 'equipment.view']);
        Permission::create(['name' => 'equipment.create']);
        Permission::create(['name' => 'equipment.update']);
        Permission::create(['name' => 'equipment.delete']);
        Permission::create(['name' => 'equipment.manage_maintenance']);

        // Payroll Management permissions
        Permission::create(['name' => 'payroll.view']);
        Permission::create(['name' => 'payroll.process']);
        Permission::create(['name' => 'payroll.approve']);
        Permission::create(['name' => 'payroll.manage_components']);

        // Rental Management permissions
        Permission::create(['name' => 'rental.view']);
        Permission::create(['name' => 'rental.create']);
        Permission::create(['name' => 'rental.update']);
        Permission::create(['name' => 'rental.approve']);

        // Customer Management permissions
        Permission::create(['name' => 'customer.view']);
        Permission::create(['name' => 'customer.create']);
        Permission::create(['name' => 'customer.update']);
        Permission::create(['name' => 'customer.delete']);
    }

    /** @test */
    public function it_enforces_employee_module_permissions()
    {
        $this->user->givePermissionTo(['employee.view', 'employee.create']);
        $token = $this->user->createToken('test-token')->plainTextToken;

        $employee = Employee::factory()->create();

        // Can view employees
        $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->getJson('/api/employees')
            ->assertStatus(200);

        // Can create employee
        $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->postJson('/api/employees', [
                'name' => 'John Doe',
                'email' => 'john@example.com'
            ])
            ->assertStatus(201);

        // Cannot update employee
        $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->putJson("/api/employees/{$employee->id}", [
                'name' => 'Updated Name'
            ])
            ->assertStatus(403);

        // Cannot delete employee
        $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->deleteJson("/api/employees/{$employee->id}")
            ->assertStatus(403);
    }

    /** @test */
    public function it_enforces_project_module_permissions()
    {
        $this->user->givePermissionTo(['project.view', 'project.manage_tasks']);
        $token = $this->user->createToken('test-token')->plainTextToken;

        $project = Project::factory()->create();

        // Can view projects
        $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->getJson('/api/projects')
            ->assertStatus(200);

        // Can manage tasks
        $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->postJson("/api/projects/{$project->id}/tasks", [
                'title' => 'New Task'
            ])
            ->assertStatus(201);

        // Cannot create project
        $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->postJson('/api/projects', [
                'name' => 'New Project'
            ])
            ->assertStatus(403);
    }

    /** @test */
    public function it_enforces_equipment_module_permissions()
    {
        $this->user->givePermissionTo(['equipment.view', 'equipment.manage_maintenance']);
        $token = $this->user->createToken('test-token')->plainTextToken;

        $equipment = Equipment::factory()->create();

        // Can view equipment
        $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->getJson('/api/equipment')
            ->assertStatus(200);

        // Can manage maintenance
        $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->postJson("/api/equipment/{$equipment->id}/maintenance", [
                'type' => 'scheduled',
                'date' => now()->addDays(7)
            ])
            ->assertStatus(201);

        // Cannot update equipment
        $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->putJson("/api/equipment/{$equipment->id}", [
                'name' => 'Updated Equipment'
            ])
            ->assertStatus(403);
    }

    /** @test */
    public function it_enforces_payroll_module_permissions()
    {
        $this->user->givePermissionTo(['payroll.view', 'payroll.process']);
        $token = $this->user->createToken('test-token')->plainTextToken;

        $payrollRun = PayrollRun::factory()->create();

        // Can view payroll
        $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->getJson('/api/payroll')
            ->assertStatus(200);

        // Can process payroll
        $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->postJson("/api/payroll/{$payrollRun->id}/process")
            ->assertStatus(200);

        // Cannot approve payroll
        $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->postJson("/api/payroll/{$payrollRun->id}/approve")
            ->assertStatus(403);
    }

    /** @test */
    public function it_enforces_rental_module_permissions()
    {
        $this->user->givePermissionTo(['rental.view', 'rental.create']);
        $token = $this->user->createToken('test-token')->plainTextToken;

        $rental = Rental::factory()->create();

        // Can view rentals
        $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->getJson('/api/rentals')
            ->assertStatus(200);

        // Can create rental
        $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->postJson('/api/rentals', [
                'customer_id' => 1,
                'equipment_id' => 1,
                'start_date' => now(),
                'expected_end_date' => now()->addDays(7)
            ])
            ->assertStatus(201);

        // Cannot approve rental
        $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->postJson("/api/rentals/{$rental->id}/approve")
            ->assertStatus(403);
    }

    /** @test */
    public function it_enforces_customer_module_permissions()
    {
        $this->user->givePermissionTo(['customer.view', 'customer.create']);
        $token = $this->user->createToken('test-token')->plainTextToken;

        $customer = Customer::factory()->create();

        // Can view customers
        $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->getJson('/api/customers')
            ->assertStatus(200);

        // Can create customer
        $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->postJson('/api/customers', [
                'name' => 'New Customer',
                'email' => 'customer@example.com'
            ])
            ->assertStatus(201);

        // Cannot update customer
        $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->putJson("/api/customers/{$customer->id}", [
                'name' => 'Updated Customer'
            ])
            ->assertStatus(403);
    }

    /** @test */
    public function it_handles_module_specific_roles()
    {
        // Create module-specific roles
        $hrRole = Role::create(['name' => 'hr_manager'])
            ->givePermissionTo(['employee.*', 'payroll.*']);

        $projectRole = Role::create(['name' => 'project_manager'])
            ->givePermissionTo(['project.*']);

        $rentalRole = Role::create(['name' => 'rental_manager'])
            ->givePermissionTo(['rental.*', 'equipment.*']);

        // Test HR Manager permissions
        $this->user->assignRole('hr_manager');
        $token = $this->user->createToken('test-token')->plainTextToken;

        $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->getJson('/api/employees')
            ->assertStatus(200);

        $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->getJson('/api/projects')
            ->assertStatus(403);

        // Test Project Manager permissions
        $this->user->syncRoles(['project_manager']);
        $token = $this->user->createToken('project-token')->plainTextToken;

        $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->getJson('/api/projects')
            ->assertStatus(200);

        $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->getJson('/api/payroll')
            ->assertStatus(403);

        // Test Rental Manager permissions
        $this->user->syncRoles(['rental_manager']);
        $token = $this->user->createToken('rental-token')->plainTextToken;

        $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->getJson('/api/rentals')
            ->assertStatus(200);

        $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->getJson('/api/equipment')
            ->assertStatus(200);
    }

    /** @test */
    public function it_handles_module_specific_middleware()
    {
        $this->user->givePermissionTo(['employee.view']);
        $token = $this->user->createToken('test-token')->plainTextToken;

        // Test module-specific middleware
        $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->getJson('/api/employees/export')
            ->assertStatus(403)
            ->assertJson([
                'message' => 'Module feature is disabled'
            ]);

        // Enable module feature
        config(['employee-management.features.export' => true]);

        $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->getJson('/api/employees/export')
            ->assertStatus(200);
    }

    /** @test */
    public function it_handles_cross_module_permissions()
    {
        $this->user->givePermissionTo([
            'project.view',
            'employee.view',
            'equipment.view'
        ]);
        $token = $this->user->createToken('test-token')->plainTextToken;

        $project = Project::factory()->create();

        // Can access project employees
        $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->getJson("/api/projects/{$project->id}/employees")
            ->assertStatus(200);

        // Can access project equipment
        $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->getJson("/api/projects/{$project->id}/equipment")
            ->assertStatus(200);

        // Cannot access project finances
        $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->getJson("/api/projects/{$project->id}/finances")
            ->assertStatus(403);
    }

    /** @test */
    public function it_handles_module_specific_settings()
    {
        $this->user->givePermissionTo(['employee.manage_settings']);
        $token = $this->user->createToken('test-token')->plainTextToken;

        // Can access module settings
        $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->getJson('/api/employees/settings')
            ->assertStatus(200);

        // Can update module settings
        $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->putJson('/api/employees/settings', [
                'notification_enabled' => true,
                'export_enabled' => true
            ])
            ->assertStatus(200);

        // Cannot access other module settings
        $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->getJson('/api/projects/settings')
            ->assertStatus(403);
    }

    /** @test */
    public function it_handles_module_specific_audit_logs()
    {
        $this->user->givePermissionTo(['employee.view_audit_logs']);
        $token = $this->user->createToken('test-token')->plainTextToken;

        $employee = Employee::factory()->create();

        // Create some audit logs
        $employee->update(['status' => 'active']);
        $employee->update(['department' => 'IT']);

        // Can view module audit logs
        $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->getJson("/api/employees/{$employee->id}/audit-logs")
            ->assertStatus(200)
            ->assertJsonCount(2, 'data');

        // Cannot view other module audit logs
        $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->getJson('/api/projects/audit-logs')
            ->assertStatus(403);
    }
}
