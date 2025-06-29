namespace Modules\EmployeeManagement\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Modules\EmployeeManagement\Domain\Models\OrganizationalUnit;
use Modules\EmployeeManagement\Domain\Models\Employee;

class OrganizationalChartController extends Controller
{
    public function index(): JsonResponse
    {
        $rootUnits = OrganizationalUnit::roots()
            ->with(['children.manager', 'children.employees', 'manager', 'employees'])
            ->get();

        $chartData = $rootUnits->map->getOrgChartData();

        return response()->json([
            'data' => $chartData->count() === 1 ? $chartData->first() : $chartData,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:organizational_units,code',
            'type' => 'required|string|in:' . implode(',', OrganizationalUnit::TYPES),
            'parent_id' => 'nullable|exists:organizational_units,id',
            'manager_id' => 'nullable|exists:employees,id',
            'description' => 'nullable|string',
            'metadata' => 'nullable|array',
        ]);

        $level = 0;
        if ($request->parent_id) {
            $parent = OrganizationalUnit::findOrFail($request->parent_id);
            $level = $parent->level + 1;
        }

        $unit = OrganizationalUnit::create([
            ...$request->all(),
            'level' => $level,
        ]);

        return response()->json([
            'message' => 'Organizational unit created successfully',
            'data' => $unit->load(['parent', 'manager']),
        ], 201);
    }

    public function update(Request $request, OrganizationalUnit $unit): JsonResponse
    {
        $request->validate([
            'name' => 'string|max:255',
            'code' => 'string|max:50|unique:organizational_units,code,' . $unit->id,
            'type' => 'string|in:' . implode(',', OrganizationalUnit::TYPES),
            'parent_id' => 'nullable|exists:organizational_units,id',
            'manager_id' => 'nullable|exists:employees,id',
            'description' => 'nullable|string',
            'metadata' => 'nullable|array',
        ]);

        if ($request->has('parent_id') && $request->parent_id !== $unit->parent_id) {
            $level = 0;
            if ($request->parent_id) {
                $parent = OrganizationalUnit::findOrFail($request->parent_id);
                $level = $parent->level + 1;
            }
            $request->merge(['level' => $level]);

            // Update levels of all children
            $diff = $level - $unit->level;
            if ($diff !== 0) {
                $unit->allChildren->each(function ($child) use ($diff) {
                    $child->update(['level' => $child->level + $diff]);
                });
            }
        }

        $unit->update($request->all());

        return response()->json([
            'message' => 'Organizational unit updated successfully',
            'data' => $unit->load(['parent', 'manager']),
        ]);
    }

    public function destroy(OrganizationalUnit $unit): JsonResponse
    {
        // Move employees to parent unit if exists
        if ($unit->parent_id) {
            Employee::where('unit_id', $unit->id)
                ->update(['unit_id' => $unit->parent_id]);
        }

        $unit->delete();

        return response()->json([
            'message' => 'Organizational unit deleted successfully',
        ]);
    }

    public function moveEmployees(Request $request, OrganizationalUnit $unit): JsonResponse
    {
        $request->validate([
            'employee_ids' => 'required|array',
            'employee_ids.*' => 'exists:employees,id',
        ]);

        Employee::whereIn('id', $request->employee_ids)
            ->update(['unit_id' => $unit->id]);

        return response()->json([
            'message' => 'Employees moved successfully',
            'data' => $unit->load('employees'),
        ]);
    }

    public function search(Request $request): JsonResponse
    {
        $request->validate([
            'query' => 'required|string|min:2',
        ]);

        $units = OrganizationalUnit::where('name', 'like', "%{$request->query}%")
            ->orWhere('code', 'like', "%{$request->query}%")
            ->with(['parent', 'manager'])
            ->get()
            ->map(function ($unit) {
                return [
                    'id' => $unit->id,
                    'name' => $unit->name,
                    'code' => $unit->code,
                    'type' => $unit->type,
                    'full_path' => $unit->full_path,
                    'manager' => $unit->manager ? [
                        'id' => $unit->manager->id,
                        'name' => $unit->manager->name,
                    ] : null,
                ];
            });

        return response()->json(['data' => $units]);
    }
} 