<?php

namespace Modules\EquipmentManagement\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Modules\Core\Services\BaseService;
use Intervention\Image\Facades\Image;

class EquipmentMediaTypeService
{
    /**
     * Media type validation rules
     */
    private array $mediaRules = [
        'equipment_image' => [
            'file' => 'required|file|mimes:jpg,jpeg,png,webp|max:5120', // 5MB max
            'metadata' => [
                'title' => 'nullable|string|max:255',
                'description' => 'nullable|string|max:1000',
                'image_type' => 'required|string|in:primary,secondary,detail,usage',
                'is_featured' => 'boolean',
                'sort_order' => 'nullable|integer|min:0',
            ],
            'optimization' => [
                'max_width' => 2048,
                'max_height' => 2048,
                'quality' => 80,
                'convert_to' => 'webp',
            ]
        ],
        'manual' => [
            'file' => 'required|file|mimes:pdf|max:10240', // 10MB max
            'metadata' => [
                'title' => 'required|string|max:255',
                'description' => 'nullable|string|max:1000',
                'document_type' => 'required|string|in:user_manual,service_manual,quick_guide',
                'version' => 'required|string|max:50',
                'language' => 'required|string|max:50',
            ]
        ],
        'specification' => [
            'file' => 'required|file|mimes:pdf,doc,docx,xls,xlsx|max:5120',
            'metadata' => [
                'title' => 'required|string|max:255',
                'description' => 'nullable|string|max:1000',
                'document_type' => 'required|string|in:technical_spec,datasheet,compliance_doc',
                'version' => 'required|string|max:50',
                'issue_date' => 'required|date|before:tomorrow',
            ]
        ],
        'certification' => [
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'metadata' => [
                'title' => 'required|string|max:255',
                'description' => 'nullable|string|max:1000',
                'certificate_type' => 'required|string|in:safety,quality,compliance,calibration',
                'issuing_authority' => 'required|string|max:255',
                'issue_date' => 'required|date|before:tomorrow',
                'expiry_date' => 'nullable|date|after:issue_date',
                'certificate_number' => 'required|string|max:100',
            ]
        ]
    ];

    /**
     * Validate media based on its type
     */
    public function validateMedia(string $mediaType, UploadedFile $file, array $metadata): void
    {
        if (!isset($this->mediaRules[$mediaType])) {
            throw ValidationException::withMessages([
                'media_type' => ['Invalid media type']
            ]);
        }

        // Validate file
        Validator::make(['file' => $file], [
            'file' => $this->mediaRules[$mediaType]['file']
        ])->validate();

        // Validate metadata
        Validator::make($metadata, $this->mediaRules[$mediaType]['metadata'])->validate();
    }

    /**
     * Process Equipment Image
     */
    public function processEquipmentImage(UploadedFile $file, array $metadata): array
    {
        $this->validateMedia('equipment_image', $file, $metadata);

        // Create optimized version if it's an image
        if ($file->getMimeType() && str_starts_with($file->getMimeType(), 'image/')) {
            $optimizedImage = $this->optimizeImage($file);
            if ($optimizedImage) {
                $file = $optimizedImage;
            }
        }

        return array_merge($metadata, [
            'media_type' => 'equipment_image',
            'status' => 'active',
        ]);
    }

    /**
     * Process Manual document
     */
    public function processManual(UploadedFile $file, array $metadata): array
    {
        $this->validateMedia('manual', $file, $metadata);
        return array_merge($metadata, [
            'media_type' => 'manual',
            'status' => 'active',
        ]);
    }

    /**
     * Process Specification document
     */
    public function processSpecification(UploadedFile $file, array $metadata): array
    {
        $this->validateMedia('specification', $file, $metadata);
        return array_merge($metadata, [
            'media_type' => 'specification',
            'status' => 'active',
        ]);
    }

    /**
     * Process Certification document
     */
    public function processCertification(UploadedFile $file, array $metadata): array
    {
        $this->validateMedia('certification', $file, $metadata);
        return array_merge($metadata, [
            'media_type' => 'certification',
            'status' => 'active',
        ]);
    }

    /**
     * Get validation rules for a media type
     */
    public function getValidationRules(string $mediaType): array
    {
        return $this->mediaRules[$mediaType] ?? [];
    }

    /**
     * Optimize image according to type rules
     */
    protected function optimizeImage(UploadedFile $file): ?UploadedFile
    {
        try {
            $rules = $this->mediaRules['equipment_image']['optimization'];
            
            // Create Intervention Image instance
            $image = Image::make($file);

            // Resize if needed while maintaining aspect ratio
            if ($image->width() > $rules['max_width'] || $image->height() > $rules['max_height']) {
                $image->resize($rules['max_width'], $rules['max_height'], function ($constraint) {
                    $constraint->aspectRatio();
                    $constraint->upsize();
                });
            }

            // Convert to WebP and set quality
            $tempPath = sys_get_temp_dir() . '/' . uniqid('optimized_', true) . '.webp';
            $image->save($tempPath, $rules['quality'], 'webp');

            // Create a new UploadedFile instance from the optimized image
            return new UploadedFile(
                $tempPath,
                $file->getClientOriginalName() . '.webp',
                'image/webp',
                null,
                true
            );
        } catch (\Exception $e) {
            \Log::warning('Image optimization failed: ' . $e->getMessage());
            return null;
        }
    }
} 