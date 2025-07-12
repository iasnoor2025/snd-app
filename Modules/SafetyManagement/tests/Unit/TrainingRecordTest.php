<?php

test('training record model has correct relations', function () {
    $record = \Modules\SafetyManagement\Domain\Models\TrainingRecord::factory()->make();
    expect($record->course())->toBeInstanceOf(\Illuminate\Database\Eloquent\Relations\BelongsTo::class);
    expect($record->users())->toBeInstanceOf(\Illuminate\Database\Eloquent\Relations\BelongsToMany::class);
});
