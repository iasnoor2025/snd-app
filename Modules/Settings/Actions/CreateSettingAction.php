<?php

namespace Modules\Settings\Actions;

use Modules\Settings\Domain\Models\Setting;
use Modules\Settings\Services\SettingService;

class CreateSettingAction
{
    /**
     * @var SettingService
     */
    protected $settingService;

    /**
     * CreateSettingAction constructor.
     *
     * @param SettingService $settingService
     */
    public function __construct(SettingService $settingService)
    {
        $this->settingService = $settingService;
    }

    /**
     * Execute the action to create a new setting.
     *
     * @param array $data
     * @return Setting;
     */
    public function execute(array $data): Setting
    {
        // Validate required fields
        if (!isset($data['key']) || !isset($data['value'])) {
            throw new \InvalidArgumentException('The key and value fields are required');
        }

        // Set default group if not provided
        if (!isset($data['group'])) {
            $data['group'] = 'general';
        }

        // Create the setting
        return $this->settingService->createSetting($data);
    }
}


