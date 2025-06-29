<?php

namespace Modules\Settings\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Modules\Settings\Services\SettingService;

class ApiConfigController extends Controller
{
    public function index(SettingService $settingService)
    {
        $settings = $settingService->getSettingsByGroup('api');
        return response()->json(['data' => $settings]);
    }

    public function update(Request $request, SettingService $settingService)
    {
        $data = $request->only(['api_key', 'api_endpoint', 'rate_limit', 'allowed_ips', 'webhook_url']);
        foreach ($data as $key => $value) {
            $settingService->updateSetting($key, $value, 'api');
        }
        return response()->json(['message' => 'API configuration updated successfully']);
    }
}
