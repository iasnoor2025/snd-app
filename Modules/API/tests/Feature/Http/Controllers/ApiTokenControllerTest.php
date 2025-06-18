<?php
namespace Modules\API\tests\Feature\Http\Controllers;

use Tests\TestCase;
use Modules\Core\Domain\Models\User;
use Modules\API\Domain\Models\ApiToken;
use Modules\API\Repositories\Interfaces\ApiTokenRepositoryInterface;
use Inertia\Testing\AssertableInertia;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ApiTokenControllerTest extends TestCase
{
    use RefreshDatabase;
use protected $user;

    protected function setUp(): void
    {
        parent::setUp();

        // Create a test user
        $this->user = User::factory()->create();
    }

    public function test_index_displays_tokens()
    {
        // Create some tokens for the user
        $tokens = ApiToken::factory()->count(3)->create([
            'user_id' => $this->user->id
        ]);

        // Act as the user and visit the tokens page
        $response = $this->actingAs($this->user)
            ->get(route('api.tokens.index'));

        // Assert the response
        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('API/Tokens/Index')
            ->has('tokens', 3)
        );
    }

    public function test_create_displays_token_form()
    {
        // Act as the user and visit the create token page
        $response = $this->actingAs($this->user)
            ->get(route('api.tokens.create'));

        // Assert the response
        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('API/Tokens/Create')
        );
    }

    public function test_store_creates_new_token()
    {
        // Act as the user and submit a token creation request
        $response = $this->actingAs($this->user)
            ->post(route('api.tokens.store'), [
                'name' => 'Test Token',
                'abilities' => ['read', 'write'],
                'expires_in_minutes' => 60,
            ]);

        // Assert the response
        $response->assertStatus(302); // Redirect back
        $response->assertSessionHas('token'); // Plain text token in session
        $response->assertSessionHas('message', 'API token created successfully');

        // Assert the token was created in the database
        $this->assertDatabaseHas('api_tokens', [
            'user_id' => $this->user->id,
            'name' => 'Test Token',
        ]);
    }

    public function test_destroy_revokes_token()
    {
        // Create a token for the user
        $token = ApiToken::factory()->create([
            'user_id' => $this->user->id,
            'name' => 'Token to Delete',
        ]);

        // Act as the user and submit a token deletion request
        $response = $this->actingAs($this->user)
            ->delete(route('api.tokens.destroy', $token->id));

        // Assert the response
        $response->assertStatus(302); // Redirect back
        $response->assertSessionHas('message', 'API token revoked successfully');

        // Assert the token was soft deleted in the database
        $this->assertSoftDeleted('api_tokens', [
            'id' => $token->id
        ]);
    }
}


