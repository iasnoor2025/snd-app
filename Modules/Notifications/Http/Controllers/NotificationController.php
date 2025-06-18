<?php

namespace Modules\Notifications\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;

class NotificationController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['message' => 'Not implemented: index'], 200);
    }

    public function show($id): JsonResponse
    {
        return response()->json(['message' => 'Not implemented: show', 'id' => $id], 200);
    }

    public function store(Request $request): JsonResponse
    {
        return response()->json(['message' => 'Not implemented: store'], 200);
    }

    public function update(Request $request, $id): JsonResponse
    {
        return response()->json(['message' => 'Not implemented: update', 'id' => $id], 200);
    }

    public function destroy($id): JsonResponse
    {
        return response()->json(['message' => 'Not implemented: destroy', 'id' => $id], 200);
    }
}
