<?php

namespace Modules\RentalManagement\Http\Controllers\Api;

use Illuminate\Routing\Controller;
use Modules\RentalManagement\Models\Rental;

class WidgetController extends Controller
{
    /**
     * Get rental analytics for dashboard widget.
     */
    public function analytics()
    {
        $total = Rental::count();
        $active = Rental::where('status', 'active')->count();
        $completed = Rental::where('status', 'completed')->count();
        $overdue = Rental::where('status', 'overdue')->count();

        return response()->json([
            'total' => $total,
            'active' => $active,
            'completed' => $completed,
            'overdue' => $overdue,
        ]);
    }
}
