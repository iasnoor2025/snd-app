<?php

namespace Tests\Integration\Database;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\RentalManagement\Models\Rental;
use Modules\CustomerManagement\Models\Customer;
use Modules\EquipmentManagement\Models\Equipment;
use Modules\EmployeeManagement\Models\Employee;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class RentalDatabaseTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_rental_creation_with_relationships(): void
    {
        // Arrange
        $customer = Customer::factory()->create();
        $equipment = Equipment::factory()->create();
        $employee = Employee::factory()->create();

        // Act
        $rental = Rental::create([
            'customer_id' => $customer->id,
            'employee_id' => $employee->id,
            'status' => 'pending',
            'start_date' => Carbon::now(),
            'expected_end_date' => Carbon::now()->addDays(7),
            'total_amount' => 1000.00
        ]);

        $rental->items()->create([
            'equipment_id' => $equipment->id,
            'quantity' => 1,
            'rate' => 100.00
        ]);

        // Assert
        $this->assertDatabaseHas('rentals', [
            'id' => $rental->id,
            'customer_id' => $customer->id,
            'employee_id' => $employee->id,
            'status' => 'pending'
        ]);

        $this->assertDatabaseHas('rental_items', [
            'rental_id' => $rental->id,
            'equipment_id' => $equipment->id
        ]);
    }

    public function test_rental_soft_delete(): void
    {
        // Arrange
        $rental = Rental::factory()->create();

        // Act
        $rental->delete();

        // Assert
        $this->assertSoftDeleted('rentals', [
            'id' => $rental->id
        ]);
    }

    public function test_rental_with_multiple_items(): void
    {
        // Arrange
        $rental = Rental::factory()->create();
        $equipmentItems = Equipment::factory()->count(3)->create();

        // Act
        foreach ($equipmentItems as $equipment) {
            $rental->items()->create([
                'equipment_id' => $equipment->id,
                'quantity' => rand(1, 5),
                'rate' => rand(100, 500)
            ]);
        }

        // Assert
        $this->assertEquals(3, $rental->items()->count());
        $this->assertDatabaseCount('rental_items', 3);
    }

    public function test_rental_status_update(): void
    {
        // Arrange
        $rental = Rental::factory()->create(['status' => 'pending']);

        // Act
        DB::transaction(function () use ($rental) {
            $rental->update(['status' => 'active']);
            $rental->statusHistory()->create([
                'from_status' => 'pending',
                'to_status' => 'active',
                'changed_by' => 1
            ]);
        });

        // Assert
        $this->assertDatabaseHas('rentals', [
            'id' => $rental->id,
            'status' => 'active'
        ]);

        $this->assertDatabaseHas('rental_status_history', [
            'rental_id' => $rental->id,
            'from_status' => 'pending',
            'to_status' => 'active'
        ]);
    }

    public function test_rental_with_payments(): void
    {
        // Arrange
        $rental = Rental::factory()->create([
            'total_amount' => 1000.00
        ]);

        // Act
        $rental->payments()->create([
            'amount' => 500.00,
            'payment_method' => 'credit_card',
            'status' => 'completed',
            'transaction_id' => 'txn_123'
        ]);

        // Assert
        $this->assertDatabaseHas('rental_payments', [
            'rental_id' => $rental->id,
            'amount' => 500.00,
            'payment_method' => 'credit_card'
        ]);
    }

    public function test_rental_with_documents(): void
    {
        // Arrange
        $rental = Rental::factory()->create();

        // Act
        $rental->documents()->create([
            'type' => 'contract',
            'file_path' => 'contracts/rental_123.pdf',
            'file_name' => 'rental_contract.pdf',
            'mime_type' => 'application/pdf'
        ]);

        // Assert
        $this->assertDatabaseHas('rental_documents', [
            'rental_id' => $rental->id,
            'type' => 'contract',
            'file_name' => 'rental_contract.pdf'
        ]);
    }

    public function test_rental_with_notes(): void
    {
        // Arrange
        $rental = Rental::factory()->create();

        // Act
        $rental->notes()->create([
            'content' => 'Customer requested early pickup',
            'created_by' => 1
        ]);

        // Assert
        $this->assertDatabaseHas('rental_notes', [
            'rental_id' => $rental->id,
            'content' => 'Customer requested early pickup'
        ]);
    }

    public function test_rental_date_constraints(): void
    {
        // Arrange
        $startDate = Carbon::now();
        $endDate = Carbon::now()->subDays(1);

        // Act & Assert
        $this->expectException(\Illuminate\Database\QueryException::class);
        
        Rental::create([
            'customer_id' => Customer::factory()->create()->id,
            'employee_id' => Employee::factory()->create()->id,
            'status' => 'pending',
            'start_date' => $startDate,
            'expected_end_date' => $endDate,
            'total_amount' => 1000.00
        ]);
    }

    public function test_rental_cascading_soft_deletes(): void
    {
        // Arrange
        $rental = Rental::factory()->create();
        $rental->items()->create([
            'equipment_id' => Equipment::factory()->create()->id,
            'quantity' => 1,
            'rate' => 100.00
        ]);
        $rental->documents()->create([
            'type' => 'contract',
            'file_path' => 'contracts/rental_123.pdf',
            'file_name' => 'rental_contract.pdf',
            'mime_type' => 'application/pdf'
        ]);

        // Act
        $rental->delete();

        // Assert
        $this->assertSoftDeleted('rentals', ['id' => $rental->id]);
        $this->assertSoftDeleted('rental_items', ['rental_id' => $rental->id]);
        $this->assertSoftDeleted('rental_documents', ['rental_id' => $rental->id]);
    }

    public function test_rental_total_amount_calculation(): void
    {
        // Arrange
        $rental = Rental::factory()->create();
        $equipment = Equipment::factory()->create();

        // Act
        $rental->items()->create([
            'equipment_id' => $equipment->id,
            'quantity' => 2,
            'rate' => 100.00
        ]);

        $rental->calculateTotalAmount();

        // Assert
        $this->assertEquals(200.00, $rental->total_amount);
        $this->assertDatabaseHas('rentals', [
            'id' => $rental->id,
            'total_amount' => 200.00
        ]);
    }
} 