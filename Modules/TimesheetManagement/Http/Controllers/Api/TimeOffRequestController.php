<?php

namespace Modules\TimesheetManagement\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Modules\TimesheetManagement\Domain\Models\TimeOffRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;

class TimeOffRequestController extends Controller
{
    public function index(Request $request)
    {
        $query = TimeOffRequest::with('employee');
        if ($request->has('employee_id')) {
            $query->where('employee_id', $request->input('employee_id'));
        }
        return response()->json($query->latest()->paginate(20));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'type' => 'required|string',
            'reason' => 'nullable|string',
        ]);
        $data['status'] = 'pending';
        $requestObj = TimeOffRequest::create($data);
        return response()->json($requestObj, 201);
    }

    public function show($id)
    {
        $requestObj = TimeOffRequest::with('employee')->findOrFail($id);
        return response()->json($requestObj);
    }

    public function approve($id)
    {
        $requestObj = TimeOffRequest::findOrFail($id);
        Gate::authorize('approve', $requestObj);
        $requestObj->status = 'approved';
        $requestObj->approved_by = Auth::id();
        $requestObj->approved_at = now();
        $requestObj->save();
        return response()->json($requestObj);
    }

    public function reject(Request $request, $id)
    {
        $requestObj = TimeOffRequest::findOrFail($id);
        Gate::authorize('approve', $requestObj);
        $data = $request->validate([
            'rejection_reason' => 'required|string',
        ]);
        $requestObj->status = 'rejected';
        $requestObj->rejected_by = Auth::id();
        $requestObj->rejected_at = now();
        $requestObj->rejection_reason = $data['rejection_reason'];
        $requestObj->save();
        return response()->json($requestObj);
    }
}
