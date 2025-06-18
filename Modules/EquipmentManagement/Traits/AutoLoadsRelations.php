<?php

namespace Modules\EquipmentManagement\Traits;

trait AutoLoadsRelations
{
    /**
     * The eagerLoading config flag
     */
    protected $shouldEagerLoad = true;

    /**
     * Enable automatic eager loading of frequently accessed relationships
     * to prevent N+1 query issues in Laravel 12.8+
     */
    public function initializeAutoLoadsRelations()
    {
        // We will set configuration via properties
        $this->shouldEagerLoad = true;
    }

    /**
     * Disable auto-loading of relations
     * Useful for testing the N+1 problem
     */
    public function withoutRelations()
    {
        // This method disables the auto-loading mechanism for tests
        $this->shouldEagerLoad = false;
        return $this;
    }

    /**
     * Check if relations should be eagerly loaded
     */
    public function shouldEagerLoadRelations()
    {
        return $this->shouldEagerLoad;
    }
}
