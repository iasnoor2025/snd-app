<?php

namespace Modules\RentalManagement\Services;

use Modules\RentalManagement\Domain\Models\Customer;
use Modules\RentalManagement\Domain\Models\Rental;
use Modules\RentalManagement\Domain\Models\LoyaltyProgram;
use Modules\RentalManagement\Domain\Models\LoyaltyTransaction;
use Illuminate\Support\Facades\DB;

class LoyaltyService
{
    public function earnPoints(Customer $customer, Rental $rental, float $amount): LoyaltyTransaction
    {
        $program = LoyaltyProgram::where('is_active', true)->first();
        if (!$program) {
            throw new \Exception('No active loyalty program');
        }
        $points = $amount * $program->points_per_currency;
        DB::transaction(function () use ($customer, $rental, $points, $amount) {
            $customer->increment('loyalty_points', $points);
            LoyaltyTransaction::create([
                'customer_id' => $customer->id,
                'rental_id' => $rental->id,
                'type' => 'earn',
                'points' => $points,
                'amount' => $amount,
                'description' => 'Points earned for rental',
            ]);
        });
        return LoyaltyTransaction::latest()->first();
    }

    public function redeemPoints(Customer $customer, float $points, ?Rental $rental = null): LoyaltyTransaction
    {
        $program = LoyaltyProgram::where('is_active', true)->first();
        if (!$program) {
            throw new \Exception('No active loyalty program');
        }
        if ($customer->loyalty_points < $points) {
            throw new \Exception('Insufficient loyalty points');
        }
        $amount = $points * $program->redeem_rate;
        DB::transaction(function () use ($customer, $points, $amount, $rental) {
            $customer->decrement('loyalty_points', $points);
            LoyaltyTransaction::create([
                'customer_id' => $customer->id,
                'rental_id' => $rental?->id,
                'type' => 'redeem',
                'points' => $points,
                'amount' => $amount,
                'description' => 'Points redeemed',
            ]);
        });
        return LoyaltyTransaction::latest()->first();
    }
}
