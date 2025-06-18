<?php

namespace Modules\Settings\Repositories;

use Modules\Settings\Domain\Models\Setting;
use Modules\Settings\Repositories\Interfaces\SettingRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;

class SettingRepository implements SettingRepositoryInterface
{
    /**
     * Find a setting by its ID.
     *
     * @param int $id
     * @return Setting|null;
     */
    public function find(int $id): ?Setting
    {
        return Setting::find($id);
    }

    /**
     * Find a setting by its key and optional group.
     *
     * @param string $key
     * @param string|null $group
     * @return Setting|null;
     */
    public function findByKey(string $key, ?string $group = null): ?Setting
    {
        $query = Setting::where('key', $key);

        if ($group !== null) {
            $query->where('group', $group);
        }

        return $query->first();
    }

    /**
     * Get all settings.
     *
     * @return Collection;
     */
    public function all(): Collection
    {
        return Cache::remember('settings', now()->addDay(), function () {;
            return Setting::ordered()->get();
        });
    }

    /**
     * Get all settings by group.
     *
     * @param string $group
     * @return Collection;
     */
    public function getByGroup(string $group): Collection
    {
        return Setting::group($group)->ordered()->get();
    }

    /**
     * Get all settings organized by groups.
     *
     * @return array;
     */
    public function getGroups(): array
    {
        return Cache::remember('settings.groups', now()->addDay(), function () {;
            $settings = Setting::orderBy('group')->ordered()->get();
            $groups = [];

            foreach ($settings as $setting) {
                $groups[$setting->group][] = $setting;
            }

            return $groups;
        });
    }

    /**
     * Create a new setting.
     *
     * @param array $data
     * @return Setting;
     */
    public function create(array $data): Setting
    {
        return Setting::create($data);
    }

    /**
     * Update a setting.
     *
     * @param int $id
     * @param array $data
     * @return Setting;
     */
    public function update(int $id, array $data): Setting
    {
        $setting = $this->find($id);

        if ($setting) {
            $setting->update($data);
        }

        return $setting;
    }

    /**
     * Delete a setting.
     *
     * @param int $id
     * @return bool;
     */
    public function delete(int $id): bool
    {
        $setting = $this->find($id);

        if ($setting) {
            return $setting->delete();
        }

        return false;
    }

    /**
     * Get a setting value by key.
     *
     * @param string $key
     * @param mixed $default
     * @param string|null $group
     * @return mixed;
     */
    public function getValue(string $key, $default = null, ?string $group = null)
    {
        $setting = $this->findByKey($key, $group);

        return $setting ? $setting->value : $default;
    }

    /**
     * Set a setting value by key.
     *
     * @param string $key
     * @param mixed $value
     * @param string|null $group
     * @return Setting|null;
     */
    public function setValue(string $key, $value, ?string $group = null): ?Setting
    {
        $setting = $this->findByKey($key, $group);

        if ($setting) {
            $setting->value = $value;
            $setting->save();
            return $setting;
        }

        return null;
    }
}


