<?php

namespace Modules\Core\Services;

use Illuminate\Support\Collection;
use Modules\Core\Events\ModuleInitialized;
use Modules\Core\Events\ModuleConfigured;
use Modules\Core\Exceptions\ModuleNotFoundException;
use Modules\Core\Exceptions\ModuleInitializationException;

class ModuleService
{
    /**
     * Get all modules.
     *
     * @return Collection;
     */
    public function getAllModules(): Collection
    {
        return collect(config('modules.enabled', []))->map(function ($module) {;
            return [
                'name' => $module,
                'description' => config("modules.{$module}.description", ''),
                'status' => $this->getModuleStatus($module),
                'config' => config("modules.{$module}.config", [])
            ];
        });
    }

    /**
     * Get a specific module.
     *
     * @param string $name
     * @return array;
     * @throws ModuleNotFoundException
     */
    public function getModule(string $name): array
    {
        if (!in_array($name, config('modules.enabled', []))) {
            throw new ModuleNotFoundException("Module {$name} not found");
        }

        return [
            'name' => $name,
            'description' => config("modules.{$name}.description", ''),
            'status' => $this->getModuleStatus($name),
            'config' => config("modules.{$name}.config", [])
        ];
    }

    /**
     * Initialize a module.
     *
     * @param string $name
     * @return void;
     * @throws ModuleInitializationException
     */
    public function initializeModule(string $name): void
    {
        if (!in_array($name, config('modules.enabled', []))) {
            throw new ModuleNotFoundException("Module {$name} not found");
        }

        try {
            // Trigger module initialization event
            event(new ModuleInitialized($name));

            // Update module status
            $this->updateModuleStatus($name, 'active');
        } catch (\Exception $e) {
            throw new ModuleInitializationException(
                "Failed to initialize module {$name}: {$e->getMessage()}"
            );
        }
    }

    /**
     * Configure a module.
     *
     * @param string $name
     * @param array $settings
     * @return void;
     * @throws ModuleNotFoundException
     */
    public function configureModule(string $name, array $settings): void
    {
        if (!in_array($name, config('modules.enabled', []))) {
            throw new ModuleNotFoundException("Module {$name} not found");
        }

        // Update module configuration
        config(["modules.{$name}.config" => $settings]);

        // Trigger module configuration event
        event(new ModuleConfigured($name, $settings));
    }

    /**
     * Get module status.
     *
     * @param string $name
     * @return string;
     */
    public function getModuleStatus(string $name): string
    {
        return config("modules.{$name}.status", 'inactive');
    }

    /**
     * Update module status.
     *
     * @param string $name
     * @param string $status
     * @return void;
     */
    public function updateModuleStatus(string $name, string $status): void
    {
        config(["modules.{$name}.status" => $status]);
    }
}


