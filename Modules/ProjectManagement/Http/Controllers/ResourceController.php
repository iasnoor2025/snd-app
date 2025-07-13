<?php
namespace Modules\ProjectManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use Modules\ProjectManagement\Domain\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ResourceController extends Controller
{
    public function index(Project $project)
    {
        $equipmentPaginated = $project->equipment()->with('equipment')->paginate(10);
        $equipmentPaginated->getCollection()->transform(function ($item) {
            $hasEquipment = $item->equipment && !empty($item->equipment->name);
            $item->equipment_name = $hasEquipment
                ? (is_array($item->equipment->name) ? ($item->equipment->name['en'] ?? reset($item->equipment->name)) : $item->equipment->name)
                : (!empty($item->name) ? $item->name : 'N/A');
            $item->is_orphaned_equipment = !$hasEquipment;
            return $item;
        });
        return Inertia::render('Projects/Resources', [
            'project' => $project,
            'manpower' => $project->manpower()
                ->with(['employee' => function($query) {
                    $query->select('id', 'first_name', 'last_name', 'designation', 'employee_id');
                }])
                ->select('project_manpower.*')
                ->paginate(10),
            'equipment' => $equipmentPaginated,
            'materials' => $project->materials()->paginate(10),
            'fuel' => $project->fuel()->paginate(10),
            'expenses' => $project->expenses()->paginate(10),
            'tasks' => $project->tasks()->paginate(10),
            'assignableUsers' => \Modules\Core\Domain\Models\User::select('id', 'name')->get(),
        ]);
    }
}


