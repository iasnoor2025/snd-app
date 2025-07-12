<?php

test('incident model has correct relations', function () {
    $incident = \Modules\SafetyManagement\Domain\Models\Incident::factory()->make();
    expect($incident->user())->toBeInstanceOf(\Illuminate\Database\Eloquent\Relations\BelongsTo::class);
    expect($incident->safetyActions())->toBeInstanceOf(\Illuminate\Database\Eloquent\Relations\HasMany::class);
});
