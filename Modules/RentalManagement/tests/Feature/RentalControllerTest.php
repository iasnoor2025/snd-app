<?php
namespace Modules\RentalManagement\tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\RentalManagement\Domain\Models\Rental;
use Tests\TestCase;

class RentalControllerTest extends TestCase
{
    use RefreshDatabase;
use /** @test */
    public function it_can_list_rentals()
    {
        Rental::factory()->count(3)->create();

        $response = $this->get(route('rentals.index'));

        $response->assertStatus(200)
            ->assertInertia(fn ($assert) => $assert
                ->component('Rental/Index')
                ->has('rentals', 3)
            );
    }

    /** @test */
    public function it_can_show_create_rental_form()
    {
        $response = $this->get(route('rentals.create'));

        $response->assertStatus(200)
            ->assertInertia(fn ($assert) => $assert
                ->component('Rental/Create')
            );
    }

    /** @test */
    public function it_can_create_a_rental()
    {
        $rentalData = [
            'customer_name' => 'John Doe',
            'start_date' => now()->format('Y-m-d'),
            'end_date' => now()->addDays(7)->format('Y-m-d'),
            'status' => 'pending',
            'total_amount' => 100.00,
        ];

        $response = $this->post(route('rentals.store'), $rentalData);

        $response->assertRedirect(route('rentals.index'));
        $this->assertDatabaseHas('rentals', $rentalData);
    }

    /** @test */
    public function it_validates_required_fields_when_creating_rental()
    {
        $response = $this->post(route('rentals.store'), []);

        $response->assertSessionHasErrors(['customer_name', 'start_date', 'end_date', 'status', 'total_amount']);
    }

    /** @test */
    public function it_can_show_rental_details()
    {
        $rental = Rental::factory()->create();

        $response = $this->get(route('rentals.show', $rental->id));

        $response->assertStatus(200)
            ->assertInertia(fn ($assert) => $assert
                ->component('Rental/Show')
                ->has('rental')
            );
    }

    /** @test */
    public function it_can_show_edit_rental_form()
    {
        $rental = Rental::factory()->create();

        $response = $this->get(route('rentals.edit', $rental->id));

        $response->assertStatus(200)
            ->assertInertia(fn ($assert) => $assert
                ->component('Rental/Edit')
                ->has('rental')
            );
    }

    /** @test */
    public function it_can_update_a_rental()
    {
        $rental = Rental::factory()->create();
        $updateData = [
            'customer_name' => 'Jane Doe',
            'start_date' => now()->format('Y-m-d'),
            'end_date' => now()->addDays(7)->format('Y-m-d'),
            'status' => 'active',
            'total_amount' => 150.00,
        ];

        $response = $this->put(route('rentals.update', $rental->id), $updateData);

        $response->assertRedirect(route('rentals.index'));
        $this->assertDatabaseHas('rentals', $updateData);
    }

    /** @test */
    public function it_can_delete_a_rental()
    {
        $rental = Rental::factory()->create();

        $response = $this->delete(route('rentals.destroy', $rental->id));

        $response->assertRedirect(route('rentals.index'));
        $this->assertDatabaseMissing('rentals', ['id' => $rental->id]);
    }
}

