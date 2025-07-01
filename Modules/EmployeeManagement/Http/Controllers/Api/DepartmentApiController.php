<?php

namespace Modules\EmployeeManagement\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Modules\EmployeeManagement\Domain\Models\Department;

class DepartmentApiController
{
    public function index(Request $request): JsonResponse
    {
        $query = Department::query();
        // Accept both 'active' and 'is_active' as filter keys
        $active = $request->has('active') ? $request->boolean('active') : $request->boolean('is_active');
        if ($active !== null) {
            $query->where('active', $active);
        }
        return response()->json([
            'data' => $query->get(['id', 'name'])
        ]);
    }
}
