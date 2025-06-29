<?php

namespace Modules\Notifications\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Modules\Core\Http\Controllers\Controller;
use Modules\Notifications\Services\ScheduledNotificationService;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class ScheduledNotificationController extends Controller
{
    public function __construct(private ScheduledNotificationService $service) {}

    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        $list = $this->service->list($user->id);
        return response()->json(['success' => true, 'data' => $list]);
    }

    public function store(Request $request): JsonResponse
    {
        $user = Auth::user();
        $validated = $request->validate([
            'template_id' => 'required|integer|exists:notification_templates,id',
            'send_at' => 'required|date',
            'payload' => 'array',
        ]);
        $notification = $this->service->schedule($user->id, $validated['template_id'], Carbon::parse($validated['send_at']), $validated['payload'] ?? []);
        return response()->json(['success' => true, 'data' => $notification], 201);
    }

    public function cancel($id): JsonResponse
    {
        $this->service->cancel($id);
        return response()->json(['success' => true]);
    }
}
