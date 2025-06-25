<?php

namespace Modules\EquipmentManagement\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Modules\EquipmentManagement\Models\MaintenanceSchedule;

class MaintenanceDueNotification extends Notification
{
    use Queueable;

    protected MaintenanceSchedule $schedule;

    public function __construct(MaintenanceSchedule $schedule)
    {
        $this->schedule = $schedule;
    }

    public function via($notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable): MailMessage
    {
        $equipment = $this->schedule->equipment;
        $daysUntilDue = now()->diffInDays($this->schedule->next_due_date, false);
        $status = $daysUntilDue < 0 ? 'overdue' : 'upcoming';

        return (new MailMessage)
            ->subject("Equipment Maintenance {$status} - {$equipment->name}")
            ->line("This is a reminder about {$status} maintenance for equipment: {$equipment->name}")
            ->line("Maintenance Type: {$this->schedule->type}")
            ->line("Description: {$this->schedule->description}")
            ->line($daysUntilDue < 0
                ? "This maintenance is overdue by " . abs($daysUntilDue) . " days"
                : "This maintenance is due in {$daysUntilDue} days")
            ->line("Estimated Duration: {$this->schedule->estimated_duration} minutes")
            ->line("Estimated Cost: $" . number_format($this->schedule->estimated_cost, 2))
            ->action('View Equipment', url("/equipment/{$equipment->id}"))
            ->line('Please ensure this maintenance is scheduled and completed on time.');
    }

    public function toArray($notifiable): array
    {
        $equipment = $this->schedule->equipment;
        $daysUntilDue = now()->diffInDays($this->schedule->next_due_date, false);

        return [
            'equipment_id' => $equipment->id,
            'equipment_name' => $equipment->name,
            'maintenance_type' => $this->schedule->type,
            'description' => $this->schedule->description,
            'days_until_due' => $daysUntilDue,
            'estimated_duration' => $this->schedule->estimated_duration,
            'estimated_cost' => $this->schedule->estimated_cost,
            'priority' => $this->schedule->priority,
            'status' => $daysUntilDue < 0 ? 'overdue' : 'upcoming',
            'next_due_date' => $this->schedule->next_due_date->toDateTimeString(),
        ];
    }
} 