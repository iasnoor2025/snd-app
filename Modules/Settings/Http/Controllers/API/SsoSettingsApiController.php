<?php

namespace Modules\Settings\Http\Controllers\API;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Modules\Core\Http\Controllers\Controller;
use Modules\Settings\Domain\Models\SsoSetting;

class SsoSettingsApiController extends Controller
{
    public function index(): JsonResponse
    {
        $settings = SsoSetting::all();
        return response()->json(['success' => true, 'data' => $settings]);
    }

    public function show($id): JsonResponse
    {
        $setting = SsoSetting::findOrFail($id);
        return response()->json(['success' => true, 'data' => $setting]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'provider' => 'required|string|max:255',
            'client_id' => 'required|string|max:255',
            'client_secret' => 'required|string|max:255',
            'discovery_url' => 'required|url',
            'redirect_uri' => 'required|url',
            'scopes' => 'required|string',
            'is_active' => 'boolean',
            'metadata' => 'nullable|array',
        ]);
        $setting = SsoSetting::create($validated);
        return response()->json(['success' => true, 'data' => $setting], 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $setting = SsoSetting::findOrFail($id);
        $validated = $request->validate([
            'provider' => 'sometimes|required|string|max:255',
            'client_id' => 'sometimes|required|string|max:255',
            'client_secret' => 'sometimes|required|string|max:255',
            'discovery_url' => 'sometimes|required|url',
            'redirect_uri' => 'sometimes|required|url',
            'scopes' => 'sometimes|required|string',
            'is_active' => 'boolean',
            'metadata' => 'nullable|array',
        ]);
        $setting->update($validated);
        return response()->json(['success' => true, 'data' => $setting]);
    }

    public function destroy($id): JsonResponse
    {
        $setting = SsoSetting::findOrFail($id);
        $setting->delete();
        return response()->json(['success' => true]);
    }
}
