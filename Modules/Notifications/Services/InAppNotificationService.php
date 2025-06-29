<?php

namespace Modules\Notifications\Services;

use Modules\Notifications\Domain\Models\InAppNotification;

class InAppNotificationService
{
    public function notify(int $userId, string $type, array $data): InAppNotification
    {
        return InAppNotification::create([
            'user_id' => $userId,
            'type' => $type,
            'data' => $data,
        ]);
    }

    public function markAsRead(int $id): void
    {
        $notification = InAppNotification::findOrFail($id);
        $notification->update(['read_at' => now()]);
    }

    public function clearAll(int $userId): void
    {
        InAppNotification::where('user_id', $userId)->delete();
    }
}
