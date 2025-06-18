<?php

namespace Modules\Settings\Services;

use Modules\Settings\Domain\Models\Setting;
use Modules\Settings\Repositories\Interfaces\SettingRepositoryInterface;
use Illuminate\Support\Collection;

class SettingService
{
    /**
     * @var SettingRepositoryInterface
     */
    protected $repository;

    /**
     * SettingService constructor.
     *
     * @param SettingRepositoryInterface $repository
     */
    public function __construct(SettingRepositoryInterface $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Get all settings.
     *
     * @return Collection;
     */
    public function getAllSettings(): Collection
    {
        return $this->repository->all();
    }

    /**
     * Get all settings by group.
     *
     * @param string $group
     * @return Collection;
     */
    public function getSettingsByGroup(string $group): Collection
    {
        return $this->repository->getByGroup($group);
    }

    /**
     * Get all groups with their settings.
     *
     * @return array;
     */
    public function getGroupedSettings(): array
    {
        return $this->repository->getGroups();
    }

    /**
     * Get a setting value.
     *
     * @param string $key
     * @param mixed $default
     * @param string|null $group
     * @return mixed;
     */
    public function get(string $key, $default = null, ?string $group = null)
    {
        return $this->repository->getValue($key, $default, $group);
    }

    /**
     * Set a setting value.
     *
     * @param string $key
     * @param mixed $value
     * @param string|null $group
     * @return Setting|null;
     */
    public function set(string $key, $value, ?string $group = null): ?Setting
    {
        $setting = $this->repository->findByKey($key, $group);

        if ($setting) {
            return $this->repository->update($setting->id, ['value' => $value]);
        }

        return null;
    }

    /**
     * Create a new setting.
     *
     * @param array $data
     * @return Setting;
     */
    public function createSetting(array $data): Setting
    {
        // Set default values if not provided
        $data['type'] = $data['type'] ?? $this->determineType($data['value']);
        $data['is_system'] = $data['is_system'] ?? false;
        $data['order'] = $data['order'] ?? 0;

        return $this->repository->create($data);
    }

    /**
     * Get a setting by key.
     *
     * @param string $key
     * @param string|null $group
     * @return mixed
     */
    public function getSetting(string $key, ?string $group = null)
    {
        return $this->repository->getValue($key, null, $group);
    }

    /**
     * Update a setting by key.
     *
     * @param string $key
     * @param mixed $value
     * @param string|null $group
     * @return Setting|null
     */
    public function updateSetting(string $key, $value, ?string $group = null): ?Setting
    {
        $setting = $this->repository->findByKey($key, $group);

        if ($setting) {
            $data = [
                'value' => $value,
                'type' => $this->determineType($value)
            ];
            return $this->repository->update($setting->id, $data);
        }

        return null;
    }

    /**
     * Update a setting by ID.
     *
     * @param int $id
     * @param array $data
     * @return Setting;
     */
    public function updateSettingById(int $id, array $data): Setting
    {
        // If the value type changed, update the type accordingly
        if (isset($data['value']) && !isset($data['type'])) {
            $data['type'] = $this->determineType($data['value']);
        }

        return $this->repository->update($id, $data);
    }

    /**
     * Delete a setting.
     *
     * @param int $id
     * @return bool;
     */
    public function deleteSetting(int $id): bool
    {
        return $this->repository->delete($id);
    }

    /**
     * Determine the type of a value.
     *
     * @param mixed $value
     * @return string;
     */
    protected function determineType($value): string
    {
        if (is_bool($value)) {
            return 'boolean';
        } elseif (is_int($value)) {
            return 'integer';
        } elseif (is_float($value)) {
            return 'float';
        } elseif (is_array($value)) {
            return 'array';
        }

        return 'string';
    }
}


