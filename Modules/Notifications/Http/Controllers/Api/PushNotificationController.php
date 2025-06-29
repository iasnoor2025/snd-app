<?php

namespace Modules\Notifications\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Modules\Core\Http\Controllers\Controller;
use Modules\Notifications\Domain\Models\DevicePushToken;
use Illuminate\Support\Facades\Auth;

class PushNotificationController extends Controller
{
    public function registerToken(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'token' => 'required|string|max:255',
            'platform' => 'required|string|max:32',
        ]);
        $user = Auth::user();
        $token = DevicePushToken::updateOrCreate(
            ['token' => $validated['token']],
            [
                'user_id' => $user->id,
                'platform' => $validated['platform'],
                'last_active_at' => now(),
            ]
        );
        return response()->json(['success' => true, 'data' => $token]);
    }

    public function sendTest(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'token' => 'required|string|max:255',
            'title' => 'required|string|max:255',
            'body' => 'required|string|max:1024',
        ]);
        // TODO: Integrate with FCM or push provider here
        // For now, just return success
        return response()->json(['success' => true, 'message' => 'Test push sent (mock).']);
    }
}
