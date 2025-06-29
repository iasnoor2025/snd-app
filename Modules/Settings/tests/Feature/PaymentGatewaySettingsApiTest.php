<?php

declare(strict_types=1);

namespace Modules\Settings\Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\Settings\Domain\Models\PaymentGatewaySetting;
use Tests\TestCase;
use App\Models\User;

class PaymentGatewaySettingsApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_crud_operations(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user, 'sanctum');

        // Create
        $payload = [
            'provider' => 'Stripe',
            'credentials' => ['api_key' => 'sk_test_123'],
            'endpoints' => ['charge' => 'https://api.stripe.com/v1/charges'],
            'is_active' => true,
            'metadata' => ['foo' => 'bar'],
        ];
        $response = $this->postJson('/api/settings/payment-gateways', $payload);
        $response->assertStatus(201)->assertJson(['success' => true]);
        $id = $response->json('data.id');

        // Index
        $response = $this->getJson('/api/settings/payment-gateways');
        $response->assertOk()->assertJson(['success' => true]);

        // Show
        $response = $this->getJson("/api/settings/payment-gateways/{$id}");
        $response->assertOk()->assertJson(['success' => true]);

        // Update
        $update = ['provider' => 'PayPal'];
        $response = $this->putJson("/api/settings/payment-gateways/{$id}", $update);
        $response->assertOk()->assertJson(['success' => true]);
        $this->assertEquals('PayPal', $response->json('data.provider'));

        // Delete
        $response = $this->deleteJson("/api/settings/payment-gateways/{$id}");
        $response->assertOk()->assertJson(['success' => true]);
        $this->assertSoftDeleted('payment_gateway_settings', ['id' => $id]);
    }
}
