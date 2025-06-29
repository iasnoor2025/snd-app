<?php

namespace Modules\EmployeeManagement\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Modules\EmployeeManagement\Services\SkillService;
use Modules\EmployeeManagement\Domain\Models\Skill;
use Modules\EmployeeManagement\Domain\Models\Employee;

class SkillController extends Controller
{
    public function __construct(private SkillService $skillService) {}

    public function index()
    {
        return response()->json([
            'data' => $this->skillService->getAllSkills(),
        ]);
    }

    public function assign(Request $request, Employee $employee)
    {
        $request->validate([
            'skill_id' => 'required|exists:skills,id',
            'proficiency' => 'required|integer|min:1|max:5',
            'certified_at' => 'nullable|date',
        ]);
        $skill = Skill::findOrFail($request->skill_id);
        $this->skillService->assignSkill($employee, $skill, $request->proficiency, $request->certified_at);
        return response()->json(['message' => 'Skill assigned successfully']);
    }

    public function remove(Request $request, Employee $employee)
    {
        $request->validate([
            'skill_id' => 'required|exists:skills,id',
        ]);
        $skill = Skill::findOrFail($request->skill_id);
        $this->skillService->removeSkill($employee, $skill);
        return response()->json(['message' => 'Skill removed successfully']);
    }

    public function updateProficiency(Request $request, Employee $employee)
    {
        $request->validate([
            'skill_id' => 'required|exists:skills,id',
            'proficiency' => 'required|integer|min:1|max:5',
        ]);
        $skill = Skill::findOrFail($request->skill_id);
        $this->skillService->updateSkillProficiency($employee, $skill, $request->proficiency);
        return response()->json(['message' => 'Proficiency updated successfully']);
    }

    public function employeeSkills(Employee $employee)
    {
        return response()->json([
            'data' => $this->skillService->getEmployeeSkills($employee),
        ]);
    }
}
