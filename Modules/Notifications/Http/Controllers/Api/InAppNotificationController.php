<?php

namespace Modules\Notifications\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Modules\Core\Http\Controllers\Controller;
use Modules\Notifications\Services\InAppNotificationService;
use Modules\Notifications\Domain\Models\InAppNotification;
use Illuminate\Support\Facades\Auth;

class InAppNotificationController extends Controller
{
    public function __construct(private InAppNotificationService $service) {}

    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        $notifications = InAppNotification::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->limit(100)
            ->get();
        return response()->json(['success' => true, 'data' => $notifications]);
    }

    public function markAsRead($id): JsonResponse
    {
        $this->service->markAsRead($id);
        return response()->json(['success' => true]);
    }

    public function clearAll(Request $request): JsonResponse
    {
        $user = Auth::user();
        $this->service->clearAll($user->id);
        return response()->json(['success' => true]);
    }
}
