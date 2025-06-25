<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use Modules\ProjectManagement\Domain\Models\Project;
use Modules\ProjectManagement\Domain\Models\Task;
use Modules\ProjectManagement\Domain\Models\ProjectDocument;
use Modules\CustomerManagement\Domain\Models\Customer;
use Modules\EmployeeManagement\Domain\Models\Employee;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Carbon\Carbon;

class ProjectWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected $projectManager;
    protected $teamLead;
    protected $employee;
    protected $customer;
    protected $password = 'Test@123456';

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create roles and permissions
        $this->setupRolesAndPermissions();

        // Create test users
        $this->projectManager = User::factory()->create([
            'email' => 'pm@example.com',
            'password' => Hash::make($this->password)
        ]);
        $this->projectManager->assignRole('project_manager');

        $this->teamLead = User::factory()->create([
            'email' => 'lead@example.com',
            'password' => Hash::make($this->password)
        ]);
        $this->teamLead->assignRole('team_lead');

        $this->employee = User::factory()->create([
            'email' => 'employee@example.com',
            'password' => Hash::make($this->password)
        ]);
        $this->employee->assignRole('team_member');

        // Create test customer
        $this->customer = Customer::factory()->create([
            'name' => 'Test Customer',
            'email' => 'customer@example.com'
        ]);

        Storage::fake('documents');
    }

    protected function setupRolesAndPermissions()
    {
        // Create roles
        $pmRole = Role::create(['name' => 'project_manager']);
        $leadRole = Role::create(['name' => 'team_lead']);
        $memberRole = Role::create(['name' => 'team_member']);

        // Create permissions
        Permission::create(['name' => 'project.view']);
        Permission::create(['name' => 'project.create']);
        Permission::create(['name' => 'project.update']);
        Permission::create(['name' => 'project.delete']);
        Permission::create(['name' => 'project.manage_team']);
        Permission::create(['name' => 'task.create']);
        Permission::create(['name' => 'task.update']);
        Permission::create(['name' => 'task.delete']);
        Permission::create(['name' => 'document.manage']);

        // Assign permissions to roles
        $pmRole->givePermissionTo(Permission::all());
        $leadRole->givePermissionTo([
            'project.view',
            'project.update',
            'task.create',
            'task.update',
            'task.delete',
            'document.manage'
        ]);
        $memberRole->givePermissionTo([
            'project.view',
            'task.update'
        ]);
    }

    /** @test */
    public function complete_project_lifecycle_workflow()
    {
        Event::fake();
        Notification::fake();

        // Step 1: Create new project
        $pmToken = $this->projectManager->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $pmToken])
            ->postJson('/api/projects', [
                'name' => 'Construction Site A',
                'description' => 'New construction project',
                'customer_id' => $this->customer->id,
                'start_date' => now()->addDays(7),
                'end_date' => now()->addMonths(6),
                'budget' => 1000000,
                'status' => 'planning'
            ]);

        $response->assertStatus(201);
        $projectId = $response->json('data.id');

        // Step 2: Upload project documents
        $contract = UploadedFile::fake()->create('contract.pdf', 100);
        $specs = UploadedFile::fake()->create('specifications.pdf', 100);

        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $pmToken])
            ->postJson("/api/projects/{$projectId}/documents", [
                'documents' => [
                    [
                        'type' => 'contract',
                        'file' => $contract,
                        'description' => 'Project contract'
                    ],
                    [
                        'type' => 'specifications',
                        'file' => $specs,
                        'description' => 'Technical specifications'
                    ]
                ]
            ]);

        $response->assertStatus(200);

        // Step 3: Assign team members
        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $pmToken])
            ->postJson("/api/projects/{$projectId}/team", [
                'team_lead_id' => $this->teamLead->id,
                'members' => [
                    [
                        'user_id' => $this->employee->id,
                        'role' => 'developer'
                    ]
                ]
            ]);

        $response->assertStatus(200);

        // Step 4: Create project phases and tasks
        $response = $this->withHeaders(['Authorization' => 'Bearer' . $pmToken])
            ->postJson("/api/projects/{$projectId}/phases", [
                'phases' => [
                    [
                        'name' => 'Planning',
                        'start_date' => now()->addDays(7),
                        'end_date' => now()->addDays(30),
                        'tasks' => [
                            [
                                'name' => 'Requirements gathering',
                                'assignee_id' => $this->teamLead->id,
                                'due_date' => now()->addDays(14)
                            ]
                        ]
                    ]
                ]
            ]);

        $response->assertStatus(200);

        // Step 5: Start project execution
        $response = $this->withHeaders(['Authorization' => 'Bearer' . $pmToken])
            ->putJson("/api/projects/{$projectId}/status", [
                'status' => 'in_progress',
                'actual_start_date' => now()->addDays(7)
            ]);

        $response->assertStatus(200);

        // Step 6: Update task progress
        $taskId = Task::where('project_id', $projectId)->first()->id;

        $response = $this->withHeaders(['Authorization' => 'Bearer' . $this->teamLead->currentAccessToken()])
            ->putJson("/api/tasks/{$taskId}", [
                'progress' => 50,
                'status' => 'in_progress',
                'comments' => 'Requirements gathering in progress'
            ]);

        $response->assertStatus(200);

        // Step 7: Add project milestone
        $response = $this->withHeaders(['Authorization' => 'Bearer' . $pmToken])
            ->postJson("/api/projects/{$projectId}/milestones", [
                'name' => 'Phase 1 Complete',
                'due_date' => now()->addDays(30),
                'description' => 'Completion of planning phase'
            ]);

        $response->assertStatus(200);

        // Step 8: Complete project
        $this->travel(180)->days();

        $response = $this->withHeaders(['Authorization' => 'Bearer' . $pmToken])
            ->putJson("/api/projects/{$projectId}/complete", [
                'completion_date' => now(),
                'final_cost' => 950000,
                'completion_notes' => 'Project completed successfully'
            ]);

        $response->assertStatus(200);

        // Verify final states
        $this->assertDatabaseHas('projects', [
            'id' => $projectId,
            'status' => 'completed'
        ]);

        Event::assertDispatched('project.created');
        Event::assertDispatched('project.completed');
        
        Notification::assertSentTo(
            $this->customer,
            'ProjectCompleted'
        );
    }

    /** @test */
    public function project_change_request_workflow()
    {
        Event::fake();

        // Create project
        $project = Project::factory()->create([
            'status' => 'in_progress',
            'customer_id' => $this->customer->id
        ]);

        $pmToken = $this->projectManager->createToken('test-token')->plainTextToken;

        // Submit change request
        $response = $this->withHeaders(['Authorization' => 'Bearer' . $pmToken])
            ->postJson("/api/projects/{$project->id}/changes", [
                'title' => 'Scope Extension',
                'description' => 'Additional requirements',
                'impact' => [
                    'schedule' => 30, // days
                    'budget' => 100000
                ],
                'justification' => 'Customer requested features'
            ]);

        $response->assertStatus(200);
        $changeId = $response->json('data.id');

        // Review and approve change
        $response = $this->withHeaders(['Authorization' => 'Bearer' . $pmToken])
            ->putJson("/api/projects/changes/{$changeId}/approve", [
                'approved' => true,
                'comments' => 'Change request approved',
                'approved_budget' => 100000,
                'approved_schedule' => 30
            ]);

        $response->assertStatus(200);

        // Implement change
        $response = $this->withHeaders(['Authorization' => 'Bearer' . $pmToken])
            ->putJson("/api/projects/changes/{$changeId}/implement", [
                'status' => 'implemented',
                'actual_impact' => [
                    'schedule' => 30,
                    'budget' => 98000
                ],
                'completion_notes' => 'Changes implemented successfully'
            ]);

        $response->assertStatus(200);

        // Verify change implementation
        $this->assertDatabaseHas('project_changes', [
            'id' => $changeId,
            'status' => 'implemented'
        ]);

        Event::assertDispatched('project.change.implemented');
    }

    /** @test */
    public function project_risk_management_workflow()
    {
        Event::fake();

        // Create project
        $project = Project::factory()->create([
            'status' => 'in_progress'
        ]);

        $pmToken = $this->projectManager->createToken('test-token')->plainTextToken;

        // Identify risk
        $response = $this->withHeaders(['Authorization' => 'Bearer' . $pmToken])
            ->postJson("/api/projects/{$project->id}/risks", [
                'title' => 'Weather Delay',
                'description' => 'Potential delays due to weather',
                'probability' => 'medium',
                'impact' => 'high',
                'category' => 'external'
            ]);

        $response->assertStatus(200);
        $riskId = $response->json('data.id');

        // Create mitigation plan
        $response = $this->withHeaders(['Authorization' => 'Bearer' . $pmToken])
            ->postJson("/api/projects/risks/{$riskId}/mitigation", [
                'strategy' => 'mitigate',
                'actions' => [
                    'Install weather protection',
                    'Adjust schedule for weather patterns'
                ],
                'cost' => 50000,
                'responsible_id' => $this->teamLead->id
            ]);

        $response->assertStatus(200);

        // Monitor and update risk
        $response = $this->withHeaders(['Authorization' => 'Bearer' . $pmToken])
            ->putJson("/api/projects/risks/{$riskId}", [
                'status' => 'mitigated',
                'actual_impact' => 'low',
                'resolution_notes' => 'Risk successfully mitigated'
            ]);

        $response->assertStatus(200);

        // Verify risk management
        $this->assertDatabaseHas('project_risks', [
            'id' => $riskId,
            'status' => 'mitigated'
        ]);

        Event::assertDispatched('project.risk.mitigated');
    }

    /** @test */
    public function project_quality_control_workflow()
    {
        Event::fake();

        // Create project
        $project = Project::factory()->create([
            'status' => 'in_progress'
        ]);

        $pmToken = $this->projectManager->createToken('test-token')->plainTextToken;

        // Create quality checklist
        $response = $this->withHeaders(['Authorization' => 'Bearer' . $pmToken])
            ->postJson("/api/projects/{$project->id}/quality/checklists", [
                'name' => 'Construction Quality Check',
                'items' => [
                    [
                        'description' => 'Foundation inspection',
                        'criteria' => 'Meet building codes',
                        'weight' => 30
                    ],
                    [
                        'description' => 'Material quality',
                        'criteria' => 'Meet specifications',
                        'weight' => 40
                    ]
                ]
            ]);

        $response->assertStatus(200);
        $checklistId = $response->json('data.id');

        // Perform inspection
        $response = $this->withHeaders(['Authorization' => 'Bearer' . $pmToken])
            ->postJson("/api/projects/quality/checklists/{$checklistId}/inspect", [
                'inspector_id' => $this->teamLead->id,
                'date' => now(),
                'results' => [
                    [
                        'item_id' => 1,
                        'status' => 'passed',
                        'score' => 28,
                        'comments' => 'Meets requirements'
                    ],
                    [
                        'item_id' => 2,
                        'status' => 'passed',
                        'score' => 35,
                        'comments' => 'Acceptable quality'
                    ]
                ]
            ]);

        $response->assertStatus(200);

        // Generate quality report
        $response = $this->withHeaders(['Authorization' => 'Bearer' . $pmToken])
            ->postJson("/api/projects/{$project->id}/quality/report", [
                'period' => 'monthly',
                'month' => now()->format('Y-m'),
                'summary' => 'Overall quality standards met'
            ]);

        $response->assertStatus(200);

        // Verify quality control
        $this->assertDatabaseHas('project_quality_inspections', [
            'checklist_id' => $checklistId,
            'status' => 'completed'
        ]);

        Event::assertDispatched('project.quality.inspected');
    }
} 