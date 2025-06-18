<?php

namespace Modules\TimesheetManagement\Tests\Unit;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\TimesheetManagement\Services\GeofencingService;
use Modules\TimesheetManagement\Domain\Models\GeofenceZone;
use Modules\TimesheetManagement\Domain\Models\Timesheet;
use Modules\EmployeeManagement\Domain\Models\Employee;
use Modules\ProjectManagement\Domain\Models\Project;
use Illuminate\Support\Facades\Event;
use Modules\TimesheetManagement\Events\GeofenceViolationDetected;

class GeofencingServiceTest extends TestCase
{
    use RefreshDatabase;

    protected GeofencingService $geofencingService;
    protected Employee $employee;
    protected Project $project;
    protected GeofenceZone $circularZone;
    protected GeofenceZone $polygonZone;

    protected function setUp(): void
    {
        parent::setUp();

        $this->geofencingService = app(GeofencingService::class);

        // Create test data
        $this->employee = Employee::factory()->create();
        $this->project = Project::factory()->create();

        // Create circular geofence zone
        $this->circularZone = GeofenceZone::create([
            'name' => 'Test Circular Zone',
            'type' => 'circular',
            'latitude' => 40.7128,
            'longitude' => -74.0060,
            'radius' => 100, // 100 meters
            'project_id' => $this->project->id,
            'is_active' => true,
            'enforce_entry' => true,
            'enforce_exit' => true,
            'monitoring_enabled' => true,
            'alert_on_violation' => true,
        ]);

        // Create polygon geofence zone
        $this->polygonZone = GeofenceZone::create([
            'name' => 'Test Polygon Zone',
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
        ]);
    }

    /** @test */
    public function it_can_validate_location_within_circular_zone()
    {
        // Location within the circular zone (very close to center)
        $latitude = 40.7128;
        $longitude = -74.0060;

        $result = $this->geofencingService->validateLocation(
            $latitude,
            $longitude,
            $this->employee,
            $this->project->id
        );

        $this->assertTrue($result['compliant']);
        $this->assertEmpty($result['violations']);
        $this->assertLessThan(100, $result['distance_from_nearest_zone']);
    }

    /** @test */
    public function it_can_detect_violation_outside_circular_zone()
    {
        // Location outside the circular zone
        $latitude = 40.7200; // About 800 meters north
        $longitude = -74.0060;

        $result = $this->geofencingService->validateLocation(
            $latitude,
            $longitude,
            $this->employee,
            $this->project->id
        );

        $this->assertFalse($result['compliant']);
        $this->assertNotEmpty($result['violations']);
        $this->assertGreaterThan(100, $result['distance_from_nearest_zone']);
    }

    /** @test */
    public function it_can_validate_location_within_polygon_zone()
    {
        // Location within the polygon zone
        $latitude = 40.7125;
        $longitude = -74.0060;

        $result = $this->geofencingService->validateLocation(
            $latitude,
            $longitude,
            $this->employee,
            $this->project->id
        );

        $this->assertTrue($result['compliant']);
        $this->assertEmpty($result['violations']);
    }

    /** @test */
    public function it_can_detect_violation_outside_polygon_zone()
    {
        // Location outside the polygon zone
        $latitude = 40.7100; // South of the polygon
        $longitude = -74.0060;

        $result = $this->geofencingService->validateLocation(
            $latitude,
            $longitude,
            $this->employee,
            $this->project->id
        );

        $this->assertFalse($result['compliant']);
        $this->assertNotEmpty($result['violations']);
    }

    /** @test */
    public function it_can_process_timesheet_location_and_fire_violation_event()
    {
        Event::fake();

        $timesheet = Timesheet::factory()->create([
            'employee_id' => $this->employee->id,
            'project_id' => $this->project->id,
            'latitude' => 40.7200, // Outside zone
            'longitude' => -74.0060,
        ]);

        $result = $this->geofencingService->processTimesheetLocation($timesheet);

        $this->assertFalse($result['compliant']);
        $this->assertNotEmpty($result['violations']);

        // Verify violation event was fired
        Event::assertDispatched(GeofenceViolationDetected::class);
    }

