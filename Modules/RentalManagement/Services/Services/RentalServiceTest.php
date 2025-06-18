<?php
namespace Modules\RentalManagement\Services\Services;

use Tests\TestCase;
use App\Services\RentalService;
use App\Repositories\RentalRepository;
use App\Repositories\EquipmentRepository;
use Modules\RentalManagement\Domain\Models\Rental;
use Modules\EquipmentManagement\Domain\Models\Equipment;
use Mockery;

class RentalServiceTest extends TestCase
{
    private RentalService $rentalService;
    private RentalRepository $rentalRepository;
    private EquipmentRepository $equipmentRepository;

    protected function setUp(): void
    {
        parent::setUp();

        $this->rentalRepository = Mockery::mock(RentalRepository::class);
        $this->equipmentRepository = Mockery::mock(EquipmentRepository::class);
        $this->rentalService = new RentalService(
            $this->rentalRepository,
            $this->equipmentRepository
        );
    }

    /** @test */
    public function it_creates_a_rental_successfully()
    {
        // Arrange
        $equipment = $this->createEquipment(['is_available' => true]);
        $rentalData = [
            'equipment_id' => $equipment->id,
            'start_date' => now(),
            'end_date' => now()->addDays(7)
        ];

        $this->equipmentRepository
            ->shouldReceive('checkAvailability')
            ->once()
            ->with($equipment->id)
            ->andReturn(true);

        $this->rentalRepository
            ->shouldReceive('create')
            ->once()
            ->with($rentalData)
            ->andReturn(new Rental($rentalData));

        $this->equipmentRepository
            ->shouldReceive('markAsRented')
            ->once()
            ->with($equipment->id);

        // Act
        $rental = $this->rentalService->createRental($rentalData);

        // Assert
        $this->assertInstanceOf(Rental::class, $rental);
        $this->assertEquals($equipment->id, $rental->equipment_id);
    }

    /** @test */
    public function it_throws_exception_when_equipment_is_not_available()
    {
        // Arrange
        $equipment = $this->createEquipment(['is_available' => false]);
        $rentalData = [
            'equipment_id' => $equipment->id,
            'start_date' => now(),
            'end_date' => now()->addDays(7)
        ];

        $this->equipmentRepository
            ->shouldReceive('checkAvailability')
            ->once()
            ->with($equipment->id)
            ->andReturn(false);

        // Assert
        $this->expectException(\App\Exceptions\EquipmentNotAvailableException::class);

        // Act
        $this->rentalService->createRental($rentalData);
    }

    /** @test */
    public function it_validates_rental_dates()
    {
        // Arrange
        $equipment = $this->createEquipment(['is_available' => true]);
        $rentalData = [
            'equipment_id' => $equipment->id,
            'start_date' => now()->addDays(7),
            'end_date' => now() // Invalid: end date before start date
        ];

        // Assert
        $this->expectException(\App\Exceptions\InvalidRentalDatesException::class);

        // Act
        $this->rentalService->createRental($rentalData);
    }
}

