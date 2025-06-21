<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Login;

class UpdateUserLoginStatus
{
    /**
     * Handle the event.
     */
    public function handle(Login $event): void
    {
        $user = $event->user;
        
        $user->update([
            'last_login_at' => now(),
            'is_active' => true
        ]);
    }
} 