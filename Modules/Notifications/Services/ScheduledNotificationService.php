<?php

namespace Modules\Notifications\Services;

use Modules\Notifications\Domain\Models\ScheduledNotification;
use Carbon\Carbon;

class ScheduledNotificationService
{
    public function schedule(?int $userId, int $templateId, Carbon $sendAt, array $payload): ScheduledNotification
    {
        return ScheduledNotification::create([
            'user_id' => $userId,
            'template_id' => $templateId,
            'send_at' => $sendAt,
            'status' => 'pending',
            'payload' => $payload,
        ]);
    }

    public function list(?int $userId = null)
    {
        $query = ScheduledNotification::query();
        if ($userId) {
            $query->where('user_id', $userId);
        }
        return $query->orderByDesc('send_at')->get();
    }

    public function cancel(int $id): void
    {
        $notification = ScheduledNotification::findOrFail($id);
        $notification->update(['status' => 'cancelled']);
    }

    public function processDue(): void
    {
        $now = Carbon::now();
        $due = ScheduledNotification::where('status', 'pending')
            ->where('send_at', '<=', $now)
            ->get();
        foreach ($due as $notification) {
            // TODO: Actually send notification using template and payload
            $notification->update(['status' => 'sent']);
        }
    }
}
