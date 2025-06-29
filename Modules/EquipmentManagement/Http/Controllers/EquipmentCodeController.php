<?php

namespace Modules\EquipmentManagement\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Modules\EquipmentManagement\Domain\Models\Equipment;
use Modules\EquipmentManagement\Domain\Models\EquipmentCode;
use Modules\EquipmentManagement\Services\EquipmentCodeService;

class EquipmentCodeController extends Controller
{
    public function __construct(private EquipmentCodeService $equipmentCodeService)
    {
    }

    public function index(Equipment $equipment): JsonResponse
    {
        $this->authorize('view', $equipment);

        return response()->json([
            'data' => $this->equipmentCodeService->getEquipmentCodes($equipment),
        ]);
    }

    public function generateQr(Request $request, Equipment $equipment): JsonResponse
    {
        $this->authorize('update', $equipment);

        $request->validate([
            'is_primary' => 'boolean',
        ]);

        $code = $this->equipmentCodeService->generateQrCode(
            $equipment,
            $request->input('is_primary', false)
        );

        return response()->json([
            'message' => 'QR code generated successfully',
            'data' => [
                'id' => $code->id,
                'type' => $code->code_type,
                'value' => $code->code_value,
                'is_primary' => $code->is_primary,
                'qr_url' => $code->generateQrCode(),
            ],
        ], 201);
    }

    public function generateBarcode(Request $request, Equipment $equipment): JsonResponse
    {
        $this->authorize('update', $equipment);

        $request->validate([
            'is_primary' => 'boolean',
        ]);

        $code = $this->equipmentCodeService->generateBarcode(
            $equipment,
            $request->input('is_primary', false)
        );

        return response()->json([
            'message' => 'Barcode generated successfully',
            'data' => [
                'id' => $code->id,
                'type' => $code->code_type,
                'value' => $code->code_value,
                'is_primary' => $code->is_primary,
                'barcode_value' => $code->generateBarcode(),
            ],
        ], 201);
    }

    public function scan(Request $request): JsonResponse
    {
        $request->validate([
            'code' => 'required|string',
        ]);

        $code = $this->equipmentCodeService->scanCode($request->input('code'));

        if (!$code) {
            return response()->json([
                'message' => 'Invalid code',
            ], 404);
        }

        $this->authorize('view', $code->equipment);

        return response()->json([
            'message' => 'Code scanned successfully',
            'data' => [
                'equipment' => $code->equipment,
                'scan_time' => $code->last_scanned_at,
            ],
        ]);
    }

    public function setPrimary(EquipmentCode $code): JsonResponse
    {
        $this->authorize('update', $code->equipment);

        $this->equipmentCodeService->setPrimaryCode($code);

        return response()->json([
            'message' => 'Primary code set successfully',
        ]);
    }

    public function destroy(EquipmentCode $code): JsonResponse
    {
        $this->authorize('update', $code->equipment);

        $this->equipmentCodeService->deleteCode($code);

        return response()->json([
            'message' => 'Code deleted successfully',
        ]);
    }
} 