<?php
namespace Modules\API\tests\Unit\Services;

use Tests\TestCase;
use Modules\API\Services\ApiTokenService;
use Modules\API\Repositories\Interfaces\ApiTokenRepositoryInterface;
use Modules\API\Domain\Models\ApiToken;
use Modules\Core\Domain\Models\User;
use Mockery;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ApiTokenServiceTest extends TestCase
{
    use RefreshDatabase;
use protected $repositoryMock;
    protected $apiTokenService;
    protected $user;

    protected function setUp(): void
    {
        parent::setUp();

        // Create a mock repository
        $this->repositoryMock = Mockery::mock(ApiTokenRepositoryInterface::class);

        // Create the service with the mock repository
        $this->apiTokenService = new ApiTokenService($this->repositoryMock);

        // Create a test user
        $this->user = User::factory()->create();
    }

    public function test_it_creates_a_token()
    {
        // Mock the repository create method
        $tokenModel = new ApiToken([
            'user_id' => $this->user->id,
            'name' => 'Test Token',
            'abilities' => ['*'],
            'expires_at' => now()->addMinutes(60),
        ]);

        $this->repositoryMock
            ->shouldReceive('create')
            ->once()
            ->andReturn($tokenModel);

        // Call the service method
        $result = $this->apiTokenService->createToken(
            $this->user,
            'Test Token',
            ['*'],
            now()->addMinutes(60)
        );

        // Assert the result structure
        $this->assertArrayHasKey('plain_text_token', $result);
        $this->assertArrayHasKey('token', $result);
        $this->assertIsString($result['plain_text_token']);
        $this->assertInstanceOf(ApiToken::class, $result['token']);
    }

    public function test_it_validates_a_token()
    {
        // Create a token model
        $tokenModel = new ApiToken([
            'user_id' => $this->user->id,
            'name' => 'Test Token',
            'abilities' => ['*'],
            'expires_at' => now()->addMinutes(60),
        ]);

        // Set the relationship
        $tokenModel->setRelation('user', $this->user);

        // Mock the repository methods
        $this->repositoryMock
            ->shouldReceive('findByToken')
            ->once()
            ->andReturn($tokenModel);

        $this->repositoryMock
            ->shouldReceive('updateLastUsed')
            ->once()
            ->andReturn(true);

        // Mock the isExpired method on the token model
        $tokenModel->shouldReceive('isExpired')
            ->once()
            ->andReturn(false);

        $tokenModel->shouldReceive('can')
            ->with('read')
            ->once()
            ->andReturn(true);

        // Call the service method
        $result = $this->apiTokenService->validateToken('test-token', 'read');

        // Assert the result
        $this->assertInstanceOf(User::class, $result);
        $this->assertEquals($this->user->id, $result->id);
    }

    public function test_it_returns_null_for_expired_token()
    {
        // Create a token model
        $tokenModel = new ApiToken([
            'user_id' => $this->user->id,
            'name' => 'Test Token',
            'abilities' => ['*'],
            'expires_at' => now()->subMinutes(10), // Expired
        ]);

        // Mock the repository method
        $this->repositoryMock
            ->shouldReceive('findByToken')
            ->once()
            ->andReturn($tokenModel);

        // Mock the isExpired method on the token model
        $tokenModel->shouldReceive('isExpired')
            ->once()
            ->andReturn(true);

        // Call the service method
        $result = $this->apiTokenService->validateToken('test-token');

        // Assert the result
        $this->assertNull($result);
    }

    public function test_it_revokes_a_token()
    {
        // Mock the repository method
        $this->repositoryMock
            ->shouldReceive('delete')
            ->once()
            ->with(1)
            ->andReturn(true);

        // Call the service method
        $result = $this->apiTokenService->revokeToken(1);

        // Assert the result
        $this->assertTrue($result);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}

