<?php

namespace Modules\Settings\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Modules\Core\Http\Controllers\Controller;
use Modules\Settings\Domain\Models\Webhook;

class WebhookApiController extends Controller
{
    public function index(): JsonResponse
    {
        $webhooks = Webhook::all();
        return response()->json(['success' => true, 'data' => $webhooks]);
    }

    public function show($id): JsonResponse
    {
        $webhook = Webhook::findOrFail($id);
        return response()->json(['success' => true, 'data' => $webhook]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'event' => 'required|string|max:255',
            'url' => 'required|url',
            'secret' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);
        $webhook = Webhook::create($validated);
        return response()->json(['success' => true, 'data' => $webhook], 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $webhook = Webhook::findOrFail($id);
        $validated = $request->validate([
            'event' => 'sometimes|required|string|max:255',
            'url' => 'sometimes|required|url',
            'secret' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);
        $webhook->update($validated);
        return response()->json(['success' => true, 'data' => $webhook]);
    }

    public function destroy($id): JsonResponse
    {
        $webhook = Webhook::findOrFail($id);
        $webhook->delete();
        return response()->json(['success' => true]);
    }
}
