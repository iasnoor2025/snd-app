<?php

namespace Modules\AuditCompliance\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Modules\AuditCompliance\Domain\Models\GdprDataRequest;
use Modules\AuditCompliance\Domain\Models\ConsentRecord;
use Modules\AuditCompliance\Services\GdprService;
use Modules\Core\Domain\Models\User;

class GdprController extends Controller
{
    protected GdprService $gdprService;

    public function __construct(GdprService $gdprService)
    {
        $this->gdprService = $gdprService;
    }

    /**
     * Display GDPR dashboard.
     */
    public function index()
    {
        $stats = $this->gdprService->getComplianceStats();
        $overdueRequests = $this->gdprService->getOverdueRequests();
        $recentRequests = GdprDataRequest::with('assignedTo')
            ->latest()
            ->take(10)
            ->get();

        return Inertia::render('AuditCompliance::Gdpr/Dashboard', [
            'stats' => $stats,
            'overdueRequests' => $overdueRequests,
            'recentRequests' => $recentRequests,
        ]);
    }

    /**
     * Display data requests.
     */
    public function requests(Request $request)
    {
        $query = GdprDataRequest::with('assignedTo')
            ->when($request->search, function ($q, $search) {
                $q->where('subject_email', 'like', "%{$search}%")
                  ->orWhere('subject_name', 'like', "%{$search}%")
                  ->orWhere('request_id', 'like', "%{$search}%");
            })
            ->when($request->type, function ($q, $type) {
                $q->where('type', $type);
            })
            ->when($request->status, function ($q, $status) {
                $q->where('status', $status);
            })
            ->when($request->overdue === 'true', function ($q) {
                $q->overdue();
            })
            ->orderBy('created_at', 'desc');

        $requests = $query->paginate(15)->withQueryString();

        return Inertia::render('AuditCompliance::Gdpr/Requests', [
            'requests' => $requests,
            'filters' => $request->only(['search', 'type', 'status', 'overdue']),
            'requestTypes' => $this->getRequestTypes(),
            'statusOptions' => $this->getStatusOptions(),
            'users' => User::select('id', 'name', 'email')->get(),
        ]);
    }

