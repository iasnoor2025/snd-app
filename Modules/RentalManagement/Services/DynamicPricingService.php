namespace Modules\RentalManagement\Services;

use Modules\RentalManagement\Domain\Models\DynamicPricing;
use Modules\RentalManagement\Domain\Models\Equipment;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class DynamicPricingService
{
    public function calculatePrice(Equipment $equipment, array $context): array
    {
        $basePrice = $equipment->base_price;
        $applicableRules = $this->getApplicableRules($equipment, $context);
        $adjustments = [];
        $finalPrice = $basePrice;

        foreach ($applicableRules as $rule) {
            $adjustment = $rule->calculateAdjustment($basePrice);
            $adjustments[] = [
                'rule_id' => $rule->id,
                'rule_type' => $rule->rule_type,
                'original_amount' => $adjustment,
                'description' => $this->getAdjustmentDescription($rule),
            ];
            $finalPrice += $adjustment;
        }

        return [
            'base_price' => $basePrice,
            'final_price' => max(0, $finalPrice),
            'adjustments' => $adjustments,
            'applied_rules' => $applicableRules->count(),
        ];
    }

    public function getApplicableRules(Equipment $equipment, array $context): Collection
    {
        return $equipment->dynamicPricingRules()
            ->where('is_active', true)
            ->get()
            ->filter(function ($rule) use ($context) {
                return $rule->isApplicable($context);
            })
            ->sortByDesc('priority');
    }

    public function createRule(Equipment $equipment, array $data): DynamicPricing
    {
        $rule = new DynamicPricing($data);
        $rule->equipment()->associate($equipment);
        $rule->save();

        return $rule;
    }

    public function updateRule(DynamicPricing $rule, array $data): DynamicPricing
    {
        $rule->update($data);
        return $rule;
    }

    public function deleteRule(DynamicPricing $rule): void
    {
        $rule->delete();
    }

    public function validateRuleConditions(string $conditionType, array $conditionValue): bool
    {
        switch ($conditionType) {
            case DynamicPricing::CONDITION_TYPES['DATE_RANGE']:
                return $this->validateDateRange($conditionValue);

            case DynamicPricing::CONDITION_TYPES['UTILIZATION']:
            case DynamicPricing::CONDITION_TYPES['RENTAL_DAYS']:
            case DynamicPricing::CONDITION_TYPES['QUANTITY']:
                return $this->validateNumericRange($conditionValue);

            case DynamicPricing::CONDITION_TYPES['CUSTOMER_SEGMENT']:
                return $this->validateCustomerSegments($conditionValue);

            default:
                return true;
        }
    }

    private function validateDateRange(array $range): bool
    {
        if (!isset($range['start']) || !isset($range['end'])) {
            return false;
        }

        try {
            $start = Carbon::parse($range['start']);
            $end = Carbon::parse($range['end']);
            return $start->lte($end);
        } catch (\Exception $e) {
            return false;
        }
    }

    private function validateNumericRange(array $range): bool
    {
        if (!isset($range['min']) || !isset($range['max'])) {
            return false;
        }

        return is_numeric($range['min']) &&
               is_numeric($range['max']) &&
               $range['min'] <= $range['max'];
    }

    private function validateCustomerSegments(array $segments): bool
    {
        return !empty($segments) && is_array($segments);
    }

    private function getAdjustmentDescription(DynamicPricing $rule): string
    {
        $type = match ($rule->adjustment_type) {
            'percentage' => $rule->adjustment_value . '% ' . ($rule->adjustment_value > 0 ? 'increase' : 'decrease'),
            'fixed' => '$' . abs($rule->adjustment_value) . ' ' . ($rule->adjustment_value > 0 ? 'added' : 'subtracted'),
            'multiplier' => ($rule->adjustment_value > 1 ? 'Multiplied by ' : 'Divided by ') . abs($rule->adjustment_value),
            default => 'Unknown adjustment',
        };

        $reason = match ($rule->rule_type) {
            'seasonal' => 'Seasonal pricing',
            'demand' => 'Demand-based pricing',
            'duration' => 'Duration-based discount',
            'customer_type' => 'Customer type pricing',
            'bulk' => 'Bulk discount',
            'special' => 'Special offer',
            default => 'Price adjustment',
        };

        return "$reason: $type";
    }

    public function getPricingForEquipment($equipmentId)
    {
        return DynamicPricing::where('equipment_id', $equipmentId)->orderByDesc('start_date')->get();
    }

    public function createPricing(array $data): DynamicPricing
    {
        return DynamicPricing::create($data);
    }

    public function updatePricing(DynamicPricing $pricing, array $data): DynamicPricing
    {
        $pricing->update($data);
        return $pricing->fresh();
    }

    public function deletePricing(DynamicPricing $pricing): void
    {
        $pricing->delete();
    }
}
