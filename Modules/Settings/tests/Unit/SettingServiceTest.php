<?php
namespace Modules\Settings\tests\Unit;

use Tests\TestCase;
use Modules\Settings\Domain\Models\Setting;
use Modules\Settings\Services\SettingService;
use Modules\Settings\Repositories\Interfaces\SettingRepositoryInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;

class SettingServiceTest extends TestCase
{
    use RefreshDatabase;
use protected $settingService;
    protected $mockRepository;

    protected function setUp(): void
    {
        parent::setUp();

        $this->mockRepository = Mockery::mock(SettingRepositoryInterface::class);
        $this->settingService = new SettingService($this->mockRepository);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function test_get_all_settings()
    {
        $settings = Setting::factory()->count(3)->make();
        $this->mockRepository->shouldReceive('all')->once()->andReturn($settings);

        $result = $this->settingService->getAllSettings();

        $this->assertCount(3, $result);
    }

    public function test_get_settings_by_group()
    {
        $groupName = 'system';
        $settings = Setting::factory()->count(2)->make([
            'group' => $groupName
        ]);

        $this->mockRepository->shouldReceive('getByGroup')
            ->once()
            ->with($groupName)
            ->andReturn($settings);

        $result = $this->settingService->getSettingsByGroup($groupName);

        $this->assertCount(2, $result);
    }

    public function test_get_setting_value()
    {
        $key = 'test_setting';
        $value = 'test_value';
        $group = 'test';

        $this->mockRepository->shouldReceive('getValue')
            ->once()
            ->with($key, null, $group)
            ->andReturn($value);

        $result = $this->settingService->get($key, null, $group);

        $this->assertEquals($value, $result);
    }

    public function test_set_setting_value()
    {
        $key = 'test_setting';
        $value = 'new_value';
        $group = 'test';
        $setting = Setting::factory()->make([
            'key' => $key,
            'value' => $value,
            'group' => $group,
        ]);

        $this->mockRepository->shouldReceive('findByKey')
            ->once()
            ->with($key, $group)
            ->andReturn($setting);

        $this->mockRepository->shouldReceive('update')
            ->once()
            ->with($setting->id, ['value' => $value])
            ->andReturn($setting);

        $result = $this->settingService->set($key, $value, $group);

        $this->assertEquals($setting, $result);
    }

    public function test_create_setting()
    {
        $settingData = [
            'key' => 'new_setting',
            'value' => 'some value',
            'group' => 'test',
        ];

        $setting = Setting::factory()->make($settingData);

        $this->mockRepository->shouldReceive('create')
            ->once()
            ->andReturn($setting);

        $result = $this->settingService->createSetting($settingData);

        $this->assertEquals($setting, $result);
    }

    public function test_update_setting()
    {
        $id = 1;
        $settingData = [
            'value' => 'updated value',
            'display_name' => 'Updated Setting',
        ];

        $setting = Setting::factory()->make($settingData);

        $this->mockRepository->shouldReceive('update')
            ->once()
            ->with($id, $settingData)
            ->andReturn($setting);

        $result = $this->settingService->updateSetting($id, $settingData);

        $this->assertEquals($setting, $result);
    }

    public function test_delete_setting()
    {
        $id = 1;

        $this->mockRepository->shouldReceive('delete')
            ->once()
            ->with($id)
            ->andReturn(true);

        $result = $this->settingService->deleteSetting($id);

        $this->assertTrue($result);
    }
}

