<?php

namespace Modules\Core\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Modules\Core\Services\MfaService;
use Inertia\Inertia;
use Inertia\Response;

class MfaController extends Controller
{
    public function __construct(private MfaService $mfaService)
    {
    }

    public function setup(Request $request): JsonResponse
    {
        $setup = $this->mfaService->setupMfa($request->user());

        return response()->json([
            'secret_key' => $setup['secret_key'],
            'qr_code_url' => $setup['qr_code_url'],
            'backup_codes' => $setup['backup_codes'],
        ]);
    }

    public function enable(Request $request): JsonResponse
    {
        $request->validate([
            'code' => 'required|string|size:6',
        ]);

        $success = $this->mfaService->enableMfa(
            $request->user(),
            $request->input('code')
        );

        return response()->json([
            'success' => $success,
            'message' => $success ? 'MFA enabled successfully' : 'Invalid verification code',
        ]);
    }

    public function disable(Request $request): JsonResponse
    {
        $this->mfaService->disableMfa($request->user());

        return response()->json([
            'success' => true,
            'message' => 'MFA disabled successfully',
        ]);
    }

    public function verify(Request $request): Response|JsonResponse|RedirectResponse
    {
        if ($request->isMethod('GET')) {
            return Inertia::render('Core/Auth/MfaVerify');
        }

        $request->validate([
            'code' => 'required|string',
        ]);

        $success = $this->mfaService->verifyCode(
            $request->user(),
            $request->input('code')
        );

        if ($request->expectsJson()) {
            return response()->json([
                'success' => $success,
                'message' => $success ? 'MFA verified successfully' : 'Invalid verification code',
            ]);
        }

        if (!$success) {
            return back()->withErrors([
                'code' => 'Invalid verification code',
            ]);
        }

        return redirect()->intended(
            $request->session()->pull('url.intended', route('dashboard'))
        );
    }

    public function setRecoveryEmail(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:6',
        ]);

        $success = $this->mfaService->setRecoveryEmail(
            $request->user(),
            $request->input('email'),
            $request->input('code')
        );

        return response()->json([
            'success' => $success,
            'message' => $success ? 'Recovery email set successfully' : 'Invalid verification code',
        ]);
    }
} 