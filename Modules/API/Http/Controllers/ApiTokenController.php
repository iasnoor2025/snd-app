<?php

namespace Modules\API\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Inertia\Inertia;
use Modules\API\Services\ApiTokenService;
use Modules\API\Actions\CreateApiTokenAction;
use Modules\API\Http\Requests\ApiTokenCreateRequest;

class ApiTokenController extends Controller
{
    /**
     * @var ApiTokenService
     */
    protected $apiTokenService;

    /**
     * @var CreateApiTokenAction
     */
    protected $createApiTokenAction;

    /**
     * ApiTokenController constructor.
     *
     * @param ApiTokenService $apiTokenService
     * @param CreateApiTokenAction $createApiTokenAction
     */
    public function __construct(
        ApiTokenService $apiTokenService,
        CreateApiTokenAction $createApiTokenAction
    ) {
        $this->apiTokenService = $apiTokenService;
        $this->createApiTokenAction = $createApiTokenAction;
    }

    /**
     * Display a listing of the user's API tokens.
     *
     * @param Request $request
     * @return \Inertia\Response;
     */
    public function index(Request $request)
    {
        $tokens = $this->apiTokenService->repository->getForUser($request->user()->id);

        return Inertia::render('API/Tokens/Index', [
            'tokens' => $tokens,
        ]);
    }

    /**
     * Show the form for creating a new API token.
     *
     * @return \Inertia\Response;
     */
    public function create()
    {
        return Inertia::render('API/Tokens/Create');
    }

    /**
     * Store a newly created API token in storage.
     *
     * @param ApiTokenCreateRequest $request
     * @return \Illuminate\Http\RedirectResponse;
     */
    public function store(ApiTokenCreateRequest $request)
    {
        $result = $this->createApiTokenAction->execute(
            $request->user(),
            $request->name,
            $request->abilities ?? ['*'],
            $request->expires_in_minutes
        );

        // Only show the plain text token once
        return back()->with([
            'token' => $result['plain_text_token'],
            'message' => 'API token created successfully'
        ]);
    }

    /**
     * Remove the specified API token from storage.
     *
     * @param int $id
     * @return \Illuminate\Http\RedirectResponse;
     */
    public function destroy($id)
    {
        $this->apiTokenService->revokeToken($id);

        return back()->with('message', 'API token revoked successfully');
    }
}


