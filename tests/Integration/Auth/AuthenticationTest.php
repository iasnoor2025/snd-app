<?php

namespace Tests\Integration\Auth;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Event;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Auth\Events\Failed;
use Illuminate\Support\Facades\Auth;
use Laravel\Sanctum\PersonalAccessToken;
use Laravel\Sanctum\Sanctum;
use Illuminate\Support\Str;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $password = 'Test@123456';

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
        
        $this->user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make($this->password),
            'email_verified_at' => now()
        ]);
    }

    /** @test */
    public function it_can_authenticate_user_with_valid_credentials()
    {
        Event::fake([Login::class]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'test@example.com',
            'password' => $this->password
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'token',
                    'user' => [
                        'id',
                        'name',
                        'email'
                    ]
                ]
            ]);

        Event::assertDispatched(Login::class);
        $this->assertTrue(Auth::check());
    }

    /** @test */
    public function it_fails_with_invalid_credentials()
    {
        Event::fake([Failed::class]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'test@example.com',
            'password' => 'wrong_password'
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'message' => 'Invalid credentials'
            ]);

        Event::assertDispatched(Failed::class);
        $this->assertFalse(Auth::check());
    }

    /** @test */
    public function it_can_logout_authenticated_user()
    {
        Event::fake([Logout::class]);

        $token = $this->user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token
        ])->postJson('/api/auth/logout');

        $response->assertStatus(200);
        Event::assertDispatched(Logout::class);
        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id' => $this->user->id
        ]);
    }

    /** @test */
    public function it_requires_email_verification()
    {
        $unverifiedUser = User::factory()->create([
            'email_verified_at' => null
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => $unverifiedUser->email,
            'password' => $this->password
        ]);

        $response->assertStatus(403)
            ->assertJson([
                'message' => 'Email not verified'
            ]);
    }

    /** @test */
    public function it_can_refresh_token()
    {
        $token = $this->user->createToken('test-token')->plainTextToken;
        
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token
        ])->postJson('/api/auth/refresh');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'token'
                ]
            ]);

        // Old token should be invalidated
        $this->assertDatabaseMissing('personal_access_tokens', [
            'token' => hash('sha256', explode('|', $token)[1])
        ]);
    }

    /** @test */
    public function it_enforces_rate_limiting()
    {
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/auth/login', [
                'email' => 'test@example.com',
                'password' => 'wrong_password'
            ]);
        }

        $response = $this->postJson('/api/auth/login', [
            'email' => 'test@example.com',
            'password' => 'wrong_password'
        ]);

        $response->assertStatus(429); // Too Many Requests
    }

    /** @test */
    public function it_can_handle_remember_me_functionality()
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => 'test@example.com',
            'password' => $this->password,
            'remember' => true
        ]);

        $response->assertStatus(200);
        
        $token = PersonalAccessToken::where('tokenable_id', $this->user->id)
            ->first();
            
        // Token should have extended expiration
        $this->assertTrue(
            $token->created_at->addDays(30)->greaterThan(now())
        );
    }

    /** @test */
    public function it_tracks_login_attempts()
    {
        $this->postJson('/api/auth/login', [
            'email' => 'test@example.com',
            'password' => 'wrong_password'
        ]);

        $this->user->refresh();
        $this->assertEquals(1, $this->user->failed_login_attempts);
        $this->assertNotNull($this->user->last_failed_login_at);
    }

    /** @test */
    public function it_can_handle_account_lockout()
    {
        // Simulate multiple failed attempts
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/auth/login', [
                'email' => 'test@example.com',
                'password' => 'wrong_password'
            ]);
        }

        $response = $this->postJson('/api/auth/login', [
            'email' => 'test@example.com',
            'password' => $this->password // Correct password
        ]);

        $response->assertStatus(423) // Locked
            ->assertJson([
                'message' => 'Account locked due to too many failed attempts'
            ]);
    }

    /** @test */
    public function it_can_handle_password_confirmation()
    {
        $token = $this->user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token
        ])->postJson('/api/auth/confirm-password', [
            'password' => $this->password
        ]);

        $response->assertStatus(200);
        $this->assertTrue(session()->has('auth.password_confirmed_at'));
    }

    /** @test */
    public function it_validates_token_expiration()
    {
        // Create an expired token
        $token = $this->user->createToken('test-token', ['*'], now()->subDays(2))
            ->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token
        ])->getJson('/api/user');

        $response->assertStatus(401);
    }

    /** @test */
    public function it_handles_concurrent_sessions()
    {
        // Create multiple tokens
        $token1 = $this->user->createToken('device-1')->plainTextToken;
        $token2 = $this->user->createToken('device-2')->plainTextToken;

        // Both tokens should be valid
        $this->withHeaders(['Authorization' => 'Bearer ' . $token1])
            ->getJson('/api/user')
            ->assertStatus(200);

        $this->withHeaders(['Authorization' => 'Bearer ' . $token2])
            ->getJson('/api/user')
            ->assertStatus(200);

        // Logout from all devices
        $this->withHeaders(['Authorization' => 'Bearer ' . $token1])
            ->postJson('/api/auth/logout-all-devices')
            ->assertStatus(200);

        // Both tokens should be invalid now
        $this->withHeaders(['Authorization' => 'Bearer ' . $token1])
            ->getJson('/api/user')
            ->assertStatus(401);

        $this->withHeaders(['Authorization' => 'Bearer ' . $token2])
            ->getJson('/api/user')
            ->assertStatus(401);
    }

    /** @test */
    public function it_handles_session_timeouts()
    {
        $token = $this->user->createToken('test-token')->plainTextToken;

        // Simulate session timeout
        $this->travel(3)->hours();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token
        ])->getJson('/api/user');

        $response->assertStatus(401)
            ->assertJson([
                'message' => 'Session has expired'
            ]);
    }

    /** @test */
    public function it_validates_device_fingerprint()
    {
        $fingerprint = 'device-123';
        
        $response = $this->postJson('/api/auth/login', [
            'email' => 'test@example.com',
            'password' => $this->password,
            'device_fingerprint' => $fingerprint
        ]);

        $token = $response->json('data.token');

        // Request with different fingerprint should fail
        $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
            'X-Device-Fingerprint' => 'different-device'
        ])->getJson('/api/user')
            ->assertStatus(401);

        // Request with same fingerprint should succeed
        $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
            'X-Device-Fingerprint' => $fingerprint
        ])->getJson('/api/user')
            ->assertStatus(200);
    }

    /** @test */
    public function it_logs_authentication_events()
    {
        Event::fake();

        $this->postJson('/api/auth/login', [
            'email' => 'test@example.com',
            'password' => $this->password
        ]);

        Event::assertDispatched(Login::class, function ($event) {
            return $event->user->id === $this->user->id;
        });

        $this->postJson('/api/auth/logout');

        Event::assertDispatched(Logout::class, function ($event) {
            return $event->user->id === $this->user->id;
        });
    }

    public function test_user_can_login_with_valid_credentials(): void
    {
        // Arrange
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password123')
        ]);

        // Act
        $response = $this->postJson('/api/auth/login', [
            'email' => 'test@example.com',
            'password' => 'password123'
        ]);

        // Assert
        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'token',
                    'user' => [
                        'id',
                        'name',
                        'email'
                    ]
                ]
            ]);

        $this->assertDatabaseHas('personal_access_tokens', [
            'tokenable_type' => User::class,
            'tokenable_id' => $user->id
        ]);
    }

    public function test_user_cannot_login_with_invalid_credentials(): void
    {
        // Arrange
        User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password123')
        ]);

        // Act
        $response = $this->postJson('/api/auth/login', [
            'email' => 'test@example.com',
            'password' => 'wrongpassword'
        ]);

        // Assert
        $response->assertStatus(401)
            ->assertJson([
                'message' => 'Invalid credentials'
            ]);
    }

    public function test_user_can_logout(): void
    {
        // Arrange
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        // Act
        $response = $this->postJson('/api/auth/logout');

        // Assert
        $response->assertStatus(200);
        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_type' => User::class,
            'tokenable_id' => $user->id
        ]);
    }

    public function test_user_can_refresh_token(): void
    {
        // Arrange
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        // Act
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token
        ])->postJson('/api/auth/refresh');

        // Assert
        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'token'
                ]
            ]);
    }

    public function test_user_can_request_password_reset(): void
    {
        // Arrange
        $user = User::factory()->create();

        // Act
        $response = $this->postJson('/api/auth/forgot-password', [
            'email' => $user->email
        ]);

        // Assert
        $response->assertStatus(200);
        $this->assertDatabaseHas('password_reset_tokens', [
            'email' => $user->email
        ]);
    }

    public function test_user_can_reset_password(): void
    {
        // Arrange
        $user = User::factory()->create();
        $token = Str::random(60);
        
        \DB::table('password_reset_tokens')->insert([
            'email' => $user->email,
            'token' => Hash::make($token),
            'created_at' => now()
        ]);

        // Act
        $response = $this->postJson('/api/auth/reset-password', [
            'email' => $user->email,
            'token' => $token,
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123'
        ]);

        // Assert
        $response->assertStatus(200);
        $this->assertTrue(Hash::check('newpassword123', $user->fresh()->password));
    }

    public function test_authenticated_user_can_get_profile(): void
    {
        // Arrange
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        // Act
        $response = $this->getJson('/api/auth/profile');

        // Assert
        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email
                ]
            ]);
    }

    public function test_user_can_update_profile(): void
    {
        // Arrange
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        // Act
        $response = $this->putJson('/api/auth/profile', [
            'name' => 'Updated Name',
            'email' => 'updated@example.com'
        ]);

        // Assert
        $response->assertStatus(200);
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Updated Name',
            'email' => 'updated@example.com'
        ]);
    }

    public function test_user_can_change_password(): void
    {
        // Arrange
        $user = User::factory()->create([
            'password' => Hash::make('currentpassword')
        ]);
        Sanctum::actingAs($user);

        // Act
        $response = $this->putJson('/api/auth/password', [
            'current_password' => 'currentpassword',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123'
        ]);

        // Assert
        $response->assertStatus(200);
        $this->assertTrue(Hash::check('newpassword123', $user->fresh()->password));
    }

    public function test_token_invalidation_on_password_change(): void
    {
        // Arrange
        $user = User::factory()->create([
            'password' => Hash::make('currentpassword')
        ]);
        $token = $user->createToken('test-token')->plainTextToken;

        // Act
        $this->actingAs($user)->putJson('/api/auth/password', [
            'current_password' => 'currentpassword',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123'
        ]);

        // Assert
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token
        ])->getJson('/api/auth/profile');

        $response->assertStatus(401);
    }

    public function test_rate_limiting_on_login_attempts(): void
    {
        // Arrange
        User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password123')
        ]);

        // Act & Assert
        for ($i = 0; $i < 5; $i++) {
            $response = $this->postJson('/api/auth/login', [
                'email' => 'test@example.com',
                'password' => 'wrongpassword'
            ]);
            $response->assertStatus(401);
        }

        $response = $this->postJson('/api/auth/login', [
            'email' => 'test@example.com',
            'password' => 'wrongpassword'
        ]);

        $response->assertStatus(429); // Too Many Attempts
    }
} 