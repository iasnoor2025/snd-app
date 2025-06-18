<?php

namespace Modules\AuditCompliance\Services;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Modules\AuditCompliance\Domain\Models\GdprDataRequest;
use Modules\AuditCompliance\Domain\Models\ConsentRecord;
use Modules\Core\Domain\Models\User;

class GdprService
{
    /**
     * Create a new GDPR data request.
     */
    public function createDataRequest(array $data): GdprDataRequest
    {
        return GdprDataRequest::create([
            'type' => $data['type'],
            'status' => 'pending',
            'subject_email' => $data['subject_email'],
            'subject_name' => $data['subject_name'] ?? null,
            'description' => $data['description'] ?? null,
            'requested_data' => $data['requested_data'] ?? [],
            'legal_basis' => $data['legal_basis'] ?? 'GDPR Article 15 - Right of access',
            'requested_at' => Carbon::now(),
        ]);
    }

    /**
     * Process a data export request.
     */
    public function processDataExport(GdprDataRequest $request): array
    {
        $request->update(['status' => 'processing']);

        try {
            $userData = $this->collectUserData($request->subject_email, $request->requested_data);
            $filePath = $this->generateDataExportFile($request, $userData);

            $request->update([
                'status' => 'completed',
                'file_path' => $filePath,
                'completed_at' => Carbon::now(),
                'response_notes' => 'Data export completed successfully.',
            ]);

            return [
                'success' => true,
                'file_path' => $filePath,
                'data' => $userData,
            ];
        } catch (\Exception $e) {
            $request->update([
                'status' => 'failed',
                'response_notes' => 'Data export failed: ' . $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Process a data deletion request.
     */
    public function processDataDeletion(GdprDataRequest $request): array
    {
        $request->update(['status' => 'processing']);

        try {
            DB::beginTransaction();

            $deletionResults = $this->deleteUserData($request->subject_email, $request->requested_data);

            $request->update([
                'status' => 'completed',
                'completed_at' => Carbon::now(),
                'response_notes' => 'Data deletion completed. ' . json_encode($deletionResults),
            ]);

            DB::commit();

            return [
                'success' => true,
                'deletion_results' => $deletionResults,
            ];
        } catch (\Exception $e) {
            DB::rollBack();

            $request->update([
                'status' => 'failed',
                'response_notes' => 'Data deletion failed: ' . $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Process a data rectification request.
     */
    public function processDataRectification(GdprDataRequest $request, array $corrections): array
    {
        $request->update(['status' => 'processing']);

        try {
            DB::beginTransaction();

            $rectificationResults = $this->rectifyUserData($request->subject_email, $corrections);

            $request->update([
                'status' => 'completed',
                'completed_at' => Carbon::now(),
                'response_notes' => 'Data rectification completed. ' . json_encode($rectificationResults),
            ]);

            DB::commit();

            return [
                'success' => true,
                'rectification_results' => $rectificationResults,
            ];
        } catch (\Exception $e) {
            DB::rollBack();

            $request->update([
                'status' => 'failed',
                'response_notes' => 'Data rectification failed: ' . $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Collect user data for export.
     */
    protected function collectUserData(string $email, array $requestedData = []): array
    {
        $user = User::where('email', $email)->first();

        if (!$user) {
            throw new \Exception('User not found');
        }

        $data = [
            'personal_information' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
            ],
        ];

        // Collect audit logs
        if (empty($requestedData) || in_array('audit_logs', $requestedData)) {
            $data['audit_logs'] = DB::table('audit_logs')
                ->where('user_id', $user->id)
                ->get()
                ->toArray();
        }

        // Collect consent records
        if (empty($requestedData) || in_array('consent_records', $requestedData)) {
            $data['consent_records'] = ConsentRecord::where('email', $email)
                ->get()
                ->toArray();
        }

        // Collect session data
        if (empty($requestedData) || in_array('session_data', $requestedData)) {
            $data['session_data'] = DB::table('sessions')
                ->where('user_id', $user->id)
                ->get()
                ->toArray();
        }

        // Add more data collections based on your application's needs
        // For example: orders, payments, communications, etc.

        return $data;
    }

    /**
     * Delete user data.
     */
    protected function deleteUserData(string $email, array $dataTypes = []): array
    {
        $user = User::where('email', $email)->first();

        if (!$user) {
            throw new \Exception('User not found');
        }

        $results = [];

        // Delete audit logs (if requested)
        if (empty($dataTypes) || in_array('audit_logs', $dataTypes)) {
            $auditCount = DB::table('audit_logs')->where('user_id', $user->id)->count();
            DB::table('audit_logs')->where('user_id', $user->id)->delete();
            $results['audit_logs'] = "Deleted {$auditCount} audit log records";
        }

        // Delete consent records (if requested)
        if (empty($dataTypes) || in_array('consent_records', $dataTypes)) {
            $consentCount = ConsentRecord::where('email', $email)->count();
            ConsentRecord::where('email', $email)->delete();
            $results['consent_records'] = "Deleted {$consentCount} consent records";
        }

        // Delete session data (if requested)
        if (empty($dataTypes) || in_array('session_data', $dataTypes)) {
            $sessionCount = DB::table('sessions')->where('user_id', $user->id)->count();
            DB::table('sessions')->where('user_id', $user->id)->delete();
            $results['session_data'] = "Deleted {$sessionCount} session records";
        }

        // Delete user account (if requested)
        if (empty($dataTypes) || in_array('user_account', $dataTypes)) {
            $user->delete();
            $results['user_account'] = 'User account deleted';
        }

        return $results;
    }

    /**
     * Rectify user data.
     */
    protected function rectifyUserData(string $email, array $corrections): array
    {
        $user = User::where('email', $email)->first();

        if (!$user) {
            throw new \Exception('User not found');
        }

        $results = [];
        $updatedFields = [];

        // Update user information
        if (isset($corrections['name'])) {
            $user->name = $corrections['name'];
            $updatedFields[] = 'name';
        }

        if (isset($corrections['email'])) {
            $user->email = $corrections['email'];
            $updatedFields[] = 'email';
        }

        if (!empty($updatedFields)) {
            $user->save();
            $results['user_information'] = 'Updated fields: ' . implode(', ', $updatedFields);
        }

        return $results;
    }

    /**
     * Generate data export file.
     */
    protected function generateDataExportFile(GdprDataRequest $request, array $data): string
    {
        $filename = "gdpr_export_{$request->id}_" . Carbon::now()->format('Y_m_d_H_i_s') . '.json';
        $path = "gdpr_exports/{$filename}";

        $exportData = [
            'request_id' => $request->request_id,
            'subject_email' => $request->subject_email,
            'export_date' => Carbon::now()->toISOString(),
            'data' => $data,
        ];

        Storage::disk('local')->put($path, json_encode($exportData, JSON_PRETTY_PRINT));

        return $path;
    }

    /**
     * Record user consent.
     */
    public function recordConsent(array $data): ConsentRecord
    {
        // Deactivate previous consents of the same type
        ConsentRecord::where('email', $data['email'])
            ->where('consent_type', $data['consent_type'])
            ->update(['is_active' => false]);

        return ConsentRecord::create([
            'user_id' => $data['user_id'] ?? null,
            'email' => $data['email'],
            'consent_type' => $data['consent_type'],
            'consent_given' => $data['consent_given'],
            'purpose' => $data['purpose'],
            'legal_basis' => $data['legal_basis'] ?? 'Consent',
            'ip_address' => $data['ip_address'] ?? request()->ip(),
            'user_agent' => $data['user_agent'] ?? request()->userAgent(),
            'consent_details' => $data['consent_details'] ?? [],
            'consent_date' => Carbon::now(),
            'expiry_date' => isset($data['expiry_date']) ? Carbon::parse($data['expiry_date']) : null,
            'is_active' => true,
        ]);
    }

    /**
     * Withdraw user consent.
     */
    public function withdrawConsent(string $email, string $consentType, array $data = []): ConsentRecord
    {
        $latestConsent = ConsentRecord::getLatestConsent($email, $consentType);

        if (!$latestConsent) {
            throw new \Exception('No active consent found for withdrawal');
        }

        $latestConsent->withdraw(
            $data['ip_address'] ?? request()->ip(),
            $data['user_agent'] ?? request()->userAgent()
        );

        return ConsentRecord::where('email', $email)
            ->where('consent_type', $consentType)
            ->where('is_active', true)
            ->latest('consent_date')
            ->first();
    }

    /**
     * Check if user has valid consent.
     */
    public function hasValidConsent(string $email, string $consentType): bool
    {
        return ConsentRecord::hasConsent($email, $consentType);
    }

    /**
     * Get consent history for a user.
     */
    public function getConsentHistory(string $email, string $consentType = null): \Illuminate\Database\Eloquent\Collection
    {
        $query = ConsentRecord::where('email', $email)
            ->orderBy('consent_date', 'desc');

        if ($consentType) {
            $query->where('consent_type', $consentType);
        }

        return $query->get();
    }

    /**
     * Get overdue GDPR requests.
     */
    public function getOverdueRequests(): \Illuminate\Database\Eloquent\Collection
    {
        return GdprDataRequest::overdue()->get();
    }

    /**
     * Assign a request to a user.
     */
    public function assignRequest(GdprDataRequest $request, int $userId): GdprDataRequest
    {
        $request->assignTo($userId);
        return $request->fresh();
    }

    /**
     * Reject a GDPR request.
     */
    public function rejectRequest(GdprDataRequest $request, string $reason): GdprDataRequest
    {
        $request->reject($reason);
        return $request->fresh();
    }

    /**
     * Get GDPR compliance statistics.
     */
    public function getComplianceStats(): array
    {
        $totalRequests = GdprDataRequest::count();
        $pendingRequests = GdprDataRequest::pending()->count();
        $overdueRequests = GdprDataRequest::overdue()->count();
        $completedRequests = GdprDataRequest::where('status', 'completed')->count();

        $totalConsents = ConsentRecord::active()->count();
        $expiredConsents = ConsentRecord::active()->get()->filter->isExpired()->count();

        return [
            'requests' => [
                'total' => $totalRequests,
                'pending' => $pendingRequests,
                'overdue' => $overdueRequests,
                'completed' => $completedRequests,
                'completion_rate' => $totalRequests > 0 ? ($completedRequests / $totalRequests) * 100 : 0,
            ],
            'consents' => [
                'total_active' => $totalConsents,
                'expired' => $expiredConsents,
                'valid_rate' => $totalConsents > 0 ? (($totalConsents - $expiredConsents) / $totalConsents) * 100 : 0,
            ],
        ];
    }
}
