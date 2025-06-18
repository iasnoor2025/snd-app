<?php

namespace Modules\Payroll\Http\Controllers\API;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Modules\Payroll\Http\Controllers\Controller;
use Modules\Payroll\Domain\Models\SalaryAdvance;
use Modules\Payroll\Services\SalaryAdvanceService;

class AdvanceController extends Controller
{
    protected $advanceService;

    public function __construct(SalaryAdvanceService $advanceService)
    {
        $this->advanceService = $advanceService;
    }

    /**
     * Display a listing of the resource.
     * @return Response
     */
    public function index(Request $request)
    {
        try {
            $advances = $this->advanceService->getAllAdvances($request->all());
            return response()->json([
                'success' => true,
                'data' => $advances,
                'message' => 'Salary advances retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving salary advances: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     * @param Request $request
     * @return Response
     */
    public function store(Request $request)
    {
        try {
            $advance = $this->advanceService->createAdvance($request->all());
            return response()->json([
                'success' => true,
                'data' => $advance,
                'message' => 'Salary advance created successfully'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creating salary advance: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Show the specified resource.
     * @param int $id
     * @return Response
     */
    public function show($id)
    {
        try {
            $advance = $this->advanceService->getAdvanceById($id);
            return response()->json([
                'success' => true,
                'data' => $advance,
                'message' => 'Salary advance retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving salary advance: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     * @param Request $request
     * @param int $id
     * @return Response
     */
    public function update(Request $request, $id)
    {
        try {
            $advance = $this->advanceService->updateAdvance($id, $request->all());
            return response()->json([
                'success' => true,
                'data' => $advance,
                'message' => 'Salary advance updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating salary advance: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     * @param int $id
     * @return Response
     */
    public function destroy($id)
    {
        try {
            $this->advanceService->deleteAdvance($id);
            return response()->json([
                'success' => true,
                'message' => 'Salary advance deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting salary advance: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Approve salary advance.
     * @param Request $request
     * @param int $id
     * @return Response
     */
    public function approve(Request $request, $id)
    {
        try {
            $advance = $this->advanceService->approveAdvance($id, $request->input('comments'));
            return response()->json([
                'success' => true,
                'data' => $advance,
                'message' => 'Salary advance approved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error approving salary advance: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reject salary advance.
     * @param Request $request
     * @param int $id
     * @return Response
     */
    public function reject(Request $request, $id)
    {
        try {
            $advance = $this->advanceService->rejectAdvance($id, $request->input('comments'));
            return response()->json([
                'success' => true,
                'data' => $advance,
                'message' => 'Salary advance rejected'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error rejecting salary advance: ' . $e->getMessage()
            ], 500);
        }
    }
}
