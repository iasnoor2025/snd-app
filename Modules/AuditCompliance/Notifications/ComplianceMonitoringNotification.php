<?php

namespace Modules\AuditCompliance\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\URL;
use Carbon\Carbon;

class ComplianceMonitoringNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected array $data;

    /**
     * Create a new notification instance.
     */
    public function __construct(array $data)
    {
        $this->data = $data;
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $summary = $this->data['summary'];
        $issues = $this->data['issues'];
        $notifications = $this->data['notifications'];

        $subject = $this->getEmailSubject($summary);
        $greeting = $this->getEmailGreeting($summary);

        $mail = (new MailMessage)
            ->subject($subject)
            ->greeting($greeting)
            ->line('This is an automated compliance monitoring report.');

        // Add summary information
        if ($summary['total_issues'] > 0) {
            $mail->line("**Issues Found:** {$summary['total_issues']} total issues")
                 ->line("- High severity: {$summary['high_severity_issues']}")
                 ->line("- Overdue GDPR requests: {$summary['overdue_requests']}")
                 ->line("- Expired consents: {$summary['expired_consents']}");
        }

        // Add detailed issues
        if (!empty($issues)) {
            $mail->line('## Issues Requiring Attention:');

            foreach (array_slice($issues, 0, 10) as $issue) { // Limit to first 10 issues
                $severity = strtoupper($issue['severity'] ?? 'MEDIUM');
                $mail->line("**[{$severity}]** {$issue['message']}");
            }

            if (count($issues) > 10) {
                $remaining = count($issues) - 10;
                $mail->line("... and {$remaining} more issues.");
            }
        }

        // Add notifications/updates
        if (!empty($notifications)) {
            $mail->line('## System Updates:');

            foreach ($notifications as $notification) {
                $mail->line("- {$notification['message']}");
            }
        }

        // Add action buttons
        $mail->action('View Compliance Dashboard', $this->getDashboardUrl())
             ->line('Please review and take appropriate action on any issues listed above.');

        if ($summary['total_issues'] > 0) {
            $mail->line('**Important:** Some issues may require immediate attention to maintain compliance.');
        }

        return $mail;
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'compliance_monitoring',
            'title' => $this->getNotificationTitle(),
            'message' => $this->getNotificationMessage(),
            'summary' => $this->data['summary'],
            'issues_count' => count($this->data['issues']),
            'high_priority_issues' => $this->getHighPriorityIssues(),
            'timestamp' => $this->data['timestamp']->toISOString(),
            'dashboard_url' => $this->getDashboardUrl(),
        ];
    }

    /**
     * Get email subject based on severity.
     */
    protected function getEmailSubject(array $summary): string
    {
        if ($summary['high_severity_issues'] > 0) {
            return '[URGENT] Compliance Issues Require Immediate Attention';
        }

        if ($summary['total_issues'] > 0) {
            return '[COMPLIANCE] Issues Found - Action Required';
        }

        return '[COMPLIANCE] Daily Monitoring Report';
    }

    /**
     * Get email greeting based on severity.
     */
    protected function getEmailGreeting(array $summary): string
    {
        if ($summary['high_severity_issues'] > 0) {
            return 'Urgent Compliance Alert!';
        }

        if ($summary['total_issues'] > 0) {
            return 'Compliance Issues Detected';
        }

        return 'Compliance Monitoring Report';
    }

    /**
     * Get notification title for database storage.
     */
    protected function getNotificationTitle(): string
    {
        $summary = $this->data['summary'];

        if ($summary['high_severity_issues'] > 0) {
            return 'Urgent Compliance Issues';
        }

        if ($summary['total_issues'] > 0) {
            return 'Compliance Issues Found';
        }

        return 'Compliance Monitoring Update';
    }

    /**
     * Get notification message for database storage.
     */
    protected function getNotificationMessage(): string
    {
        $summary = $this->data['summary'];

        if ($summary['total_issues'] === 0) {
            return 'Compliance monitoring completed successfully with no issues found.';
        }

        $parts = [];

        if ($summary['overdue_requests'] > 0) {
            $parts[] = "{$summary['overdue_requests']} overdue GDPR request(s)";
        }

        if ($summary['expired_consents'] > 0) {
            $parts[] = "{$summary['expired_consents']} expired consent(s)";
        }

        $issueText = implode(', ', $parts);

        if ($summary['high_severity_issues'] > 0) {
            return "Found {$summary['total_issues']} compliance issues including {$summary['high_severity_issues']} high-priority items: {$issueText}";
        }

        return "Found {$summary['total_issues']} compliance issues: {$issueText}";
    }

    /**
     * Get high priority issues for quick reference.
     */
    protected function getHighPriorityIssues(): array
    {
        return array_filter($this->data['issues'], function ($issue) {
            return ($issue['severity'] ?? 'low') === 'high';
        });
    }

    /**
     * Get dashboard URL.
     */
    protected function getDashboardUrl(): string
    {
        return URL::route('audit-compliance.gdpr.dashboard');
    }

    /**
     * Determine if the notification should be sent.
     */
    public function shouldSend(object $notifiable): bool
    {
        // Always send if there are issues
        if ($this->data['summary']['total_issues'] > 0) {
            return true;
        }

        // Send daily summary if configured (you can add user preferences here)
        return true;
    }

    /**
     * Get the notification's database type.
     */
    public function databaseType(object $notifiable): string
    {
        return 'compliance_monitoring';
    }

    /**
     * Get the tags that should be assigned to the queued notification job.
     */
    public function tags(): array
    {
        $tags = ['compliance', 'notification'];

        if ($this->data['summary']['high_severity_issues'] > 0) {
            $tags[] = 'urgent';
        }

        return $tags;
    }

    /**
     * Determine the time at which the notification job should timeout.
     */
    public function retryUntil(): \DateTime
    {
        return now()->addMinutes(30);
    }

    /**
     * Calculate the number of seconds to wait before retrying the job.
     */
    public function backoff(): array
    {
        return [30, 60, 120]; // 30 seconds, 1 minute, 2 minutes
    }
}
