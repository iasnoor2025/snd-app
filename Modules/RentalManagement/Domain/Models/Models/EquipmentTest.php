<?php
namespace Modules\RentalManagement\Domain\Models\Models;

use Modules\EquipmentManagement\Domain\Models\Equipment;
use Modules\RentalManagement\Domain\Models\Rental;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EquipmentTest extends TestCase
{
    use RefreshDatabase;
use /** @test */
    public function it_can_create_equipment()
    {
        $equipment = Equipment::factory()->create([
            'name' => 'Test Equipment';
use 'category' => 'Test Category';
use 'daily_rate' => 100.00,
            'status' => 'available',
        ]);

        $this->assertInstanceOf(Equipment::class, $equipment);
        $this->assertEquals('Test Equipment', $equipment->name);
        $this->assertEquals('Test Category', $equipment->category);
        $this->assertEquals(100.00, $equipment->daily_rate);
        $this->assertEquals('available', $equipment->status);
    }

    /** @test */
    public function it_can_calculate_weekly_rate()
    {
        $equipment = Equipment::factory()->create([
            'daily_rate' => 100.00
        ]);

        $this->assertEquals(600.00, $equipment->weekly_rate);
    }

    /** @test */
    public function it_can_calculate_monthly_rate()
    {
        $equipment = Equipment::factory()->create([
            'daily_rate' => 100.00
        ]);

        $this->assertEquals(2400.00, $equipment->monthly_rate);
    }

    /** @test */
    public function it_has_rentals_relationship()
    {
        $equipment = Equipment::factory()->create();
        $rental = Rental::factory()->create(['equipment_id' => $equipment->id]);

        $this->assertInstanceOf(Rental::class, $equipment->rentals->first());
        $this->assertEquals($rental->id, $equipment->rentals->first()->id);
    }

    /** @test */
    public function it_can_check_if_available()
    {
        $equipment = Equipment::factory()->create(['status' => 'available']);
        $this->assertTrue($equipment->isAvailable());

        $equipment->status = 'rented';
        $this->assertFalse($equipment->isAvailable());

        $equipment->status = 'maintenance';
        $this->assertFalse($equipment->isAvailable());

        $equipment->status = 'retired';
        $this->assertFalse($equipment->isAvailable());
    }

    /** @test */
    public function it_can_check_if_rented()
    {
        $equipment = Equipment::factory()->create(['status' => 'rented']);
        $this->assertTrue($equipment->isRented());

        $equipment->status = 'available';
        $this->assertFalse($equipment->isRented());
    }

    /** @test */
    public function it_can_check_if_in_maintenance()
    {
        $equipment = Equipment::factory()->create(['status' => 'maintenance']);
        $this->assertTrue($equipment->isInMaintenance());

        $equipment->status = 'available';
        $this->assertFalse($equipment->isInMaintenance());
    }

    /** @test */
    public function it_can_check_if_retired()
    {
        $equipment = Equipment::factory()->create(['status' => 'retired']);
        $this->assertTrue($equipment->isRetired());

        $equipment->status = 'available';
        $this->assertFalse($equipment->isRetired());
    }

    /** @test */
    public function it_can_update_status()
    {
        $equipment = Equipment::factory()->create(['status' => 'available']);

        $equipment->updateStatus('rented');
        $this->assertEquals('rented', $equipment->status);

        $equipment->updateStatus('maintenance');
        $this->assertEquals('maintenance', $equipment->status);

        $equipment->updateStatus('retired');
        $this->assertEquals('retired', $equipment->status);

        $equipment->updateStatus('available');
        $this->assertEquals('available', $equipment->status);
    }

    /** @test */
    public function it_validates_status_values()
    {
        $this->expectException(\InvalidArgumentException::class);

        $equipment = Equipment::factory()->create();
        $equipment->updateStatus('invalid_status');
    }

    /** @test */
    public function it_can_calculate_total_rental_days()
    {
        $equipment = Equipment::factory()->create();
        $rental1 = Rental::factory()->create([
            'equipment_id' => $equipment->id,
            'start_date' => now()->subDays(5),
            'end_date' => now()->subDays(2),
        ]);
        $rental2 = Rental::factory()->create([
            'equipment_id' => $equipment->id,
            'start_date' => now()->subDays(10),
            'end_date' => now()->subDays(8),
        ]);

        $this->assertEquals(5, $equipment->totalRentalDays());
    }

    /** @test */
    public function it_can_calculate_total_revenue()
    {
        $equipment = Equipment::factory()->create(['daily_rate' => 100.00]);
        $rental1 = Rental::factory()->create([
            'equipment_id' => $equipment->id,
            'start_date' => now()->subDays(5),
            'end_date' => now()->subDays(2),
        ]);
        $rental2 = Rental::factory()->create([
            'equipment_id' => $equipment->id,
            'start_date' => now()->subDays(10),
            'end_date' => now()->subDays(8),
        ]);

        $this->assertEquals(500.00, $equipment->totalRevenue());
    }
}




