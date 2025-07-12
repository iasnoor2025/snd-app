<?php

namespace Modules\SafetyManagement\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\NexmoMessage;
use Modules\SafetyManagement\Domain\Models\Incident;

class IncidentReported extends Notification implements ShouldQueue
{
    use Queueable;

    public $incident;

    public function __construct(Incident $incident)
    {
        $this->incident = $incident;
    }

    public function via($notifiable)
    {
        return ['mail', 'nexmo'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('New Incident Reported')
            ->line('A new safety incident has been reported.')
            ->action('View Incident', url('/safety/incidents/' . $this->incident->id));
    }

    public function toNexmo($notifiable)
    {
        return (new NexmoMessage)
            ->content('New safety incident reported. Check dashboard.');
    }
}
