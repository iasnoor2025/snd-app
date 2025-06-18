<?php

namespace Modules\Settings\Facades;

use Illuminate\Support\Facades\Facade;
use /**
 * @method static mixed get(string $key;
use mixed $default = null;
use string $group = null)
 * @method static \Modules\Settings\Domain\Models\Setting|null set(string $key, mixed $value, string $group = null)
 * @method static \Illuminate\Support\Collection getAllSettings()
 * @method static \Illuminate\Support\Collection getSettingsByGroup(string $group)
 * @method static array getGroupedSettings()
 * @method static \Modules\Settings\Domain\Models\Setting createSetting(array $data)
 * @method static \Modules\Settings\Domain\Models\Setting updateSetting(int $id, array $data)
 * @method static bool deleteSetting(int $id)
 *
 * @see \Modules\Settings\Services\SettingService
 */
class Setting extends Facade
{
    /**
     * Get the registered name of the component.
     *
     * @return string;
     */
    protected static function getFacadeAccessor()
    {
        return 'settings.service';
    }
}




