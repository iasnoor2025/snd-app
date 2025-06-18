<?php
namespace Modules\EmployeeManagement\Services\Services;

use Modules\RentalManagement\Domain\Models\Rental;
use Modules\RentalManagement\Domain\Models\RentalItem;
use Modules\EquipmentManagement\Domain\Models\Equipment;
use Modules\EmployeeManagement\Domain\Models\Employee;
use App\Services\RentalItemService;
use App\Repositories\RentalItemRepository;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Mockery;

class RentalItemServiceTest extends TestCase
{
    use RefreshDatabase;
use private RentalItemService $service;
    private RentalItemRepository $repository;
    private Rental $rental;
    private Equipment $equipment;
    private Employee $operator;

    protected function setUp(): void
    {
        parent::setUp();

        $this->repository = Mockery::mock(RentalItemRepository::class);
        $this->service = new RentalItemService($this->repository);
        $this->rental = Rental::factory()->create();
        $this->equipment = Equipment::factory()->create();
        $this->operator = Employee::factory()->create();
    }

    public function test_calculate_total_amount(): void
    {
        $items = [
            [
                'rate' => 100.00,
                'rate_type' => 'daily',
                'days' => 5,
                'discount_percentage' => 10,
            ],
            [
                'rate' => 500.00,
                'rate_type' => 'weekly',
                'days' => 14,
                'discount_percentage' => 0,
            ],
        ];

        $total = $this->service->calculateTotalAmount($items);

        // Daily item: (100 * 5) * 0.9 = 450
        // Weekly item: (500 * 2) = 1000
        // Total: 1450
        $this->assertEquals(1450.00, $total);
    }

    public function test_get_by_rental_id(): void
    {
        $rentalItems = RentalItem::factory()->count(3)->create([
            'rental_id' => $this->rental->id,
            'equipment_id' => $this->equipment->id,
        ]);

        $this->repository->shouldReceive('getByRentalId')
            ->with($this->rental->id)
            ->once()
            ->andReturn($rentalItems);

        $result = $this->service->getByRentalId($this->rental->id);

        $this->assertCount(3, $result);
    }

    public function test_get_with_relations(): void
    {
        $rentalItems = RentalItem::factory()->count(3)->create([
            'rental_id' => $this->rental->id,
            'equipment_id' => $this->equipment->id,
            'operator_id' => $this->operator->id,
        ]);

        $this->repository->shouldReceive('getWithRelations')
            ->with($this->rental->id)
            ->once()
            ->andReturn($rentalItems);

        $result = $this->service->getWithRelations($this->rental->id);

        $this->assertCount(3, $result);
    }

    public function test_create_many(): void
    {
        $items = [
            [
                'equipment_id' => $this->equipment->id,
                'operator_id' => $this->operator->id,
                'rate' => 100.00,
                'rate_type' => 'daily',
                'days' => 5,
                'discount_percentage' => 10,
            ],
            [
                'equipment_id' => $this->equipment->id,
                'operator_id' => $this->operator->id,
                'rate' => 500.00,
                'rate_type' => 'weekly',
                'days' => 14,
                'discount_percentage' => 0,
            ],
        ];

        $this->repository->shouldReceive('createMany')
            ->with($items)
            ->once()
            ->andReturn(true);

        $result = $this->service->createMany($items);

        $this->assertTrue($result);
    }

    public function test_update_many(): void
    {
        $items = [
            [
                'id' => 1,
                'equipment_id' => $this->equipment->id,
                'operator_id' => $this->operator->id,
                'rate' => 150.00,
                'rate_type' => 'daily',
                'days' => 7,
                'discount_percentage' => 15,
            ],
        ];

        $this->repository->shouldReceive('updateMany')
            ->with($items)
            ->once()
            ->andReturn(true);

        $result = $this->service->updateMany($items);

        $this->assertTrue($result);
    }

    public function test_delete_by_rental_id(): void
    {
        $this->repository->shouldReceive('deleteByRentalId')
            ->with($this->rental->id)
            ->once()
            ->andReturn(true);

        $result = $this->service->deleteByRentalId($this->rental->id);

        $this->assertTrue($result);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}

