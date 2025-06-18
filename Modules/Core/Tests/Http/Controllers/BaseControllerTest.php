<?php

namespace Modules\Core\Tests\Http\Controllers;

use Modules\Core\Tests\TestCase;
use Modules\Core\Http\Controllers\BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class BaseControllerTest extends TestCase
{
    /**
     * @var BaseController
     */
    protected $controller;

    /**
     * Setup the test environment.
     *
     * @return void;
     */
    protected function setUp(): void
    {
        parent::setUp();

        $this->controller = new class extends BaseController {
            protected function getModuleName(): string
            {
                return 'test-module';
            }
        };
    }

    /**
     * Test that the controller returns a success response.
     *
     * @return void;
     */
    public function testSuccessResponse()
    {
        $data = ['test' => 'data'];
        $message = 'Test success';
        $response = $this->controller->successResponse($data, $message);

        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertEquals(Response::HTTP_OK, $response->getStatusCode());
        $this->assertEquals([
            'success' => true,
            'message' => $message,
            'data' => $data,
            'module' => 'test-module',
        ], json_decode($response->getContent(), true));
    }

    /**
     * Test that the controller returns an error response.
     *
     * @return void;
     */
    public function testErrorResponse()
    {
        $message = 'Test error';
        $errors = ['field' => ['Error message']];
        $response = $this->controller->errorResponse($message, Response::HTTP_BAD_REQUEST, $errors);

        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertEquals(Response::HTTP_BAD_REQUEST, $response->getStatusCode());
        $this->assertEquals([
            'success' => false,
            'message' => $message,
            'module' => 'test-module',
            'errors' => $errors,
        ], json_decode($response->getContent(), true));
    }

    /**
     * Test that the controller returns a not found response.
     *
     * @return void;
     */
    public function testNotFoundResponse()
    {
        $message = 'Test not found';
        $response = $this->controller->notFoundResponse($message);

        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertEquals(Response::HTTP_NOT_FOUND, $response->getStatusCode());
        $this->assertEquals([
            'success' => false,
            'message' => $message,
            'module' => 'test-module',
        ], json_decode($response->getContent(), true));
    }

    /**
     * Test that the controller returns a validation error response.
     *
     * @return void;
     */
    public function testValidationErrorResponse()
    {
        $errors = ['field' => ['Validation error']];
        $response = $this->controller->validationErrorResponse($errors);

        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertEquals(Response::HTTP_UNPROCESSABLE_ENTITY, $response->getStatusCode());
        $this->assertEquals([
            'success' => false,
            'message' => 'Validation failed',
            'module' => 'test-module',
            'errors' => $errors,
        ], json_decode($response->getContent(), true));
    }
}


