<?php

namespace Modules\EquipmentManagement\Services;

use Illuminate\Support\Str;
use Modules\EquipmentManagement\Domain\Models\Equipment;
use Modules\EquipmentManagement\Domain\Models\EquipmentCode;

class EquipmentCodeService
{
    public function generateQrCode(Equipment $equipment, bool $isPrimary = false): EquipmentCode
    {
        // Generate a unique code value
        $codeValue = $this->generateUniqueCode();

        // Create the equipment code record
        return EquipmentCode::create([
            'equipment_id' => $equipment->id,
            'code_type' => 'qr',
            'code_value' => $codeValue,
            'is_primary' => $isPrimary,
        ]);
    }

    public function generateBarcode(Equipment $equipment, bool $isPrimary = false): EquipmentCode
    {
        // Generate a unique barcode value
        $codeValue = $this->generateUniqueCode('barcode');

        // Create the equipment code record
        return EquipmentCode::create([
            'equipment_id' => $equipment->id,
            'code_type' => 'barcode',
            'code_value' => $codeValue,
            'is_primary' => $isPrimary,
        ]);
    }

    public function scanCode(string $codeValue): ?EquipmentCode
    {
        $code = EquipmentCode::where('code_value', $codeValue)->first();

        if ($code) {
            $code->recordScan();
        }

        return $code;
    }

    public function setPrimaryCode(EquipmentCode $code): void
    {
        // Remove primary status from other codes
        EquipmentCode::where('equipment_id', $code->equipment_id)
            ->where('id', '!=', $code->id)
            ->where('is_primary', true)
            ->update(['is_primary' => false]);

        // Set this code as primary
        $code->update(['is_primary' => true]);
    }

    public function deleteCode(EquipmentCode $code): bool
    {
        return $code->delete();
    }

    private function generateUniqueCode(string $type = 'qr'): string
    {
        do {
            $code = $type === 'qr'
                ? Str::random(32)
                : Str::upper(Str::random(12));
        } while (EquipmentCode::where('code_value', $code)->exists());

        return $code;
    }

    public function getEquipmentCodes(Equipment $equipment): array
    {
        return $equipment->codes()
            ->orderBy('is_primary', 'desc')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($code) {
                return [
                    'id' => $code->id,
                    'type' => $code->code_type,
                    'value' => $code->code_value,
                    'is_primary' => $code->is_primary,
                    'last_scanned' => $code->last_scanned_at?->diffForHumans(),
                    'qr_url' => $code->code_type === 'qr' ? $code->generateQrCode() : null,
                    'barcode_value' => $code->code_type === 'barcode' ? $code->generateBarcode() : null,
                ];
            })
            ->toArray();
    }
} 