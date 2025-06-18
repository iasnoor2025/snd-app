<?php
namespace Modules\Core\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use App\Models\Document;
use Inertia\Inertia;

class DocumentUploadController extends Controller
{
    /**
     * Handle document uploads for different model types
     *
     * @param Request $request
     * @param string $modelType
     * @param int $modelId
     * @return \Illuminate\Http\JsonResponse;
     */
    public function upload(Request $request, $modelType, $modelId)
    {
        Log::info('Document upload request received', [
            'model_type' => $modelType,
            'model_id' => $modelId,
            'has_files' => $request->hasFile('documents'),
            'files_count' => $request->hasFile('documents') ? count($request->file('documents')) : 0,
            'all_input' => $request->all(),
            'files' => $request->allFiles(),
        ]);

        try {
            // Validate the request
            $validation = $request->validate([
                'documents.*' => 'required|file|max:10240', // 10MB max
                'document_names.*' => 'required|string|max:255',
            ]);

            Log::info('Validation passed', ['validation' => $validation]);

            $uploadedDocuments = [];

            // Check if files were uploaded
            if ($request->hasFile('documents')) {
                $files = $request->file('documents');
                $names = $request->input('document_names', []);

                foreach ($files as $index => $file) {
                    // Generate a unique filename
                    $filename = time() . '_' . $file->getClientOriginalName();

                    // Store the file in the appropriate directory
                    $path = $file->storeAs(
                        "uploads/documents/{$modelType}/{$modelId}",
                        $filename
                    );

                    // Create a document record in the database
                    $document = Document::create([
                        'name' => $names[$index] ?? $file->getClientOriginalName(),
                        'documentable_type' => ucfirst($modelType),
                        'documentable_id' => $modelId,
                        'file_path' => $path,
                        'file_type' => $file->getMimeType(),
                        'file_size' => $file->getSize(),
                        'uploaded_by' => Auth::id(),
                    ]);

                    $uploadedDocuments[] = $document;
                }

                Log::info('Documents uploaded successfully', [
                    'count' => count($uploadedDocuments),
                    'model_type' => $modelType,
                    'model_id' => $modelId,
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Documents uploaded successfully',
                    'documents' => $uploadedDocuments,
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'No documents provided',
            ], 400);

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
}


