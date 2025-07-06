<?php
namespace Modules\Core\Services\Services;

use Modules\RentalManagement\Domain\Models\Rental;
use Modules\CustomerManagement\Domain\Models\Customer;
use Modules\EquipmentManagement\Domain\Models\Equipment;
use Modules\RentalManagement\Domain\Models\RentalItem;
use App\Services\RentalShowService;
use App\Services\RentalCalculationService;
use Illuminate\Contracts\Auth\Access\Gate;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Mockery;

class RentalShowServiceTest extends TestCase
{
    use RefreshDatabase;
use protected $calculationService;
    protected $gate;
    protected $showService;
    protected $rental;

    public function setUp(): void
    {
        parent::setUp();

        // Create mock services
        $this->calculationService = Mockery::mock(RentalCalculationService::class);
        $this->gate = Mockery::mock(Gate::class);

        // Create the show service
        $this->showService = new RentalShowService(
            $this->calculationService,
            $this->gate
        );

        // Create test data
        $customer = Customer::factory()->create();
        $this->rental = Rental::factory()->create([
            'customer_id' => $customer->id,
            'status' => 'active',
            'start_date' => '2023-01-01',
            'expected_end_date' => '2023-01-15',
        ]);

        // Add rental items
        $equipment = Equipment::factory()->create();
        RentalItem::factory()->create([
            'rental_id' => $this->rental->id,
            'equipment_id' => $equipment->id,
        ]);

        // Set up mock responses
        $this->gate->shouldReceive('allows')->andReturn(true);
    }

    public function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    /** @test */
    public function it_returns_rental_data()
    {
        // Configure the calculation service mock
        $this->calculationService->shouldReceive('calculateTotals')->andReturn([
            'subtotal' => 1000,
            'tax' => 100,
            'total' => 1100,
        ]);

        // Get data from the service
        $data = $this->showService->getData($this->rental);

        // Assert the response structure
        $this->assertIsArray($data);
        $this->assertArrayHasKey('rental', $data);
        $this->assertArrayHasKey('rentalItems', $data);
        $this->assertArrayHasKey('invoices', $data);
        $this->assertArrayHasKey('permissions', $data);

        // Check data content
        $this->assertEquals($this->rental->id, $data['rental']['id']);
        $this->assertEquals('active', $data['rental']['status']);
        $this->assertCount(1, $data['rentalItems']['data']);
    }

    /** @test */
    public function it_loads_necessary_relationships()
    {
        // Configure the calculation service mock
        $this->calculationService->shouldReceive('calculateTotals')->andReturn([
            'subtotal' => 1000,
            'tax' => 100,
            'total' => 1100,
        ]);

        // Get data from the service
        $data = $this->showService->getData($this->rental);

        // Check that relationships are loaded
        $this->assertTrue($this->rental->relationLoaded('customer'));
        $this->assertTrue($this->rental->relationLoaded('rentalItems'));
    }

    /** @test */
    public function it_includes_permissions_data()
    {
        // Configure the calculation service mock
        $this->calculationService->shouldReceive('calculateTotals')->andReturn([
            'subtotal' => 1000,
            'tax' => 100,
            'total' => 1100,
        ]);

        // Set up specific permission checks
        $this->gate->shouldReceive('allows')->with('view', $this->rental)->andReturn(true);
        $this->gate->shouldReceive('allows')->with('update', $this->rental)->andReturn(true);
        $this->gate->shouldReceive('allows')->with('delete', $this->rental)->andReturn(false);

        // Get data from the service
        $data = $this->showService->getData($this->rental);

        // Check permissions data
        $this->assertArrayHasKey('permissions', $data);
        $this->assertTrue($data['permissions']['view']);
        $this->assertTrue($data['permissions']['update']);
        $this->assertFalse($data['permissions']['delete']);
    }
}

