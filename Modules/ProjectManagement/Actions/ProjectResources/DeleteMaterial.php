<?php

namespace Modules\ProjectManagement\Actions\ProjectResources;

use Modules\ProjectManagement\Domain\Models\ProjectMaterial;

class DeleteMaterial
{
    /**
     * Execute the action to delete a material resource.
     *
     * @param ProjectMaterial $material
     * @return bool
     */
    public function execute(ProjectMaterial $material): bool
    {
        return $material->delete();
    }
}
