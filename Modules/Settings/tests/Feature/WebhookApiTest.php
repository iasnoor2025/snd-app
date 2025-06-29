<?php

declare(strict_types=1);

namespace Modules\Settings\Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\Settings\Domain\Models\Webhook;
use Tests\TestCase;
use App\Models\User;

class WebhookApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_crud_operations(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user, 'sanctum');

        // Create
        $payload = [
            'event' => 'user.created',
            'url' => 'https://example.com/webhook',
            'secret' => 'abc123',
            'is_active' => true,
        ];
        $response = $this->postJson('/api/settings/webhooks', $payload);
        $response->assertStatus(201)->assertJson(['success' => true]);
        $webhookId = $response->json('data.id');

        // Index
        $response = $this->getJson('/api/settings/webhooks');
        $response->assertOk()->assertJson(['success' => true]);

        // Show
        $response = $this->getJson("/api/settings/webhooks/{$webhookId}");
        $response->assertOk()->assertJson(['success' => true]);

        // Update
        $update = ['event' => 'user.updated'];
        $response = $this->putJson("/api/settings/webhooks/{$webhookId}", $update);
        $response->assertOk()->assertJson(['success' => true]);
        $this->assertEquals('user.updated', $response->json('data.event'));

        // Delete
        $response = $this->deleteJson("/api/settings/webhooks/{$webhookId}");
        $response->assertOk()->assertJson(['success' => true]);
        $this->assertSoftDeleted('webhooks', ['id' => $webhookId]);
    }
}
