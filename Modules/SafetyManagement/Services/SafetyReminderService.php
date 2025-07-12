<?php

namespace Modules\SafetyManagement\Services;

use Modules\SafetyManagement\Domain\Models\Inspection;
use Modules\SafetyManagement\Domain\Models\Incident;
use Modules\SafetyManagement\Domain\Models\TrainingRecord;
use Modules\SafetyManagement\Domain\Models\SafetyAction;
use Modules\SafetyManagement\Notifications\ActionOverdue;
use Modules\SafetyManagement\Notifications\IncidentReported;
use Modules\SafetyManagement\Notifications\TrainingExpiryReminder;
use Illuminate\Support\Facades\Notification;
use Carbon\Carbon;

class SafetyReminderService
{
    public static function dispatchReminders()
    {
        // Overdue Inspections
        $overdueInspections = Inspection::where('status', 'overdue')->get();
        foreach ($overdueInspections as $inspection) {
            // Notify responsible users (stub)
        }

        // Unclosed Incidents older than 7 days
        $unclosedIncidents = Incident::where('status', '!=', 'closed')
            ->where('date', '<', Carbon::now()->subDays(7))->get();
        foreach ($unclosedIncidents as $incident) {
            Notification::send($incident->user, new IncidentReported($incident));
        }

        // Expired Certifications
        $expiredCerts = TrainingRecord::where('expiry_date', '<', Carbon::now())->get();
        foreach ($expiredCerts as $record) {
            foreach ($record->users as $user) {
                Notification::send($user, new TrainingExpiryReminder($record));
            }
        }

        // Overdue Actions
        $overdueActions = SafetyAction::where('status', 'overdue')->get();
        foreach ($overdueActions as $action) {
            Notification::send($action->assignedTo, new ActionOverdue($action));
        }
    }
}
