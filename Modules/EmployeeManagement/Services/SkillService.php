<?php

namespace Modules\EmployeeManagement\Services;

use Modules\EmployeeManagement\Domain\Models\Skill;
use Modules\EmployeeManagement\Domain\Models\Employee;

class SkillService
{
    public function getAllSkills()
    {
        return Skill::orderBy('category')->orderBy('name')->get();
    }

    public function assignSkill(Employee $employee, Skill $skill, int $proficiency = 1, $certifiedAt = null)
    {
        $employee->skills()->syncWithoutDetaching([
            $skill->id => [
                'proficiency' => $proficiency,
                'certified_at' => $certifiedAt,
            ],
        ]);
    }

    public function removeSkill(Employee $employee, Skill $skill)
    {
        $employee->skills()->detach($skill->id);
    }

    public function updateSkillProficiency(Employee $employee, Skill $skill, int $proficiency)
    {
        $employee->skills()->updateExistingPivot($skill->id, ['proficiency' => $proficiency]);
    }

    public function getEmployeeSkills(Employee $employee)
    {
        return $employee->skills()->withPivot('proficiency', 'certified_at')->get();
    }
}
