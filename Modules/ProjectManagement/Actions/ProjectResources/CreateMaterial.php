<?php

namespace Modules\ProjectManagement\Actions\ProjectResources;

use Modules\ProjectManagement\Domain\Models\Project;
use Modules\ProjectManagement\Domain\Models\ProjectMaterial;

class CreateMaterial
{
    /**
     * Execute the action to create a new material resource for a project.
     *
     * @param Project $project
     * @param array $data
     * @return ProjectMaterial
     */
    public function execute(Project $project, array $data): ProjectMaterial
    {
        $material = new ProjectMaterial();
        $material->project_id = $project->id;
        $material->name = $data['name'];
        $material->description = $data['description'] ?? null;
        $material->quantity = $data['quantity'];
        $material->unit = $data['unit'];
        $material->unit_price = $data['unit_price'];
        $material->purchase_date = $data['purchase_date'];
        $material->save();

        return $material;
    }
}
