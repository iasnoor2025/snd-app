<?php

test('dashboard API returns KPIs', function () {
    $response = $this->getJson('/api/safety/kpis');
    $response->assertOk();
    $response->assertJsonStructure([
        'incident_rate',
        'overdue_actions',
        'training_compliance',
    ]);
});
