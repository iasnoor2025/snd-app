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

class AuthorizationTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $adminRole;
    protected $managerRole;
    protected $employeeRole;
    protected $password = 'Test@123456';

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create roles
        $this->adminRole = Role::create(['name' => 'admin']);
        $this->managerRole = Role::create(['name' => 'manager']);
        $this->employeeRole = Role::create(['name' => 'employee']);

        // Create permissions
        Permission::create(['name' => 'view_employees']);
        Permission::create(['name' => 'manage_employees']);
        Permission::create(['name' => 'view_projects']);
        Permission::create(['name' => 'manage_projects']);
        Permission::create(['name' => 'view_equipment']);
        Permission::create(['name' => 'manage_equipment']);
        Permission::create(['name' => 'view_reports']);
        Permission::create(['name' => 'manage_settings']);

        // Assign permissions to roles
        $this->adminRole->givePermissionTo(Permission::all());
        $this->managerRole->givePermissionTo([
            'view_employees', 'manage_employees',
            'view_projects', 'manage_projects',
            'view_equipment', 'view_reports'
        ]);
        $this->employeeRole->givePermissionTo([
            'view_projects', 'view_equipment'
        ]);

        // Create test user
        $this->user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make($this->password)
        ]);
    }

    /** @test */
    public function admin_can_access_all_resources()
    {
        $this->user->assignRole('admin');
        $token = $this->user->createToken('test-token')->plainTextToken;

        // Test employee management access
        $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->getJson('/api/employees')
            ->assertStatus(200);

        // Test project management access
        $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->getJson('/api/projects')
            ->assertStatus(200);

        // Test equipment management access
        $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->getJson('/api/equipment')
            ->assertStatus(200);

        // Test settings access
        $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->getJson('/api/settings')
            ->assertStatus(200);
    }

    /** @test */
    public function manager_has_limited_access()
    {
        $this->user->assignRole('manager');
        $token = $this->user->createToken('test-token')->plainTextToken;

        // Can access employee management
        $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->getJson('/api/employees')
            ->assertStatus(200);

        // Can access project management
        $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->getJson('/api/projects')
            ->assertStatus(200);

        // Can view equipment
        $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->getJson('/api/equipment')
            ->assertStatus(200);

        // Cannot access settings
        $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->getJson('/api/settings')
            ->assertStatus(403);
    }

    /** @test */
    public function employee_has_restricted_access()
    {
        $this->user->assignRole('employee');
        $token = $this->user->createToken('test-token')->plainTextToken;

        // Cannot access employee management
        $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->getJson('/api/employees')
            ->assertStatus(403);

        // Can view projects
        $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->getJson('/api/projects')
            ->assertStatus(200);

        // Can view equipment
        $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->getJson('/api/equipment')
            ->assertStatus(200);
    }

    /** @test */
    public function it_enforces_role_hierarchy()
    {
        // Create a project
        $project = Project::factory()->create();
        
        // Test admin access
        $this->user->assignRole('admin');
        $adminToken = $this->user->createToken('admin-token')->plainTextToken;
        
        $this->withHeaders(['Authorization' => 'Bearer ' . $adminToken])
            ->putJson("/api/projects/{$project->id}", [
                'name' => 'Updated Project'
            ])
            ->assertStatus(200);

        // Test manager access
        $this->user->syncRoles(['manager']);
        $managerToken = $this->user->createToken('manager-token')->plainTextToken;
        
        $this->withHeaders(['Authorization' => 'Bearer ' . $managerToken])
            ->putJson("/api/projects/{$project->id}", [
                'name' => 'Updated Project'
            ])
            ->assertStatus(200);

        // Test employee access
        $this->user->syncRoles(['employee']);
        $employeeToken = $this->user->createToken('employee-token')->plainTextToken;
        
        $this->withHeaders(['Authorization' => 'Bearer ' . $employeeToken])
            ->putJson("/api/projects/{$project->id}", [
                'name' => 'Updated Project'
            ])
            ->assertStatus(403);
    }

    /** @test */
    public function it_handles_multiple_roles()
    {
        $this->user->assignRole(['employee', 'manager']);
        $token = $this->user->createToken('test-token')->plainTextToken;

        // Should have combined permissions
        $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->getJson('/api/employees')
            ->assertStatus(200);

        $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->getJson('/api/projects')
            ->assertStatus(200);
    }

    /** @test */
    public function it_handles_direct_permissions()
    {
        $this->user->assignRole('employee');
        $this->user->givePermissionTo('manage_projects');
        $token = $this->user->createToken('test-token')->plainTextToken;

        // Should have both role and direct permissions
        $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->putJson('/api/projects/1', [
                'name' => 'Updated Project'
            ])
            ->assertStatus(200);
    }

    /** @test */
    public function it_enforces_resource_ownership()
    {
        $this->user->assignRole('employee');
        $token = $this->user->createToken('test-token')->plainTextToken;

        // Create resources
        $ownedProject = Project::factory()->create([
            'created_by' => $this->user->id
        ]);

        $otherProject = Project::factory()->create([
            'created_by' => $this->user->id + 1
        ]);

        // Can access own project
        $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->getJson("/api/projects/{$ownedProject->id}")
            ->assertStatus(200);

        // Cannot access other's project
        $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->getJson("/api/projects/{$otherProject->id}")
            ->assertStatus(403);
    }

    /** @test */
    public function it_handles_permission_inheritance()
    {
        $this->user->assignRole('manager');
        $token = $this->user->createToken('test-token')->plainTextToken;

        // Create nested resources
        $employee = Employee::factory()->create();
        $project = Project::factory()->create([
            'manager_id' => $this->user->id
        ]);

        // Manager can access employee data within their projects
        $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->getJson("/api/projects/{$project->id}/employees/{$employee->id}")
            ->assertStatus(200);
    }

    /** @test */
    public function it_handles_dynamic_permissions()
    {
        $this->user->assignRole('manager');
        $token = $this->user->createToken('test-token')->plainTextToken;

        $equipment = Equipment::factory()->create([
            'status' => 'maintenance'
        ]);

        // Manager cannot modify equipment in maintenance
        $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->putJson("/api/equipment/{$equipment->id}", [
                'status' => 'available'
            ])
            ->assertStatus(403);

        // Update equipment status
        $equipment->update(['status' => 'available']);

        // Manager can now modify equipment
        $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->putJson("/api/equipment/{$equipment->id}", [
                'name' => 'Updated Equipment'
            ])
            ->assertStatus(200);
    }

    /** @test */
    public function it_handles_temporary_permissions()
    {
        $this->user->assignRole('employee');
        $token = $this->user->createToken('test-token')->plainTextToken;

        // Grant temporary permission
        $this->user->givePermissionTo('manage_projects', [
            'expires_at' => now()->addHour()
        ]);

        // Can access with temporary permission
        $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->postJson('/api/projects', [
                'name' => 'New Project'
            ])
            ->assertStatus(201);

        // Simulate permission expiration
        $this->travel(2)->hours();

        // Cannot access after expiration
        $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->postJson('/api/projects', [
                'name' => 'New Project'
            ])
            ->assertStatus(403);
    }

    /** @test */
    public function it_handles_permission_wildcards()
    {
        Permission::create(['name' => 'projects.*']);
        $this->user->assignRole('employee');
        $this->user->givePermissionTo('projects.*');
        $token = $this->user->createToken('test-token')->plainTextToken;

        // Should have access to all project endpoints
        $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->getJson('/api/projects')
            ->assertStatus(200);

        $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->postJson('/api/projects', [
                'name' => 'New Project'
            ])
            ->assertStatus(201);

        $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->deleteJson('/api/projects/1')
            ->assertStatus(200);
    }

    /** @test */
    public function it_logs_authorization_checks()
    {
        $this->user->assignRole('employee');
        $token = $this->user->createToken('test-token')->plainTextToken;

        // Attempt unauthorized access
        $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->getJson('/api/settings')
            ->assertStatus(403);

        // Check audit log
        $this->assertDatabaseHas('activity_log', [
            'subject_type' => User::class,
            'subject_id' => $this->user->id,
            'description' => 'Unauthorized access attempt to settings'
        ]);
    }
} 