<?php

namespace Modules\RentalManagement\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Modules\RentalManagement\Domain\Models\Rental;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;

class RentalStatusApiController extends Controller
{
    /**
     * Update the status of a rental via API
     */
    public function update(Request $request, Rental $rental): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|string',
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 422);
        }
        $oldStatus = $rental->status;
        $newStatus = $request->input('status');
        $rental->update(['status' => $newStatus]);
        Log::info('Rental status updated via API', [
            'rental_id' => $rental->id,
            'old_status' => $oldStatus,
            'new_status' => $newStatus,
            'user_id' => $request->user()->id,
        ]);
        return response()->json(['success' => true, 'rental_id' => $rental->id, 'status' => $newStatus]);
    }
}
