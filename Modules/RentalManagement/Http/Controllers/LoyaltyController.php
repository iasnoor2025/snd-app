<?php

namespace Modules\RentalManagement\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Modules\CustomerManagement\Domain\Models\Customer;
use Modules\RentalManagement\Domain\Models\Rental;
use Modules\RentalManagement\Domain\Models\LoyaltyTransaction;
use Modules\RentalManagement\Services\LoyaltyService;

class LoyaltyController extends Controller
{
    protected LoyaltyService $service;

    public function __construct(LoyaltyService $service)
    {
        $this->service = $service;
    }

    public function earn(Request $request, Customer $customer, Rental $rental)
    {
        $request->validate(['amount' => 'required|numeric|min:0.01']);
        $transaction = $this->service->earnPoints($customer, $rental, $request->amount);
        return response()->json(['message' => 'Points earned', 'transaction' => $transaction]);
    }

    public function redeem(Request $request, Customer $customer)
    {
        $request->validate(['points' => 'required|numeric|min:1']);
        $transaction = $this->service->redeemPoints($customer, $request->points);
        return response()->json(['message' => 'Points redeemed', 'transaction' => $transaction]);
    }

    public function points(Customer $customer)
    {
        return response()->json(['points' => $customer->loyalty_points]);
    }

    public function history(Customer $customer)
    {
        $transactions = LoyaltyTransaction::where('customer_id', $customer->id)->orderByDesc('created_at')->get();
        return response()->json(['transactions' => $transactions]);
    }
}
