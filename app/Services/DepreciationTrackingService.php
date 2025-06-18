<?php

namespace App\Services;

use Illuminate\Support\Collection;
use Modules\EquipmentManagement\Domain\Models\Equipment;
use Carbon\Carbon;

class DepreciationTrackingService
{
    /**
     * Calculate depreciation for equipment
     *
     * @param Equipment $equipment
     * @return array
     */
    public function calculateDepreciation(Equipment $equipment): array
    {
        $purchaseDate = Carbon::parse($equipment->purchase_date);
        $currentDate = Carbon::now();
        $yearsInService = $purchaseDate->diffInYears($currentDate);

        $depreciationRate = $equipment->depreciation_rate ?? 0.15; // 15% default
        $currentValue = $equipment->purchase_price * pow(1 - $depreciationRate, $yearsInService);

        return [
            'original_value' => $equipment->purchase_price,
            'current_value' => max($currentValue, $equipment->purchase_price * 0.1), // Min 10% residual
            'depreciation_amount' => $equipment->purchase_price - $currentValue,
            'years_in_service' => $yearsInService,
            'depreciation_rate' => $depreciationRate
        ];
    }

    /**
     * Get fleet depreciation summary
     *
     * @return array
     */
    public function getFleetDepreciationSummary(): array
    {
        $equipment = Equipment::all();
        $totalOriginalValue = 0;
        $totalCurrentValue = 0;

        foreach ($equipment as $item) {
            $depreciation = $this->calculateDepreciation($item);
            $totalOriginalValue += $depreciation['original_value'];
            $totalCurrentValue += $depreciation['current_value'];
        }

        return [
            'total_equipment' => $equipment->count(),
            'total_original_value' => $totalOriginalValue,
            'total_current_value' => $totalCurrentValue,
            'total_depreciation' => $totalOriginalValue - $totalCurrentValue,
            'average_depreciation_rate' => $totalOriginalValue > 0 ?
                (($totalOriginalValue - $totalCurrentValue) / $totalOriginalValue) * 100 : 0
        ];
    }

    /**
     * Get equipment needing replacement
     *
     * @param float $thresholdPercentage
     * @return Collection
     */
    public function getEquipmentNeedingReplacement(float $thresholdPercentage = 80): Collection
    {
        return Equipment::all()->filter(function ($equipment) use ($thresholdPercentage) {
            $depreciation = $this->calculateDepreciation($equipment);
            $depreciationPercentage = ($depreciation['depreciation_amount'] / $depreciation['original_value']) * 100;

            return $depreciationPercentage >= $thresholdPercentage;
        });
    }

    /**
     * Get depreciation report for specific equipment
     *
     * @param int $equipmentId
     * @return array
     */
    public function getDepreciationReport(int $equipmentId): array
    {
        $equipment = Equipment::findOrFail($equipmentId);
        $depreciation = $this->calculateDepreciation($equipment);

        return [
            'equipment' => $equipment,
            'depreciation' => $depreciation,
            'replacement_recommended' => $depreciation['current_value'] < ($depreciation['original_value'] * 0.2)
        ];
    }

    /**
     * Get valuation history for equipment
     *
     * @param int $equipmentId
     * @return array
     */
    public function getValuationHistory(int $equipmentId): array
    {
        $equipment = Equipment::findOrFail($equipmentId);
        $purchaseDate = Carbon::parse($equipment->purchase_date);
        $currentDate = Carbon::now();
        $history = [];

        $depreciationRate = $equipment->depreciation_rate ?? 0.15;

        // Generate yearly valuation history
        for ($year = 0; $year <= $purchaseDate->diffInYears($currentDate); $year++) {
            $value = $equipment->purchase_price * pow(1 - $depreciationRate, $year);
            $history[] = [
                'year' => $purchaseDate->copy()->addYears($year)->year,
                'value' => max($value, $equipment->purchase_price * 0.1)
            ];
        }

        return $history;
    }
}
