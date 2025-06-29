<?php

namespace Modules\Notifications\Services;

use Modules\Notifications\Domain\Models\NotificationPreference;

class NotificationPreferenceService
{
    public function getForUser(int $userId): array
    {
        $pref = NotificationPreference::where('user_id', $userId)->first();
        return $pref ? $pref->preferences : [
            'email' => true,
            'sms' => false,
            'push' => true,
            'in_app' => true,
        ];
    }

    public function updateForUser(int $userId, array $preferences): array
    {
        $pref = NotificationPreference::updateOrCreate(
            ['user_id' => $userId],
            ['preferences' => $preferences]
        );
        return $pref->preferences;
    }
}
