<?php

namespace Modules\AuditCompliance\Http\Controllers;

use Illuminate\Contracts\Support\Renderable;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Inertia\Inertia;
use Modules\AuditCompliance\Domain\Models\AuditLog;
use Modules\AuditCompliance\Http\Requests\IndexAuditLogRequest;

class AuditLogController extends Controller
{
    /**
     * Display a listing of the audit logs.
     *
     * @param IndexAuditLogRequest $request
     * @return Renderable;
     */
    public function index(IndexAuditLogRequest $request)
    {
        $query = AuditLog::with('user')
            ->latest();

        // Filter by user
        if ($request->has('user_id') && $request->user_id) {
            $query->fromUser($request->user_id);
        }

        // Filter by event
        if ($request->has('event') && $request->event) {
            $query->where('event', $request->event);
        }

        // Filter by model type
        if ($request->has('model_type') && $request->model_type) {
            $query->where('auditable_type', $request->model_type);
        }

        // Filter by model ID
        if ($request->has('model_id') && $request->model_id) {
            $query->where('auditable_id', $request->model_id);
        }

        // Filter by date range
        if ($request->has('from_date') && $request->from_date) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }

        if ($request->has('to_date') && $request->to_date) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        // Filter by tags
        if ($request->has('tags') && is_array($request->tags) && !empty($request->tags)) {
            $query->withTags($request->tags);
        }

        $logs = $query->paginate(20)
            ->appends($request->all());

        // Get unique event types for filter dropdown
        $eventTypes = AuditLog::select('event')
            ->distinct()
            ->pluck('event');

        // Get unique model types for filter dropdown
        $modelTypes = AuditLog::select('auditable_type')
            ->distinct()
            ->pluck('auditable_type');

        return Inertia::render('AuditCompliance::Index', [
            'logs' => $logs,
            'filters' => $request->all(),
            'eventTypes' => $eventTypes,
            'modelTypes' => $modelTypes,
        ]);
    }

    /**
     * Display the specified audit log.
     *
     * @param AuditLog $auditLog
     * @return Renderable;
     */
    public function show(AuditLog $auditLog)
    {
        $auditLog->load('user');

        return Inertia::render('AuditCompliance::Show', [
            'log' => $auditLog
        ]);
    }
}


