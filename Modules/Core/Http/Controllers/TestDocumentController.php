<?php
namespace Modules\Core\Http\Controllers;

use Modules\RentalManagement\Domain\Models\Customer;
use Modules\Core\Services\DocumentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TestDocumentController extends Controller
{
    protected $documentService;

    public function __construct(DocumentService $documentService)
    {
        $this->documentService = $documentService;
    }

    /**
     * Display the document upload test page
     */
    public function index()
    {
        // Get a list of customers for the demo
        $customers = Customer::select('id', 'company_name', 'contact_person')
            ->orderBy('company_name')
            ->get();

        return Inertia::render('Test/DocumentUpload', [
            'customers' => $customers,
        ]);
    }

    /**
     * Process document upload
     */
    public function upload(Request $request)
    {
        $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'documents' => 'required|array',
            'documents.*' => 'file|max:10240', // 10MB max
            'document_names' => 'required|array',
            'document_names.*' => 'string|max:255',
        ]);

        try {
            DB::beginTransaction();

            $customer = Customer::findOrFail($request->customer_id);

            // Upload documents using the DocumentService
            $media = $this->documentService->uploadDocuments(
                $customer,
                $request->file('documents'),
                $request->input('document_names')
            );

            DB::commit();

            return redirect()->back()->with('success', count($media) . ' documents uploaded successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Error uploading documents: ' . $e->getMessage());
        }
    }

    /**
     * Display a customer's documents
     */
    public function showCustomerDocuments($customerId)
    {
        $customer = Customer::findOrFail($customerId);

        return Inertia::render('Test/CustomerDocuments', [
            'customer' => [
                'id' => $customer->id,
                'company_name' => $customer->company_name,
                'contact_person' => $customer->contact_person,
            ],
            'documents' => $customer->attachments,
        ]);
    }

    /**
     * Delete a document
     */
    public function deleteDocument(Request $request, $customerId, $mediaId)
    {
        try {
            $customer = Customer::findOrFail($customerId);

            $result = $this->documentService->deleteDocument($customer, $mediaId);

            if ($result) {
                return redirect()->back()->with('success', 'Document deleted successfully');
            }

            return redirect()->back()->with('error', 'Failed to delete document');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error deleting document: ' . $e->getMessage());
        }
    }

    /**
     * Update a document name
     */
    public function updateDocument(Request $request, $customerId, $mediaId)
    {
        \Log::info('Update document request received', [
            'customerId' => $customerId,
            'mediaId' => $mediaId,
            'request' => $request->all()
        ]);

        $validated = $request->validate([
            'name' => 'required|string|max:255'
        ]);

        try {
            $customer = Customer::findOrFail($customerId);

            // Get the media item to ensure it exists and belongs to the customer
            $media = $customer->media()->findOrFail($mediaId);

            // Update directly rather than using the service
            $media->name = $validated['name'];
            $media->save();

            \Log::info('Document updated successfully', [
                'mediaId' => $mediaId,
                'name' => $validated['name']
            ]);

            if ($request->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Document updated successfully'
                ]);
            }

            return redirect()->back()->with('success', 'Document updated successfully');
        } catch (\Exception $e) {
            \Log::error('Exception updating document', [
                'mediaId' => $mediaId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error updating document: ' . $e->getMessage()
                ], 500);
            }

            return redirect()->back()->with('error', 'Error updating document: ' . $e->getMessage());
        }
    }
}


