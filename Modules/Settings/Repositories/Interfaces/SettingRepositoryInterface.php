<?php

namespace Modules\Settings\Repositories\Interfaces;

use Modules\Settings\Domain\Models\Setting;
use Illuminate\Database\Eloquent\Collection; interface SettingRepositoryInterface
{
    /**
     * Find a setting by its ID.
     *
     * @param int $id
     * @return Setting|null;
     */
    public function find(int $id): ?Setting;

    /**
     * Find a setting by its key and optional group.
     *
     * @param string $key
     * @param string|null $group
     * @return Setting|null;
     */
    public function findByKey(string $key, ?string $group = null): ?Setting;

    /**
     * Get all settings.
     *
     * @return Collection;
     */
    public function all(): Collection;

    /**
     * Get all settings by group.
     *
     * @param string $group
     * @return Collection;
     */
    public function getByGroup(string $group): Collection;

    /**
     * Get all settings organized by groups.
     *
     * @return array;
     */
    public function getGroups(): array;

    /**
     * Create a new setting.
     *
     * @param array $data
     * @return Setting;
     */
    public function create(array $data): Setting;

    /**
     * Update a setting.
     *
     * @param int $id
     * @param array $data
     * @return Setting;
     */
    public function update(int $id, array $data): Setting;

    /**
     * Delete a setting.
     *
     * @param int $id
     * @return bool;
     */
    public function delete(int $id): bool;

    /**
     * Get a setting value by key.
     *
     * @param string $key
     * @param mixed $default
     * @param string|null $group
     * @return mixed;
     */
    public function getValue(string $key, $default = null, ?string $group = null);

    /**
     * Set a setting value by key.
     *
     * @param string $key
     * @param mixed $value
     * @param string|null $group
     * @return Setting;
     */
    public function setValue(string $key, $value, ?string $group = null): ?Setting;
}


