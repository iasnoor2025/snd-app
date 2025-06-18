<?php
namespace Modules\Core\Http\Controllers\Controllers;

use Modules\EquipmentManagement\Domain\Models\Equipment;
use Modules\Core\Domain\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EquipmentControllerTest extends TestCase
{
    use RefreshDatabase;
    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    /** @test */
    public function it_can_list_equipment()
    {
        $equipment = Equipment::factory()->count(3)->create();

        $response = $this->actingAs($this->user)
            ->getJson('/api/equipment');

        $response->assertOk()
            ->assertJsonCount(3, 'data')
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'category',
                        'daily_rate',
                        'status',
                        'serial_number',
                        'created_at',
                        'updated_at',
                    ],
                ],
            ]);
    }

    /** @test */
    public function it_can_show_equipment_details()
    {
        $equipment = Equipment::factory()->create();

        $response = $this->actingAs($this->user)
            ->getJson("/api/equipment/{$equipment->id}");

        $response->assertOk()
            ->assertJson([
                'data' => [
                    'id' => $equipment->id,
                    'name' => $equipment->name,
                    'category' => $equipment->category,
                    'daily_rate' => $equipment->daily_rate,
                    'status' => $equipment->status,
                    'serial_number' => $equipment->serial_number,
                ],
            ]);
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

        $response = $this->actingAs($this->user)
            ->postJson('/api/equipment', $equipmentData);

        $response->assertCreated()
            ->assertJson([
                'data' => [
                    'name' => $equipmentData['name'],
                    'category' => $equipmentData['category'],
                    'daily_rate' => $equipmentData['daily_rate'],
                    'status' => $equipmentData['status'],
                    'serial_number' => $equipmentData['serial_number']
                ],
            ]);

        $this->assertDatabaseHas('equipment', [
            'name' => $equipmentData['name'],
            'category' => $equipmentData['category'],
            'daily_rate' => $equipmentData['daily_rate'],
            'status' => $equipmentData['status'],
            'serial_number' => $equipmentData['serial_number']
        ]);
    }

    /** @test */
    public function it_validates_required_fields_when_creating_equipment()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/equipment', []);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors([
                'name',
                'category',
                'daily_rate',
                'serial_number',
            ]);
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

        $response = $this->actingAs($this->user)
            ->putJson("/api/equipment/{$equipment->id}", $updateData);

        $response->assertOk()
            ->assertJson([
                'data' => [
                    'id' => $equipment->id,
                    'name' => $updateData['name'],
                    'category' => $updateData['category'],
                    'daily_rate' => $updateData['daily_rate'],
                    'status' => $updateData['status']
                ],
            ]);

        $this->assertDatabaseHas('equipment', [
            'id' => $equipment->id,
            'name' => $updateData['name'],
            'category' => $updateData['category'],
            'daily_rate' => $updateData['daily_rate'],
            'status' => $updateData['status']
        ]);
    }

    /** @test */
    public function it_validates_required_fields_when_updating_equipment()
    {
        $equipment = Equipment::factory()->create();

        $response = $this->actingAs($this->user)
            ->putJson("/api/equipment/{$equipment->id}", []);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors([
                'name',
                'category',
                'daily_rate',
                'serial_number',
            ]);
    }

    /** @test */
    public function it_can_delete_equipment()
    {
        $equipment = Equipment::factory()->create();

        $response = $this->actingAs($this->user)
            ->deleteJson("/api/equipment/{$equipment->id}");

        $response->assertNoContent();

        $this->assertDatabaseMissing('equipment', [
            'id' => $equipment->id
        ]);
    }

    /** @test */
    public function it_cannot_delete_equipment_with_active_rentals()
    {
        $equipment = Equipment::factory()->create(['status' => 'rented']);

        $response = $this->actingAs($this->user)
            ->deleteJson("/api/equipment/{$equipment->id}");

        $response->assertForbidden();

        $this->assertDatabaseHas('equipment', [
            'id' => $equipment->id
        ]);
    }

    /** @test */
    public function it_can_filter_equipment_by_status()
    {
        Equipment::factory()->create(['status' => 'available']);
        Equipment::factory()->create(['status' => 'rented']);
        Equipment::factory()->create(['status' => 'maintenance']);

        $response = $this->actingAs($this->user)
            ->getJson('/api/equipment?status=available');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJson([
                'data' => [
                    [
                        'status' => 'available'
                    ],
                ],
            ]);
    }

    /** @test */
    public function it_can_filter_equipment_by_category()
    {
        Equipment::factory()->create(['category' => 'Category A']);
        Equipment::factory()->create(['category' => 'Category B']);
        Equipment::factory()->create(['category' => 'Category A']);

        $response = $this->actingAs($this->user)
            ->getJson('/api/equipment?category=Category A');

        $response->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJson([
                'data' => [
                    [
                        'category' => 'Category A'
                    ],
                ],
            ]);
    }

    /** @test */
    public function it_can_search_equipment_by_name()
    {
        Equipment::factory()->create(['name' => 'Test Equipment 1']);
        Equipment::factory()->create(['name' => 'Test Equipment 2']);
        Equipment::factory()->create(['name' => 'Other Equipment']);

        $response = $this->actingAs($this->user)
            ->getJson('/api/equipment?search=Test');

        $response->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJson([
                'data' => [
                    [
                        'name' => 'Test Equipment 1'
                    ],
                ],
            ]);
    }
}


