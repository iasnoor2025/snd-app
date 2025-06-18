<?php
namespace Modules\RentalManagement\Services\Services;

use Modules\EquipmentManagement\Domain\Models\Equipment;
use Modules\RentalManagement\Domain\Models\Rental;
use App\Services\EquipmentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EquipmentServiceTest extends TestCase
{
    use RefreshDatabase;
use private EquipmentService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(EquipmentService::class);
    }

    /** @test */
    public function it_can_get_all_equipment()
    {
        Equipment::factory()->count(3)->create();

        $equipment = $this->service->getAll();

        $this->assertCount(3, $equipment);
    }

    /** @test */
    public function it_can_get_equipment_by_id()
    {
        $createdEquipment = Equipment::factory()->create();

        $equipment = $this->service->getById($createdEquipment->id);

        $this->assertInstanceOf(Equipment::class, $equipment);
        $this->assertEquals($createdEquipment->id, $equipment->id);
    }

    /** @test */
    public function it_can_create_equipment()
    {
        $equipmentData = [
            'name' => 'New Equipment',
            'description' => 'Test Description',
            'category' => 'Test Category',
            'daily_rate' => 100.00,
            'weekly_rate' => 600.00,
            'monthly_rate' => 2400.00,
            'status' => 'available',
            'serial_number' => 'SN001',
            'purchase_date' => now()->toDateString(),
            'last_maintenance_date' => now()->toDateString(),
            'notes' => 'Test Notes',
        ];

        $equipment = $this->service->create($equipmentData);

        $this->assertInstanceOf(Equipment::class, $equipment);
        $this->assertEquals($equipmentData['name'], $equipment->name);
        $this->assertEquals($equipmentData['category'], $equipment->category);
        $this->assertEquals($equipmentData['daily_rate'], $equipment->daily_rate);
        $this->assertEquals($equipmentData['status'], $equipment->status);
        $this->assertEquals($equipmentData['serial_number'], $equipment->serial_number);
    }

    /** @test */
    public function it_can_update_equipment()
    {
        $equipment = Equipment::factory()->create();
        $updateData = [
            'name' => 'Updated Equipment',
            'category' => 'Updated Category',
            'daily_rate' => 150.00,
            'status' => 'maintenance',
        ];

        $updatedEquipment = $this->service->update($equipment->id, $updateData);

        $this->assertInstanceOf(Equipment::class, $updatedEquipment);
        $this->assertEquals($updateData['name'], $updatedEquipment->name);
        $this->assertEquals($updateData['category'], $updatedEquipment->category);
        $this->assertEquals($updateData['daily_rate'], $updatedEquipment->daily_rate);
        $this->assertEquals($updateData['status'], $updatedEquipment->status);
    }

    /** @test */
    public function it_can_delete_equipment()
    {
        $equipment = Equipment::factory()->create();

        $this->service->delete($equipment->id);

        $this->assertDatabaseMissing('equipment', [
            'id' => $equipment->id
        ]);
    }

    /** @test */
    public function it_cannot_delete_equipment_with_active_rentals()
    {
        $equipment = Equipment::factory()->create(['status' => 'rented']);

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Cannot delete equipment with active rentals');

        $this->service->delete($equipment->id);
    }

    /** @test */
    public function it_can_get_available_equipment()
    {
        Equipment::factory()->create(['status' => 'available']);
        Equipment::factory()->create(['status' => 'rented']);
        Equipment::factory()->create(['status' => 'maintenance']);

        $availableEquipment = $this->service->getAvailable();

        $this->assertCount(1, $availableEquipment);
        $this->assertEquals('available', $availableEquipment->first()->status);
    }

    /** @test */
    public function it_can_get_equipment_by_category()
    {
        Equipment::factory()->create(['category' => 'Category A']);
        Equipment::factory()->create(['category' => 'Category B']);
        Equipment::factory()->create(['category' => 'Category A']);

        $equipment = $this->service->getByCategory('Category A');

        $this->assertCount(2, $equipment);
        $this->assertEquals('Category A', $equipment->first()->category);
    }

    /** @test */
    public function it_can_search_equipment()
    {
        Equipment::factory()->create(['name' => 'Test Equipment 1']);
        Equipment::factory()->create(['name' => 'Test Equipment 2']);
        Equipment::factory()->create(['name' => 'Other Equipment']);

        $equipment = $this->service->search('Test');

        $this->assertCount(2, $equipment);
        $this->assertStringContainsString('Test', $equipment->first()->name);
    }

    /** @test */
    public function it_can_calculate_equipment_revenue()
    {
        $equipment = Equipment::factory()->create(['daily_rate' => 100.00]);
        Rental::factory()->create([
            'equipment_id' => $equipment->id,
            'start_date' => now()->subDays(5),
            'end_date' => now()->subDays(2),
        ]);
        Rental::factory()->create([
            'equipment_id' => $equipment->id,
            'start_date' => now()->subDays(10),
            'end_date' => now()->subDays(8),
        ]);

        $revenue = $this->service->calculateRevenue($equipment->id);

        $this->assertEquals(500.00, $revenue);
    }

    /** @test */
    public function it_can_calculate_equipment_utilization()
    {
        $equipment = Equipment::factory()->create();
        Rental::factory()->create([
            'equipment_id' => $equipment->id,
            'start_date' => now()->subDays(30),
            'end_date' => now()->subDays(20),
        ]);
        Rental::factory()->create([
            'equipment_id' => $equipment->id,
            'start_date' => now()->subDays(10),
            'end_date' => now()->subDays(5),
        ]);

        $utilization = $this->service->calculateUtilization($equipment->id);

        $this->assertEquals(50.0, $utilization); // 15 days rented out of 30 days
    }

    /** @test */
    public function it_can_get_equipment_maintenance_history()
    {
        $equipment = Equipment::factory()->create();
        $equipment->update([
            'last_maintenance_date' => now()->subDays(30),
            'notes' => 'Regular maintenance performed',
        ]);

        $history = $this->service->getMaintenanceHistory($equipment->id);

        $this->assertIsArray($history);
        $this->assertCount(1, $history);
        $this->assertEquals('Regular maintenance performed', $history[0]['notes']);
    }

    /** @test */
    public function it_can_schedule_maintenance()
    {
        $equipment = Equipment::factory()->create(['status' => 'available']);

        $this->service->scheduleMaintenance($equipment->id, 'Scheduled maintenance');

        $this->assertDatabaseHas('equipment', [
            'id' => $equipment->id,
            'status' => 'maintenance',
        ]);
    }

    /** @test */
    public function it_cannot_schedule_maintenance_for_rented_equipment()
    {
        $equipment = Equipment::factory()->create(['status' => 'rented']);

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Cannot schedule maintenance for rented equipment');

        $this->service->scheduleMaintenance($equipment->id, 'Scheduled maintenance');
    }
}


