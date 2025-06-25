<?php

namespace Modules\EquipmentManagement\Services;

use Modules\Core\Services\BaseService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Modules\EquipmentManagement\Domain\Models\Equipment;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Facades\Image;
use Modules\EquipmentManagement\Models\EquipmentMedia;

class EquipmentMediaService extends BaseService
{
    private EquipmentMediaTypeService $mediaTypeService;

    /**
     * Allowed image mime types
     */
    protected array $allowedImageTypes = [
        'image/jpeg',
        'image/png',
        'image/webp'
    ];

    /**
     * Allowed document mime types
     */
    protected array $allowedDocumentTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    /**
     * Image optimization settings
     */
    protected array $imageSettings = [
        'thumbnail' => [
            'width' => 200,
            'height' => 200,
            'quality' => 80
        ],
        'medium' => [
            'width' => 800,
            'height' => 800,
            'quality' => 85
        ],
        'large' => [
            'width' => 1600,
            'height' => 1600,
            'quality' => 90
        ]
    ];

    public function __construct(EquipmentMediaTypeService $mediaTypeService)
    {
        $this->mediaTypeService = $mediaTypeService;
    }

    /**
     * Upload media for equipment
     */
    public function uploadMedia(Equipment $equipment, string $mediaType, array $metadata, UploadedFile $file): Media
    {
        try {
            DB::beginTransaction();

            // Process and validate the media based on its type
            $processedMetadata = match($mediaType) {
                'equipment_image' => $this->mediaTypeService->processEquipmentImage($file, $metadata),
                'manual' => $this->mediaTypeService->processManual($file, $metadata),
                'specification' => $this->mediaTypeService->processSpecification($file, $metadata),
                'certification' => $this->mediaTypeService->processCertification($file, $metadata),
                default => throw new \InvalidArgumentException('Invalid media type')
            };

            // Add additional metadata
            $customProperties = array_merge($processedMetadata, [
                'uploaded_by' => auth()->id(),
                'uploaded_at' => now()->toDateTimeString(),
            ]);

            // Add the media to the equipment's collection
            $media = $equipment->addMedia($file)
                ->withCustomProperties($customProperties)
                ->toMediaCollection($mediaType);

            // If this is a primary image and is_featured is true, unset other featured images
            if ($mediaType === 'equipment_image' && 
                ($metadata['image_type'] === 'primary' && ($metadata['is_featured'] ?? false))) {
                $this->unsetOtherFeaturedImages($equipment, $media->id);
            }

            DB::commit();
            return $media;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to upload equipment media: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Upload equipment image
     */
    public function uploadImage(Equipment $equipment, array $metadata, UploadedFile $file): Media
    {
        return $this->uploadMedia($equipment, 'equipment_image', $metadata, $file);
    }

    /**
     * Upload equipment manual
     */
    public function uploadManual(Equipment $equipment, array $metadata, UploadedFile $file): Media
    {
        return $this->uploadMedia($equipment, 'manual', $metadata, $file);
    }

    /**
     * Upload equipment specification
     */
    public function uploadSpecification(Equipment $equipment, array $metadata, UploadedFile $file): Media
    {
        return $this->uploadMedia($equipment, 'specification', $metadata, $file);
    }

    /**
     * Upload equipment certification
     */
    public function uploadCertification(Equipment $equipment, array $metadata, UploadedFile $file): Media
    {
        return $this->uploadMedia($equipment, 'certification', $metadata, $file);
    }

    /**
     * Get all media for equipment
     */
    public function getEquipmentMedia(Equipment $equipment, ?string $mediaType = null): Collection
    {
        if ($mediaType) {
            return $equipment->getMedia($mediaType);
        }
        
        return collect([
            'images' => $equipment->getMedia('equipment_image'),
            'manuals' => $equipment->getMedia('manual'),
            'specifications' => $equipment->getMedia('specification'),
            'certifications' => $equipment->getMedia('certification'),
        ]);
    }

    /**
     * Delete media
     */
    public function deleteMedia(Media $media): bool
    {
        try {
            DB::beginTransaction();
            $deleted = $media->delete();
            DB::commit();
            return $deleted;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to delete equipment media: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Update media metadata
     */
    public function updateMediaMetadata(Media $media, array $metadata): Media
    {
        try {
            DB::beginTransaction();

            // Validate the metadata based on media type
            $this->mediaTypeService->validateMedia(
                $media->collection_name,
                new UploadedFile($media->getPath(), $media->file_name),
                $metadata
            );

            // Update custom properties
            $customProperties = array_merge(
                $media->custom_properties,
                $metadata,
                [
                    'updated_by' => auth()->id(),
                    'updated_at' => now()->toDateTimeString(),
                ]
            );

            $media->custom_properties = $customProperties;
            $media->save();

            // If this is a primary image and is_featured is true, unset other featured images
            if ($media->collection_name === 'equipment_image' && 
                ($metadata['image_type'] === 'primary' && ($metadata['is_featured'] ?? false))) {
                $this->unsetOtherFeaturedImages($media->model, $media->id);
            }

            DB::commit();
            return $media;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to update media metadata: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get featured image for equipment
     */
    public function getFeaturedImage(Equipment $equipment): ?Media
    {
        return $equipment->getMedia('equipment_image')
            ->first(function ($media) {
                return $media->custom_properties['is_featured'] ?? false;
            });
    }

    /**
     * Unset featured flag from all other images
     */
    protected function unsetOtherFeaturedImages(Equipment $equipment, int $exceptMediaId): void
    {
        $equipment->getMedia('equipment_image')
            ->filter(function ($media) use ($exceptMediaId) {
                return $media->id !== $exceptMediaId && 
                    ($media->custom_properties['is_featured'] ?? false);
            })
            ->each(function ($media) {
                $customProperties = $media->custom_properties;
                $customProperties['is_featured'] = false;
                $media->custom_properties = $customProperties;
                $media->save();
            });
    }

    /**
     * Get validation rules for a media type
     */
    public function getValidationRules(string $mediaType): array
    {
        return $this->mediaTypeService->getValidationRules($mediaType);
    }

    /**
     * Store media file for equipment
     */
    public function store(Equipment $equipment, UploadedFile $file, array $data = []): EquipmentMedia
    {
        $this->validateFile($file);

        $isImage = $this->isImage($file);
        $mediaType = $isImage ? 'image' : 'document';
        
        // Generate unique filename
        $filename = $this->generateFilename($file);
        $path = "equipment/{$equipment->id}/media/{$mediaType}/{$filename}";

        if ($isImage) {
            $paths = $this->handleImageUpload($file, $equipment->id, $filename);
            $mainPath = $paths['large'];
            $data['variants'] = $paths;
        } else {
            Storage::put($path, file_get_contents($file));
            $mainPath = $path;
        }

        return $equipment->media()->create([
            'type' => $mediaType,
            'file_path' => $mainPath,
            'file_name' => $filename,
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'title' => $data['title'] ?? null,
            'description' => $data['description'] ?? null,
            'metadata' => array_merge(
                $data['metadata'] ?? [],
                ['variants' => $paths ?? null]
            )
        ]);
    }

    /**
     * Store multiple media files for equipment
     */
    public function storeBatch(Equipment $equipment, array $files, array $data = []): array
    {
        $results = [];

        foreach ($files as $index => $file) {
            try {
                $fileData = $data[$index] ?? [];
                $results[] = [
                    'success' => true,
                    'media' => $this->store($equipment, $file, $fileData)
                ];
            } catch (\Exception $e) {
                $results[] = [
                    'success' => false,
                    'error' => $e->getMessage(),
                    'file' => $file->getClientOriginalName()
                ];
            }
        }

        return $results;
    }

    /**
     * Update media metadata
     */
    public function update(EquipmentMedia $media, array $data): EquipmentMedia
    {
        $media->update([
            'title' => $data['title'] ?? $media->title,
            'description' => $data['description'] ?? $media->description,
            'metadata' => array_merge(
                $media->metadata ?? [],
                $data['metadata'] ?? []
            )
        ]);

        return $media->fresh();
    }

    /**
     * Delete media and its files
     */
    public function delete(EquipmentMedia $media): bool
    {
        if ($media->type === 'image' && isset($media->metadata['variants'])) {
            foreach ($media->metadata['variants'] as $path) {
                Storage::delete($path);
            }
        } else {
            Storage::delete($media->file_path);
        }

        return $media->delete();
    }

    /**
     * Handle image upload with optimization
     */
    protected function handleImageUpload(UploadedFile $file, int $equipmentId, string $filename): array
    {
        $paths = [];
        $baseDir = "equipment/{$equipmentId}/media/image";

        foreach ($this->imageSettings as $size => $settings) {
            $path = "{$baseDir}/{$size}_{$filename}";
            
            $image = Image::make($file)
                ->resize($settings['width'], $settings['height'], function ($constraint) {
                    $constraint->aspectRatio();
                    $constraint->upsize();
                })
                ->encode(null, $settings['quality']);

            Storage::put($path, $image->stream());
            $paths[$size] = $path;
        }

        return $paths;
    }

    /**
     * Generate unique filename
     */
    protected function generateFilename(UploadedFile $file): string
    {
        $extension = $file->getClientOriginalExtension();
        return Str::uuid() . '.' . $extension;
    }

    /**
     * Validate uploaded file
     */
    protected function validateFile(UploadedFile $file): void
    {
        $mimeType = $file->getMimeType();
        $allowedTypes = array_merge($this->allowedImageTypes, $this->allowedDocumentTypes);

        if (!in_array($mimeType, $allowedTypes)) {
            throw new \InvalidArgumentException('Invalid file type. Allowed types: ' . implode(', ', $allowedTypes));
        }

        // 50MB limit
        if ($file->getSize() > 50 * 1024 * 1024) {
            throw new \InvalidArgumentException('File size exceeds maximum limit of 50MB');
        }
    }

    /**
     * Check if file is an image
     */
    protected function isImage(UploadedFile $file): bool
    {
        return in_array($file->getMimeType(), $this->allowedImageTypes);
    }

    /**
     * Get media variants URLs
     */
    public function getMediaUrls(EquipmentMedia $media): array
    {
        if ($media->type !== 'image') {
            return [
                'url' => Storage::url($media->file_path)
            ];
        }

        $urls = [];
        foreach ($media->metadata['variants'] as $size => $path) {
            $urls[$size] = Storage::url($path);
        }

        return $urls;
    }

    /**
     * Reorder media items
     */
    public function reorder(Equipment $equipment, array $mediaIds): void
    {
        foreach ($mediaIds as $order => $id) {
            $equipment->media()->where('id', $id)->update(['order' => $order]);
        }
    }

    /**
     * Get media by type
     */
    public function getByType(Equipment $equipment, string $type): array
    {
        return $equipment->media()
            ->where('type', $type)
            ->orderBy('order')
            ->get()
            ->map(function ($media) {
                $media->urls = $this->getMediaUrls($media);
                return $media;
            })
            ->toArray();
    }
} 