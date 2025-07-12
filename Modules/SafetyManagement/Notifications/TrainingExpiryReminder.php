<?php

namespace Modules\SafetyManagement\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\NexmoMessage;
use Modules\SafetyManagement\Domain\Models\TrainingRecord;

class TrainingExpiryReminder extends Notification implements ShouldQueue
{
    use Queueable;

    public $record;

    public function __construct(TrainingRecord $record)
    {
        $this->record = $record;
    }

    public function via($notifiable)
    {
        return ['mail', 'nexmo'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Training Certification Expiry Reminder')
            ->line('A training certification is about to expire.')
            ->action('View Record', url('/safety/training-records/' . $this->record->id));
    }

    public function toNexmo($notifiable)
    {
        return (new NexmoMessage)
            ->content('A training certification is about to expire. Check dashboard.');
    }
}
