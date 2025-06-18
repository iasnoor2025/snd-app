<?php

namespace Modules\EquipmentManagement\Domain\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EquipmentValuationRecord extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * Valuation type constants.
     */
    const TYPE_APPRAISAL = 'appraisal';
    const TYPE_MARKET_ESTIMATION = 'market_estimation';
    const TYPE_INTERNAL_ASSESSMENT = 'internal_assessment';

    /**
     * Valuation method constants.
     */
    const METHOD_MARKET_COMPARISON = 'market_comparison';
    const METHOD_COST_APPROACH = 'cost_approach';
    const METHOD_INCOME_APPROACH = 'income_approach';
    const METHOD_AGE_LIFE = 'age_life';
    const METHOD_EXPERT_OPINION = 'expert_opinion';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'equipment_id',
        'valuation_date',
        'valuation_amount',
        'valuation_method',
        'valuation_type',
        'appraiser_name',
        'notes',
        'created_by',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'valuation_date' => 'date',
        'valuation_amount' => 'decimal:2',
    ];

    /**
     * Get the equipment this valuation record belongs to.
     */
    public function equipment(): BelongsTo
    {
        return $this->belongsTo(Equipment::class);
    }

    /**
     * Get the user who created this valuation record.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get available valuation types.
     *
     * @return array;
     */
    public static function getAvailableTypes(): array
    {
        return [
            self::TYPE_APPRAISAL => 'Professional Appraisal',
            self::TYPE_MARKET_ESTIMATION => 'Market-based Estimation',
            self::TYPE_INTERNAL_ASSESSMENT => 'Internal Assessment',
        ];
    }

    /**
     * Get available valuation methods.
     *
     * @return array;
     */
    public static function getAvailableMethods(): array
    {
        return [
            self::METHOD_MARKET_COMPARISON => 'Market Comparison Approach',
            self::METHOD_COST_APPROACH => 'Cost Approach',
            self::METHOD_INCOME_APPROACH => 'Income Approach',
            self::METHOD_AGE_LIFE => 'Age-Life Method',
            self::METHOD_EXPERT_OPINION => 'Expert Opinion',
        ];
    }

    /**
     * Update the equipment's current value based on this valuation.
     *
     * @return bool;
     */
    public function updateEquipmentValue(): bool
    {
        $equipment = $this->equipment;
        if (!$equipment) {
            return false;
        }

        // Update or create depreciation record if needed
        $depreciation = EquipmentDepreciation::where('equipment_id', $equipment->id)->first();

        if (!$depreciation) {
            // If no depreciation record exists, create one with default values
            $depreciation = new EquipmentDepreciation([
                'equipment_id' => $equipment->id,
                'initial_value' => $this->valuation_amount,
                'residual_value' => $this->valuation_amount * 0.1, // Default to 10% residual value
                'current_value' => $this->valuation_amount,
                'depreciation_method' => EquipmentDepreciation::METHOD_STRAIGHT_LINE,
                'useful_life_years' => 5, // Default to 5 years
                'depreciation_start_date' => $this->valuation_date,
                'created_by' => $this->created_by,
            ]);
            $depreciation->save();
        } else {
            // If existing depreciation record and this is a newer valuation
            if ($this->valuation_date > $depreciation->last_depreciation_date) {
                // Calculate value appreciation or depreciation
                $appreciation = $this->valuation_amount - $depreciation->current_value;

                // Update equipment record
                $equipment->value_appreciation = $appreciation;

                // Optionally reset the depreciation calculation based on new valuation
                // This would be a business decision
            }
        }

        // Update the equipment valuation fields
        $equipment->depreciated_value = $this->valuation_amount;
        $equipment->last_depreciation_update = $this->valuation_date;

        return $equipment->save();
    }
}




