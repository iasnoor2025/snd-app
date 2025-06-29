<?php

namespace Modules\Core\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Modules\Core\Services\DeviceSessionService;
use Modules\Core\Domain\Models\DeviceSession;

class DeviceSessionController extends Controller
{
    public function __construct(private DeviceSessionService $sessionService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $sessions = $this->sessionService->getActiveSessions($request->user());

        return response()->json([
            'data' => $sessions,
        ]);
    }

    public function revoke(Request $request): JsonResponse
    {
        $request->validate([
            'session_id' => 'required|string',
        ]);

        $session = $request->user()->deviceSessions()
            ->where('session_id', $request->input('session_id'))
            ->firstOrFail();

        if ($session->session_id === session()->getId()) {
            return response()->json([
                'message' => 'Cannot revoke current session',
            ], 422);
        }

        $this->sessionService->revokeSession($session);

        return response()->json([
            'message' => 'Session revoked successfully',
        ]);
    }

    public function revokeAll(Request $request): JsonResponse
    {
        $this->sessionService->revokeAllSessionsExceptCurrent($request->user());

        return response()->json([
            'message' => 'All other sessions revoked successfully',
        ]);
    }

    public function current(Request $request): JsonResponse
    {
        $session = $this->sessionService->getCurrentSession($request->user());

        if (!$session) {
            return response()->json([
                'message' => 'No active session found',
            ], 404);
        }

        return response()->json([
            'data' => $session->device_info,
        ]);
    }
} 