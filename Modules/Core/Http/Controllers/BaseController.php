<?php

namespace Modules\Core\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

abstract class BaseController extends Controller
{
    use AuthorizesRequests, ValidatesRequests;

    /**
     * The module name.
     *
     * @var string
     */
    protected $moduleName;
    /**
     * Create a new controller instance.
     * @return void;
     */
    public function __construct()
    {
        $this->moduleName = $this->getModuleName();
    }

    /**
     * Get the module name.
     *
     * @return string;
     */
    abstract protected function getModuleName(): string;

    /**
     * Return a success response.
     *
     * @param mixed $data
     * @param string $message
     * @param int $statusCode
     * @return JsonResponse;
     */
    protected function successResponse($data, string $message = 'Success', int $statusCode = Response::HTTP_OK): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
            'module' => $this->moduleName,
        ], $statusCode);
    }

    /**
     * Return an error response.
     *
     * @param string $message
     * @param int $statusCode
     * @param mixed $errors
     * @return JsonResponse;
     */
    protected function errorResponse(string $message, int $statusCode = Response::HTTP_BAD_REQUEST, $errors = null): JsonResponse
    {
        $response = [
            'success' => false,
            'message' => $message,
            'module' => $this->moduleName,
        ];

        if ($errors !== null) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $statusCode);
    }

    /**
     * Return a not found response.
     *
     * @param string $message
     * @return JsonResponse;
     */
    protected function notFoundResponse(string $message = 'Resource not found'): JsonResponse
    {
        return $this->errorResponse($message, Response::HTTP_NOT_FOUND);
    }

    /**
     * Return a validation error response.
     *
     * @param mixed $errors
     * @return JsonResponse;
     */
    protected function validationErrorResponse($errors): JsonResponse
    {
        return $this->errorResponse('Validation failed', Response::HTTP_UNPROCESSABLE_ENTITY, $errors);
    }
}


