<?php

use Modules\RentalManagement\Domain\Models\Quotation;
use Modules\RentalManagement\Domain\Models\QuotationHistory;
use Modules\CustomerManagement\Domain\Models\Customer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Modules\RentalManagement\Mail\QuotationMail;

uses(RefreshDatabase::class);

describe('QuotationController', function () {
    it('can approve a quotation and logs history', function () {
        $quotation = Quotation::factory()->create(['status' => 'draft']);
        $user = \App\Models\User::factory()->create();
        $this->actingAs($user)
            ->post(route('quotations.approve', $quotation))
            ->assertRedirect();
        $quotation->refresh();
        expect($quotation->status)->toBe('approved');
        expect(QuotationHistory::where('quotation_id', $quotation->id)->where('action', 'approved')->exists())->toBeTrue();
    });

    it('can reject a quotation and logs history', function () {
        $quotation = Quotation::factory()->create(['status' => 'draft']);
        $user = \App\Models\User::factory()->create();
        $this->actingAs($user)
            ->post(route('quotations.reject', $quotation), ['notes' => 'Not acceptable'])
            ->assertRedirect();
        $quotation->refresh();
        expect($quotation->status)->toBe('rejected');
        expect(QuotationHistory::where('quotation_id', $quotation->id)->where('action', 'rejected')->exists())->toBeTrue();
    });

    it('can edit a quotation and logs history', function () {
        $quotation = Quotation::factory()->create(['status' => 'draft']);
        $user = \App\Models\User::factory()->create();
        $this->actingAs($user)
            ->put(route('quotations.update', $quotation), [
                'customer_id' => $quotation->customer_id,
                'quotation_number' => $quotation->quotation_number,
                'issue_date' => $quotation->issue_date,
                'valid_until' => $quotation->valid_until,
                'status' => 'draft',
                'subtotal' => 100,
                'total_amount' => 100,
                'quotation_items' => [],
            ])
            ->assertRedirect();
        expect(QuotationHistory::where('quotation_id', $quotation->id)->where('action', 'edited')->exists())->toBeTrue();
    });

    it('can delete a quotation and logs history', function () {
        $quotation = Quotation::factory()->create();
        $user = \App\Models\User::factory()->create();
        $this->actingAs($user)
            ->delete(route('quotations.destroy', $quotation))
            ->assertRedirect();
        expect(QuotationHistory::where('quotation_id', $quotation->id)->where('action', 'deleted')->exists())->toBeTrue();
    });

    it('can email a quotation and logs history', function () {
        Mail::fake();
        $customer = Customer::factory()->create(['email' => 'test@example.com']);
        $quotation = Quotation::factory()->create(['customer_id' => $customer->id]);
        $user = \App\Models\User::factory()->create();
        $this->actingAs($user)
            ->post("/quotations/{$quotation->id}/email")
            ->assertOk();
        Mail::assertSent(QuotationMail::class);
        expect(QuotationHistory::where('quotation_id', $quotation->id)->where('action', 'emailed')->exists())->toBeTrue();
    });

    it('shows timeline/history for a quotation', function () {
        $quotation = Quotation::factory()->create();
        $user = \App\Models\User::factory()->create();
        QuotationHistory::create([
            'quotation_id' => $quotation->id,
            'user_id' => $user->id,
            'action' => 'created',
            'from_status' => null,
            'to_status' => 'draft',
            'notes' => 'Initial',
        ]);
        $this->actingAs($user)
            ->getJson("/api/quotations/{$quotation->id}/history")
            ->assertOk()
            ->assertJsonFragment(['action' => 'created', 'notes' => 'Initial']);
    });

    it('enforces permissions for actions', function () {
        $quotation = Quotation::factory()->create(['status' => 'draft']);
        $this->post(route('quotations.approve', $quotation))
            ->assertForbidden();
    });
});
