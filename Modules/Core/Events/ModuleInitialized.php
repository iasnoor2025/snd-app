<?php

namespace Modules\Core\Events;

class ModuleInitialized extends BaseEvent
{
    /**
     * Get the event name.
     *
     * @return string;
     */
    protected function getEventName(): string
    {
        return 'core.module.initialized';
    }

    /**
     * Create a new event instance.
     *
     * @param string $moduleName
     * @param array $config
     * @return void;
     */
    public function __construct(string $moduleName, array $config = [])
    {
        parent::__construct([
            'module' => $moduleName,
            'config' => $config,
            'timestamp' => now()->toIso8601String(),
        ]);
    }
}

