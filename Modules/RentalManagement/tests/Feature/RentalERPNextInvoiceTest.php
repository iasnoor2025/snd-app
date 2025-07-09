<?php

namespace Modules\RentalManagement\Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\RentalManagement\Domain\Models\Rental;
use Modules\RentalManagement\Domain\Models\RentalItem;
use Modules\CustomerManagement\Domain\Models\Customer;
use Modules\RentalManagement\Services\ERPNextClient;
use Tests\TestCase;
use Mockery;

class RentalERPNextInvoiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_invoice_id_is_set_when_rental_completed_and_erpnext_sync_succeeds()
    {
        // Create customer and rental
        $customer = Customer::factory()->create(['name' => 'Test Customer']);
        $rental = Rental::factory()->create([
            'customer_id' => $customer->id,
            'status' => 'active',
            'invoice_id' => null,
        ]);
        RentalItem::factory()->create(['rental_id' => $rental->id]);

        // Mock ERPNextClient
        $mock = Mockery::mock(ERPNextClient::class);
        $mock->shouldReceive('getOrCreateCustomer')
            ->once()
            ->andReturn(['name' => 'Cust-1']);
        $mock->shouldReceive('createSalesInvoice')
            ->once()
            ->andReturn(['name' => 'INV-1']);
        $this->app->instance(ERPNextClient::class, $mock);

        // Simulate status update to completed
        $rental->status = 'completed';
        $rental->save();
        $rental->refresh();

        $this->assertEquals('INV-1', $rental->invoice_id);
    }
}
