<?php

namespace Modules\EmployeeManagement\Http\Controllers;

use Modules\EmployeeManagement\Domain\Models\Employee;
use Modules\Core\Services\DocumentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Illuminate\Support\Facades\Gate;

class EmployeeDocumentController extends Controller
{
    protected $documentService;

    public function __construct(DocumentService $documentService)
    {
        $this->documentService = $documentService;
        $this->middleware('auth');
    }

    /**
     * Upload a document for an employee
     */
    public function upload(Request $request, Employee $employee)
    {
        try {
            // Check permissions
            if (Gate::denies('update', $employee)) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are not authorized to upload documents for this employee'
                ], 403);
            }

            $request->validate([
                'file' => 'required|file|max:10240', // 10MB limit
                'name' => 'required|string|max:255',
                'type' => 'required|string|in:employee_documents,employee_custom_certificates'
            ]);

            // Upload the document
            $media = $employee->addMedia($request->file('file'))
                ->usingName($request->input('name'))
                ->usingFileName(time() . '_' . $request->input('name') . '.' . $request->file('file')->getClientOriginalExtension())
                ->toMediaCollection($request->input('type'));

            return response()->json([
                'success' => true,
                'document' => [
                    'id' => $media->id,
                    'name' => $media->name,
                    'file_name' => $media->file_name,
                    'mime_type' => $media->mime_type,
                    'size' => $media->size,
                    'url' => $media->getUrl(),
                    'preview_url' => $media->hasGeneratedConversion('thumb') ? $media->getUrl('thumb') : null,
                    'created_at' => $media->created_at
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error uploading employee document', [
                'employee_id' => $employee->id,
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to upload document: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all documents for an employee
     */
    public function index(Employee $employee)
    {
        try {
            // Check permissions
            if (Gate::denies('view', $employee)) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are not authorized to view documents for this employee'
                ], 403);
            }

            $documents = $employee->getMedia('employee_documents');
            $certificates = $employee->getMedia('employee_custom_certificates');

            $allMedia = $documents->concat($certificates)->map(function ($mediaItem) {
                return [
                    'id' => $mediaItem->id,
                    'name' => $mediaItem->name,
                    'file_name' => $mediaItem->file_name,
                    'mime_type' => $mediaItem->mime_type,
                    'size' => $mediaItem->size,
                    'url' => $mediaItem->getUrl(),
                    'preview_url' => $mediaItem->hasGeneratedConversion('thumb') ? $mediaItem->getUrl('thumb') : null,
                    'collection_name' => $mediaItem->collection_name,
                    'created_at' => $mediaItem->created_at
                ];
            });

            return response()->json([
                'success' => true,
                'documents' => $allMedia
            ]);
        } catch (\Exception $e) {
            Log::error('Error getting employee documents', [
                'employee_id' => $employee->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve documents: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a document
     */
    public function destroy(Employee $employee, $document)
    {
        try {
            // Check permissions
            if (Gate::denies('update', $employee)) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are not authorized to delete documents for this employee'
                ], 403);
            }

            $media = $employee->getMedia('employee_documents')
                ->concat($employee->getMedia('employee_custom_certificates'))
                ->find($document);

            if (!$media) {
                return response()->json([
                    'success' => false,
                    'message' => 'Document not found'
                ], 404);
            }

            $media->delete();

            return response()->json([
                'success' => true,
                'message' => 'Document deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting employee document', [
                'employee_id' => $employee->id,
                'document_id' => $document,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete document: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Download a document
     */
    public function download(Employee $employee, $document)
    {
        try {
            // Check permissions
            if (Gate::denies('view', $employee)) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are not authorized to download documents for this employee'
                ], 403);
            }

            $mediaId = (int) $document;
            $media = $employee->getMedia('employee_documents')
                ->concat($employee->getMedia('employee_custom_certificates'))
                ->first(function ($item) use ($mediaId) {
                    return (int) $item->id === $mediaId;
                });

            if (!$media || !method_exists($media, 'getPath')) {
                \Log::error('Media not found or invalid in EmployeeDocumentController@download', [
                    'employee_id' => $employee->id,
                    'document_id' => $document,
                    'media' => $media
                ]);
                return response()->json(['error' => 'Media not found'], 404);
            }

            return response()->file($media->getPath());
        } catch (\Exception $e) {
            Log::error('Error downloading employee document', [
                'employee_id' => $employee->id,
                'document_id' => $document,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to download document: ' . $e->getMessage()
            ], 500);
        }
    }
}


