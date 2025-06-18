<?php

namespace Modules\EquipmentManagement\Traits;

use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Illuminate\Support\Facades\Log;

trait HandlesDocumentUploads
{
    /**
     * Upload documents from a request to a model
     *
     * @param \Illuminate\Http\Request $request
     * @param \Spatie\MediaLibrary\HasMedia $model
     * @param string $collection
     * @return array
     */
    protected function uploadDocuments(Request $request, HasMedia $model, string $collection = 'documents'): array
    {
        $uploadedDocuments = [];

        try {
            if ($request->hasFile('documents')) {
                $documents = $request->file('documents');
                $documentNames = $request->input('document_names', []);

                foreach ($documents as $index => $file) {
                    // Generate document name - use provided name or original filename
                    $documentName = $documentNames[$index] ?? $file->getClientOriginalName();

                    // Add the media to the model
                    $media = $model->addMedia($file)
                        ->usingName($documentName)
                        ->toMediaCollection($collection);

                    $uploadedDocuments[] = $media;
                }
            }

            return $uploadedDocuments;
        } catch (\Exception $e) {
            Log::error('Document upload failed', [
                'model_type' => get_class($model),
                'model_id' => $model->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return $uploadedDocuments;
        }
    }

    /**
     * Delete a document from a model
     *
     * @param \Spatie\MediaLibrary\HasMedia $model
     * @param int $mediaId
     * @return bool
     */
    protected function deleteDocument(HasMedia $model, int $mediaId): bool
    {
        try {
            $media = $model->getMedia()->where('id', $mediaId)->first();

            if ($media) {
                $media->delete();
                return true;
            }

            return false;
        } catch (\Exception $e) {
            Log::error('Document deletion failed', [
                'model_type' => get_class($model),
                'model_id' => $model->id,
                'media_id' => $mediaId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return false;
        }
    }

    /**
     * Rename a document
     *
     * @param \Spatie\MediaLibrary\HasMedia $model
     * @param int $mediaId
     * @param string $newName
     * @return bool
     */
    protected function renameDocument(HasMedia $model, int $mediaId, string $newName): bool
    {
        try {
            $media = $model->getMedia()->where('id', $mediaId)->first();

            if ($media) {
                $media->name = $newName;
                $media->save();
                return true;
            }

            return false;
        } catch (\Exception $e) {
            Log::error('Document rename failed', [
                'model_type' => get_class($model),
                'model_id' => $model->id,
                'media_id' => $mediaId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return false;
        }
    }
}


