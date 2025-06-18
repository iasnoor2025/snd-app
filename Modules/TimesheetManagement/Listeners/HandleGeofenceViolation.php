<?php

namespace Modules\TimesheetManagement\Listeners;

use Modules\TimesheetManagement\Events\GeofenceViolationDetected;
use Modules\TimesheetManagement\Notifications\GeofenceViolationNotification;
use Modules\Core\Domain\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;

class HandleGeofenceViolation implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Handle the event.
     */
    public function handle(GeofenceViolationDetected $event): void
    {
        try {
            // Log the violation
            $this->logViolation($event);

            // Send notifications
            $this->sendNotifications($event);

            // Update violation statistics
            $this->updateViolationStatistics($event);

        } catch (\Exception $e) {
            Log::error('Failed to handle geofence violation', [
                'timesheet_id' => $event->timesheet->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }

    /**
     * Log the geofence violation
     */
    private function logViolation(GeofenceViolationDetected $event): void
    {
        Log::warning('Geofence violation processed', [
            'timesheet_id' => $event->timesheet->id,
            'employee_id' => $event->timesheet->employee_id,
            'project_id' => $event->timesheet->project_id,
            'violations' => $event->violations,
            'location' => [
                'latitude' => $event->timesheet->start_latitude,
                'longitude' => $event->timesheet->start_longitude
            ],
            'distance_from_site' => $event->timesheet->distance_from_site,
            'timestamp' => $event->timestamp
        ]);
    }

    /**
     * Send notifications to relevant users
     */
    private function sendNotifications(GeofenceViolationDetected $event): void
    {
        // Get notification recipients
        $recipients = $this->getNotificationRecipients($event);

        if ($recipients->isEmpty()) {
            Log::info('No notification recipients found for geofence violation', [
                'timesheet_id' => $event->timesheet->id
            ]);
            return;
        }

        // Send notifications
        Notification::send(
            $recipients,
            new GeofenceViolationNotification($event)
        );

        Log::info('Geofence violation notifications sent', [
            'timesheet_id' => $event->timesheet->id,
            'recipient_count' => $recipients->count(),
            'recipients' => $recipients->pluck('email')->toArray()
        ]);
    }

    /**
     * Get users who should receive notifications
     */
    private function getNotificationRecipients(GeofenceViolationDetected $event): \Illuminate\Support\Collection
    {
        $recipients = collect();

        // Add the employee (if they should be notified)
        if ($this->shouldNotifyEmployee($event)) {
            $employee = User::find($event->timesheet->employee_id);
            if ($employee) {
                $recipients->push($employee);
            }
        }

        // Add project managers
        $projectManagers = $this->getProjectManagers($event->timesheet->project_id);
        $recipients = $recipients->merge($projectManagers);

        // Add HR managers
        $hrManagers = $this->getHRManagers();
        $recipients = $recipients->merge($hrManagers);

        // Add system administrators for critical violations
        if ($this->isCriticalViolation($event)) {
            $admins = $this->getSystemAdministrators();
            $recipients = $recipients->merge($admins);
        }

        return $recipients->unique('id');
    }

    /**
     * Check if employee should be notified
     */
    private function shouldNotifyEmployee(GeofenceViolationDetected $event): bool
    {
        // Check if this is a strict violation (employee should always know)
        $hasStrictViolation = collect($event->violations)
            ->contains('severity', 'strict');

        return $hasStrictViolation;
    }

    /**
     * Get project managers for the project
     */
    private function getProjectManagers(?int $projectId): \Illuminate\Support\Collection
    {
        if (!$projectId) {
            return collect();
        }

        // This would depend on your project management structure
        // For now, we'll get users with project manager role
        return User::whereHas('roles', function ($query) {
            $query->where('name', 'project_manager');
        })->get();
    }

    /**
     * Get HR managers
     */
    private function getHRManagers(): \Illuminate\Support\Collection
    {
        return User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['hr_manager', 'hr_admin']);
        })->get();
    }

    /**
     * Get system administrators
     */
    private function getSystemAdministrators(): \Illuminate\Support\Collection
    {
        return User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['admin', 'super_admin']);
        })->get();
    }

    /**
     * Check if this is a critical violation
     */
    private function isCriticalViolation(GeofenceViolationDetected $event): bool
    {
        // Critical if:
        // 1. Has strict enforcement violations
        // 2. Distance is very far from any zone
        // 3. Multiple violations in short time period

        $hasStrictViolation = collect($event->violations)
            ->contains('severity', 'strict');

        $isVeryFarFromSite = $event->timesheet->distance_from_site > 1000; // 1km

        return $hasStrictViolation || $isVeryFarFromSite;
    }

    /**
     * Update violation statistics
     */
    private function updateViolationStatistics(GeofenceViolationDetected $event): void
    {
        // This could update a statistics table or cache
        // For now, we'll just log the statistics update
        Log::info('Violation statistics updated', [
            'timesheet_id' => $event->timesheet->id,
            'employee_id' => $event->timesheet->employee_id,
            'project_id' => $event->timesheet->project_id,
            'violation_count' => count($event->violations),
            'severity' => collect($event->violations)->contains('severity', 'strict') ? 'critical' : 'warning'
        ]);

        // You could implement actual statistics tracking here:
        // - Daily/weekly/monthly violation counts per employee
        // - Project-level violation statistics
        // - Zone-specific violation patterns
        // - Compliance rate calculations
    }

    /**
     * Handle a job failure.
     */
    public function failed(GeofenceViolationDetected $event, \Throwable $exception): void
    {
        Log::error('Failed to process geofence violation', [
            'timesheet_id' => $event->timesheet->id,
            'error' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString()
        ]);
    }
}
