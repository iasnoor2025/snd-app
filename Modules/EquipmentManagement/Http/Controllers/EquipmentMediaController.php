<?php

namespace Modules\EquipmentManagement\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Modules\EquipmentManagement\Domain\Models\Equipment;
use Modules\EquipmentManagement\Services\EquipmentMediaService;
use Modules\EquipmentManagement\Services\EquipmentMediaTypeService;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;
use Modules\EquipmentManagement\Models\EquipmentMedia;
use Modules\Core\Traits\ApiResponse;

class EquipmentMediaController extends Controller
{
    use ApiResponse;

    protected EquipmentMediaService $mediaService;
    protected EquipmentMediaTypeService $mediaTypeService;

    public function __construct(
        EquipmentMediaService $mediaService,
        EquipmentMediaTypeService $mediaTypeService
    ) {
        $this->mediaService = $mediaService;
        $this->mediaTypeService = $mediaTypeService;
        $this->middleware('auth:sanctum');
    }

    /**
     * Get all media for equipment
     */
    public function index(Equipment $equipment)
    {
        try {
            if (Gate::denies('view', $equipment)) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are not authorized to view media for this equipment'
                ], 403);
            }

            $media = $this->mediaService->getEquipmentMedia($equipment);

            return response()->json([
                'success' => true,
                'media' => $media->map(function ($collection) {
                    return $collection->map(function ($media) {
                        return $this->formatMediaResponse($media);
                    });
                })
            ]);
        } catch (\Exception $e) {
            return $this->handleError($e, 'index', $equipment->id);
        }
    }

    /**
     * Upload equipment image
     */
    public function uploadImage(Request $request, Equipment $equipment)
    {
        try {
            if (Gate::denies('update', $equipment)) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are not authorized to upload media for this equipment'
                ], 403);
            }

            $rules = $this->mediaTypeService->getValidationRules('equipment_image');
            $request->validate($rules['metadata']);
            $request->validate(['file' => $rules['file']]);

            $media = $this->mediaService->uploadImage(
                $equipment,
                $request->only([
                    'title',
                    'description',
                    'image_type',
                    'is_featured',
                    'sort_order'
                ]),
                $request->file('file')
            );

            return $this->mediaResponse($media);
        } catch (\Exception $e) {
            return $this->handleError($e, 'upload_image', $equipment->id);
        }
    }

    /**
     * Upload equipment manual
     */
    public function uploadManual(Request $request, Equipment $equipment)
    {
        try {
            if (Gate::denies('update', $equipment)) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are not authorized to upload media for this equipment'
                ], 403);
            }

            $rules = $this->mediaTypeService->getValidationRules('manual');
            $request->validate($rules['metadata']);
            $request->validate(['file' => $rules['file']]);

            $media = $this->mediaService->uploadManual(
                $equipment,
                $request->only([
                    'title',
                    'description',
                    'document_type',
                    'version',
                    'language'
                ]),
                $request->file('file')
            );

            return $this->mediaResponse($media);
        } catch (\Exception $e) {
            return $this->handleError($e, 'upload_manual', $equipment->id);
        }
    }

    /**
     * Upload equipment specification
     */
    public function uploadSpecification(Request $request, Equipment $equipment)
    {
        try {
            if (Gate::denies('update', $equipment)) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are not authorized to upload media for this equipment'
                ], 403);
            }

            $rules = $this->mediaTypeService->getValidationRules('specification');
            $request->validate($rules['metadata']);
            $request->validate(['file' => $rules['file']]);

            $media = $this->mediaService->uploadSpecification(
                $equipment,
                $request->only([
                    'title',
                    'description',
                    'document_type',
                    'version',
                    'issue_date'
                ]),
                $request->file('file')
            );

            return $this->mediaResponse($media);
        } catch (\Exception $e) {
            return $this->handleError($e, 'upload_specification', $equipment->id);
        }
    }

    /**
     * Upload equipment certification
     */
    public function uploadCertification(Request $request, Equipment $equipment)
    {
        try {
            if (Gate::denies('update', $equipment)) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are not authorized to upload media for this equipment'
                ], 403);
            }

            $rules = $this->mediaTypeService->getValidationRules('certification');
            $request->validate($rules['metadata']);
            $request->validate(['file' => $rules['file']]);

            $media = $this->mediaService->uploadCertification(
                $equipment,
                $request->only([
                    'title',
                    'description',
                    'certificate_type',
                    'issuing_authority',
                    'issue_date',
                    'expiry_date',
                    'certificate_number'
                ]),
                $request->file('file')
            );

            return $this->mediaResponse($media);
        } catch (\Exception $e) {
            return $this->handleError($e, 'upload_certification', $equipment->id);
        }
    }

    /**
     * Store media for equipment
     */
    public function store(Request $request, Equipment $equipment): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|max:51200', // 50MB max
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'metadata' => 'nullable|array'
        ]);

        $media = $this->mediaService->store(
            $equipment,
            $request->file('file'),
            $request->only(['title', 'description', 'metadata'])
        );

        return $this->success([
            'message' => 'Media uploaded successfully',
            'media' => array_merge(
                $media->toArray(),
                ['urls' => $this->mediaService->getMediaUrls($media)]
            )
        ]);
    }

    /**
     * Store multiple media files
     */
    public function storeBatch(Request $request, Equipment $equipment): JsonResponse
    {
        $request->validate([
            'files' => 'required|array',
            'files.*' => 'required|file|max:51200', // 50MB max
            'data' => 'nullable|array',
            'data.*.title' => 'nullable|string|max:255',
            'data.*.description' => 'nullable|string',
            'data.*.metadata' => 'nullable|array'
        ]);

        $results = $this->mediaService->storeBatch(
            $equipment,
            $request->file('files'),
            $request->input('data', [])
        );

        return $this->success([
            'message' => 'Media batch upload completed',
            'results' => $results
        ]);
    }

    /**
     * Update media metadata
     */
    public function update(Request $request, Equipment $equipment, EquipmentMedia $media): JsonResponse
    {
        $this->authorize('update', [$media, $equipment]);

        $request->validate([
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'metadata' => 'nullable|array'
        ]);

        $media = $this->mediaService->update(
            $media,
            $request->only(['title', 'description', 'metadata'])
        );

        return $this->success([
            'message' => 'Media updated successfully',
            'media' => array_merge(
                $media->toArray(),
                ['urls' => $this->mediaService->getMediaUrls($media)]
            )
        ]);
    }

    /**
     * Delete media
     */
    public function destroy(Equipment $equipment, EquipmentMedia $media): JsonResponse
    {
        $this->authorize('delete', [$media, $equipment]);

        $this->mediaService->delete($media);

        return $this->success([
            'message' => 'Media deleted successfully'
        ]);
    }

    /**
     * Reorder media items
     */
    public function reorder(Request $request, Equipment $equipment): JsonResponse
    {
        $request->validate([
            'media_ids' => 'required|array',
            'media_ids.*' => 'required|exists:equipment_media,id'
        ]);

        $this->mediaService->reorder($equipment, $request->input('media_ids'));

        return $this->success([
            'message' => 'Media reordered successfully'
        ]);
    }

    /**
     * Get media by type
     */
    public function getByType(Equipment $equipment, string $type): JsonResponse
    {
        $media = $this->mediaService->getByType($equipment, $type);

        return $this->success([
            'media' => $media
        ]);
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
            'created_at' => $media->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $media->updated_at?->format('Y-m-d H:i:s')
        ];
    }

    /**
     * Handle media response
     */
    protected function mediaResponse(Media $media)
    {
        return response()->json([
            'success' => true,
            'media' => $this->formatMediaResponse($media)
        ]);
    }

    /**
     * Handle error response
     */
    protected function handleError(\Exception $e, string $operation, int $equipmentId, ?int $mediaId = null): \Illuminate\Http\JsonResponse
    {
        $context = [
            'equipment_id' => $equipmentId,
            'operation' => $operation,
            'error' => $e->getMessage()
        ];

        if ($mediaId) {
            $context['media_id'] = $mediaId;
        }

        \Log::error('Error in equipment media operation', $context);

        return response()->json([
            'success' => false,
            'message' => 'Failed to ' . $operation . ' media: ' . $e->getMessage()
        ], 500);
    }
} 