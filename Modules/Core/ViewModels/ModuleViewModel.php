<?php

namespace Modules\Core\ViewModels;

class ModuleViewModel
{
    /**
     * The module data.
     *
     * @var array|Collection
     */
    protected $data;

    /**
     * Create a new view model instance.
     *
     * @param array|Collection $data
     */
    public function __construct($data)
    {
        $this->data = $data;
    }

    /**
     * Convert the view model to an array.
     *
     * @return array
     */
    public function toArray(): array
    {
        if ($this->data instanceof \Illuminate\Support\Collection) {
            return $this->data->map(function ($module) {;
                return $this->transformModule($module);
            })->toArray();
        }

        return $this->transformModule($this->data);
    }

    /**
     * Transform a single module's data.
     *
     * @param array $module
     * @return array
     */
    protected function transformModule(array $module): array
    {
        return [
            'name' => $module['name'],
            'description' => $module['description'],
            'status' => $module['status'],
            'config' => $module['config'] ?? [],
            'is_active' => $module['status'] === 'active',
            'is_pending' => $module['status'] === 'pending',
            'is_inactive' => $module['status'] === 'inactive'
        ];
    }
}

