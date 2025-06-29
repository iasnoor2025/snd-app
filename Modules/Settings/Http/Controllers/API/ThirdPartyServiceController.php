<?php

namespace Modules\Settings\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Modules\Settings\Services\SettingService;

class ThirdPartyServiceController extends Controller
{
    public function index(SettingService $settingService)
    {
        $services = $settingService->getSettingsByGroup('third_party_services');
        return response()->json(['data' => $services]);
    }

    public function store(Request $request, SettingService $settingService)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'type' => 'required|string',
            'api_key' => 'nullable|string',
            'endpoint' => 'nullable|string',
            'config' => 'nullable|array',
        ]);
        $key = 'service_' . strtolower(preg_replace('/\s+/', '_', $data['name']));
        $settingService->updateSetting($key, json_encode($data), 'third_party_services');
        return response()->json(['message' => 'Service added']);
    }

    public function update(Request $request, $key, SettingService $settingService)
    {
        $data = $request->validate([
            'name' => 'sometimes|string',
            'type' => 'sometimes|string',
            'api_key' => 'nullable|string',
            'endpoint' => 'nullable|string',
            'config' => 'nullable|array',
        ]);
        $settingService->updateSetting($key, json_encode($data), 'third_party_services');
        return response()->json(['message' => 'Service updated']);
    }

    public function destroy($key, SettingService $settingService)
    {
        $settingService->deleteSetting($key, 'third_party_services');
        return response()->json(['message' => 'Service deleted']);
    }
}