    /** @test */
    public function it_can_calculate_distance_between_coordinates()
    {
        $lat1 = 40.7128;
        $lon1 = -74.0060;
        $lat2 = 40.7200;
        $lon2 = -74.0060;

        $distance = $this->geofencingService->calculateDistance($lat1, $lon1, $lat2, $lon2);

        // Distance should be approximately 800 meters
        $this->assertGreaterThan(700, $distance);
        $this->assertLessThan(900, $distance);
    }

    /** @test */
    public function it_can_check_if_point_is_in_polygon()
    {
        $polygon = [
            ['lat' => 40.7120, 'lng' => -74.0070],
            ['lat' => 40.7130, 'lng' => -74.0070],
            ['lat' => 40.7130, 'lng' => -74.0050],
            ['lat' => 40.7120, 'lng' => -74.0050],
        ];

        // Point inside polygon
        $insideResult = $this->geofencingService->isPointInPolygon(40.7125, -74.0060, $polygon);
        $this->assertTrue($insideResult);

        // Point outside polygon
        $outsideResult = $this->geofencingService->isPointInPolygon(40.7100, -74.0060, $polygon);
        $this->assertFalse($outsideResult);
    }

    /** @test */
    public function it_can_get_geofence_statistics()
    {
        // Create some test timesheets with violations
        Timesheet::factory()->count(5)->create([
            'employee_id' => $this->employee->id,
            'project_id' => $this->project->id,
            'geofence_status' => 'violation',
            'geofence_violations' => ['outside_zone'],
        ]);

        Timesheet::factory()->count(10)->create([
            'employee_id' => $this->employee->id,
            'project_id' => $this->project->id,
            'geofence_status' => 'compliant',
        ]);

        $stats = $this->geofencingService->getGeofenceStatistics();

        $this->assertArrayHasKey('total_entries', $stats);
        $this->assertArrayHasKey('compliant_entries', $stats);
        $this->assertArrayHasKey('violation_entries', $stats);
        $this->assertArrayHasKey('compliance_rate', $stats);

        $this->assertEquals(15, $stats['total_entries']);
        $this->assertEquals(10, $stats['compliant_entries']);
        $this->assertEquals(5, $stats['violation_entries']);
        $this->assertEquals(66.67, $stats['compliance_rate']);
    }

    /** @test */
    public function it_respects_inactive_zones()
    {
        // Deactivate the zone
        $this->circularZone->update(['is_active' => false]);

        // Location that would normally be outside the zone
        $latitude = 40.7200;
        $longitude = -74.0060;

        $result = $this->geofencingService->validateLocation(
            $latitude,
            $longitude,
            $this->employee,
            $this->project->id
        );

        // Should be compliant because zone is inactive
        $this->assertTrue($result['compliant']);
        $this->assertEmpty($result['violations']);
    }

    /** @test */
    public function it_handles_time_restrictions()
    {
        // Update zone with time restrictions (only active during business hours)
        $this->circularZone->update([
            'time_restrictions' => [
                'start_time' => '09:00',
                'end_time' => '17:00',
                'days_of_week' => [1, 2, 3, 4, 5], // Monday to Friday
            ],
        ]);

        // Mock current time to be outside business hours
        $this->travelTo(now()->setTime(20, 0)); // 8 PM

        // Location outside zone
        $latitude = 40.7200;
        $longitude = -74.0060;

        $result = $this->geofencingService->validateLocation(
            $latitude,
            $longitude,
            $this->employee,
            $this->project->id
        );

        // Should be compliant because it's outside business hours
        $this->assertTrue($result['compliant']);
    }

    /** @test */
    public function it_can_find_nearest_zone()
    {
        $latitude = 40.7150; // Between the two zones
        $longitude = -74.0060;

        $nearestZone = $this->geofencingService->findNearestZone(
            $latitude,
            $longitude,
            $this->project->id
        );

        $this->assertNotNull($nearestZone);
        $this->assertArrayHasKey('zone', $nearestZone);
        $this->assertArrayHasKey('distance', $nearestZone);
        $this->assertInstanceOf(GeofenceZone::class, $nearestZone['zone']);
    }
}
