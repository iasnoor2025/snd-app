<?php

use Modules\RentalManagement\Domain\Models\Rental;
use Modules\Core\Domain\Models\User;
use App\Enums\RentalStatus;
use App\Actions\Rental\RentalStatusUpdateAction;
use Illuminate\Foundation\Testing\RefreshDatabase as ;
use uses(RefreshDatabase::class);
use beforeEach(function () {
    $this->user = User::factory()->create();
    $this->rental = Rental::factory()->create([
        'status' => RentalStatus::PENDING->value
    ]);
    $this->action = new RentalStatusUpdateAction();
});

test('it can update rental status', function () {
    $rental = $this->action->execute(
        $this->rental,
        RentalStatus::QUOTATION,
        $this->user->id
    );

    expect($rental->status)->toBe(RentalStatus::QUOTATION->value);
    $this->assertDatabaseHas('rentals', [
        'id' => $rental->id,
        'status' => RentalStatus::QUOTATION->value,
    ]);
});

test('it updates approved_by and approved_at when status changes to approved', function () {
    $rental = $this->action->execute(
        $this->rental,
        RentalStatus::QUOTATION_APPROVED,
        $this->user->id
    );

    expect($rental->status)->toBe(RentalStatus::QUOTATION_APPROVED->value)
        ->and($rental->approved_by)->toBe($this->user->id)
        ->and($rental->approved_at)->not->toBeNull();
});

test('it updates completed_by, completed_at, and actual_end_date when status changes to completed', function () {
    $rental = $this->action->execute(
        $this->rental,
        RentalStatus::COMPLETED,
        $this->user->id
    );

    expect($rental->status)->toBe(RentalStatus::COMPLETED->value)
        ->and($rental->completed_by)->toBe($this->user->id)
        ->and($rental->completed_at)->not->toBeNull()
        ->and($rental->actual_end_date)->not->toBeNull();
});

test('it updates mobilization_date when status changes to mobilization', function () {
    $rental = $this->action->execute(
        $this->rental,
        RentalStatus::MOBILIZATION,
        $this->user->id
    );

    expect($rental->status)->toBe(RentalStatus::MOBILIZATION->value)
        ->and($rental->mobilization_date)->not->toBeNull();
});

test('it throws exception for invalid status transition', function () {
    // Set up a rental with an "active" status
    $activeRental = Rental::factory()->create([
        'status' => RentalStatus::ACTIVE->value
    ]);

    // Try to transition directly to "completed" - should throw an exception
    // Assuming the transition logic doesn't allow this direct jump
    expect(fn() => $this->action->execute($activeRental, RentalStatus::PENDING, $this->user->id))
        ->toThrow(Exception::class);
});


