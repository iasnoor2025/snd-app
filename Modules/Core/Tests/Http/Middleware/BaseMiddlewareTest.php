<?php

namespace Modules\Core\Tests\Http\Middleware;

use Modules\Core\Tests\TestCase;
use Modules\Core\Http\Middleware\BaseMiddleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Mockery;

class BaseMiddlewareTest extends TestCase
{
    /**
     * @var \Mockery\MockInterface
     */
    protected $request;

    /**
     * @var \Mockery\MockInterface
     */
    protected $middleware;

    /**
     * Setup the test environment.
     *
     * @return void;
     */
    protected function setUp(): void
    {
        parent::setUp();

        $this->request = Mockery::mock(Request::class);
        $this->middleware = new class extends BaseMiddleware {
            protected function before(Request $request)
            {
                // Test implementation
            }

            protected function after(Request $request, $response)
            {
                // Test implementation
            }
        };
    }

    /**
     * Clean up the test environment.
     *
     * @return void;
     */
    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    /**
     * Test that the middleware processes the request successfully.
     *
     * @return void;
     */
    public function testMiddlewareProcessesRequestSuccessfully()
    {
        $next = function ($request) {
            return 'response';
        };

        $response = $this->middleware->handle($this->request, $next);

        $this->assertEquals('response', $response);
    }

    /**
     * Test that the middleware handles exceptions.
     *
     * @return void;
     */
    public function testMiddlewareHandlesExceptions()
    {
        $next = function ($request) {
            throw new \Exception('Test error');
        };

        Log::shouldReceive('error')
            ->once()
            ->with('Middleware error: Test error', Mockery::any());

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Test error');

        $this->middleware->handle($this->request, $next);
    }

    /**
     * Test that the middleware gets the correct module name.
     *
     * @return void;
     */
    public function testMiddlewareGetsModuleName()
    {
        $middleware = new class extends BaseMiddleware {
            public function getModuleNamePublic()
            {
                return $this->getModuleName();
            }
        };

        $this->assertEquals('basemiddlewaretest', $middleware->getModuleNamePublic());
    }
}


