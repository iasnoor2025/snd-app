<?php

namespace Modules\TimesheetManagement\Notifications;

use Modules\TimesheetManagement\Events\GeofenceViolationDetected;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\DatabaseMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\HtmlString;

class GeofenceViolationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public GeofenceViolationDetected $violationEvent;
    public string $severity;
    public array $violationDetails;

    /**
     * Create a new notification instance.
     */
    public function __construct(GeofenceViolationDetected $violationEvent)
    {
        $this->violationEvent = $violationEvent;
        $this->violationDetails = $violationEvent->getViolationDetails();
        $this->severity = $this->violationDetails['severity'];
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        $channels = ['database'];

        // Add email for critical violations
        if ($this->severity === 'critical') {
            $channels[] = 'mail';
        }

        // Add broadcast for real-time notifications
        $channels[] = 'broadcast';

        return $channels;
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $subject = $this->severity === 'critical'
            ? '🚨 Critical Geofence Violation Alert'
            : '⚠️ Geofence Violation Notice';

        $employeeName = $this->violationDetails['employee']['name'];
        $projectName = $this->violationDetails['project']['name'];
        $date = $this->violationDetails['timesheet']['date'];
        $violationCount = count($this->violationEvent->violations);

        $mailMessage = (new MailMessage)
            ->subject($subject)
            ->greeting('Geofence Violation Detected')
            ->line("A geofence violation has been detected for employee **{$employeeName}** on project **{$projectName}**.")
            ->line("**Date:** {$date}")
            ->line("**Time:** {$this->violationDetails['timesheet']['start_time']}")
            ->line("**Violations:** {$violationCount}")
            ->line('');

        // Add violation details
        foreach ($this->violationEvent->violations as $violation) {
            $mailMessage->line("• **{$violation['zone_name']}**: {$violation['message']}");
        }

        // Add location information
        if ($this->violationDetails['timesheet']['location']['address']) {
            $mailMessage->line('')
                ->line("**Location:** {$this->violationDetails['timesheet']['location']['address']}");
        }

        $mailMessage->line("**Coordinates:** {$this->violationDetails['timesheet']['location']['latitude']}, {$this->violationDetails['timesheet']['location']['longitude']}");

        // Add action button
        $mailMessage->action('View Timesheet Details', url('/timesheets/' . $this->violationEvent->timesheet->id));

        // Add severity-specific messaging
        if ($this->severity === 'critical') {
            $mailMessage->line('')
                ->line('⚠️ **This is a critical violation that requires immediate attention.**')
                ->line('Please review the timesheet and take appropriate action.');
        } else {
            $mailMessage->line('')
                ->line('Please review this violation and follow up as necessary.');
        }

        return $mailMessage;
    }

    /**
     * Get the database representation of the notification.
     */
    public function toDatabase(object $notifiable): array
    {
        return [
            'type' => 'geofence_violation',
            'severity' => $this->severity,
            'title' => $this->getNotificationTitle(),
            'message' => $this->getNotificationMessage(),
            'timesheet_id' => $this->violationEvent->timesheet->id,
            'employee_id' => $this->violationDetails['employee']['id'],
            'employee_name' => $this->violationDetails['employee']['name'],
            'project_id' => $this->violationDetails['project']['id'],
            'project_name' => $this->violationDetails['project']['name'],
            'date' => $this->violationDetails['timesheet']['date'],
            'start_time' => $this->violationDetails['timesheet']['start_time'],
            'location' => $this->violationDetails['timesheet']['location'],
            'violations' => $this->violationEvent->violations,
            'violation_count' => count($this->violationEvent->violations),
            'timestamp' => $this->violationEvent->timestamp,
            'action_url' => url('/timesheets/' . $this->violationEvent->timesheet->id),
            'icon' => $this->severity === 'critical' ? 'exclamation-triangle' : 'map-marker-alt',
            'color' => $this->severity === 'critical' ? 'red' : 'yellow'
        ];
    }

    /**
     * Get the broadcast representation of the notification.
     */
    public function toBroadcast(object $notifiable): array
    {
        return [
            'type' => 'geofence_violation',
            'severity' => $this->severity,
            'title' => $this->getNotificationTitle(),
            'message' => $this->getNotificationMessage(),
            'timesheet_id' => $this->violationEvent->timesheet->id,
            'employee_name' => $this->violationDetails['employee']['name'],
            'project_name' => $this->violationDetails['project']['name'],
            'violation_count' => count($this->violationEvent->violations),
            'timestamp' => $this->violationEvent->timestamp,
            'action_url' => url('/timesheets/' . $this->violationEvent->timesheet->id),
            'icon' => $this->severity === 'critical' ? 'exclamation-triangle' : 'map-marker-alt',
            'color' => $this->severity === 'critical' ? 'red' : 'yellow',
            'auto_dismiss' => $this->severity !== 'critical'
        ];
    }

    /**
     * Get the notification title
     */
    private function getNotificationTitle(): string
    {
        $employeeName = $this->violationDetails['employee']['name'];

        if ($this->severity === 'critical') {
            return "Critical Geofence Violation - {$employeeName}";
        }

        return "Geofence Violation - {$employeeName}";
    }

    /**
     * Get the notification message
     */
    private function getNotificationMessage(): string
    {
        $employeeName = $this->violationDetails['employee']['name'];
        $projectName = $this->violationDetails['project']['name'];
        $violationCount = count($this->violationEvent->violations);
        $date = $this->violationDetails['timesheet']['date'];

        if ($violationCount === 1) {
            return "Employee {$employeeName} has a geofence violation on {$projectName} for {$date}.";
        }

        return "Employee {$employeeName} has {$violationCount} geofence violations on {$projectName} for {$date}.";
    }

    /**
     * Get the notification's database type.
     */
    public function databaseType(object $notifiable): string
    {
        return 'geofence_violation';
    }

    /**
     * Determine which queues should be used for each notification channel.
     */
    public function viaQueues(): array
    {
        return [
            'mail' => 'notifications',
            'database' => 'notifications',
            'broadcast' => 'broadcasts'
        ];
    }

    /**
     * Get the notification's channels with custom options.
     */
    public function shouldSend(object $notifiable, string $channel): bool
    {
        // Don't send email notifications during off-hours for non-critical violations
        if ($channel === 'mail' && $this->severity !== 'critical') {
            $hour = now()->hour;
            return $hour >= 8 && $hour <= 18; // Only during business hours
        }

        return true;
    }
}
