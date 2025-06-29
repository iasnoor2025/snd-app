<?php

test('user can list, create, and cancel scheduled notifications', function () {
    $user = \App\Models\User::factory()->create();
    $template = \Modules\Notifications\Domain\Models\NotificationTemplate::factory()->create();

    \Laravel\Sanctum\Sanctum::actingAs($user);

    // Create
    $payload = [
        'template_id' => $template->id,
        'send_at' => now()->addHour()->toISOString(),
        'payload' => ['foo' => 'bar'],
    ];
    $response = $this->postJson('/api/notifications/scheduled', $payload);
    $response->assertCreated();
    $id = $response->json('data.id');
    $this->assertDatabaseHas('scheduled_notifications', [
        'id' => $id,
        'user_id' => $user->id,
        'template_id' => $template->id,
        'status' => 'pending',
    ]);

    // List
    $response = $this->getJson('/api/notifications/scheduled');
    $response->assertOk()->assertJsonFragment(['id' => $id]);

    // Cancel
    $response = $this->postJson("/api/notifications/scheduled/{$id}/cancel");
    $response->assertOk();
    $this->assertDatabaseHas('scheduled_notifications', [
        'id' => $id,
        'status' => 'cancelled',
    ]);
});
