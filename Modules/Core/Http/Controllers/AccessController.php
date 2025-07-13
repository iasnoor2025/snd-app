<?php
namespace Modules\Core\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Carbon;
use Modules\EmployeeManagement\Domain\Models\Employee;

class AccessController extends Controller
{
    /**
     * Show the access restricted page
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Inertia\Response;
     */
    public function restricted(Request $request)
    {
        $user = Auth::user();
        $employee = $user ? $user->employee : null;

        $accessInfo = [
            'reason' => null,
            'until' => null,
            'status' => null,
            'contact' => 'HR department',
        ];

        if ($employee) {
            // Get access restriction information
            $accessInfo['status'] = $employee->status;
            $accessInfo['reason'] = $employee->access_restriction_reason;

            if ($employee->access_restricted_until) {
                $accessInfo['until'] = Carbon::parse($employee->access_restricted_until)->format('F j, Y');
            } elseif ($employee->access_start_date && $employee->access_end_date) {
                $now = Carbon::now();
                $startDate = Carbon::parse($employee->access_start_date);
                $endDate = Carbon::parse($employee->access_end_date);

                if ($now->lt($startDate)) {
                    // Access not yet valid
                    $accessInfo['reason'] = $accessInfo['reason'] ?: 'Your access period has not started yet.';
                    $accessInfo['until'] = 'Your access will begin on ' . $startDate->format('F j, Y');
                } elseif ($now->gt($endDate)) {
                    // Access expired
                    $accessInfo['reason'] = $accessInfo['reason'] ?: 'Your access period has expired.';
                    $accessInfo['until'] = 'Your access ended on ' . $endDate->format('F j, Y');
                }
            }
        }

        return Inertia::render('AccessRestricted', [;
            'accessInfo' => $accessInfo,
            'user' => $user ? [
                'name' => $user->name,
                'email' => $user->email,
            ] : null,
            'employee' => $employee ? [
                'name' => $employee->full_name,
                'position' => $employee->designation ? $employee->designation->name : null,
                'department' => $employee->department ? $employee->department->name : null,
            ] : null,
        ]);
    }
}


