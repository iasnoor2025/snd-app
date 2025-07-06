<?php
namespace Modules\Core\Http\Controllers;

use App\Models\Document;
use Modules\EquipmentManagement\Domain\Models\Equipment;
use Modules\EmployeeManagement\Domain\Models\Employee;
use App\Services\PdfMergeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use InvalidArgumentException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Modules\Core\Services\DocumentService;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class DocumentController extends Controller
{
    protected $pdfMergeService;
    protected $documentService;
    protected $modelMap = [
        'customer' => \Modules\CustomerManagement\Domain\Models\Customer::class,
        'equipment' => \Modules\EquipmentManagement\Domain\Models\Equipment::class,
        'employee' => \Modules\EmployeeManagement\Domain\Models\Employee::class,
        'rental' => \Modules\RentalManagement\Domain\Models\Rental::class,
        'quotation' => \Modules\RentalManagement\Domain\Models\Quotation::class,
        'invoice' => \Modules\RentalManagement\Domain\Models\Invoice::class
    ];

    public function __construct(PdfMergeService $pdfMergeService, DocumentService $documentService)
    {
        $this->pdfMergeService = $pdfMergeService;
        $this->documentService = $documentService;
    }

    private function getModelClass(string $model): string
    {
        Log::info('Getting model class', [
            'input_model' => $model,
            'lowercase_model' => strtolower($model)
        ]);

        $model = strtolower($model);
        $modelMap = [
            'employee' => Employee::class,
            'equipment' => Equipment::class,
        ];

        if (!isset($modelMap[$model])) {
            Log::error('Invalid model type', [
                'model' => $model,
                'available_models' => array_keys($modelMap)
            ]);
            throw new InvalidArgumentException("Invalid model type: {$model}");
        }

        Log::info('Model class resolved', [
            'model' => $model,
            'class' => $modelMap[$model]
        ]);

        return $modelMap[$model];
    }

    public function index(Request $request)
    {
        $query = Document::with('uploadedBy')
            ->when($request->documentable_type && $request->documentable_id, function ($query) use ($request) {
                return $query->where('documentable_type', $request->documentable_type)
                    ->where('documentable_id', $request->documentable_id);
            })
            ->latest();

        $documents = $query->paginate(10);

        return Inertia::render('Documents/Index', [
            'documents' => $documents,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'files' => 'required|array',
            'files.*' => 'required|file|max:5120', // 5MB max
            'documentable_type' => 'required|string',
            'documentable_id' => 'required|integer',
        ]);

        $uploadedFiles = [];

        foreach ($request->file('files') as $file) {
            $originalName = $file->getClientOriginalName();
            $extension = $file->getClientOriginalExtension();
            $fileName = Str::random(40) . '.' . $extension;
            $filePath = $file->storeAs('documents', $fileName, 'public');

            $document = Document::create([
                'name' => $originalName,
                'file_path' => $filePath,
                'file_type' => $file->getMimeType(),
                'file_size' => $file->getSize(),
                'documentable_type' => $request->documentable_type,
                'documentable_id' => $request->documentable_id,
                'uploaded_by' => auth()->id(),
            ]);

            $uploadedFiles[] = $document;
        }

        return response()->json([
            'message' => 'Files uploaded successfully',
            'documents' => $uploadedFiles,
        ]);
    }

    public function destroy(Document $document)
    {
        $this->authorize('delete', $document);

        $document->delete();

        return response()->json([
            'message' => 'Document deleted successfully',
        ]);
    }

    public function download(Document $document)
    {
        if (!Storage::disk('public')->exists($document->file_path)) {
            abort(404);
        }

        return Storage::disk('public')->download(
            $document->file_path,
            $document->name
        );
    }

    public function merge(Request $request, $model, $modelId)
    {
        try {
            $modelClass = $this->getModelClass($model);
            $modelInstance = $modelClass::findOrFail($modelId);

            if (!$request->user()->can('update', $modelInstance)) {
                return response()->json([
                    'message' => 'Access denied',
                    'error' => 'You do not have permission to merge documents for this resource'
                ], 403);
            }

            $request->validate([
                'document_ids' => 'required|array|min:2',
                'document_ids.*' => 'required|exists:documents,id',
                'output_name' => 'required|string|max:255',
            ]);

            $documents = $modelInstance->documents()
                ->whereIn('id', $request->document_ids)
                ->where('file_type', 'pdf')
                ->get();

            if ($documents->count() !== count($request->document_ids)) {
                return response()->json([
                    'message' => 'Invalid document IDs or non-PDF files selected',
                    'error' => 'Please ensure all selected documents exist and are PDF files'
                ], 400);
            }

            $mergedDocument = $this->pdfMergeService->merge(
                $documents,
                $request->output_name,
                $model,
                $modelId
            );

            return response()->json([
                'message' => 'PDFs merged successfully',
                'document' => $mergedDocument,
            ]);

        } catch (\Exception $e) {
            Log::error('Error merging PDFs', [
                'model' => $model,
                'modelId' => $modelId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Error merging PDFs',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Upload documents for a model
     *
     * @param Request $request
     * @param string $modelType
     * @param int $modelId
     * @return \Illuminate\Http\JsonResponse;
     */
    public function upload(Request $request, string $modelType, int $modelId)
    {
        try {
            // Check if model type is supported
            if (!array_key_exists($modelType, $this->modelMap)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unsupported model type: ' . $modelType,
                ], 400);
            }

            // Get model class
            $modelClass = $this->modelMap[$modelType];

            // Find the model instance
            $model = $modelClass::findOrFail($modelId);

            // Check permissions
            if ($request->user()->cannot('uploadDocuments', $model)) {
                return response()->json([
                    'success' => false,
                    'message' => 'You do not have permission to upload documents for this ' . $modelType,
                ], 403);
            }

            // Validate the request
            $request->validate([
                'documents.*' => 'required|file|max:10240', // 10MB max
                'document_names.*' => 'sometimes|string|max:255',
            ]);

            // Check if files were uploaded
            if (!$request->hasFile('documents')) {
                return response()->json([
                    'success' => false,
                    'message' => 'No documents provided',
                ], 400);
            }

            // Upload documents
            $files = $request->file('documents');
            $names = $request->input('document_names', []);

            $media = $this->documentService->uploadDocuments($model, $files, 'documents', [
                'custom_properties' => [
                    'names' => $names
                ],
                'conversions' => [
                    'thumb' => [
                        'width' => 200,
                        'height' => 200,
                        'fit' => 'contain'
                    ],
                    'id_card' => [
                        'width' => 340,
                        'height' => 215,
                        'fit' => 'contain'
                    ]
                ]
            ]);

            // Transform media to a format suitable for the frontend
            $uploadedDocuments = $media->map(function ($item) {
                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'file_name' => $item->file_name,
                    'mime_type' => $item->mime_type,
                    'size' => $item->size,
                    'url' => $item->getUrl(),
                    'thumb' => $item->hasGeneratedConversion('thumb') ? $item->getUrl('thumb') : null,
                    'id_card' => $item->hasGeneratedConversion('id_card') ? $item->getUrl('id_card') : null,
                    'created_at' => $item->created_at?->format('Y-m-d H:i:s')->toDateTimeString(),
                ];
            });

            return response()->json([
                'success' => true,
                'message' => 'Documents uploaded successfully',
                'documents' => $uploadedDocuments,
            ]);
        } catch (\Exception $e) {
            Log::error('Document upload failed', [
                'model_type' => $modelType,
                'model_id' => $modelId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Document upload failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a document
     *
     * @param Request $request
     * @param string $modelType
     * @param int $modelId
     * @param int $mediaId
     * @return \Illuminate\Http\JsonResponse;
     */
    public function delete(Request $request, string $modelType, int $modelId, int $mediaId)
    {
        try {
            // Check if model type is supported
            if (!array_key_exists($modelType, $this->modelMap)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unsupported model type: ' . $modelType,
                ], 400);
            }

            // Get model class
            $modelClass = $this->modelMap[$modelType];

            // Find the model instance
            $model = $modelClass::findOrFail($modelId);

            // Check permissions
            if ($request->user()->cannot('deleteDocuments', $model)) {
                return response()->json([
                    'success' => false,
                    'message' => 'You do not have permission to delete documents for this ' . $modelType,
                ], 403);
            }

            // Delete the document
            $success = $this->documentService->deleteDocument($model, $mediaId);

            if (!$success) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to delete document',
                ], 500);
            }

            return response()->json([
                'success' => true,
                'message' => 'Document deleted successfully',
            ]);
        } catch (\Exception $e) {
            Log::error('Document deletion failed', [
                'model_type' => $modelType,
                'model_id' => $modelId,
                'media_id' => $mediaId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Document deletion failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Download a single document
     *
     * @param Request $request
     * @param string $modelType
     * @param int $modelId
     * @param int $mediaId
     * @return StreamedResponse;
     */
    public function downloadSingle(Request $request, string $modelType, int $modelId, int $mediaId)
    {
        try {
            if (!array_key_exists($modelType, $this->modelMap)) {
                abort(400, 'Unsupported model type: ' . $modelType);
            }
            $modelClass = $this->modelMap[$modelType];
            $model = $modelClass::findOrFail($modelId);
            if ($request->user()->cannot('view', $model)) {
                abort(403, 'You do not have permission to download documents for this ' . $modelType);
            }
            $mediaIdInt = (int) $mediaId;
            $media = $model->media()->find($mediaIdInt);
            if (!$media || !method_exists($media, 'getPath')) {
                \Log::error('Media not found or invalid in DocumentController@downloadSingle', [
                    'model_type' => $modelType,
                    'model_id' => $modelId,
                    'media_id' => $mediaId,
                    'media' => $media,
                    'all_media_ids' => $model->media()->pluck('id')->all(),
                ]);
                abort(404, 'Media not found');
            }
            $path = $media->getPath();
            if (!$path || !file_exists($path)) {
                \Log::error('Media file does not exist on disk in DocumentController@downloadSingle', [
                    'model_type' => $modelType,
                    'model_id' => $modelId,
                    'media_id' => $mediaId,
                    'path' => $path,
                ]);
                abort(404, 'File not found on disk');
            }
            return response()->download($path, $media->file_name);
        } catch (\Exception $e) {
            Log::error('Document download failed', [
                'model_type' => $modelType,
                'model_id' => $modelId,
                'media_id' => $mediaId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            abort(500, 'Document download failed: ' . $e->getMessage());
        }
    }

    /**
     * Print documents as a combined PDF
     *
     * @param Request $request
     * @param string $modelType
     * @param int $modelId
     * @return StreamedResponse;
     */
    public function printCombined(Request $request, string $modelType, int $modelId)
    {
        try {
            // Check if model type is supported
            if (!array_key_exists($modelType, $this->modelMap)) {
                abort(400, 'Unsupported model type: ' . $modelType);
            }

            // Get model class
            $modelClass = $this->modelMap[$modelType];

            // Find the model instance
            $model = $modelClass::findOrFail($modelId);

            // Check permissions
            if ($request->user()->cannot('view', $model)) {
                abort(403, 'You do not have permission to print documents for this ' . $modelType);
            }

            // Get media IDs to combine (optional)
            $mediaIds = $request->input('media_ids');

            // Generate the combined PDF
            $pdfPath = $this->documentService->generateCombinedPdf($model, $mediaIds);

            if (!$pdfPath || !file_exists($pdfPath)) {
                abort(404, 'No PDF documents found or could not create combined PDF');
            }

            // Create a filename for the download
            $downloadName = Str::slug($modelType) . '-' . $modelId . '-documents.pdf';

            // Download the file
            return response()->download($pdfPath, $downloadName, [
                'Content-Type' => 'application/pdf',
            ])->deleteFileAfterSend(true);
        } catch (\Exception $e) {
            Log::error('Document printing failed', [
                'model_type' => $modelType,
                'model_id' => $modelId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            abort(500, 'Document printing failed: ' . $e->getMessage());
        }
    }

    /**
     * Display a media file, optionally with a conversion
     *
     * @param int $mediaId
     * @param string|null $conversionName
     * @return \Symfony\Component\HttpFoundation\Response;
     */
    public function showMedia(int $mediaId, string $conversionName = null)
    {
        try {
            $mediaIdInt = (int) $mediaId;
            $media = Media::find($mediaIdInt);
            if (!$media || !method_exists($media, 'getPath')) {
                \Log::error('Media not found or invalid in DocumentController@showMedia', [
                    'media_id' => $mediaId,
                    'media' => $media
                ]);
                abort(404, 'Media not found');
            }
            if ($conversionName === null) {
                $path = $media->getPath();
                if (!$path || !file_exists($path)) {
                    \Log::error('Media file does not exist on disk in DocumentController@showMedia', [
                        'media_id' => $mediaId,
                        'path' => $path,
                    ]);
                    abort(404, 'File not found on disk');
                }
                return response()->file($path);
            }
            if (!$media->hasGeneratedConversion($conversionName)) {
                abort(404, 'Conversion not found');
            }
            $path = $media->getPath($conversionName);
            if (!$path || !file_exists($path)) {
                \Log::error('Media conversion file does not exist on disk in DocumentController@showMedia', [
                    'media_id' => $mediaId,
                    'conversion' => $conversionName,
                    'path' => $path,
                ]);
                abort(404, 'Conversion file not found on disk');
            }
            return response()->file($path);
        } catch (ModelNotFoundException $e) {
            abort(404, 'Media not found');
        } catch (\Exception $e) {
            Log::error('Error serving media', [
                'mediaId' => $mediaId,
                'conversionName' => $conversionName,
                'error' => $e->getMessage()
            ]);
            abort(500, 'Error serving media file');
        }
    }

    /**
     * Get documents for an equipment item
     *
     * @param \Modules\EquipmentManagement\Domain\Models\Equipment $equipment
     * @return \Illuminate\Http\JsonResponse;
     */
    public function getDocuments(Equipment $equipment)
    {
        try {
            // Use the document service to get formatted documents
            $documents = $this->documentService->getFormattedDocuments($equipment, 'documents');

            return response()->json($documents);
        } catch (\Exception $e) {
            Log::error('Error retrieving equipment documents', [
                'equipment_id' => $equipment->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'error' => 'Failed to retrieve documents: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Upload documents to an equipment item
     *
     * @param Request $request
     * @param \Modules\EquipmentManagement\Domain\Models\Equipment $equipment
     * @return \Illuminate\Http\JsonResponse;
     */
    public function uploadEquipmentDocuments(Request $request, Equipment $equipment)
    {
        try {
            // Validate the request
            $request->validate([
                'documents.*' => 'required|file|max:10240', // 10MB max
                'document_names.*' => 'sometimes|string|max:255',
            ]);

            // Check if files were uploaded
            if (!$request->hasFile('documents')) {
                return response()->json([
                    'error' => 'No documents provided'
                ], 400);
            }

            // Upload documents
            $files = $request->file('documents');
            $names = $request->input('document_names', []);

            $media = $this->documentService->uploadDocuments($equipment, $files, $names);

            // Transform media to a format suitable for the frontend
            $uploadedDocuments = $media->map(function ($item) {
                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'file_name' => $item->file_name,
                    'file_type' => $item->mime_type,
                    'size' => $item->size,
                    'url' => $item->getUrl(),
                    'created_at' => $item->created_at?->format('Y-m-d H:i:s')->toDateTimeString(),
                ];
            });

            return response()->json([
                'message' => 'Documents uploaded successfully',
                'documents' => $uploadedDocuments,
            ]);
        } catch (\Exception $e) {
            Log::error('Error uploading equipment documents', [
                'equipment_id' => $equipment->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'error' => 'Failed to upload documents: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a document from an equipment item
     *
     * @param \Modules\EquipmentManagement\Domain\Models\Equipment $equipment
     * @param int $document
     * @return \Illuminate\Http\JsonResponse;
     */
    public function deleteEquipmentDocument(Equipment $equipment, $document)
    {
        try {
            // Find the media item
            $media = $equipment->media()->find($document);
            if (!$media) {
                abort(404, 'Media not found');
            }

            // Delete the media
            $media->delete();

            return response()->json([
                'message' => 'Document deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting equipment document', [
                'equipment_id' => $equipment->id,
                'document_id' => $document,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'error' => 'Failed to delete document: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Download a document from an equipment item
     *
     * @param \Modules\EquipmentManagement\Domain\Models\Equipment $equipment
     * @param int $document
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse;
     */
    public function downloadEquipmentDocument(Equipment $equipment, $document)
    {
        try {
            $mediaId = (int) $document;
            $media = $equipment->media()->find($mediaId);
            if (!$media || !method_exists($media, 'getPath')) {
                \Log::error('Media not found or invalid in DocumentController@downloadEquipmentDocument', [
                    'equipment_id' => $equipment->id,
                    'document_id' => $document,
                    'media' => $media,
                    'all_media_ids' => $equipment->media()->pluck('id')->all(),
                ]);
                abort(404, 'Media not found');
            }
            $path = $media->getPath();
            if (!$path || !file_exists($path)) {
                \Log::error('Media file does not exist on disk in DocumentController@downloadEquipmentDocument', [
                    'equipment_id' => $equipment->id,
                    'document_id' => $document,
                    'media_id' => $media->id,
                    'path' => $path,
                ]);
                abort(404, 'File not found on disk');
            }
            return response()->download($path, $media->file_name);
        } catch (\Exception $e) {
            Log::error('Error downloading equipment document', [
                'equipment_id' => $equipment->id,
                'document_id' => $document,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            abort(500, 'Failed to download document: ' . $e->getMessage());
        }
    }

    /**
     * Merge multiple documents from an equipment item
     *
     * @param Request $request
     * @param \Modules\EquipmentManagement\Domain\Models\Equipment $equipment
     * @return \Illuminate\Http\JsonResponse;
     */
    public function mergeEquipmentDocuments(Request $request, Equipment $equipment)
    {
        try {
            // Validate request
            $request->validate([
                'document_ids' => 'required|array|min:2',
                'document_ids.*' => 'required|integer|exists:media,id',
                'output_name' => 'required|string|max:255',
            ]);

            // Get the selected media items
            $mediaItems = $equipment->media()
                ->whereIn('id', $request->document_ids)
                ->get();

            if ($mediaItems->count() !== count($request->document_ids)) {
                return response()->json([
                    'error' => 'One or more documents not found'
                ], 404);
            }

            // Check if all documents are PDFs
            foreach ($mediaItems as $media) {
                if (!in_array($media->mime_type, ['application/pdf', 'pdf'])) {
                    return response()->json([
                        'error' => 'All documents must be PDFs for merging'
                    ], 400);
                }
            }

            // Create paths array for all PDFs
            $pdfPaths = $mediaItems->map(function ($media) {
                return $media ? $media->getPath() : null;
            })->filter()->toArray();

            // Use PDF merge service
            $mergedPdfPath = $this->pdfMergeService->mergeFiles(
                $pdfPaths,
                $request->output_name
            );

            // Add the merged PDF as a new media item
            $mergedDocument = $equipment->addMedia($mergedPdfPath)
                ->usingName($request->output_name)
                ->usingFileName(basename($mergedPdfPath))
                ->toMediaCollection('documents');

            return response()->json([
                'message' => 'Documents merged successfully',
                'document' => [
                    'id' => $mergedDocument->id,
                    'name' => $mergedDocument->name,
                    'file_name' => $mergedDocument->file_name,
                    'file_type' => $mergedDocument->mime_type,
                    'size' => $mergedDocument->size,
                    'url' => $mergedDocument->getUrl(),
                    'created_at' => $mergedDocument->created_at?->format('Y-m-d H:i:s')->toDateTimeString(),
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error merging equipment documents', [
                'equipment_id' => $equipment->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'error' => 'Failed to merge documents: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Rename a document from an equipment item
     *
     * @param Request $request
     * @param \Modules\EquipmentManagement\Domain\Models\Equipment $equipment
     * @param int $document
     * @return \Illuminate\Http\JsonResponse;
     */
    public function renameEquipmentDocument(Request $request, Equipment $equipment, $document)
    {
        try {
            // Validate request
            $request->validate([
                'name' => 'required|string|max:255'
            ]);

            // Find the media item
            $media = $equipment->media()->find($document);
            if (!$media) {
                abort(404, 'Media not found');
            }

            // Update media name
            $media->name = $request->name;
            $media->save();

            return response()->json([
                'message' => 'Document renamed successfully',
                'document' => [
                    'id' => $media->id,
                    'name' => $media->name,
                    'file_name' => $media->file_name,
                    'file_type' => $media->mime_type,
                    'size' => $media->size,
                    'url' => $media->getUrl(),
                    'created_at' => $media->created_at?->format('Y-m-d H:i:s')->toDateTimeString(),
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error renaming equipment document', [
                'equipment_id' => $equipment->id,
                'document_id' => $document,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'error' => 'Failed to rename document: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate a PDF summary of documents
     *
     * @param Request $request
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse;
     */
    public function generateSummary(Request $request)
    {
        $request->validate([
            'document_ids' => 'required|array',
            'document_ids.*' => 'exists:media,id',
        ]);

        $documents = Media::whereIn('id', $request->document_ids)->get();

        // Get employee data if available
        $employee = null;
        if ($request->has('employee_id')) {
            // Ensure ID is numeric
            if (!is_numeric($request->employee_id)) {
                abort(404, 'Invalid ID provided');
            }
            $employee = Employee::find($request->employee_id);
        }

        // Generate the summary PDF
        $pdfPath = $this->documentService->generateDocumentSummary($documents, [
            'employee' => $employee,
            'summary' => $request->input('summary', ''),
        ]);

        if (!$pdfPath) {
            return response()->json(['error' => 'Failed to generate document summary'], 500);
        }

        return response()->download($pdfPath, 'document_summary.pdf', [
            'Content-Type' => 'application/pdf',
        ])->deleteFileAfterSend(true);
    }

    /**
     * Print a summary of employee documents
     *
     * @param Request $request
     * @param int $employeeId
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse;
     */
    public function printEmployeeDocuments(Request $request, $employeeId)
    {
        try {
            $employee = Employee::findOrFail($employeeId);

            // Check if user has permission to view employee documents
            if ($request->user()->cannot('view', $employee)) {
                return response()->json([
                    'error' => 'You do not have permission to view this employee\'s documents'
                ], 403);
            }

            // Get all documents for the employee
            $documents = $employee->getMedia('documents');

            if ($documents->isEmpty()) {
                return response()->json([
                    'error' => 'No documents found for this employee'
                ], 404);
            }

            // Prepare document data for summary
            $documentData = $documents->map(function ($document) {
                return [
                    'name' => $document->name,
                    'is_required' => $document->custom_properties['is_required'] ?? false,
                    'human_readable_size' => $this->formatFileSize($document->size),
                    'status' => $document->custom_properties['status'] ?? 'Active'
                ];
            });

            // Generate the summary PDF
            $pdfPath = $this->documentService->generateDocumentSummary($documentData, [
                'employee' => [
                    'name' => $employee->name,
                    'employee_id' => $employee->employee_id
                ],
                'summary' => [
                    'total_documents' => $documents->count(),
                    'required_documents' => $documents->where('custom_properties.is_required', true)->count(),
                    'additional_documents' => $documents->where('custom_properties.is_required', false)->count(),
                    'generated_at' => now()->format('Y-m-d H:i:s')
                ]
            ]);

            if (!$pdfPath) {
                return response()->json([
                    'error' => 'Failed to generate document summary'
                ], 500);
            }

            return response()->download($pdfPath, 'employee_documents_summary.pdf', [
                'Content-Type' => 'application/pdf',
            ])->deleteFileAfterSend(true);
        } catch (\Exception $e) {
            Log::error('Error generating employee document summary', [
                'employee_id' => $employeeId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Failed to generate document summary: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Format file size to human readable format
     *
     * @param int $bytes
     * @return string;
     */
    private function formatFileSize($bytes)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);
        return round($bytes, 2) . ' ' . $units[$pow];
    }

    /**
     * Download all documents for an employee
     *
     * @param Request $request
     * @param int $employeeId
     * @return \Illuminate\Http\JsonResponse;
     */
    public function downloadAllEmployeeDocuments(Request $request, $employeeId)
    {
        try {
            Log::info('Starting bulk document download', [
                'employee_id' => $employeeId,
                'user_id' => auth()->id()
            ]);

            $employee = Employee::findOrFail($employeeId);

            // Check if user has permission to view employee documents
            if ($request->user()->cannot('view', $employee)) {
                Log::warning('Unauthorized access attempt to employee documents', [
                    'employee_id' => $employeeId,
                    'user_id' => auth()->id()
                ]);
                return response()->json([
                    'error' => 'You do not have permission to view this employee\'s documents'
                ], 403);
            }

            // Get all documents for the employee
            $documents = $employee->getMedia('documents');

            if ($documents->isEmpty()) {
                Log::info('No documents found for employee', [
                    'employee_id' => $employeeId
                ]);
                return response()->json([
                    'error' => 'No documents found for this employee'
                ], 404);
            }

            // Create a temporary directory for the zip file
            $tempDir = storage_path('app/temp/' . Str::random(16));
            if (!is_dir($tempDir)) {
                mkdir($tempDir, 0755, true);
            }

            // Create a zip file
            $zipFile = $tempDir . '/documents.zip';
            $zip = new \ZipArchive();

            if ($zip->open($zipFile, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) !== true) {
                throw new \Exception('Could not create zip file');
            }

            // Add each document to the zip file
            foreach ($documents as $document) {
                $filePath = $document ? $document->getPath() : null;
                if ($filePath && file_exists($filePath)) {
                    $zip->addFile($filePath, $document->file_name);
                }
            }

            $zip->close();

            Log::info('Successfully created zip file', [
                'employee_id' => $employeeId,
                'document_count' => $documents->count(),
                'zip_file' => $zipFile
            ]);

            // Generate a temporary URL for the zip file
            $downloadUrl = route('api.employee.documents.download-all', ['employee' => $employeeId]);
            $redirectUrl = route('dashboard');

            return response()->json([
                'success' => true,
                'download_url' => $downloadUrl,
                'redirect_url' => $redirectUrl,
                'message' => 'Documents are ready for download'
            ]);
        } catch (\Exception $e) {
            Log::error('Error downloading employee documents', [
                'employee_id' => $employeeId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => auth()->id()
            ]);

            return response()->json([
                'error' => 'Failed to download documents: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Copy Istimara document for equipment
     *
     * @param Request $request
     * @param Equipment $equipment
     * @return \Illuminate\Http\JsonResponse;
     */
    public function copyIstimara(Request $request, Equipment $equipment)
    {
        try {
            // Check if user has permission
            if ($request->user()->cannot('uploadDocuments', $equipment)) {
                return response()->json([
                    'success' => false,
                    'message' => 'You do not have permission to copy Istimara for this equipment',
                ], 403);
            }

            // Find the original Istimara document
            $originalIstimara = $equipment->documents()
                ->where('name', 'like', '%istimara%')
                ->latest()
                ->first();

            if (!$originalIstimara) {
                return response()->json([
                    'success' => false,
                    'message' => 'No Istimara document found for this equipment',
                ], 404);
            }

            // Generate a new name for the copy
            $newName = 'Istimara_Copy_' . date('Y-m-d_H-i-s') . '.pdf';

            // Copy the file
            $newPath = $this->documentService->copyDocument($originalIstimara, $newName);

            // Create a new document record
            $newDocument = Document::create([
                'name' => $newName,
                'file_path' => $newPath,
                'file_type' => $originalIstimara->file_type,
                'file_size' => $originalIstimara->file_size,
                'documentable_type' => get_class($equipment),
                'documentable_id' => $equipment->id,
                'uploaded_by' => auth()->id(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Istimara copied successfully',
                'document' => $newDocument,
            ]);

        } catch (\Exception $e) {
            Log::error('Error copying Istimara', [
                'equipment_id' => $equipment->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error copying Istimara: ' . $e->getMessage(),
            ], 500);
        }
    }
}





