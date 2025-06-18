<?php

namespace Modules\Settings\Http\Controllers\API;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Routing\Controller;
use Modules\Settings\Services\SettingService;
use Modules\Settings\Actions\CreateSettingAction;
use Modules\Settings\Actions\UpdateSettingAction;

class SettingApiController extends Controller
{
    protected $settingService;
    protected $createSettingAction;
    protected $updateSettingAction;

    public function __construct(
        SettingService $settingService,
        CreateSettingAction $createSettingAction,
        UpdateSettingAction $updateSettingAction
    ) {
        $this->settingService = $settingService;
        $this->createSettingAction = $createSettingAction;
        $this->updateSettingAction = $updateSettingAction;
    }

    /**
     * Get all settings.
     *
     * @return \Illuminate\Http\JsonResponse;
     */
    public function index()
    {
        $settings = $this->settingService->getAllSettings();

        return response()->json([
            'data' => $settings,
        ]);
    }

    /**
     * Get settings by group.
     *
     * @param string $group
     * @return \Illuminate\Http\JsonResponse;
     */
    public function getByGroup($group)
    {
        $settings = $this->settingService->getSettingsByGroup($group);

        return response()->json([
            'data' => $settings,
        ]);
    }

    /**
     * Get setting by key.
     *
     * @param string $key
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse;
     */
    public function getByKey($key, Request $request)
    {
        $group = $request->input('group');
        $default = $request->input('default');

        $value = $this->settingService->get($key, $default, $group);

        return response()->json([
            'data' => [
                'key' => $key,
                'value' => $value,
                'group' => $group,
            ],
        ]);
    }

    /**
     * Store a new setting.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse;
     */
    public function store(Request $request)
    {
        try {
            $setting = $this->createSettingAction->execute($request->all());

            return response()->json([
                'data' => $setting,
                'message' => 'Setting created successfully',
            ], Response::HTTP_CREATED);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], Response::HTTP_BAD_REQUEST);
        }
    }

    /**
     * Update a setting.
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse;
     */
    public function update(Request $request, $id)
    {
        try {
            $setting = $this->updateSettingAction->execute($id, $request->all());

            return response()->json([
                'data' => $setting,
                'message' => 'Setting updated successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], Response::HTTP_BAD_REQUEST);
        }
    }

    /**
     * Delete a setting.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse;
     */
    public function destroy($id)
    {
        try {
            $this->settingService->deleteSetting($id);

            return response()->json([
                'message' => 'Setting deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], Response::HTTP_BAD_REQUEST);
        }
    }
}


