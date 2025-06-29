<?php

namespace Modules\PayrollManagement\Http\Controllers\API;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Modules\PayrollManagement\Http\Controllers\Controller;
use Modules\PayrollManagement\Domain\Models\FinalSettlement;
use Modules\PayrollManagement\Services\FinalSettlementService;

class SettlementController extends Controller
{
    protected $settlementService;

    public function __construct(FinalSettlementService $settlementService)
    {
        $this->settlementService = $settlementService;
    }

    /**
     * Display a listing of the resource.
     * @return Response
     */
    public function index(Request $request)
    {
        try {
            $settlements = $this->settlementService->getAllSettlements($request->all());
            return response()->json([
                'success' => true,
                'data' => $settlements,
                'message' => 'Final settlements retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving final settlements: ' . $e->getMessage()
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
            $settlement = $this->settlementService->createSettlement($request->all());
            return response()->json([
                'success' => true,
                'data' => $settlement,
                'message' => 'Final settlement created successfully'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creating final settlement: ' . $e->getMessage()
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
            $settlement = $this->settlementService->getSettlementById($id);
            return response()->json([
                'success' => true,
                'data' => $settlement,
                'message' => 'Final settlement retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving final settlement: ' . $e->getMessage()
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
            $settlement = $this->settlementService->updateSettlement($id, $request->all());
            return response()->json([
                'success' => true,
                'data' => $settlement,
                'message' => 'Final settlement updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating final settlement: ' . $e->getMessage()
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
            $this->settlementService->deleteSettlement($id);
            return response()->json([
                'success' => true,
                'message' => 'Final settlement deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting final settlement: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Calculate final settlement amount.
     * @param Request $request
     * @return Response
     */
    public function calculate(Request $request)
    {
        try {
            $calculation = $this->settlementService->calculateSettlement($request->all());
            return response()->json([
                'success' => true,
                'data' => $calculation,
                'message' => 'Final settlement calculated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error calculating final settlement: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Process final settlement.
     * @param Request $request
     * @param int $id
     * @return Response
     */
    public function process(Request $request, $id)
    {
        try {
            $settlement = $this->settlementService->processSettlement($id);
            return response()->json([
                'success' => true,
                'data' => $settlement,
                'message' => 'Final settlement processed successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error processing final settlement: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate settlement document.
     * @param Request $request
     * @param int $id
     * @return Response
     */
    public function generateDocument(Request $request, $id)
    {
        try {
            $document = $this->settlementService->generateDocument($id);
            return response()->json([
                'success' => true,
                'data' => $document,
                'message' => 'Settlement document generated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error generating settlement document: ' . $e->getMessage()
            ], 500);
        }
    }
}
