<?php

declare(strict_types=1);

namespace Modules\Notifications\Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\Notifications\Domain\Models\InAppNotification;
use Modules\Notifications\Services\InAppNotificationService;
use Tests\TestCase;
use App\Models\User;

class InAppNotificationApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_in_app_notifications_crud(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user, 'sanctum');
        $service = new InAppNotificationService();
        $n1 = $service->notify($user->id, 'Test', ['message' => 'Hello']);
        $n2 = $service->notify($user->id, 'Test', ['message' => 'World']);

        // List
        $response = $this->getJson('/api/notifications/in-app');
        $response->assertOk()->assertJson(['success' => true]);
        $this->assertCount(2, $response->json('data'));

        // Mark as read
        $response = $this->postJson("/api/notifications/in-app/{$n1->id}/read");
        $response->assertOk()->assertJson(['success' => true]);
        $this->assertNotNull(InAppNotification::find($n1->id)->read_at);

        // Clear all
        $response = $this->deleteJson('/api/notifications/in-app/clear');
        $response->assertOk()->assertJson(['success' => true]);
        $this->assertDatabaseMissing('in_app_notifications', ['id' => $n1->id]);
        $this->assertDatabaseMissing('in_app_notifications', ['id' => $n2->id]);
    }
}
