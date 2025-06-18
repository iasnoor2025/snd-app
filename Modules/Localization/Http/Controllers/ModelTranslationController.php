<?php

namespace Modules\Localization\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;
use Modules\Localization\Services\SpatieTranslatableService;
use Modules\Localization\Models\Language;

class ModelTranslationController extends Controller
{
    protected SpatieTranslatableService $spatieService;

    public function __construct(SpatieTranslatableService $spatieService)
    {
        $this->spatieService = $spatieService;
    }

    /**
     * Get translation statistics for all translatable models
     */
    public function getStatistics(): JsonResponse
    {
        try {
            $statistics = $this->spatieService->getTranslationStatistics();

            return response()->json([
                'success' => true,
                'data' => $statistics
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get translation statistics: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get missing translations for a specific model and language
     */
    public function getMissingTranslations(Request $request): JsonResponse
    {
        $request->validate([
            'model' => 'required|string',
            'language' => 'required|string|exists:languages,code'
        ]);

        try {
            $modelClass = $this->getModelClass($request->model);
            $missing = $this->spatieService->getMissingTranslations($modelClass, $request->language);

            return response()->json([
                'success' => true,
                'data' => $missing
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get missing translations: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Copy translations from one language to another
     */
    public function copyTranslations(Request $request): JsonResponse
    {
        $request->validate([
            'model' => 'required|string',
            'from_language' => 'required|string|exists:languages,code',
            'to_language' => 'required|string|exists:languages,code',
            'overwrite' => 'boolean'
        ]);

        try {
            $modelClass = $this->getModelClass($request->model);
            $copied = $this->spatieService->copyTranslations(
                $modelClass,
                $request->from_language,
                $request->to_language,
                $request->boolean('overwrite', false)
            );

            return response()->json([
                'success' => true,
                'message' => "Copied {$copied} translations from {$request->from_language} to {$request->to_language}",
                'copied_count' => $copied
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to copy translations: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export model translations
     */
    public function exportTranslations(Request $request): JsonResponse
    {
        $request->validate([
            'model' => 'required|string',
            'language' => 'nullable|string|exists:languages,code'
        ]);

        try {
            $modelClass = $this->getModelClass($request->model);
            $translations = $this->spatieService->exportModelTranslations(
                $modelClass,
                $request->language
            );

            return response()->json([
                'success' => true,
                'data' => $translations
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to export translations: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Import model translations
     */
    public function importTranslations(Request $request): JsonResponse
    {
        $request->validate([
            'model' => 'required|string',
            'translations' => 'required|array',
            'overwrite' => 'boolean'
        ]);

        try {
            $modelClass = $this->getModelClass($request->model);
            $imported = $this->spatieService->importModelTranslations(
                $modelClass,
                $request->translations,
                $request->boolean('overwrite', false)
            );

            return response()->json([
                'success' => true,
                'message' => "Imported {$imported} translations",
                'imported_count' => $imported
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to import translations: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Clean up empty translations
     */
    public function cleanupTranslations(): JsonResponse
    {
        try {
            $cleaned = $this->spatieService->cleanupEmptyTranslations();

            return response()->json([
                'success' => true,
                'message' => "Cleaned up {$cleaned} empty translations",
                'cleaned_count' => $cleaned
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to cleanup translations: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get available translatable models
     */
    public function getModels(): JsonResponse
    {
        try {
            $models = $this->spatieService->getTranslatableModels();
            $modelList = [];

            foreach ($models as $modelClass) {
                if (class_exists($modelClass)) {
                    $model = new $modelClass;
                    $modelList[] = [
                        'class' => $modelClass,
                        'name' => class_basename($modelClass),
                        'table' => $model->getTable(),
                        'translatable_attributes' => method_exists($model, 'getTranslatableAttributes')
                            ? $model->getTranslatableAttributes()
                            : []
                    ];
                }
            }

            return response()->json([
                'success' => true,
                'data' => $modelList
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get models: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get translation completion for a specific model and language
     */
    public function getCompletion(Request $request): JsonResponse
    {
        $request->validate([
            'model' => 'required|string',
            'language' => 'required|string|exists:languages,code'
        ]);

        try {
            $modelClass = $this->getModelClass($request->model);
            $completion = $this->spatieService->getModelTranslationCompletion(
                $modelClass,
                $request->language
            );

            return response()->json([
                'success' => true,
                'completion' => $completion
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get completion: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get the full model class name from a short name
     */
    private function getModelClass(string $modelName): string
    {
        $models = [
            'Category' => 'Modules\\Core\\Domain\\Models\\Category',
            'Department' => 'Modules\\EmployeeManagement\\Domain\\Models\\Department',
            'Position' => 'Modules\\EmployeeManagement\\Domain\\Models\\Position',
            'Equipment' => 'Modules\\EquipmentManagement\\Domain\\Models\\Equipment',
        ];

        if (!isset($models[$modelName])) {
            throw new \InvalidArgumentException("Model {$modelName} is not supported");
        }

        return $models[$modelName];
    }
}
