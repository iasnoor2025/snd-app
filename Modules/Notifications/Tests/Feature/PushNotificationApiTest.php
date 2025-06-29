<?php

declare(strict_types=1);

namespace Modules\Notifications\Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\Notifications\Domain\Models\DevicePushToken;
use Tests\TestCase;
use App\Models\User;

class PushNotificationApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_and_send_test(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user, 'sanctum');

        // Register device token
        $payload = [
            'token' => 'test-token-123',
            'platform' => 'web',
        ];
        $response = $this->postJson('/api/notifications/push/register', $payload);
        $response->assertOk()->assertJson(['success' => true]);
        $this->assertDatabaseHas('device_push_tokens', [
            'token' => 'test-token-123',
            'platform' => 'web',
            'user_id' => $user->id,
        ]);

        // Send test push
        $testPayload = [
            'token' => 'test-token-123',
            'title' => 'Test Title',
            'body' => 'Test Body',
        ];
        $response = $this->postJson('/api/notifications/push/test', $testPayload);
        $response->assertOk()->assertJson(['success' => true]);
    }
}
