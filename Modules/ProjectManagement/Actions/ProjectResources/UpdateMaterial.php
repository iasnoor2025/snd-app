<?php

namespace Modules\ProjectManagement\Actions\ProjectResources;

use Modules\ProjectManagement\Domain\Models\ProjectMaterial;

class UpdateMaterial
{
    /**
     * Execute the action to update an existing material resource.
     *
     * @param ProjectMaterial $material
     * @param array $data
     * @return ProjectMaterial
     */
    public function execute(ProjectMaterial $material, array $data): ProjectMaterial
    {
        $material->name = $data['name'] ?? $material->name;
        $material->description = $data['description'] ?? $material->description;
        $material->quantity = $data['quantity'] ?? $material->quantity;
        $material->unit = $data['unit'] ?? $material->unit;
        $material->unit_price = $data['unit_price'] ?? $material->unit_price;
        $material->purchase_date = $data['purchase_date'] ?? $material->purchase_date;
        $material->save();

        return $material;
    }
}
