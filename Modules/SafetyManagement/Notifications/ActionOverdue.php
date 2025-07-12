<?php

namespace Modules\SafetyManagement\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\NexmoMessage;
use Modules\SafetyManagement\Domain\Models\SafetyAction;

class ActionOverdue extends Notification implements ShouldQueue
{
    use Queueable;

    public $action;

    public function __construct(SafetyAction $action)
    {
        $this->action = $action;
    }

    public function via($notifiable)
    {
        return ['mail', 'nexmo'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Safety Action Overdue')
            ->line('A safety action is overdue.')
            ->action('View Action', url('/safety/safety-actions/' . $this->action->id));
    }

    public function toNexmo($notifiable)
    {
        return (new NexmoMessage)
            ->content('A safety action is overdue. Check dashboard.');
    }
}
