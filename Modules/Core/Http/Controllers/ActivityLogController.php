<?php

namespace Modules\Core\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Modules\Core\Domain\Models\ActivityLog;
use Illuminate\Routing\Controller;

class ActivityLogController extends Controller
{
    public function index(): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }
        $logs = ActivityLog::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->limit(100)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'user' => $log->user ? $log->user->name : 'You',
                    'action' => $log->action ?? ($log->description ?? ''),
                    'time' => $log->created_at ? $log->created_at->toIso8601String() : null,
                ];
            });
        return response()->json(['success' => true, 'data' => $logs]);
    }
}
