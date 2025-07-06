<?php
namespace Modules\Core\Services\Services;

use Modules\RentalManagement\Domain\Models\Rental;
use Modules\CustomerManagement\Domain\Models\Customer;
use App\Enums\RentalStatus;
use App\Services\RentalStatusWorkflow;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RentalStatusWorkflowTest extends TestCase
{
    use RefreshDatabase;
use protected $workflow;
    protected $rental;

    public function setUp(): void
    {
        parent::setUp();

        $this->workflow = new RentalStatusWorkflow();

        // Create test data
        $customer = Customer::factory()->create();
        $this->rental = Rental::factory()->create([
            'customer_id' => $customer->id,
            'status' => RentalStatus::PENDING->value,
        ]);
    }

    /** @test */
    public function it_returns_next_possible_states()
    {
        $nextStates = $this->workflow->getNextPossibleStates($this->rental);

        // Pending can transition to Quotation, Active, or Cancelled
        $this->assertTrue(in_array(RentalStatus::QUOTATION->value, $nextStates));
        $this->assertTrue(in_array(RentalStatus::ACTIVE->value, $nextStates));
        $this->assertTrue(in_array(RentalStatus::CANCELLED->value, $nextStates));

        // But not to Completed
        $this->assertFalse(in_array(RentalStatus::COMPLETED->value, $nextStates));
    }

    /** @test */
    public function it_validates_transitions()
    {
        // Valid transitions
        $this->assertTrue($this->workflow->canTransitionTo($this->rental, RentalStatus::QUOTATION));
        $this->assertTrue($this->workflow->canTransitionTo($this->rental, RentalStatus::CANCELLED));

        // Invalid transitions
        $this->assertFalse($this->workflow->canTransitionTo($this->rental, RentalStatus::COMPLETED));
        $this->assertFalse($this->workflow->canTransitionTo($this->rental, RentalStatus::OVERDUE));
    }

    /** @test */
    public function it_transitions_rental_status()
    {
        // Transition from Pending to Quotation
        $updatedRental = $this->workflow->transitionTo($this->rental, RentalStatus::QUOTATION);

        // Check that the status has been updated
        $this->assertEquals(RentalStatus::QUOTATION->value, $updatedRental->status);

        // The original rental object should be unchanged (fresh instance was returned)
        $this->assertEquals(RentalStatus::PENDING->value, $this->rental->status);

        // Reload the rental from the database
        $this->rental->refresh();

        // Now the original should be updated too
        $this->assertEquals(RentalStatus::QUOTATION->value, $this->rental->status);
    }

    /** @test */
    public function it_sets_additional_data_on_transition()
    {
        // Transition from Pending to Quotation Approved (which should set approved_at)
        $this->rental->status = RentalStatus::QUOTATION->value;
        $this->rental->save();

        $userId = 999;
        $updatedRental = $this->workflow->transitionTo($this->rental, RentalStatus::QUOTATION_APPROVED, $userId);

        // Check status and additional fields
        $this->assertEquals(RentalStatus::QUOTATION_APPROVED->value, $updatedRental->status);
        $this->assertNotNull($updatedRental->approved_at);
        $this->assertEquals($userId, $updatedRental->approved_by);
    }

    /** @test */
    public function it_applies_business_rules_to_transitions()
    {
        // A rental without items can't transition to Active
        $this->assertFalse($this->workflow->canTransitionTo($this->rental, RentalStatus::ACTIVE));

        // Add a rental item to satisfy the business rule
        $this->rental->rentalItems()->create([
            'equipment_id' => 1,
            'start_date' => now(),
            'end_date' => now()->addDays(7),
            'rate' => 100,
        ]);

        // Now it should be allowed
        $this->assertTrue($this->workflow->canTransitionTo($this->rental, RentalStatus::ACTIVE));
    }

    /** @test */
    public function it_prevents_invalid_transitions()
    {
        // Try to transition to a state that isn't allowed
        $this->expectException(\Exception::class);
        $this->workflow->transitionTo($this->rental, RentalStatus::COMPLETED);
    }
}

