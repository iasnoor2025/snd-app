<?php

namespace Modules\ProjectManagement\Actions\ProjectResources;

use Modules\ProjectManagement\Domain\Models\Project;
use Modules\ProjectManagement\Domain\Models\ProjectFuel;

class CreateFuel
{
    /**
     * Execute the action to create a new fuel resource for a project.
     *
     * @param Project $project
     * @param array $data
     * @return ProjectFuel
     */
    public function execute(Project $project, array $data): ProjectFuel
    {
        $fuel = new ProjectFuel();
        $fuel->project_id = $project->id;
        $fuel->equipment_id = $data['equipment_id'] ?? null;
        $fuel->date = $data['date'];
        $fuel->quantity = $data['quantity'];
        $fuel->unit_price = $data['unit_price'];
        $fuel->notes = $data['notes'] ?? null;
        $fuel->save();

        return $fuel;
    }
}
