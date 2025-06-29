<?php

namespace Modules\Notifications\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Modules\Core\Http\Controllers\Controller;
use Modules\Notifications\Services\NotificationPreferenceService;
use Illuminate\Support\Facades\Auth;

class NotificationPreferenceController extends Controller
{
    public function __construct(private NotificationPreferenceService $service) {}

    public function get(Request $request): JsonResponse
    {
        $user = Auth::user();
        $prefs = $this->service->getForUser($user->id);
        return response()->json(['success' => true, 'data' => $prefs]);
    }

    public function update(Request $request): JsonResponse
    {
        $user = Auth::user();
        $validated = $request->validate([
            'email' => 'boolean',
            'sms' => 'boolean',
            'push' => 'boolean',
            'in_app' => 'boolean',
        ]);
        $prefs = $this->service->updateForUser($user->id, $validated);
        return response()->json(['success' => true, 'data' => $prefs]);
    }
}
