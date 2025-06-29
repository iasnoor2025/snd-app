namespace Modules\RentalManagement\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class DynamicPricing extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'equipment_id',
        'rule_type',
        'condition_type',
        'condition_value',
        'adjustment_type',
        'adjustment_value',
        'priority',
        'start_date',
        'end_date',
        'is_active',
        'metadata',
        'price',
        'notes',
    ];

    protected $casts = [
        'condition_value' => 'array',
        'adjustment_value' => 'decimal:2',
        'priority' => 'integer',
        'start_date' => 'date',
        'end_date' => 'date',
        'is_active' => 'boolean',
        'metadata' => 'array',
        'price' => 'float',
    ];

    public const RULE_TYPES = [
        'SEASONAL' => 'seasonal',
        'DEMAND' => 'demand',
        'DURATION' => 'duration',
        'CUSTOMER_TYPE' => 'customer_type',
        'BULK' => 'bulk',
        'SPECIAL' => 'special',
    ];

    public const CONDITION_TYPES = [
        'DATE_RANGE' => 'date_range',
        'UTILIZATION' => 'utilization',
        'RENTAL_DAYS' => 'rental_days',
        'CUSTOMER_SEGMENT' => 'customer_segment',
        'QUANTITY' => 'quantity',
        'CUSTOM' => 'custom',
    ];

    public const ADJUSTMENT_TYPES = [
        'PERCENTAGE' => 'percentage',
        'FIXED' => 'fixed',
        'MULTIPLIER' => 'multiplier',
    ];

    public function equipment(): BelongsTo
    {
        return $this->belongsTo(\Modules\EquipmentManagement\Domain\Models\Equipment::class);
    }

    public function isApplicable(array $context): bool
    {
        if (!$this->is_active) {
            return false;
        }

        if ($this->start_date && $this->start_date->isFuture()) {
            return false;
        }

        if ($this->end_date && $this->end_date->isPast()) {
            return false;
        }

        switch ($this->condition_type) {
            case self::CONDITION_TYPES['DATE_RANGE']:
                return $this->isDateInRange($context['rental_date'] ?? now());

            case self::CONDITION_TYPES['UTILIZATION']:
                return $this->isUtilizationInRange($context['utilization'] ?? 0);

            case self::CONDITION_TYPES['RENTAL_DAYS']:
                return $this->isDurationInRange($context['duration'] ?? 0);

            case self::CONDITION_TYPES['CUSTOMER_SEGMENT']:
                return $this->isCustomerSegmentMatch($context['customer_segment'] ?? null);

            case self::CONDITION_TYPES['QUANTITY']:
                return $this->isQuantityInRange($context['quantity'] ?? 0);

            case self::CONDITION_TYPES['CUSTOM']:
                return $this->evaluateCustomCondition($context);

            default:
                return false;
        }
    }

    public function calculateAdjustment(float $basePrice): float
    {
        switch ($this->adjustment_type) {
            case self::ADJUSTMENT_TYPES['PERCENTAGE']:
                return $basePrice * ($this->adjustment_value / 100);

            case self::ADJUSTMENT_TYPES['FIXED']:
                return $this->adjustment_value;

            case self::ADJUSTMENT_TYPES['MULTIPLIER']:
                return $basePrice * ($this->adjustment_value - 1);

            default:
                return 0;
        }
    }

    private function isDateInRange(\DateTime $date): bool
    {
        $range = $this->condition_value;
        $start = Carbon::parse($range['start']);
        $end = Carbon::parse($range['end']);
        return $date->between($start, $end);
    }

    private function isUtilizationInRange(float $utilization): bool
    {
        $range = $this->condition_value;
        return $utilization >= ($range['min'] ?? 0) &&
               $utilization <= ($range['max'] ?? 100);
    }

    private function isDurationInRange(int $days): bool
    {
        $range = $this->condition_value;
        return $days >= ($range['min'] ?? 0) &&
               $days <= ($range['max'] ?? PHP_INT_MAX);
    }

    private function isCustomerSegmentMatch(?string $segment): bool
    {
        if (!$segment) {
            return false;
        }
        return in_array($segment, (array) $this->condition_value);
    }

    private function isQuantityInRange(int $quantity): bool
    {
        $range = $this->condition_value;
        return $quantity >= ($range['min'] ?? 0) &&
               $quantity <= ($range['max'] ?? PHP_INT_MAX);
    }

    private function evaluateCustomCondition(array $context): bool
    {
        // Custom conditions can be implemented based on specific business rules
        return false;
    }
}
