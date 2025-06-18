<?php

namespace Modules\ProjectManagement\Actions\ProjectResources;

use Modules\ProjectManagement\Domain\Models\ProjectFuel;

class DeleteFuel
{
    /**
     * Execute the action to delete a fuel resource.
     *
     * @param ProjectFuel $fuel
     * @return bool
     */
    public function execute(ProjectFuel $fuel): bool
    {
        return $fuel->delete();
    }
}
