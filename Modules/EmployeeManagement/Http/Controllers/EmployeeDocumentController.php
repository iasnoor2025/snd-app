<?php

namespace Modules\EmployeeManagement\Http\Controllers;

use Modules\EmployeeManagement\Domain\Models\Employee;
use Modules\EmployeeManagement\Services\EmployeeDocumentService;
use Modules\EmployeeManagement\Services\EmployeeDocumentTypeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Illuminate\Support\Facades\Gate;

class EmployeeDocumentController extends Controller
{
    protected EmployeeDocumentService $documentService;
    protected EmployeeDocumentTypeService $documentTypeService;

    public function __construct(
        EmployeeDocumentService $documentService,
        EmployeeDocumentTypeService $documentTypeService
    ) {
        $this->documentService = $documentService;
        $this->documentTypeService = $documentTypeService;
        $this->middleware('auth');
    }

    /**
     * Upload an Iqama document
     */
    public function uploadIqama(Request $request, Employee $employee)
    {
        try {
            if (Gate::denies('update', $employee)) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are not authorized to upload documents for this employee'
                ], 403);
            }

            $rules = $this->documentTypeService->getValidationRules('iqama');
            $request->validate($rules['metadata']);
            $request->validate(['file' => $rules['file']]);

            $media = $this->documentService->uploadIqama(
                $employee->id,
                $request->only([
                    'document_number',
                    'issue_date',
                    'expiry_date',
                    'issuing_authority'
                ]),
                $request->file('file')
            );

            return $this->documentResponse($media);
        } catch (\Exception $e) {
            return $this->handleError($e, 'iqama', $employee->id);
        }
    }

    /**
     * Upload a Passport document
     */
    public function uploadPassport(Request $request, Employee $employee)
    {
        try {
            if (Gate::denies('update', $employee)) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are not authorized to upload documents for this employee'
                ], 403);
            }

            $rules = $this->documentTypeService->getValidationRules('passport');
            $request->validate($rules['metadata']);
            $request->validate(['file' => $rules['file']]);

            $media = $this->documentService->uploadPassport(
                $employee->id,
                $request->only([
                    'document_number',
                    'issue_date',
                    'expiry_date',
                    'issuing_authority',
                    'nationality'
                ]),
                $request->file('file')
            );

            return $this->documentResponse($media);
        } catch (\Exception $e) {
            return $this->handleError($e, 'passport', $employee->id);
        }
    }

    /**
     * Upload a Contract document
     */
    public function uploadContract(Request $request, Employee $employee)
    {
        try {
            if (Gate::denies('update', $employee)) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are not authorized to upload documents for this employee'
                ], 403);
            }

            $rules = $this->documentTypeService->getValidationRules('contract');
            $request->validate($rules['metadata']);
            $request->validate(['file' => $rules['file']]);

            $media = $this->documentService->uploadContract(
                $employee->id,
                $request->only([
                    'contract_type',
                    'start_date',
                    'end_date',
                    'position',
                    'department'
                ]),
                $request->file('file')
            );

            return $this->documentResponse($media);
        } catch (\Exception $e) {
            return $this->handleError($e, 'contract', $employee->id);
        }
    }

    /**
     * Upload a Medical document
     */
    public function uploadMedical(Request $request, Employee $employee)
    {
        try {
            if (Gate::denies('update', $employee)) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are not authorized to upload documents for this employee'
                ], 403);
            }

            $rules = $this->documentTypeService->getValidationRules('medical');
            $request->validate($rules['metadata']);
            $request->validate(['file' => $rules['file']]);

            $media = $this->documentService->uploadMedical(
                $employee->id,
                $request->only([
                    'document_type',
                    'issue_date',
                    'expiry_date',
                    'provider',
                    'policy_number'
                ]),
                $request->file('file')
            );

            return $this->documentResponse($media);
        } catch (\Exception $e) {
            return $this->handleError($e, 'medical', $employee->id);
        }
    }

    /**
     * Upload a general document
     */
    public function uploadGeneral(Request $request, Employee $employee)
    {
        try {
            if (Gate::denies('update', $employee)) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are not authorized to upload documents for this employee'
                ], 403);
            }

            $rules = $this->documentTypeService->getValidationRules('general');
            $request->validate($rules['metadata']);
            $request->validate(['file' => $rules['file']]);

            $media = $this->documentService->uploadGeneral(
                $employee->id,
                $request->only([
                    'document_type',
                    'document_number',
                    'issue_date',
                    'expiry_date',
                    'issuing_authority',
                    'description',
                ]),
                $request->file('file')
            );

            return $this->documentResponse($media);
        } catch (\Exception $e) {
            return $this->handleError($e, 'general', $employee->id);
        }
    }

    /**
     * Get all documents for an employee
     */
    public function index(Employee $employee)
    {
        try {
            if (Gate::denies('view', $employee)) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are not authorized to view documents for this employee'
                ], 403);
            }

            $documents = $this->documentService->getEmployeeDocuments($employee->id);

            return response()->json([
                'success' => true,
                'documents' => $documents->map(function ($media) {
                    return $this->formatMediaResponse($media);
                })
            ]);
        } catch (\Exception $e) {
            return $this->handleError($e, 'index', $employee->id);
        }
    }

    /**
     * Delete a document
     */
    public function destroy(Employee $employee, $document)
    {
        try {
            if (Gate::denies('update', $employee)) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are not authorized to delete documents for this employee'
                ], 403);
            }

            $deleted = $this->documentService->deleteDocument($document);

            return response()->json([
                'success' => true,
                'message' => 'Document deleted successfully'
            ]);
        } catch (\Exception $e) {
            return $this->handleError($e, 'delete', $employee->id, $document);
        }
    }

    /**
     * Download a document
     */
    public function download(Employee $employee, $document)
    {
        try {
            if (Gate::denies('view', $employee)) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are not authorized to download documents for this employee'
                ], 403);
            }

            $media = Media::findOrFail($document);

            if ($media->model_id !== $employee->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Document does not belong to this employee'
                ], 403);
            }

            return response()->file($media->getPath());
        } catch (\Exception $e) {
            return $this->handleError($e, 'download', $employee->id, $document);
        }
    }

    /**
     * Format the media response
     */
    protected function formatMediaResponse(Media $media): array
    {
        return [
            'id' => $media->id,
            'name' => $media->name,
            'file_name' => $media->file_name,
            'mime_type' => $media->mime_type,
            'size' => $media->size,
            'url' => $media->getUrl(),
            'preview_url' => $media->hasGeneratedConversion('thumb') ? $media->getUrl('thumb') : null,
            'custom_properties' => $media->custom_properties,
            'created_at' => $media->created_at?->format('Y-m-d H:i:s')
        ];
    }

    /**
     * Handle document response
     */
    protected function documentResponse(Media $media)
    {
        return response()->json([
            'success' => true,
            'document' => $this->formatMediaResponse($media)
        ]);
    }

    /**
     * Handle error response
     */
    protected function handleError(\Exception $e, string $operation, int $employeeId, ?int $documentId = null): \Illuminate\Http\JsonResponse
    {
        $context = [
            'employee_id' => $employeeId,
            'operation' => $operation,
            'error' => $e->getMessage()
        ];

        if ($documentId) {
            $context['document_id'] = $documentId;
        }

        Log::error('Error in employee document operation', $context);

        return response()->json([
            'success' => false,
            'message' => 'Failed to ' . $operation . ' document: ' . $e->getMessage()
        ], 500);
    }
}


