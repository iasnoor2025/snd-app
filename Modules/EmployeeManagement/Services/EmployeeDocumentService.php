<?php

namespace Modules\EmployeeManagement\Services;

use Modules\Core\Services\BaseService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Modules\Core\Domain\Models\User;
use Modules\EmployeeManagement\Domain\Models\Employee;
use Modules\EmployeeManagement\Domain\Models\EmployeeDocument;
use Modules\EmployeeManagement\Repositories\EmployeeDocumentRepositoryInterface;
use Modules\EmployeeManagement\Repositories\EmployeeRepositoryInterface;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class EmployeeDocumentService extends BaseService
{
    private EmployeeDocumentRepositoryInterface $documentRepository;
    private EmployeeRepositoryInterface $employeeRepository;

    public function __construct(
        EmployeeDocumentRepositoryInterface $documentRepository,
        EmployeeRepositoryInterface $employeeRepository
    ) {
        $this->documentRepository = $documentRepository;
        $this->employeeRepository = $employeeRepository;
    }

    public function uploadDocument(int $employeeId, array $data, UploadedFile $file): Media
    {
        try {
            DB::beginTransaction();

            $employee = $this->employeeRepository->find($employeeId);

            // Add custom properties to be stored with the media
            $customProperties = [
                'document_type' => $data['document_type'],
                'document_number' => $data['document_number'] ?? null,
                'issue_date' => $data['issue_date'] ?? null,
                'expiry_date' => $data['expiry_date'] ?? null,
                'issuing_authority' => $data['issuing_authority'] ?? null,
                'description' => $data['description'] ?? null,
                'status' => 'pending',
                'notes' => $data['notes'] ?? null,
                'is_verified' => false,
                'uploaded_by' => auth()->id(),
                'uploaded_at' => now()->toDateTimeString(),
            ];

            // Add the document to the employee's media collection
            $media = $employee->addMedia($file)
                ->withCustomProperties($customProperties)
                ->toMediaCollection('documents');

            DB::commit();
            return $media;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to upload document: ' . $e->getMessage());
            throw $e;
        }
    }

    public function verifyDocument(int $mediaId, User $verifier, ?string $notes = null): Media
    {
        try {
            DB::beginTransaction();

            $media = Media::findOrFail($mediaId);
            $employee = $this->employeeRepository->find($media->model_id);

            // Update custom properties
            $customProperties = $media->custom_properties;
            $customProperties['is_verified'] = true;
            $customProperties['verified_at'] = now()->toDateTimeString();
            $customProperties['verified_by'] = $verifier->id;
            $customProperties['status'] = 'verified';

            if ($notes) {
                $customProperties['notes'] = $notes;
            }

            $media->custom_properties = $customProperties;
            $media->save();

            DB::commit();
            return $media;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to verify document: ' . $e->getMessage());
            throw $e;
        }
    }

    public function rejectDocument(int $mediaId, User $rejecter, string $reason): Media
    {
        try {
            DB::beginTransaction();

            $media = Media::findOrFail($mediaId);

            // Update custom properties
            $customProperties = $media->custom_properties;
            $customProperties['is_verified'] = false;
            $customProperties['verified_at'] = now()->toDateTimeString();
            $customProperties['verified_by'] = $rejecter->id;
            $customProperties['status'] = 'rejected';
            $customProperties['notes'] = $reason;

            $media->custom_properties = $customProperties;
            $media->save();

            DB::commit();
            return $media;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to reject document: ' . $e->getMessage());
            throw $e;
        }
    }

    public function deleteDocument(int $mediaId): bool
    {
        try {
            DB::beginTransaction();

            $media = Media::findOrFail($mediaId);
            $deleted = $media->delete();

            DB::commit();
            return $deleted;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to delete document: ' . $e->getMessage());
            throw $e;
        }
    }

    public function getEmployeeDocuments(int $employeeId): Collection
    {
        $employee = $this->employeeRepository->find($employeeId);
        return $employee->getMedia('documents');
    }

    public function getExpiringDocuments(int $daysThreshold = 30): Collection
    {
        $cutoffDate = now()->addDays($daysThreshold)->toDateString();

        return Media::query()
            ->where('collection_name', 'documents')
            ->whereJsonContains('custom_properties->document_type', ['passport', 'iqama', 'driving_license'])
            ->whereNotNull('custom_properties->expiry_date')
            ->whereDate('custom_properties->expiry_date', '<=', $cutoffDate)
            ->whereDate('custom_properties->expiry_date', '>=', now()->toDateString())
            ->where('custom_properties->status', 'verified')
            ->get();
    }

    public function getExpiredDocuments(): Collection
    {
        return Media::query()
            ->where('collection_name', 'documents')
            ->whereJsonContains('custom_properties->document_type', ['passport', 'iqama', 'driving_license'])
            ->whereNotNull('custom_properties->expiry_date')
            ->whereDate('custom_properties->expiry_date', '<', now()->toDateString())
            ->get();
    }

    public function getPendingVerificationDocuments(): Collection
    {
        return Media::query()
            ->where('collection_name', 'documents')
            ->where('custom_properties->status', 'pending')
            ->get();
    }
}


