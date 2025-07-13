<?php
namespace Modules\PayrollManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SalaryEmployeeApiController extends Controller
{
    /**
     * Get a list of active employees for dropdowns
     *
     * @return \Illuminate\Http\JsonResponse;
     */
    public function index(Request $request)
    {
        try {
            // Simple query directly on DB facade to avoid module dependency issues
            $query = DB::table('employees')
                ->select(
                    'id',
                    'first_name',
                    'last_name',
                    'hourly_rate',
                    'position',
                    DB::raw("CONCAT(first_name, ' ', last_name) as full_name")
                );

            // Check if specific IDs were requested
            if ($request->has('ids')) {
                $ids = explode(',', $request->input('ids'));
                $query->whereIn('id', $ids);
            } else {
                $query->where('status', 'active');
            }

            $employees = $query->orderBy('first_name')->get();

            // Format the response
            $formattedEmployees = $employees->map(function ($employee) {
                $hourlyRate = is_null($employee->hourly_rate) ? null : (float)$employee->hourly_rate;
                return [
                    'id' => $employee->id,
                    'first_name' => $employee->first_name,
                    'last_name' => $employee->last_name,
                    'full_name' => $employee->full_name,
                    'hourly_rate' => $hourlyRate,
                    'position' => $employee->designation,
                ];
            });

            return response()->json($formattedEmployees);
        } catch (\Exception $e) {
            Log::error('Error fetching employees: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Failed to retrieve employees',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}


