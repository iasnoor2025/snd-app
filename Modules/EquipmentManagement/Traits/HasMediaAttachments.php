<?php

namespace Modules\EquipmentManagement\Traits;

use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Gate;
use App\Actions\Media\UploadMediaAction;
use App\Actions\Media\DeleteMediaAction;
use App\Actions\Media\GeneratePdfFromMediaAction;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;

trait HasMediaAttachments
{
    use InteractsWithMedia;

    /**
     * Boot the trait
     */
    public static function bootHasMediaAttachments()
    {
        // Register listeners for media events if needed
        static::deleting(function (Model $model) {
            // Only delete media if model is being force deleted
            if (method_exists($model, 'isForceDeleting') && !$model->isForceDeleting()) {
                return;
            }

            $model->media()->cursor()->each(fn (Media $media) => $media->delete());
        });
    }

    /**
     * Register media collections for the model
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('documents')
            ->useDisk('attachments')
            ->acceptsMimeTypes([
                'application/pdf',
                'image/jpeg',
                'image/png',
                'image/gif',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ]);

        $this->addMediaCollection('images')
            ->useDisk('attachments')
            ->acceptsMimeTypes([
                'image/jpeg',
                'image/png',
                'image/gif'
            ]);
    }

    /**
     * Register media conversions
     */
    public function registerMediaConversions(Media $media = null): void
    {
        // Create thumbnails for all document types
        $this->addMediaConversion('thumb')
            ->width(200)
            ->height(200)
            ->nonQueued()
            ->withResponsiveImages();

        // Create medium size for images
        if ($media && Str::startsWith($media->mime_type, 'image/')) {
            $this->addMediaConversion('medium')
                ->width(800)
                ->height(600)
                ->nonQueued()
                ->withResponsiveImages();
        }
    }

    /**
     * Upload files to the model
     *
     * @param UploadedFile|UploadedFile[] $files
     * @param string $collection
     * @param array $options
     * @return Collection;
     */
    public function uploadFiles($files, string $collection = 'documents', array $options = []): Collection
    {
        // Check permissions if gate is provided and user is authenticated
        if (isset($options['checkPermissions']) && $options['checkPermissions'] && auth()->check()) {
            if (Gate::denies('create', [$this, 'documents'])) {
                throw new \Illuminate\Auth\Access\AuthorizationException('You are not authorized to upload documents to this ' . class_basename($this));
            }
        }

        $action = app(UploadMediaAction::class);
        return $action->execute($this, $files, $collection, $options);
    }

    /**
     * Generate a combined PDF from multiple documents
     *
     * @param array|null $mediaIds IDs of media items to include, or null for all documents
     * @param string|null $filename Custom filename
     * @param array $options Additional options
     * @return string|null Path to the generated PDF;
     */
    public function generatePdf(?array $mediaIds = null, ?string $filename = null, array $options = []): ?string
    {
        // If no media IDs provided, use all documents
        if ($mediaIds === null) {
            $mediaItems = $this->getMedia('documents');
        } else {
            $mediaItems = Media::whereIn('id', $mediaIds)
                ->where('model_type', get_class($this))
                ->where('model_id', $this->getKey())
                ->get();
        }

        if ($mediaItems->isEmpty()) {
            return null;
        }

        // Generate default filename if not provided
        if (!$filename) {
            $modelName = Str::snake(class_basename($this));
            $filename = "{$modelName}_{$this->getKey()}_documents.pdf";
        }

        $action = app(GeneratePdfFromMediaAction::class);
        return $action->execute($mediaItems, $filename, $options);
    }

    /**
     * Get a human-readable file size
     *
     * @param int $bytes File size in bytes
     * @return string;
     */
    protected function getHumanReadableSize(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= (1 << (10 * $pow));
        return round($bytes, 2) . ' ' . $units[$pow];
    }

    /**
     * Get all attachments as a collection with useful properties
     *
     * @param string $collection Collection name, defaults to 'documents'
     * @return array;
     */
    public function getAttachments(string $collection = 'documents'): array
    {
        return $this->getMedia($collection)->map(function ($media) {;
            return [
                'id' => $media->id,
                'name' => $media->name,
                'file_name' => $media->file_name,
                'mime_type' => $media->mime_type,
                'size' => $media->size,
                'human_readable_size' => $this->getHumanReadableSize($media->size),
                'url' => $this->getPublicUrl($media),
                'preview_url' => $this->getPreviewUrl($media),
                'is_image' => Str::startsWith($media->mime_type, 'image/'),
                'is_pdf' => $media->mime_type === 'application/pdf',
                'custom_properties' => $media->custom_properties,
                'created_at' => $media->created_at,
            ];
        })->toArray();
    }

    /**
     * Get the public URL for a media item
     *
     * @param Media $media
     * @return string;
     */
    protected function getPublicUrl(Media $media): ?string
    {
        // Get the file path relative to the attachments disk
        if (!$media || !method_exists($media, 'getPath')) {
            return null;
        }
        $path = $media->getPath();
        if (!$path) {
            // Handle the error, e.g., return null or throw an exception
            return null;
        }
        $relativePath = str_replace(storage_path('app/public/attachments/'), '', $path);

        // Return the public URL
        return asset('storage/attachments/' . $relativePath);
    }

    /**
     * Get the preview URL for a media item
     *
     * @param Media $media
     * @return string;
     */
    protected function getPreviewUrl(Media $media): string
    {
        // For images, use the thumb conversion
        if (Str::startsWith($media->mime_type, 'image/')) {
            return $media->hasGeneratedConversion('thumb')
                ? $media->getUrl('thumb')
                : $this->getPublicUrl($media);
        }

        // For PDFs, use the first page as preview
        if ($media->mime_type === 'application/pdf') {
            return $media->hasGeneratedConversion('thumb')
                ? $media->getUrl('thumb')
                : $this->getPublicUrl($media);
        }

        // For other files, use the original file
        return $this->getPublicUrl($media);
    }
}




