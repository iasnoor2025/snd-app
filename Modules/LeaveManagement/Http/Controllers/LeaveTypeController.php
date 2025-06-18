<?php

namespace Modules\LeaveManagement\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Inertia\Inertia;
use Modules\LeaveManagement\Domain\Entities\LeaveType;
use Modules\LeaveManagement\Http\Requests\LeaveTypeRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class LeaveTypeController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:leave-types.view')->only(['index', 'show']);
        $this->middleware('permission:leave-types.create')->only(['create', 'store']);
        $this->middleware('permission:leave-types.edit')->only(['edit', 'update']);
        $this->middleware('permission:leave-types.delete')->only(['destroy']);
    }

    /**
     * Display a listing of leave types.
     */
    public function index(Request $request)
    {
        $query = LeaveType::query();

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('is_active', $request->get('status') === 'active');
        }

        // Sort
        $sortBy = $request->get('sort_by', 'name');
        $sortOrder = $request->get('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        $leaveTypes = $query->paginate(15)->withQueryString();

        return Inertia::render('LeaveManagement/LeaveTypes/Index', [
            'leaveTypes' => $leaveTypes,
            'filters' => $request->only(['search', 'status', 'sort_by', 'sort_order']),
        ]);
    }

    /**
     * Show the form for creating a new leave type.
     */
    public function create()
    {
        return Inertia::render('LeaveManagement/LeaveTypes/Create');
    }

    /**
     * Store a newly created leave type.
     */
    public function store(LeaveTypeRequest $request)
    {
        try {
            DB::beginTransaction();

            $leaveType = LeaveType::create([
                'name' => $request->name,
                'description' => $request->description,
                'max_days_per_year' => $request->max_days_per_year,
                'requires_approval' => $request->boolean('requires_approval'),
                'is_paid' => $request->boolean('is_paid'),
                'is_active' => $request->boolean('is_active', true),
                'carry_forward' => $request->boolean('carry_forward'),
                'max_carry_forward_days' => $request->max_carry_forward_days,
                'notice_days_required' => $request->notice_days_required,
                'gender_specific' => $request->gender_specific,
                'applicable_after_months' => $request->applicable_after_months,
            ]);

            DB::commit();

            return redirect()
                ->route('leaves.types.index')
                ->with('success', 'Leave type created successfully.');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating leave type: ' . $e->getMessage());

            return back()
                ->withInput()
                ->with('error', 'Failed to create leave type. Please try again.');
        }
    }

    /**
     * Display the specified leave type.
     */
    public function show(LeaveType $leaveType)
    {
        $leaveType->load(['leaves' => function ($query) {
            $query->with('employee')
                  ->latest()
                  ->take(10);
        }]);

        // Get statistics
        $stats = [
            'total_requests' => $leaveType->leaves()->count(),
            'approved_requests' => $leaveType->leaves()->where('status', 'approved')->count(),
            'pending_requests' => $leaveType->leaves()->where('status', 'pending')->count(),
            'rejected_requests' => $leaveType->leaves()->where('status', 'rejected')->count(),
            'total_days_used' => $leaveType->leaves()
                ->where('status', 'approved')
                ->get()
                ->sum(function ($leave) {
                    return $leave->calculateLeaveDays();
                }),
        ];

        return Inertia::render('LeaveManagement/LeaveTypes/Show', [
            'leaveType' => $leaveType,
            'stats' => $stats,
        ]);
    }

    /**
     * Show the form for editing the specified leave type.
     */
    public function edit(LeaveType $leaveType)
    {
        return Inertia::render('LeaveManagement/LeaveTypes/Edit', [
            'leaveType' => $leaveType,
        ]);
    }

    /**
     * Update the specified leave type.
     */
    public function update(LeaveTypeRequest $request, LeaveType $leaveType)
    {
        try {
            DB::beginTransaction();

            $leaveType->update([
                'name' => $request->name,
                'description' => $request->description,
                'max_days_per_year' => $request->max_days_per_year,
                'requires_approval' => $request->boolean('requires_approval'),
                'is_paid' => $request->boolean('is_paid'),
                'is_active' => $request->boolean('is_active'),
                'carry_forward' => $request->boolean('carry_forward'),
                'max_carry_forward_days' => $request->max_carry_forward_days,
                'notice_days_required' => $request->notice_days_required,
                'gender_specific' => $request->gender_specific,
                'applicable_after_months' => $request->applicable_after_months,
            ]);

            DB::commit();

            return redirect()
                ->route('leaves.types.index')
                ->with('success', 'Leave type updated successfully.');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating leave type: ' . $e->getMessage());

            return back()
                ->withInput()
                ->with('error', 'Failed to update leave type. Please try again.');
        }
    }

    /**
     * Remove the specified leave type.
     */
    public function destroy(LeaveType $leaveType)
    {
        try {
            // Check if leave type has associated leave requests
            if ($leaveType->leaves()->exists()) {
                return back()->with('error', 'Cannot delete leave type that has associated leave requests.');
            }

            DB::beginTransaction();

            $leaveType->delete();

            DB::commit();

            return redirect()
                ->route('leaves.types.index')
                ->with('success', 'Leave type deleted successfully.');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error deleting leave type: ' . $e->getMessage());

            return back()->with('error', 'Failed to delete leave type. Please try again.');
        }
    }

    /**
     * Toggle the active status of a leave type.
     */
    public function toggleStatus(LeaveType $leaveType)
    {
        try {
            $leaveType->update([
                'is_active' => !$leaveType->is_active
            ]);

            $status = $leaveType->is_active ? 'activated' : 'deactivated';

            return back()->with('success', "Leave type {$status} successfully.");

        } catch (\Exception $e) {
            Log::error('Error toggling leave type status: ' . $e->getMessage());

            return back()->with('error', 'Failed to update leave type status.');
        }
    }
}
