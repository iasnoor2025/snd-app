<?php

namespace Modules\TimesheetManagement\Events;

use Modules\TimesheetManagement\Domain\Models\Timesheet;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class GeofenceViolationDetected implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Timesheet $timesheet;
    public array $violations;
    public string $timestamp;

    /**
     * Create a new event instance.
     */
    public function __construct(Timesheet $timesheet, array $violations)
    {
        $this->timesheet = $timesheet;
        $this->violations = $violations;
        $this->timestamp = now()->toISOString();
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('timesheet.violations.' . $this->timesheet->employee_id),
            new PrivateChannel('project.violations.' . $this->timesheet->project_id),
            new PrivateChannel('admin.violations')
        ];
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'timesheet_id' => $this->timesheet->id,
            'employee_id' => $this->timesheet->employee_id,
            'employee_name' => $this->timesheet->employee->name ?? 'Unknown',
            'project_id' => $this->timesheet->project_id,
            'project_name' => $this->timesheet->project->name ?? 'No Project',
            'date' => $this->timesheet->date,
            'location' => [
                'latitude' => $this->timesheet->start_latitude,
                'longitude' => $this->timesheet->start_longitude,
                'address' => $this->timesheet->start_address
            ],
            'violations' => $this->violations,
            'distance_from_site' => $this->timesheet->distance_from_site,
            'timestamp' => $this->timestamp,
            'severity' => $this->getSeverity()
        ];
    }

    /**
     * Get the broadcast event name.
     */
    public function broadcastAs(): string
    {
        return 'geofence.violation.detected';
    }

    /**
     * Determine the severity of violations
     */
    private function getSeverity(): string
    {
        $hasStrict = collect($this->violations)->contains('severity', 'strict');
        return $hasStrict ? 'critical' : 'warning';
    }

    /**
     * Get violation summary for notifications
     */
    public function getViolationSummary(): string
    {
        $violationCount = count($this->violations);
        $employeeName = $this->timesheet->employee->name ?? 'Unknown Employee';
        $projectName = $this->timesheet->project->name ?? 'No Project';

        if ($violationCount === 1) {
            return "Geofence violation detected for {$employeeName} on {$projectName}";
        }

        return "{$violationCount} geofence violations detected for {$employeeName} on {$projectName}";
    }

    /**
     * Get detailed violation information
     */
    public function getViolationDetails(): array
    {
        return [
            'summary' => $this->getViolationSummary(),
            'employee' => [
                'id' => $this->timesheet->employee_id,
                'name' => $this->timesheet->employee->name ?? 'Unknown'
            ],
            'project' => [
                'id' => $this->timesheet->project_id,
                'name' => $this->timesheet->project->name ?? 'No Project'
            ],
            'timesheet' => [
                'id' => $this->timesheet->id,
                'date' => $this->timesheet->date,
                'start_time' => $this->timesheet->start_time,
                'location' => [
                    'latitude' => $this->timesheet->start_latitude,
                    'longitude' => $this->timesheet->start_longitude,
                    'address' => $this->timesheet->start_address
                ]
            ],
            'violations' => $this->violations,
            'severity' => $this->getSeverity(),
            'timestamp' => $this->timestamp
        ];
    }
}
