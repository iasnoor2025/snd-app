<?php

namespace Modules\Settings\Actions;

use Modules\Settings\Domain\Models\Setting;
use Modules\Settings\Services\SettingService;

class UpdateSettingAction
{
    /**
     * @var SettingService
     */
    protected $settingService;

    /**
     * UpdateSettingAction constructor.
     *
     * @param SettingService $settingService
     */
    public function __construct(SettingService $settingService)
    {
        $this->settingService = $settingService;
    }

    /**
     * Execute the action to update a setting.
     *
     * @param int $id
     * @param array $data
     * @return Setting;
     */
    public function execute(int $id, array $data): Setting
    {
        // Update the setting
        return $this->settingService->updateSetting($id, $data);
    }
}


