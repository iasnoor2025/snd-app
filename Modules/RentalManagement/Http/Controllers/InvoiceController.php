<?php

namespace Modules\RentalManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;
use Modules\RentalManagement\Domain\Models\Customer;
use Modules\RentalManagement\Domain\Models\Invoice;
use Modules\RentalManagement\Domain\Models\InvoiceItem;
use Modules\RentalManagement\Domain\Models\Rental;
use Modules\EquipmentManagement\Traits\HandlesDocumentUploads;
use Illuminate\Http\JsonResponse;
use Modules\RentalManagement\Models\Booking;
use Modules\Core\Services\PdfGenerationService;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class InvoiceController extends Controller
{
    use HandlesDocumentUploads;
    protected $documentCollection = 'documents';

    public function __construct(
        private readonly PdfGenerationService $pdfService
    ) {}

    /**
     * Display a listing of the invoices.
     */
    public function index(Request $request): Response
    {
        $this->authorize('invoices.viewAny');

        $filters = $request->all('search', 'status', 'customer_id', 'start_date', 'end_date', 'column', 'direction');

        $invoices = Invoice::with(['customer', 'items'])
            ->filter($filters)
            ->orderBy($filters['column'] ?? 'created_at', $filters['direction'] ?? 'desc')
            ->paginate($request->input('per_page', 10))
            ->withQueryString();

        $customers = Customer::orderBy('company_name')->get();
        $statuses = [
            ['value' => 'draft', 'label' => 'Draft'],
            ['value' => 'sent', 'label' => 'Sent'],
            ['value' => 'paid', 'label' => 'Paid'],
            ['value' => 'partially_paid', 'label' => 'Partially Paid'],
            ['value' => 'overdue', 'label' => 'Overdue'],
            ['value' => 'cancelled', 'label' => 'Cancelled']
        ];

        return Inertia::render('Invoices/Index', [
            'invoices' => $invoices,
            'filters' => $filters,
            'customers' => $customers,
            'statuses' => $statuses,
        ]);
    }

    /**
     * Show the form for creating a new invoice.
     */
    public function create(Request $request): Response
    {
        $this->authorize('invoices.create');

        $customers = Customer::orderBy('company_name')->get();
        $rentals = null;

        // If customer_id is provided, get their rentals
        if ($request->has('customer_id')) {
            $rentals = Rental::where('customer_id', $request->customer_id)
                ->where('status', 'active')
                ->orderBy('start_date', 'desc')
                ->get();
        }

        // Generate next invoice number (simple implementation)
        $lastInvoice = Invoice::latest()->first();
        $invoiceNumber = $lastInvoice ? 'INV-' . str_pad((intval(substr($lastInvoice->invoice_number, 4)) + 1), 6, '0', STR_PAD_LEFT) : 'INV-000001';

        return Inertia::render('Invoices/Create', [
            'customers' => $customers,
            'rentals' => $rentals,
            'defaultInvoiceNumber' => $invoiceNumber,
            'defaultIssueDate' => Carbon::today()->format('Y-m-d'),
            'defaultDueDate' => Carbon::today()->addDays(30)->format('Y-m-d'),
        ]);
    }

    /**
     * Store a newly created invoice in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $this->authorize('invoices.create');

        // Validate request
        $validatedData = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'rental_id' => 'nullable|exists:rentals,id',
            'invoice_number' => 'required|string|unique:invoices,invoice_number',
            'issue_date' => 'required|date',
            'due_date' => 'required|date|after_or_equal:issue_date',
            'subtotal' => 'required|numeric|min:0',
            'discount_amount' => 'nullable|numeric|min:0',
            'tax_amount' => 'nullable|numeric|min:0',
            'total_amount' => 'required|numeric|min:0',
            'status' => 'required|string',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.amount' => 'required|numeric|min:0',
        ]);

        DB::beginTransaction();
        try {
            // Create the invoice
            $invoice = Invoice::create($validatedData);

            // Create invoice items
            foreach ($request->items as $item) {
                $invoice->items()->create([
                    'description' => $item['description'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'amount' => $item['amount']
                ]);
            }

            // Handle documents if any
            if ($request->hasFile('documents')) {
                foreach ($request->file('documents') as $index => $file) {
                    $documentName = $request->input('document_names.' . $index, 'Document ' . ($index + 1));
                    $invoice->addMedia($file)
                        ->usingName($documentName)
                        ->toMediaCollection($this->documentCollection);
                }
            }

            DB::commit();

            return redirect()->route('invoices.show', $invoice)
                ->with('success', 'Invoice created successfully');
        } catch (\Exception $e) {
            dd($e);
            DB::rollBack();
            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to create invoice: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified invoice.
     */
    public function show(Invoice $invoice): Response
    {
        $this->authorize('invoices.view');

        $invoice->load(['customer', 'items']);

        return Inertia::render('Invoices/Show', [
            'invoice' => $invoice,
            'documents' => $invoice->getMedia($this->documentCollection),
        ]);
    }

    /**
     * Show the form for editing the specified invoice.
     */
    public function edit(Invoice $invoice): Response
    {
        $this->authorize('invoices.edit');

        $invoice->load(['customer', 'items']);

        $customers = Customer::orderBy('company_name')->get();
        $rentals = Rental::where('customer_id', $invoice->customer_id)
            ->orderBy('start_date', 'desc')
            ->get();

        return Inertia::render('Invoices/Edit', [
            'invoice' => $invoice,
            'customers' => $customers,
            'rentals' => $rentals,
            'documents' => $invoice->getMedia($this->documentCollection),
        ]);
    }

    /**
     * Update the specified invoice in storage.
     */
    public function update(Request $request, Invoice $invoice): RedirectResponse
    {
        $this->authorize('invoices.edit');

        // Validate request
        $validatedData = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'rental_id' => 'nullable|exists:rentals,id',
            'invoice_number' => 'required|string|unique:invoices,invoice_number,' . $invoice->id,
            'issue_date' => 'required|date',
            'due_date' => 'required|date|after_or_equal:issue_date',
            'subtotal' => 'required|numeric|min:0',
            'discount_amount' => 'nullable|numeric|min:0',
            'tax_amount' => 'nullable|numeric|min:0',
            'total_amount' => 'required|numeric|min:0',
            'status' => 'required|string',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.id' => 'nullable|exists:invoice_items,id',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.amount' => 'required|numeric|min:0',
        ]);

        DB::beginTransaction();
        try {
            // Update the invoice
            $invoice->update($validatedData);

            // Update or create invoice items
            $existingItemIds = [];

            foreach ($request->items as $itemData) {
                if (isset($itemData['id'])) {
                    // Update existing item
                    $item = InvoiceItem::findOrFail($itemData['id']);
                    $item->update([
                        'description' => $itemData['description'],
                        'quantity' => $itemData['quantity'],
                        'unit_price' => $itemData['unit_price'],
                        'amount' => $itemData['amount']
                    ]);
                    $existingItemIds[] = $item->id;
                } else {
                    // Create new item
                    $item = $invoice->items()->create([
                        'description' => $itemData['description'],
                        'quantity' => $itemData['quantity'],
                        'unit_price' => $itemData['unit_price'],
                        'amount' => $itemData['amount']
                    ]);
                    $existingItemIds[] = $item->id;
                }
            }

            // Delete removed items
            $invoice->items()->whereNotIn('id', $existingItemIds)->delete();

            // Handle documents if any
            if ($request->hasFile('documents')) {
                foreach ($request->file('documents') as $index => $file) {
                    $documentName = $request->input('document_names.' . $index, 'Document ' . ($index + 1));
                    $invoice->addMedia($file)
                        ->usingName($documentName)
                        ->toMediaCollection($this->documentCollection);
                }
            }

            DB::commit();

            return redirect()->route('invoices.show', $invoice)
                ->with('success', 'Invoice updated successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to update invoice: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified invoice from storage.
     */
    public function destroy(Invoice $invoice): RedirectResponse
    {
        $this->authorize('invoices.delete');

        DB::beginTransaction();
        try {
            // Delete related items
            $invoice->items()->delete();

            // Delete media items
            $invoice->clearMediaCollection($this->documentCollection);

            // Delete the invoice
            $invoice->delete();

            DB::commit();

            return redirect()->route('invoices.index')
                ->with('success', 'Invoice deleted successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Failed to delete invoice: ' . $e->getMessage());
        }
    }

    /**
     * Remove a document from the invoice.
     */
    public function removeDocument(Request $request, Invoice $invoice, $documentId): RedirectResponse
    {
        $this->authorize('invoices.edit');

        try {
            // Ensure ID is numeric
            if (!is_numeric($documentId)) {
                abort(404, 'Invalid ID provided');
            }

            $document = $invoice->getMedia($this->documentCollection)->where('id', $documentId)->first();

            if ($document) {
                $document->delete();
                return redirect()->back()->with('success', 'Document removed successfully');
            }

            return redirect()->back()->with('error', 'Document not found');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to remove document: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified invoice for API.
     */
    public function showApi(Invoice $invoice): JsonResponse
    {
        $this->authorize('invoices.view');

        $invoice->load(['customer', 'items']);

        return response()->json([
            'success' => true,
            'data' => $invoice
        ]);
    }

    /**
     * Get all invoices for a booking.
     */
    public function getBookingInvoices(Booking $booking): JsonResponse
    {
        $this->authorize('invoices.viewAny');

        $invoices = $booking->invoices()
            ->with(['customer', 'items'])
            ->get();

        return response()->json([
            'success' => true,
            'data' => $invoices
        ]);
    }

    /**
     * Download invoice as PDF.
     */
    public function downloadPdf(Invoice $invoice): BinaryFileResponse
    {
        $this->authorize('invoices.view');

        $invoice->load(['customer', 'items']);

        $pdf = $this->pdfService->generateInvoicePdf($invoice);
        $filename = 'invoice_' . $invoice->invoice_number . '.pdf';

        return response()->file($pdf, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"'
        ]);
    }

    /**
     * Send invoice by email.
     */
    public function sendByEmail(Invoice $invoice): JsonResponse
    {
        $this->authorize('invoices.edit');

        try {
            // TODO: Implement email sending logic
            return response()->json([
                'success' => true,
                'message' => 'Invoice sent successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send invoice: ' . $e->getMessage()
            ], 500);
        }
    }
}


