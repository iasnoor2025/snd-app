<?php

namespace Modules\Notifications\Services;

class SmsNotificationService
{
    public function send(string $to, string $message): bool
    {
        // TODO: Integrate with Twilio, Nexmo, etc.
        // For now, just mock (log or return true)
        \Log::info("Mock SMS sent to {$to}: {$message}");
        return true;
    }
}
