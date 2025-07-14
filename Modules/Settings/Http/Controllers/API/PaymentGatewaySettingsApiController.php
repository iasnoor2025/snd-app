<?php

namespace Modules\Settings\Http\Controllers\API;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Modules\Core\Http\Controllers\Controller;
use Modules\Settings\Domain\Models\PaymentGatewaySetting;

class PaymentGatewaySettingsApiController extends Controller
{
    public function index(): JsonResponse
    {
        $settings = PaymentGatewaySetting::all();
        return response()->json(['success' => true, 'data' => $settings]);
    }

    public function show($id): JsonResponse
    {
        $setting = PaymentGatewaySetting::findOrFail($id);
        return response()->json(['success' => true, 'data' => $setting]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'provider' => 'required|string|max:255',
            'credentials' => 'required|array',
            'endpoints' => 'required|array',
            'is_active' => 'boolean',
            'metadata' => 'nullable|array',
        ]);
        $setting = PaymentGatewaySetting::create($validated);
        return response()->json(['success' => true, 'data' => $setting], 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $setting = PaymentGatewaySetting::findOrFail($id);
        $validated = $request->validate([
            'provider' => 'sometimes|required|string|max:255',
            'credentials' => 'sometimes|required|array',
            'endpoints' => 'sometimes|required|array',
            'is_active' => 'boolean',
            'metadata' => 'nullable|array',
        ]);
        $setting->update($validated);
        return response()->json(['success' => true, 'data' => $setting]);
    }

    public function destroy($id): JsonResponse
    {
        $setting = PaymentGatewaySetting::findOrFail($id);
        $setting->delete();
        return response()->json(['success' => true]);
    }
}
