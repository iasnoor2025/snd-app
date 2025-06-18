<?php
namespace Modules\Core\Services;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Exception;

class DocumentService
{
    /**
     * Upload documents to a model
     *
     * @param Model $model The model to attach documents to
     * @param array|UploadedFile $files Files to upload
     * @param string $collection Collection name for the files
     * @param array $options Additional options
     * @return mixed The media models
     */
    public function uploadDocuments(Model $model, $files, string $collection = 'default', array $options = [])
    {
        try {
            $result = [];

            // Convert single file to array
            if (!is_array($files)) {
                $files = [$files];
            }

            // Process each file
            foreach ($files as $index => $file) {
                $name = $options['names'][$index] ?? $file->getClientOriginalName();
                $disk = $options['disk'] ?? 'public';

                $path = $file->store("documents/{$model->getTable()}/{$model->id}/{$collection}", $disk);

                // If the model uses Laravel Media Library
                if (method_exists($model, 'addMedia')) {
                    $media = $model->addMedia(Storage::path($path))
                        ->usingName($name)
                        ->usingFileName(basename($path))
                        ->withCustomProperties($options['properties'] ?? [])
                        ->toMediaCollection($collection);

                    $result[] = $media;
                } else {
                    // Simple attachment logic if Media Library not available
                    $attachment = [
                        'path' => $path,
                        'name' => $name,
                        'mime_type' => $file->getMimeType(),
                        'size' => $file->getSize(),
                        'disk' => $disk,
                        'collection' => $collection
                    ];

                    $result[] = $attachment;
                }
            }

            return $result;
        } catch (Exception $e) {
            Log::error('Failed to upload documents', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'model' => get_class($model),
                'model_id' => $model->id,
            ]);

            throw $e;
        }
    }

    /**
     * Upload a document for an employee
     *
     * @param mixed $employee Employee model
     * @param UploadedFile $file File to upload
     * @param string $documentType Document type
     * @param array $options Additional options
     * @return mixed Media model
     */
    public function uploadEmployeeDocument($employee, UploadedFile $file, string $documentType, array $options = [])
    {
        $options['properties'] = array_merge($options['properties'] ?? [], [
            'document_type' => $documentType
        ]);

        $collection = 'employee_documents';

        return $this->uploadDocuments($employee, $file, $collection, $options)[0] ?? null;
    }

    /**
     * Delete a document
     *
     * @param Model $model Model that owns the document
     * @param int $mediaId ID of the media to delete
     * @return bool Success
     */
    public function deleteDocument(Model $model, int $mediaId): bool
    {
        try {
            // If the model uses Laravel Media Library
            if (method_exists($model, 'media')) {
                $media = $model->media()->findOrFail($mediaId);
                return $media->delete();
            }

            return false;
        } catch (Exception $e) {
            Log::error('Failed to delete document', [
                'error' => $e->getMessage(),
                'model' => get_class($model),
                'model_id' => $model->id,
                'media_id' => $mediaId,
            ]);

            return false;
        }
    }

    /**
     * Generate a PDF from documents
     *
     * @param array $documents Documents data
     * @param string $filename Output filename
     * @param array $options Options for the PDF
     * @return string Path to generated PDF
     */
    public function generatePdf(array $documents, string $filename, array $options = []): string
    {
        // In a real implementation, you'd use a PDF library like TCPDF, FPDF, or DomPDF
        // For now, just create a placeholder file
        $path = storage_path('app/public/generated/' . Str::slug(pathinfo($filename, PATHINFO_FILENAME)) . '.pdf');

        // Ensure directory exists
        if (!File::exists(dirname($path))) {
            File::makeDirectory(dirname($path), 0755, true);
        }

        // Write a dummy PDF file
        File::put($path, "This is a placeholder for a PDF document that would contain: " . json_encode($documents));

        return $path;
    }

    /**
     * Generate a combined PDF from selected documents
     *
     * @param Model $model Model that owns the documents
     * @param array $mediaIds IDs of media to combine
     * @param array $options Options for the PDF
     * @return string Path to generated PDF
     */
    public function generateCombinedPdf(Model $model, array $mediaIds, array $options = []): string
    {
        try {
            // Placeholder implementation
            $filename = get_class($model) . '_' . $model->id . '_combined.pdf';
            $path = storage_path('app/public/combined/' . Str::slug(pathinfo($filename, PATHINFO_FILENAME)) . '.pdf');

            // Ensure directory exists
            if (!File::exists(dirname($path))) {
                File::makeDirectory(dirname($path), 0755, true);
            }

            // Write a dummy PDF file
            File::put($path, "This is a placeholder for a combined PDF document for {$model->id} with media IDs: " . implode(', ', $mediaIds));

            return $path;
        } catch (Exception $e) {
            Log::error('Failed to generate combined PDF', [
                'error' => $e->getMessage(),
                'model' => get_class($model),
                'model_id' => $model->id,
                'media_ids' => $mediaIds,
            ]);

            throw $e;
        }
    }

    /**
     * Generate a document summary
     *
     * @param array $documentData Document data
     * @param array $options Options for the summary
     * @return string Path to generated PDF
     */
    public function generateDocumentSummary(array $documentData, array $options = []): string
    {
        $filename = $options['filename'] ?? 'document_summary.pdf';
        return $this->generatePdf($documentData, $filename, $options);
    }

    /**
     * Copy a document to a new location with a new name
     *
     * @param mixed $originalDocument Original document (could be a Media model or path)
     * @param string $newName New name for the document
     * @return string Path to the new document
     */
    public function copyDocument($originalDocument, string $newName): string
    {
        try {
            // Get the source path
            $sourcePath = is_string($originalDocument) ? $originalDocument : ($originalDocument ? $originalDocument->getPath() : null);
            if (!$sourcePath) {
                throw new \Exception('Original document not found or invalid');
            }

            // Generate the destination path
            $extension = pathinfo($sourcePath, PATHINFO_EXTENSION);
            $destinationPath = storage_path('app/public/copies/' . Str::slug($newName) . '.' . $extension);

            // Ensure directory exists
            if (!File::exists(dirname($destinationPath))) {
                File::makeDirectory(dirname($destinationPath), 0755, true);
            }

            // Copy the file
            File::copy($sourcePath, $destinationPath);

            return $destinationPath;
        } catch (Exception $e) {
            Log::error('Failed to copy document', [
                'error' => $e->getMessage(),
                'original' => is_string($originalDocument) ? $originalDocument : $originalDocument->id,
                'new_name' => $newName,
            ]);

            throw $e;
        }
    }

    /**
     * Get formatted documents for a model
     *
     * @param Model $model Model that owns the documents
     * @param string $collection Collection name
     * @return array Formatted document data
     */
    public function getFormattedDocuments(Model $model, string $collection = 'default'): array
    {
        try {
            // If the model uses Laravel Media Library
            if (method_exists($model, 'media')) {
                return $model->media()
                    ->where('collection_name', $collection)
                    ->get()
                    ->map(function ($media) {
                        return [
                            'id' => $media->id,
                            'name' => $media->name,
                            'file_name' => $media->file_name,
                            'mime_type' => $media->mime_type,
                            'size' => $media->size,
                            'url' => $media->getUrl(),
                            'created_at' => $media->created_at,
                            'properties' => $media->custom_properties,
                        ];
                    })
                    ->toArray();
            }

            return [];
        } catch (Exception $e) {
            Log::error('Failed to get formatted documents', [
                'error' => $e->getMessage(),
                'model' => get_class($model),
                'model_id' => $model->id,
                'collection' => $collection,
            ]);

            return [];
        }
    }
}
