namespace Modules\RentalManagement\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Modules\RentalManagement\Services\DynamicPricingService;
use Modules\RentalManagement\Domain\Models\Equipment;
use Modules\RentalManagement\Domain\Models\DynamicPricing;
use Carbon\Carbon;

class DynamicPricingController extends Controller
{
    public function __construct(private DynamicPricingService $pricingService)
    {
    }

    public function index(Equipment $equipment): JsonResponse
    {
        $rules = $equipment->dynamicPricingRules()
            ->orderBy('priority', 'desc')
            ->get()
            ->map(function ($rule) {
                return [
                    'id' => $rule->id,
                    'rule_type' => $rule->rule_type,
                    'condition_type' => $rule->condition_type,
                    'condition_value' => $rule->condition_value,
                    'adjustment_type' => $rule->adjustment_type,
                    'adjustment_value' => $rule->adjustment_value,
                    'priority' => $rule->priority,
                    'start_date' => $rule->start_date?->format('Y-m-d H:i:s'),
                    'end_date' => $rule->end_date?->format('Y-m-d H:i:s'),
                    'is_active' => $rule->is_active,
                ];
            });

        return response()->json(['data' => $rules]);
    }

    public function store(Request $request, Equipment $equipment): JsonResponse
    {
        $request->validate([
            'rule_type' => 'required|string',
            'condition_type' => 'required|string',
            'condition_value' => 'required|array',
            'adjustment_type' => 'required|string',
            'adjustment_value' => 'required|numeric',
            'priority' => 'required|integer',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_date',
            'is_active' => 'boolean',
        ]);

        if (!$this->pricingService->validateRuleConditions(
            $request->input('condition_type'),
            $request->input('condition_value')
        )) {
            return response()->json([
                'message' => 'Invalid condition value for the selected condition type',
            ], 422);
        }

        $rule = $this->pricingService->createRule($equipment, $request->all());

        return response()->json([
            'message' => 'Pricing rule created successfully',
            'data' => $rule,
        ], 201);
    }

    public function update(Request $request, DynamicPricing $rule): JsonResponse
    {
        $request->validate([
            'rule_type' => 'string',
            'condition_type' => 'string',
            'condition_value' => 'array',
            'adjustment_type' => 'string',
            'adjustment_value' => 'numeric',
            'priority' => 'integer',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_date',
            'is_active' => 'boolean',
        ]);

        if (
            $request->has('condition_type') &&
            $request->has('condition_value') &&
            !$this->pricingService->validateRuleConditions(
                $request->input('condition_type'),
                $request->input('condition_value')
            )
        ) {
            return response()->json([
                'message' => 'Invalid condition value for the selected condition type',
            ], 422);
        }

        $rule = $this->pricingService->updateRule($rule, $request->all());

        return response()->json([
            'message' => 'Pricing rule updated successfully',
            'data' => $rule,
        ]);
    }

    public function destroy(DynamicPricing $rule): JsonResponse
    {
        $this->pricingService->deleteRule($rule);

        return response()->json([
            'message' => 'Pricing rule deleted successfully',
        ]);
    }

    public function calculatePrice(Request $request, Equipment $equipment): JsonResponse
    {
        $request->validate([
            'rental_date' => 'nullable|date',
            'duration' => 'nullable|integer',
            'quantity' => 'nullable|integer',
            'customer_segment' => 'nullable|string',
            'utilization' => 'nullable|numeric',
        ]);

        $context = array_filter($request->only([
            'rental_date',
            'duration',
            'quantity',
            'customer_segment',
            'utilization',
        ]));

        $priceDetails = $this->pricingService->calculatePrice($equipment, $context);

        return response()->json([
            'data' => $priceDetails,
        ]);
    }
} 