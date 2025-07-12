<?php

test('inspection model has correct relations', function () {
    $inspection = \Modules\SafetyManagement\Domain\Models\Inspection::factory()->make();
    expect($inspection->inspectionItems())->toBeInstanceOf(\Illuminate\Database\Eloquent\Relations\HasMany::class);
    expect($inspection->module())->toBeInstanceOf(\Illuminate\Database\Eloquent\Relations\BelongsTo::class);
});
