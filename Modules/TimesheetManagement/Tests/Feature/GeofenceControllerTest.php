<?php

namespace Modules\TimesheetManagement\Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Modules\TimesheetManagement\Domain\Models\GeofenceZone;
use Modules\EmployeeManagement\Domain\Models\Employee;
use Modules\ProjectManagement\Domain\Models\Project;
use Modules\Core\Domain\Models\User;
use Laravel\Sanctum\Sanctum;
use Illuminate\Support\Facades\Event;
use Modules\TimesheetManagement\Events\GeofenceViolationDetected;

class GeofenceControllerTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected User $user;
    protected Employee $employee;
    protected Project $project;
    protected GeofenceZone $geofenceZone;

    protected function setUp(): void
    {
        parent::setUp();

        // Create test user and employee
        $this->user = User::factory()->create();
        $this->employee = Employee::factory()->create(['user_id' => $this->user->id]);
        $this->project = Project::factory()->create();

        // Create test geofence zone
        $this->geofenceZone = GeofenceZone::create([
            'name' => 'Test Zone',
            'description' => 'Test geofence zone',
            'type' => 'circular',
            'latitude' => 40.7128,
            'longitude' => -74.0060,
            'radius' => 100,
            'project_id' => $this->project->id,
            'is_active' => true,
            'enforce_entry' => true,
            'enforce_exit' => true,
            'monitoring_enabled' => true,
            'alert_on_violation' => true,
        ]);

        // Authenticate user
        Sanctum::actingAs($this->user);
    }

    /** @test */
    public function it_can_list_geofence_zones()
    {
        $response = $this->getJson('/api/geofences');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'data' => [
                        '*' => [
                            'id',
                            'name',
                            'description',
                            'type',
                            'latitude',
                            'longitude',
                            'radius',
                            'project_id',
                            'is_active',
                            'created_at',
                            'updated_at'
                        ]
                    ]
                ])
                ->assertJsonFragment([
                    'name' => 'Test Zone',
                    'type' => 'circular'
                ]);
    }

    /** @test */
    public function it_can_create_geofence_zone()
    {
        $zoneData = [
            'name' => 'New Test Zone',
            'description' => 'A new test zone',
            'type' => 'circular',
            'latitude' => 40.7589,
            'longitude' => -73.9851,
            'radius' => 150,
            'project_id' => $this->project->id,
            'is_active' => true,
            'enforce_entry' => true,
            'enforce_exit' => false,
            'monitoring_enabled' => true,
            'alert_on_violation' => true,
        ];

        $response = $this->postJson('/api/geofences', $zoneData);

        $response->assertStatus(201)
                ->assertJsonFragment([
                    'name' => 'New Test Zone',
                    'type' => 'circular',
                    'radius' => 150
                ]);

        $this->assertDatabaseHas('geofence_zones', [
            'name' => 'New Test Zone',
            'type' => 'circular',
            'project_id' => $this->project->id
        ]);
    }

    /** @test */
    public function it_can_create_polygon_geofence_zone()
    {
        $zoneData = [
            'name' => 'Polygon Zone',
            'description' => 'A polygon test zone',
            'type' => 'polygon',
            'polygon_coordinates' => [
                ['lat' => 40.7120, 'lng' => -74.0070],
                ['lat' => 40.7130, 'lng' => -74.0070],
                ['lat' => 40.7130, 'lng' => -74.0050],
                ['lat' => 40.7120, 'lng' => -74.0050],
            ],
            'project_id' => $this->project->id,
            'is_active' => true,
            'enforce_entry' => true,
            'enforce_exit' => true,
            'monitoring_enabled' => true,
            'alert_on_violation' => true,
        ];

        $response = $this->postJson('/api/geofences', $zoneData);

        $response->assertStatus(201)
                ->assertJsonFragment([
                    'name' => 'Polygon Zone',
                    'type' => 'polygon'
                ]);

        $this->assertDatabaseHas('geofence_zones', [
            'name' => 'Polygon Zone',
            'type' => 'polygon'
        ]);
    }

    /** @test */
    public function it_validates_required_fields_when_creating_zone()
    {
        $response = $this->postJson('/api/geofences', []);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['name', 'type']);
    }

    /** @test */
    public function it_validates_circular_zone_requirements()
    {
        $zoneData = [
            'name' => 'Invalid Circular Zone',
            'type' => 'circular',
            // Missing latitude, longitude, radius
        ];

        $response = $this->postJson('/api/geofences', $zoneData);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['latitude', 'longitude', 'radius']);
    }

    /** @test */
    public function it_validates_polygon_zone_requirements()
    {
        $zoneData = [
            'name' => 'Invalid Polygon Zone',
            'type' => 'polygon',
            // Missing polygon_coordinates
        ];

        $response = $this->postJson('/api/geofences', $zoneData);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['polygon_coordinates']);
    }

    /** @test */
    public function it_can_show_specific_geofence_zone()
    {
        $response = $this->getJson("/api/geofences/{$this->geofenceZone->id}");

        $response->assertStatus(200)
                ->assertJsonFragment([
                    'id' => $this->geofenceZone->id,
                    'name' => 'Test Zone',
                    'type' => 'circular'
                ]);
    }

    /** @test */
    public function it_can_update_geofence_zone()
    {
        $updateData = [
            'name' => 'Updated Test Zone',
            'description' => 'Updated description',
            'radius' => 200,
        ];

        $response = $this->putJson("/api/geofences/{$this->geofenceZone->id}", $updateData);

        $response->assertStatus(200)
                ->assertJsonFragment([
                    'name' => 'Updated Test Zone',
                    'radius' => 200
                ]);

        $this->assertDatabaseHas('geofence_zones', [
            'id' => $this->geofenceZone->id,
            'name' => 'Updated Test Zone',
            'radius' => 200
        ]);
    }

    /** @test */
    public function it_can_delete_geofence_zone()
    {
        $response = $this->deleteJson("/api/geofences/{$this->geofenceZone->id}");

        $response->assertStatus(200);

        $this->assertSoftDeleted('geofence_zones', [
            'id' => $this->geofenceZone->id
        ]);
    }

    /** @test */
    public function it_can_toggle_zone_active_status()
    {
        $this->assertTrue($this->geofenceZone->is_active);

        $response = $this->postJson("/api/geofences/{$this->geofenceZone->id}/toggle-active");

        $response->assertStatus(200)
                ->assertJsonFragment(['is_active' => false]);

        $this->geofenceZone->refresh();
        $this->assertFalse($this->geofenceZone->is_active);
    }

    /** @test */
    public function it_can_validate_location()
    {
        $locationData = [
            'latitude' => 40.7128, // Within zone
            'longitude' => -74.0060,
            'employee_id' => $this->employee->id,
            'project_id' => $this->project->id,
        ];

        $response = $this->postJson('/api/geofences/validate-location', $locationData);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'data' => [
                        'compliant',
                        'violations',
                        'distance_from_nearest_zone',
                        'nearest_zone'
                    ]
                ])
                ->assertJsonFragment(['compliant' => true]);
    }

    /** @test */
    public function it_can_detect_location_violation()
    {
        $locationData = [
            'latitude' => 40.7200, // Outside zone
            'longitude' => -74.0060,
            'employee_id' => $this->employee->id,
            'project_id' => $this->project->id,
        ];

        $response = $this->postJson('/api/geofences/validate-location', $locationData);

        $response->assertStatus(200)
                ->assertJsonFragment(['compliant' => false])
                ->assertJsonStructure([
                    'data' => [
                        'compliant',
                        'violations',
                        'distance_from_nearest_zone'
                    ]
                ]);

        $responseData = $response->json('data');
        $this->assertFalse($responseData['compliant']);
        $this->assertNotEmpty($responseData['violations']);
    }

    /** @test */
    public function it_can_get_geofence_statistics()
    {
        $response = $this->getJson('/api/geofences/statistics');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'data' => [
                        'total_zones',
                        'active_zones',
                        'total_entries',
                        'compliant_entries',
                        'violation_entries',
                        'compliance_rate'
                    ]
                ]);
    }

    /** @test */
    public function it_can_get_work_area_coverage()
    {
        $response = $this->getJson('/api/geofences/work-area-coverage');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'data' => [
                        '*' => [
                            'project_id',
                            'project_name',
                            'total_work_area',
                            'covered_area',
                            'coverage_percentage',
                            'zones'
                        ]
                    ]
                ]);
    }

    /** @test */
    public function it_can_filter_zones_by_project()
    {
        // Create another project and zone
        $anotherProject = Project::factory()->create();
        GeofenceZone::create([
            'name' => 'Another Zone',
            'type' => 'circular',
            'latitude' => 40.7589,
            'longitude' => -73.9851,
            'radius' => 100,
            'project_id' => $anotherProject->id,
            'is_active' => true,
            'enforce_entry' => true,
            'enforce_exit' => true,
            'monitoring_enabled' => true,
            'alert_on_violation' => true,
        ]);

        $response = $this->getJson("/api/geofences?project_id={$this->project->id}");

        $response->assertStatus(200);

        $zones = $response->json('data');
        $this->assertCount(1, $zones);
        $this->assertEquals('Test Zone', $zones[0]['name']);
    }

    /** @test */
    public function it_requires_authentication_for_protected_routes()
    {
        // Remove authentication
        $this->app['auth']->forgetGuards();

        $response = $this->getJson('/api/geofences');
        $response->assertStatus(401);

        $response = $this->postJson('/api/geofences', []);
        $response->assertStatus(401);
    }

    /** @test */
    public function it_handles_mobile_location_validation()
    {
        $locationData = [
            'latitude' => 40.7128,
            'longitude' => -74.0060,
            'accuracy' => 5,
            'timestamp' => now()->timestamp,
        ];

        $response = $this->postJson('/api/mobile/timesheets/location/validate', $locationData, [
            'X-Mobile-App' => 'TimesheetApp',
            'X-App-Version' => '1.0.0'
        ]);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'data' => [
                        'compliant',
                        'violations',
                        'nearest_zone'
                    ]
                ]);
    }

    /** @test */
    public function it_can_get_nearby_zones_for_mobile()
    {
        $response = $this->getJson('/api/mobile/timesheets/geofences/nearby?latitude=40.7128&longitude=-74.0060&radius=1000', [
            'X-Mobile-App' => 'TimesheetApp',
            'X-App-Version' => '1.0.0'
        ]);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'data' => [
                        '*' => [
                            'id',
                            'name',
                            'type',
                            'distance'
                        ]
                    ]
                ]);
    }
}
