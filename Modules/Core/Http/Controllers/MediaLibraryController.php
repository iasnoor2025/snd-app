<?php
namespace Modules\Core\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Validator;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Illuminate\Support\Str;
use App\Actions\Media\UploadMediaAction;
use App\Actions\Media\DeleteMediaAction;
use App\Actions\Media\GeneratePdfFromMediaAction;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class MediaLibraryController extends Controller
{
    /**
     * Get media items for a specific model
     *
     * @param Request $request
     * @param string $model
     * @param int $modelId
     *
     * @return \Illuminate\Http\JsonResponse;
     */
    public function index(Request $request, string $model, int $modelId)
    {
        try {
            \Log::info('MediaLibrary Request', [
                'model' => $model,
                'modelId' => $modelId,
                'collection' => $request->get('collection'),
                'user' => $request->user() ? $request->user()->id : 'unauthenticated'
            ]);

            // Check authentication
            if (!$request->user()) {
                return response()->json([
                    'message' => 'Unauthenticated.',
                    'code' => 'UNAUTHENTICATED'
                ], 401);
            }

            // Get the model class
            $modelClass = $this->getModelClass($model);
            if (!$modelClass) {
                \Log::error('Invalid model class', ['modelClass' => $modelClass]);
                return response()->json([
                    'message' => 'Invalid model type',
                    'code' => 'INVALID_MODEL'
                ], 400);
            }

            // Get the model instance
            $modelInstance = $modelClass::find($modelId);
            if (!$modelInstance) {
                \Log::warning('Model not found', ['model' => $model, 'id' => $modelId]);
                return response()->json([
                    'message' => 'Model not found',
                    'code' => 'MODEL_NOT_FOUND'
                ], 404);
            }

            // Check if model implements HasMedia
            if (!($modelInstance instanceof \Spatie\MediaLibrary\HasMedia)) {
                \Log::error('Model does not implement HasMedia', ['model' => get_class($modelInstance)]);
                return response()->json([
                    'message' => 'Model does not support media attachments',
                    'code' => 'INVALID_MODEL_TYPE'
                ], 400);
            }

            // Check if user has permission to view documents
            if (!$request->user()->can('view', $modelInstance)) {
                \Log::warning('Permission denied', [
                    'user' => $request->user()->id,
                    'model' => get_class($modelInstance),
                    'modelId' => $modelId
                ]);
                return response()->json([
                    'message' => 'You do not have permission to view documents for this record',
                    'code' => 'PERMISSION_DENIED'
                ], 403);
            }

            // Get the collection name from the request
            $collection = $request->get('collection', 'documents');
            \Log::info('Fetching media for collection', ['collection' => $collection]);

            // Get all media items for the specified collection
            $mediaItems = $modelInstance->getMedia($collection);
            \Log::info('Media items found', ['count' => $mediaItems->count()]);

            // Transform the media items to include the full URL
            $mediaItems = $mediaItems->map(function ($media) {
                \Log::info('Processing media item', [
                    'id' => $media->id,
                    'name' => $media->name,
                    'collection_name' => $media->collection_name,
                    'model_type' => $media->model_type,
                    'model_id' => $media->model_id
                ]);

                return [
                    'id' => $media->id,
                    'name' => $media->name,
                    'file_name' => $media->file_name,
                    'mime_type' => $media->mime_type,
                    'size' => $media->size,
                    'created_at' => $media->created_at?->format('Y-m-d H:i:s'),
                    'url' => $media->getFullUrl(),
                    'preview_url' => $media->hasGeneratedConversion('thumb') ? $media->getUrl('thumb') : null,
                    'collection_name' => $media->collection_name,
                    'original_url' => $media->getUrl(),
                ];
            });

            return response()->json([
                'data' => $mediaItems,
                'success' => true
            ]);
        } catch (\Exception $e) {
            \Log::error('MediaLibrary Error: ' . $e->getMessage(), [
                'model' => $model ?? 'unknown',
                'modelId' => $modelId ?? 'unknown',
                'collection' => $request->get('collection', 'unknown'),
                'trace' => $e->getTraceAsString(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);

            return response()->json([
                'message' => 'An error occurred while fetching media items',
                'code' => 'SERVER_ERROR',
                'debug' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Upload files to a model's media collection
     *
     * @param Request $request
     * @param UploadMediaAction $uploadMediaAction
     *
     * @return \Illuminate\Http\JsonResponse;
     */
    public function upload(Request $request, UploadMediaAction $uploadMediaAction)
    {
        // Validate request
        $validator = Validator::make($request->all(), [
            'model' => 'required|string',
            'model_id' => 'required|integer',
            'collection' => 'nullable|string',
            'files' => 'required|array',
            'files.*' => 'required|file|max:10240', // 10MB max per file
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 422);
        }

        // Validate model exists
        $model = $this->getModelClass($request->model);

        if (!$model) {
            return response()->json(['error' => 'Invalid model type'], 400);
        }

        $modelInstance = $model::find($request->model_id);

        if (!$modelInstance) {
            return response()->json(['error' => 'Model not found'], 404);
        }

        // Check permissions for uploading documents
        if (Gate::denies('create', [$modelInstance, 'documents'])) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $collection = $request->input('collection', 'default');

        try {
            // Use the action to upload files
            $uploadedMedia = $uploadMediaAction->execute(
                $modelInstance,
                $request->file('files'),
                $collection,
                [
                    'custom_properties' => $request->input('custom_properties', []),
                    'create_medium' => $request->input('create_medium', false)
                ]
            );

            return response()->json([
                'success' => true,
                'message' => $uploadedMedia->count() . ' file(s) uploaded successfully',
                'data' => $uploadedMedia->map(function ($media) {
                    return [
                        'id' => $media->id,
                        'file_name' => $media->file_name,
                        'mime_type' => $media->mime_type,
                        'size' => $media->size,
                        'original_url' => $media->getUrl(),
                        'preview_url' => $media->hasGeneratedConversion('thumb') ? $media->getUrl('thumb') : null,
                        'created_at' => $media->created_at?->format('Y-m-d H:i:s')->toDateTimeString(),
                    ];
                }),
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to upload file: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Delete a media item
     *
     * @param int $id
     * @param DeleteMediaAction $deleteMediaAction
     *
     * @return \Illuminate\Http\JsonResponse;
     */
    public function destroy(int $id, DeleteMediaAction $deleteMediaAction)
    {
        // Ensure ID is numeric
        if (!is_numeric($id)) {
            abort(404, 'Invalid ID provided');
        }
        // Ensure ID is numeric
        if (!is_numeric($id)) {
            abort(404, 'Invalid ID provided');
        }
        // Ensure ID is numeric
        if (!is_numeric($id)) {
            abort(404, 'Invalid ID provided');
        }
        // Ensure ID is numeric
        if (!is_numeric($id)) {
            abort(404, 'Invalid ID provided');
        }
        $media = Media::find($id);

        if (!$media) {
            return response()->json(['error' => 'Media not found'], 404);
        }

        // Get the model this media belongs to
        $model = $media->model;

        if (!$model) {
            return response()->json(['error' => 'Associated model not found'], 404);
        }

        // Check permissions for deleting documents
        if (Gate::denies('delete', [$model, 'documents'])) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        try {
            $deleteMediaAction->execute($media);

            return response()->json([
                'success' => true,
                'message' => 'File deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to delete file: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Generate a PDF from one or more media items
     *
     * @param Request $request
     * @param GeneratePdfFromMediaAction $generatePdfAction
     *
     * @return \Illuminate\Http\Response|\Illuminate\Http\JsonResponse;
     */
    public function generatePdf(Request $request, GeneratePdfFromMediaAction $generatePdfAction)
    {
        $validator = Validator::make($request->all(), [
            'media_ids' => 'required|array',
            'media_ids.*' => 'required|integer|exists:media,id',
            'filename' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 422);
        }

        // Get media items and check permissions
        $mediaItems = Media::whereIn('id', $request->media_ids)->get();

        // Group media by model for permission checking
        $mediaByModel = $mediaItems->groupBy(function ($media) {
            return $media->model_type . '-' . $media->model_id;
        });

        // Check permissions for each model
        foreach ($mediaByModel as $modelKey => $items) {
            $firstMedia = $items->first();
            $model = $firstMedia->model;

            if (!$model || Gate::denies('view', [$model, 'documents'])) {
                return response()->json(['error' => 'Unauthorized to access one or more files'], 403);
            }
        }

        // Generate the PDF
        $filename = $request->input('filename', 'combined_' . Str::random(8) . '.pdf');
        $pdfPath = $generatePdfAction->execute($mediaItems, $filename);

        if (!$pdfPath || !file_exists($pdfPath)) {
            return response()->json(['error' => 'Failed to generate PDF'], 500);
        }

        // Return the file as download
        return Response::download($pdfPath, $filename, [
            'Content-Type' => 'application/pdf',
        ])->deleteFileAfterSend(true);
    }

    /**
     * Preview a media item
     *
     * @param int $id
     *
     * @return \Illuminate\Http\Response|\Illuminate\Http\JsonResponse;
     */
    public function preview(int $id)
    {
        // Ensure ID is numeric
        if (!is_numeric($id)) {
            abort(404, 'Invalid ID provided');
        }
        $mediaId = (int) $id;
        $media = Media::find($mediaId);
        if (!$media || !method_exists($media, 'getPath')) {
            \Log::error('Media not found or invalid in MediaLibraryController@preview', [
                'media_id' => $id,
                'media' => $media
            ]);
            return response()->json(['error' => 'Media not found'], 404);
        }
        $model = $media->model;
        if (!$model) {
            return response()->json(['error' => 'Associated model not found'], 404);
        }
        if (Gate::denies('view', [$model, 'documents'])) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        $path = $media->getPath();
        if (!$path || !file_exists($path)) {
            \Log::error('Media file does not exist on disk in MediaLibraryController@preview', [
                'media_id' => $mediaId,
                'path' => $path,
            ]);
            return response()->json(['error' => 'File not found on disk'], 404);
        }
        $disposition = in_array($media->mime_type, ['application/pdf']) ||
                      Str::startsWith($media->mime_type, 'image/') ? 'inline' : 'attachment';
        return Response::make(file_get_contents($path), 200, [
            'Content-Type' => $media->mime_type,
            'Content-Disposition' => $disposition . '; filename="' . $media->file_name . '"',
        ]);
    }

    /**
     * Get the model class from the model name
     *
     * @param string $model
     *
     * @return string|null;
     */
    private function getModelClass(string $model)
    {
        // Try to find the model in the App\Models namespace
        $appModelClass = "App\\Models\\{$model}";
        if (class_exists($appModelClass)) {
            return $appModelClass;
        }

        // Try to find the model in the Modules\*\Domain\Models namespace with 'Management' suffix
        $moduleNameWithManagement = Str::studly($model) . 'Management';
        $moduleModelClassWithManagement = "Modules\\{$moduleNameWithManagement}\\Domain\\Models\\{$model}";
        if (class_exists($moduleModelClassWithManagement)) {
            return $moduleModelClassWithManagement;
        }

        // Try to find the model in the Modules\*\Domain\Models namespace without 'Management' suffix
        $moduleName = Str::studly($model);
        $moduleModelClass = "Modules\\{$moduleName}\\Domain\\Models\\{$model}";
        if (class_exists($moduleModelClass)) {
            return $moduleModelClass;
        }

        // Fallback for models that might be directly under Modules\*\Models with 'Management' suffix
        $fallbackModuleModelClassWithManagement = "Modules\\{$moduleNameWithManagement}\\Models\\{$model}";
        if (class_exists($fallbackModuleModelClassWithManagement)) {
            return $fallbackModuleModelClassWithManagement;
        }

        // Fallback for models that might be directly under Modules\*\Models without 'Management' suffix
        $fallbackModuleModelClass = "Modules\\{$moduleName}\\Models\\{$model}";
        if (class_exists($fallbackModuleModelClass)) {
            return $fallbackModuleModelClass;
        }

        return null;
    }
}




