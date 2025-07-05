<?php

namespace Modules\Settings\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Inertia\Inertia;
use Modules\Settings\Services\SettingService;
use Modules\Settings\Actions\CreateSettingAction;
use Modules\Settings\Actions\UpdateSettingAction;
use Modules\Settings\Http\Requests\SettingStoreRequest;
use Modules\Settings\Http\Requests\SettingUpdateRequest;

class SettingController extends Controller
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

    public function index()
    {
        $groupedSettings = $this->settingService->getGroupedSettings();

        return Inertia::render('Settings/Index', [
            'settings' => $groupedSettings,
        ]);
    }

    public function create()
    {
        $groups = array_keys($this->settingService->getGroupedSettings());

        return Inertia::render('Settings/Create', [
            'groups' => $groups,
            'types' => ['string', 'boolean', 'integer', 'float', 'array', 'json']
        ]);
    }

    public function store(SettingStoreRequest $request)
    {
        $this->createSettingAction->execute($request->validated());

        return redirect()->route('settings.index')
            ->with('success', 'Setting created successfully');
    }

    public function show($id)
    {
        $setting = $this->settingService->repository->find($id);
        $groups = array_keys($this->settingService->getGroupedSettings());
        return Inertia::render('Settings/Show', [
            'setting' => $setting,
            'groups' => $groups,
            'types' => ['string', 'boolean', 'integer', 'float', 'array', 'json'],
            'created_at' => $setting->created_at ?? null,
            'updated_at' => $setting->updated_at ?? null,
            'deleted_at' => $setting->deleted_at ?? null,
        ]);
    }

    public function edit($id)
    {
        $setting = $this->settingService->repository->find($id);
        $groups = array_keys($this->settingService->getGroupedSettings());
        return Inertia::render('Settings/Edit', [
            'setting' => $setting,
            'groups' => $groups,
            'types' => ['string', 'boolean', 'integer', 'float', 'array', 'json'],
            'created_at' => $setting->created_at ?? null,
            'updated_at' => $setting->updated_at ?? null,
            'deleted_at' => $setting->deleted_at ?? null,
        ]);
    }

    public function update(SettingUpdateRequest $request, $id)
    {
        $this->updateSettingAction->execute($id, $request->validated());

        return redirect()->route('settings.index')
            ->with('success', 'Setting updated successfully');
    }

    public function destroy($id)
    {
        $this->settingService->deleteSetting($id);

        return redirect()->route('settings.index')
            ->with('success', 'Setting deleted successfully');
    }
}


