<?php

declare(strict_types=1);

namespace Modules\Notifications\Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\Notifications\Domain\Models\NotificationPreference;
use Modules\Notifications\Services\NotificationPreferenceService;
use Tests\TestCase;
use App\Models\User;

class NotificationPreferenceApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_get_and_update_preferences(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user, 'sanctum');
        $service = new NotificationPreferenceService();
        $prefs = $service->getForUser($user->id);
        $this->assertTrue($prefs['email']);
        $this->assertFalse($prefs['sms']);

        // Update
        $payload = [
            'email' => false,
            'sms' => true,
            'push' => false,
            'in_app' => true,
        ];
        $response = $this->postJson('/api/notifications/preferences', $payload);
        $response->assertOk()->assertJson(['success' => true]);
        $this->assertEquals($payload, $response->json('data'));

        // Get again
        $response = $this->getJson('/api/notifications/preferences');
        $response->assertOk()->assertJson(['success' => true]);
        $this->assertEquals($payload, $response->json('data'));
    }
}
