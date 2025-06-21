<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Logout;

class UpdateUserLogoutStatus
{
    /**
     * Handle the event.
     */
    public function handle(Logout $event): void
    {
        if ($event->user) {
            $event->user->update([
                'is_active' => false
            ]);
        }
    }
} 