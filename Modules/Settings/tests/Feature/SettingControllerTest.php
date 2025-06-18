<?php
namespace Modules\Settings\tests\Feature;

use Tests\TestCase;
use Modules\Settings\Domain\Models\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\Core\Domain\Models\User;

class SettingControllerTest extends TestCase
{
    use RefreshDatabase;
use protected $user;

    protected function setUp(): void
    {
        parent::setUp();

        // Create a user
        $this->user = User::factory()->create();
    }

    public function test_can_view_settings_index()
    {
        // Create some settings
        Setting::factory()->count(3)->create();

        $response = $this->actingAs($this->user)
            ->get(route('settings.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Settings/Index'));
    }

    public function test_can_create_setting()
    {
        $response = $this->actingAs($this->user)
            ->get(route('settings.create'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Settings/Create'));
    }

    public function test_can_store_setting()
    {
        $settingData = [
            'key' => 'test_setting',
            'value' => 'test value',
            'group' => 'test',
            'display_name' => 'Test Setting',
            'description' => 'A test setting',
        ];

        $response = $this->actingAs($this->user)
            ->post(route('settings.store'), $settingData);

        $response->assertRedirect(route('settings.index'));
        $this->assertDatabaseHas('settings', [
            'key' => 'test_setting',
            'group' => 'test',
        ]);
    }

    public function test_can_update_setting()
    {
        $setting = Setting::factory()->create([
            'key' => 'test_setting',
            'value' => 'original value',
            'group' => 'test',
        ]);

        $updatedData = [
            'value' => 'updated value',
            'display_name' => 'Updated Setting',
        ];

        $response = $this->actingAs($this->user)
            ->put(route('settings.update', $setting->id), $updatedData);

        $response->assertRedirect(route('settings.index'));
        $this->assertDatabaseHas('settings', [
            'id' => $setting->id,
            'value' => 'updated value',
            'display_name' => 'Updated Setting',
        ]);
    }

    public function test_can_delete_setting()
    {
        $setting = Setting::factory()->create();

        $response = $this->actingAs($this->user)
            ->delete(route('settings.destroy', $setting->id));

        $response->assertRedirect(route('settings.index'));
        $this->assertSoftDeleted('settings', [
            'id' => $setting->id
        ]);
    }
}