    /**
     * Create a new data request.
     */
    public function createRequest(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'required|string|in:access,rectification,erasure,portability,restriction',
            'subject_email' => 'required|email',
            'subject_name' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:1000',
            'requested_data' => 'nullable|array',
            'legal_basis' => 'nullable|string|max:255',
        ]);

        $dataRequest = $this->gdprService->createDataRequest($validated);

        return response()->json([
            'message' => 'GDPR data request created successfully.',
            'request' => $dataRequest,
        ], 201);
    }

    /**
     * Show a specific data request.
     */
    public function showRequest(GdprDataRequest $request)
    {
        $request->load('assignedTo');

        return Inertia::render('AuditCompliance::Gdpr/RequestDetail', [
            'request' => $request,
            'users' => User::select('id', 'name', 'email')->get(),
        ]);
    }

    /**
     * Process a data export request.
     */
    public function processExport(GdprDataRequest $request): JsonResponse
    {
        if ($request->type !== 'access') {
            return response()->json([
                'message' => 'This request is not a data access request.',
            ], 422);
        }

        try {
            $result = $this->gdprService->processDataExport($request);

            return response()->json([
                'message' => 'Data export completed successfully.',
                'result' => $result,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Data export failed: ' . $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Process a data deletion request.
     */
    public function processDeletion(GdprDataRequest $request): JsonResponse
    {
        if ($request->type !== 'erasure') {
            return response()->json([
                'message' => 'This request is not a data erasure request.',
            ], 422);
        }

        try {
            $result = $this->gdprService->processDataDeletion($request);

            return response()->json([
                'message' => 'Data deletion completed successfully.',
                'result' => $result,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Data deletion failed: ' . $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Process a data rectification request.
     */
    public function processRectification(Request $request, GdprDataRequest $dataRequest): JsonResponse
    {
        if ($dataRequest->type !== 'rectification') {
            return response()->json([
                'message' => 'This request is not a data rectification request.',
            ], 422);
        }

        $validated = $request->validate([
            'corrections' => 'required|array',
            'corrections.name' => 'nullable|string|max:255',
            'corrections.email' => 'nullable|email',
        ]);

        try {
            $result = $this->gdprService->processDataRectification($dataRequest, $validated['corrections']);

            return response()->json([
                'message' => 'Data rectification completed successfully.',
                'result' => $result,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Data rectification failed: ' . $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Assign a request to a user.
     */
    public function assignRequest(Request $request, GdprDataRequest $dataRequest): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $updatedRequest = $this->gdprService->assignRequest($dataRequest, $validated['user_id']);

        return response()->json([
            'message' => 'Request assigned successfully.',
            'request' => $updatedRequest,
        ]);
    }

    /**
     * Reject a request.
     */
    public function rejectRequest(Request $request, GdprDataRequest $dataRequest): JsonResponse
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        $updatedRequest = $this->gdprService->rejectRequest($dataRequest, $validated['reason']);

        return response()->json([
            'message' => 'Request rejected successfully.',
            'request' => $updatedRequest,
        ]);
    }

    /**
     * Download exported data.
     */
    public function downloadExport(GdprDataRequest $request): Response
    {
        if (!$request->file_path || !Storage::disk('local')->exists($request->file_path)) {
            abort(404, 'Export file not found.');
        }

        $filename = "gdpr_export_{$request->request_id}.json";

        return Storage::disk('local')->download($request->file_path, $filename);
    }

    /**
     * Display consent records.
     */
    public function consents(Request $request)
    {
        $query = ConsentRecord::query()
            ->when($request->search, function ($q, $search) {
                $q->where('email', 'like', "%{$search}%")
                  ->orWhere('consent_type', 'like', "%{$search}%");
            })
            ->when($request->consent_type, function ($q, $type) {
                $q->where('consent_type', $type);
            })
            ->when($request->status, function ($q, $status) {
                if ($status === 'given') {
                    $q->given();
                } elseif ($status === 'withdrawn') {
                    $q->withdrawn();
                } elseif ($status === 'expired') {
                    $q->expired();
                }
            })
            ->orderBy('consent_date', 'desc');

        $consents = $query->paginate(15)->withQueryString();

        $consentTypes = ConsentRecord::select('consent_type')
            ->distinct()
            ->pluck('consent_type')
            ->toArray();

        return Inertia::render('AuditCompliance::Gdpr/Consents', [
            'consents' => $consents,
            'filters' => $request->only(['search', 'consent_type', 'status']),
            'consentTypes' => $consentTypes,
        ]);
    }

    /**
     * Record user consent.
     */
    public function recordConsent(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'nullable|exists:users,id',
            'email' => 'required|email',
            'consent_type' => 'required|string|max:255',
            'consent_given' => 'required|boolean',
            'purpose' => 'required|string|max:500',
            'legal_basis' => 'nullable|string|max:255',
            'consent_details' => 'nullable|array',
            'expiry_date' => 'nullable|date|after:today',
        ]);

        $consent = $this->gdprService->recordConsent($validated);

        return response()->json([
            'message' => 'Consent recorded successfully.',
            'consent' => $consent,
        ], 201);
    }

    /**
     * Withdraw user consent.
     */
    public function withdrawConsent(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'consent_type' => 'required|string',
        ]);

        try {
            $consent = $this->gdprService->withdrawConsent(
                $validated['email'],
                $validated['consent_type']
            );

            return response()->json([
                'message' => 'Consent withdrawn successfully.',
                'consent' => $consent,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to withdraw consent: ' . $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Get consent history for a user.
     */
    public function consentHistory(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'consent_type' => 'nullable|string',
        ]);

        $history = $this->gdprService->getConsentHistory(
            $validated['email'],
            $validated['consent_type'] ?? null
        );

        return response()->json([
            'history' => $history,
        ]);
    }

    /**
     * Get available request types.
     */
    protected function getRequestTypes(): array
    {
        return [
            'access' => 'Data Access (Article 15)',
            'rectification' => 'Data Rectification (Article 16)',
            'erasure' => 'Data Erasure (Article 17)',
            'portability' => 'Data Portability (Article 20)',
            'restriction' => 'Processing Restriction (Article 18)',
        ];
    }

    /**
     * Get status options.
     */
    protected function getStatusOptions(): array
    {
        return [
            'pending' => 'Pending',
            'processing' => 'Processing',
            'completed' => 'Completed',
            'rejected' => 'Rejected',
            'failed' => 'Failed',
        ];
    }
}
