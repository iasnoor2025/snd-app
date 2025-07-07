<?php

use Modules\RentalManagement\Domain\Models\Rental;
use Modules\RentalManagement\Domain\Models\RentalItem;
use Modules\RentalManagement\Domain\Models\Quotation;
use Modules\RentalManagement\Domain\Models\Invoice;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

describe('RentalItem', function () {
    it('calculates price per day correctly', function () {
        $item = RentalItem::factory()->make([
            'price_per_day' => 100,
            'days' => 3,
        ]);
        expect($item->price_per_day)->toBe(100);
        expect($item->getTotalAmountAttribute())->toBe(300);
    });

    it('falls back to unit_price if price_per_day is not set', function () {
        $item = RentalItem::factory()->make([
            'unit_price' => 80,
            'days' => 2,
        ]);
        expect($item->price_per_day)->toBe(80);
        expect($item->getTotalAmountAttribute())->toBe(160);
    });
});

describe('Rental relationships', function () {
    it('has many rental items', function () {
        $rental = Rental::factory()->create();
        RentalItem::factory()->count(2)->create(['rental_id' => $rental->id]);
        expect($rental->rentalItems)->toHaveCount(2);
    });

    it('has many quotations', function () {
        $rental = Rental::factory()->create();
        Quotation::factory()->count(2)->create(['rental_id' => $rental->id]);
        expect($rental->quotations)->toHaveCount(2);
    });

    it('has many invoices', function () {
        $rental = Rental::factory()->create();
        Invoice::factory()->count(2)->create(['rental_id' => $rental->id]);
        expect($rental->invoices)->toHaveCount(2);
    });
});
