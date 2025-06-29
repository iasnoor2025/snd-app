<?php

declare(strict_types=1);

namespace Modules\Settings\Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\Settings\Domain\Models\SsoSetting;
use Tests\TestCase;
use App\Models\User;

class SsoSettingsApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_crud_operations(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user, 'sanctum');

        // Create
        $payload = [
            'provider' => 'Okta',
            'client_id' => 'client-123',
            'client_secret' => 'secret-xyz',
            'discovery_url' => 'https://okta.com/.well-known/openid-configuration',
            'redirect_uri' => 'https://app.example.com/auth/callback',
            'scopes' => 'openid email profile',
            'is_active' => true,
            'metadata' => ['foo' => 'bar'],
        ];
        $response = $this->postJson('/api/settings/sso', $payload);
        $response->assertStatus(201)->assertJson(['success' => true]);
        $ssoId = $response->json('data.id');

        // Index
        $response = $this->getJson('/api/settings/sso');
        $response->assertOk()->assertJson(['success' => true]);

        // Show
        $response = $this->getJson("/api/settings/sso/{$ssoId}");
        $response->assertOk()->assertJson(['success' => true]);

        // Update
        $update = ['provider' => 'AzureAD'];
        $response = $this->putJson("/api/settings/sso/{$ssoId}", $update);
        $response->assertOk()->assertJson(['success' => true]);
        $this->assertEquals('AzureAD', $response->json('data.provider'));

        // Delete
        $response = $this->deleteJson("/api/settings/sso/{$ssoId}");
        $response->assertOk()->assertJson(['success' => true]);
        $this->assertSoftDeleted('sso_settings', ['id' => $ssoId]);
    }
}
