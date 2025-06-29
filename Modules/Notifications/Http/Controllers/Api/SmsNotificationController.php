<?php

namespace Modules\Notifications\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Modules\Core\Http\Controllers\Controller;
use Modules\Notifications\Services\SmsNotificationService;

class SmsNotificationController extends Controller
{
    public function __construct(private SmsNotificationService $smsService) {}

    public function sendTest(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'to' => 'required|string|max:32',
            'message' => 'required|string|max:160',
        ]);
        $success = $this->smsService->send($validated['to'], $validated['message']);
        if ($success) {
            return response()->json(['success' => true, 'message' => 'Test SMS sent (mock).']);
        }
        return response()->json(['success' => false, 'message' => 'Failed to send SMS.'], 500);
    }
}
