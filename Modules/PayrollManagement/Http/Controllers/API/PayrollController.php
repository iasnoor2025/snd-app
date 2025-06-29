<?php

namespace Modules\PayrollManagement\Http\Controllers\API;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Modules\PayrollManagement\Http\Controllers\Controller;
use Modules\PayrollManagement\Domain\Models\Payroll;
use Modules\PayrollManagement\Services\PayrollService;

class PayrollController extends Controller
{
    protected $payrollService;

    public function __construct(PayrollService $payrollService)
    {
        $this->payrollService = $payrollService;
    }

    /**
     * Display a listing of the resource.
     * @return Response
     */
    public function index(Request $request)
    {
        try {
            $payrolls = $this->payrollService->getAllPayrolls($request->all());
            return response()->json([
                'success' => true,
                'data' => $payrolls,
                'message' => 'Payrolls retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving payrolls: ' . $e->getMessage()
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
            $payroll = $this->payrollService->createPayroll($request->all());
            return response()->json([
                'success' => true,
                'data' => $payroll,
                'message' => 'Payroll created successfully'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creating payroll: ' . $e->getMessage()
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
            $payroll = $this->payrollService->getPayrollById($id);
            return response()->json([
                'success' => true,
                'data' => $payroll,
                'message' => 'Payroll retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving payroll: ' . $e->getMessage()
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
            $payroll = $this->payrollService->updatePayroll($id, $request->all());
            return response()->json([
                'success' => true,
                'data' => $payroll,
                'message' => 'Payroll updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating payroll: ' . $e->getMessage()
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
            $this->payrollService->deletePayroll($id);
            return response()->json([
                'success' => true,
                'message' => 'Payroll deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting payroll: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Process payroll for a specific period.
     * @param Request $request
     * @return Response
     */
    public function process(Request $request)
    {
        try {
            $result = $this->payrollService->processPayroll($request->all());
            return response()->json([
                'success' => true,
                'data' => $result,
                'message' => 'Payroll processed successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error processing payroll: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate payroll report.
     * @param Request $request
     * @return Response
     */
    public function report(Request $request)
    {
        try {
            $report = $this->payrollService->generateReport($request->all());
            return response()->json([
                'success' => true,
                'data' => $report,
                'message' => 'Payroll report generated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error generating payroll report: ' . $e->getMessage()
            ], 500);
        }
    }
}
