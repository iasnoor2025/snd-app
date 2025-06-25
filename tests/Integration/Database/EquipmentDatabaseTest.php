<?php

namespace Tests\Integration\Database;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\EquipmentManagement\Models\Equipment;
use Modules\EquipmentManagement\Models\EquipmentCategory;
use Modules\EquipmentManagement\Models\EquipmentMaintenance;
use Modules\EmployeeManagement\Models\Employee;
use Carbon\Carbon;

class EquipmentDatabaseTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_equipment_creation_with_category(): void
    {
        // Arrange
        $category = EquipmentCategory::factory()->create();

        // Act
        $equipment = Equipment::create([
            'name' => 'Test Equipment',
            'category_id' => $category->id,
            'serial_number' => 'SN123456',
            'purchase_date' => Carbon::now(),
            'purchase_price' => 1000.00,
            'status' => 'available'
        ]);

        // Assert
        $this->assertDatabaseHas('equipment', [
            'id' => $equipment->id,
            'name' => 'Test Equipment',
            'category_id' => $category->id,
            'serial_number' => 'SN123456'
        ]);

        $this->assertTrue($equipment->category()->exists());
        $this->assertEquals($category->id, $equipment->category->id);
    }

    public function test_equipment_with_maintenance_records(): void
    {
        // Arrange
        $equipment = Equipment::factory()->create();
        $employee = Employee::factory()->create();

        // Act
        $maintenance = $equipment->maintenanceRecords()->create([
            'type' => 'preventive',
            'description' => 'Regular maintenance check',
            'scheduled_date' => Carbon::now(),
            'completed_date' => Carbon::now(),
            'cost' => 150.00,
            'performed_by' => $employee->id,
            'status' => 'completed'
        ]);

        // Assert
        $this->assertDatabaseHas('equipment_maintenance', [
            'equipment_id' => $equipment->id,
            'type' => 'preventive',
            'status' => 'completed'
        ]);

        $this->assertTrue($equipment->maintenanceRecords()->exists());
        $this->assertEquals(1, $equipment->maintenanceRecords()->count());
    }

    public function test_equipment_with_media(): void
    {
        // Arrange
        $equipment = Equipment::factory()->create();

        // Act
        $media = $equipment->media()->create([
            'type' => 'image',
            'file_path' => 'equipment/test.jpg',
            'file_name' => 'test.jpg',
            'mime_type' => 'image/jpeg',
            'size' => 1024
        ]);

        // Assert
        $this->assertDatabaseHas('equipment_media', [
            'equipment_id' => $equipment->id,
            'type' => 'image',
            'file_name' => 'test.jpg'
        ]);

        $this->assertTrue($equipment->media()->exists());
    }

    public function test_equipment_soft_delete(): void
    {
        // Arrange
        $equipment = Equipment::factory()->create();
        $maintenance = EquipmentMaintenance::factory()->create([
            'equipment_id' => $equipment->id
        ]);

        // Act
        $equipment->delete();

        // Assert
        $this->assertSoftDeleted('equipment', [
            'id' => $equipment->id
        ]);

        $this->assertSoftDeleted('equipment_maintenance', [
            'id' => $maintenance->id
        ]);
    }

    public function test_equipment_status_update(): void
    {
        // Arrange
        $equipment = Equipment::factory()->create(['status' => 'available']);

        // Act
        $equipment->update(['status' => 'in_maintenance']);
        $equipment->statusHistory()->create([
            'from_status' => 'available',
            'to_status' => 'in_maintenance',
            'changed_by' => 1,
            'notes' => 'Equipment requires maintenance'
        ]);

        // Assert
        $this->assertDatabaseHas('equipment', [
            'id' => $equipment->id,
            'status' => 'in_maintenance'
        ]);

        $this->assertDatabaseHas('equipment_status_history', [
            'equipment_id' => $equipment->id,
            'from_status' => 'available',
            'to_status' => 'in_maintenance'
        ]);
    }

    public function test_equipment_with_documents(): void
    {
        // Arrange
        $equipment = Equipment::factory()->create();

        // Act
        $document = $equipment->documents()->create([
            'type' => 'manual',
            'file_path' => 'equipment/manual.pdf',
            'file_name' => 'user_manual.pdf',
            'mime_type' => 'application/pdf',
            'description' => 'User manual for equipment'
        ]);

        // Assert
        $this->assertDatabaseHas('equipment_documents', [
            'equipment_id' => $equipment->id,
            'type' => 'manual',
            'file_name' => 'user_manual.pdf'
        ]);
    }

    public function test_equipment_with_notes(): void
    {
        // Arrange
        $equipment = Equipment::factory()->create();

        // Act
        $note = $equipment->notes()->create([
            'content' => 'Equipment needs calibration',
            'created_by' => 1
        ]);

        // Assert
        $this->assertDatabaseHas('equipment_notes', [
            'equipment_id' => $equipment->id,
            'content' => 'Equipment needs calibration'
        ]);
    }

    public function test_equipment_unique_serial_number(): void
    {
        // Arrange
        Equipment::factory()->create([
            'serial_number' => 'UNIQUE123'
        ]);

        // Act & Assert
        $this->expectException(\Illuminate\Database\QueryException::class);
        
        Equipment::create([
            'name' => 'Test Equipment',
            'category_id' => EquipmentCategory::factory()->create()->id,
            'serial_number' => 'UNIQUE123',
            'purchase_date' => Carbon::now(),
            'purchase_price' => 1000.00,
            'status' => 'available'
        ]);
    }

    public function test_equipment_maintenance_scheduling(): void
    {
        // Arrange
        $equipment = Equipment::factory()->create();
        $scheduledDate = Carbon::now()->addDays(7);

        // Act
        $maintenance = $equipment->maintenanceRecords()->create([
            'type' => 'scheduled',
            'description' => 'Scheduled maintenance',
            'scheduled_date' => $scheduledDate,
            'status' => 'pending'
        ]);

        // Assert
        $this->assertDatabaseHas('equipment_maintenance', [
            'equipment_id' => $equipment->id,
            'type' => 'scheduled',
            'status' => 'pending',
            'scheduled_date' => $scheduledDate->toDateTimeString()
        ]);
    }

    public function test_equipment_category_hierarchy(): void
    {
        // Arrange
        $parentCategory = EquipmentCategory::factory()->create();
        $childCategory = EquipmentCategory::factory()->create([
            'parent_id' => $parentCategory->id
        ]);

        // Act
        $equipment = Equipment::create([
            'name' => 'Test Equipment',
            'category_id' => $childCategory->id,
            'serial_number' => 'TEST123',
            'status' => 'available'
        ]);

        // Assert
        $this->assertEquals($parentCategory->id, $equipment->category->parent_id);
        $this->assertTrue($childCategory->parent()->exists());
    }
} 