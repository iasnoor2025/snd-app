<?php

namespace Modules\RentalManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Modules\RentalManagement\Services\PaymentService;
use Modules\RentalManagement\Http\Requests\StorePaymentRequest;
use Modules\RentalManagement\Http\Requests\UpdatePaymentRequest;
use Inertia\Inertia;
use Illuminate\Http\JsonResponse;
use Modules\RentalManagement\Http\Requests\ProcessPaymentRequest;
use Modules\RentalManagement\Http\Requests\ProcessRefundRequest;
use Modules\RentalManagement\Models\Booking;
use Modules\RentalManagement\Models\Payment;

class PaymentController extends Controller
{
    /**
     * The payment service instance.
     *
     * @var PaymentService
     */
    protected $paymentService;

    /**
     * Create a new controller instance.
     *
     * @param PaymentService $paymentService
     */
    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    /**
     * Display a listing of payments for a rental.
     *
     * @param int $rentalId
     * @return \Inertia\Response;
     */
    public function index($rentalId)
    {
        $payments = $this->paymentService->getByRentalId($rentalId);

        return Inertia::render('Rental/Payments/Index', [
            'payments' => $payments,
            'rentalId' => $rentalId
        ]);
    }

    /**
     * Show the form for creating a new payment.
     *
     * @param int $rentalId
     * @return \Inertia\Response;
     */
    public function create($rentalId)
    {
        return Inertia::render('Rental/Payments/Create', [
            'rentalId' => $rentalId
        ]);
    }

    /**
     * Store a newly created payment.
     *
     * @param StorePaymentRequest $request
     * @param int $rentalId
     * @return \Illuminate\Http\RedirectResponse;
     */
    public function store(StorePaymentRequest $request, $rentalId)
    {
        $data = array_merge($request->validated(), ['rental_id' => $rentalId]);
        $payment = $this->paymentService->create($data);

        return redirect()->route('rentals.payments.index', $rentalId)
            ->with('success', 'Payment created successfully.');
    }

    /**
     * Display the specified payment.
     *
     * @param int $rentalId
     * @param int $id
     * @return \Inertia\Response;
     */
    public function show($rentalId, $id)
    {
        $payment = $this->paymentService->find($id);

        return Inertia::render('Rental/Payments/Show', [
            'payment' => $payment,
            'rentalId' => $rentalId
        ]);
    }

    /**
     * Show the form for editing the specified payment.
     *
     * @param int $rentalId
     * @param int $id
     * @return \Inertia\Response;
     */
    public function edit($rentalId, $id)
    {
        $payment = $this->paymentService->find($id);

        return Inertia::render('Rental/Payments/Edit', [
            'payment' => $payment,
            'rentalId' => $rentalId
        ]);
    }

    /**
     * Update the specified payment.
     *
     * @param UpdatePaymentRequest $request
     * @param int $rentalId
     * @param int $id
     * @return \Illuminate\Http\RedirectResponse;
     */
    public function update(UpdatePaymentRequest $request, $rentalId, $id)
    {
        $this->paymentService->update($id, $request->validated());

        return redirect()->route('rentals.payments.show', [$rentalId, $id])
            ->with('success', 'Payment updated successfully.');
    }

    /**
     * Remove the specified payment.
     *
     * @param int $rentalId
     * @param int $id
     * @return \Illuminate\Http\RedirectResponse;
     */
    public function destroy($rentalId, $id)
    {
        $this->paymentService->delete($id);

        return redirect()->route('rentals.payments.index', $rentalId)
            ->with('success', 'Payment deleted successfully.');
    }

    /**
     * Process a payment for a booking
     */
    public function processPayment(ProcessPaymentRequest $request, Booking $booking): JsonResponse
    {
        try {
            $payment = $this->paymentService->processPayment($booking, $request->validated());

            return response()->json([
                'message' => 'Payment processed successfully',
                'data' => [
                    'payment' => $payment,
                    'booking_status' => $booking->status,
                    'payment_status' => $booking->payment_status,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Payment processing failed',
                'error' => $e->getMessage()
            ], 422);
        }
    }

    /**
     * Process a refund for a payment
     */
    public function processRefund(ProcessRefundRequest $request, Payment $payment): JsonResponse
    {
        try {
            $refund = $this->paymentService->processRefund($payment, $request->validated());

            return response()->json([
                'message' => 'Refund processed successfully',
                'data' => [
                    'refund' => $refund,
                    'booking_status' => $payment->booking->status,
                    'payment_status' => $payment->booking->payment_status,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Refund processing failed',
                'error' => $e->getMessage()
            ], 422);
        }
    }

    /**
     * Get payment history for a booking
     */
    public function getPaymentHistory(Booking $booking): JsonResponse
    {
        $history = $this->paymentService->getPaymentHistory($booking);

        return response()->json([
            'data' => $history
        ]);
    }

    /**
     * Get payment summary for a booking
     */
    public function getPaymentSummary(Booking $booking): JsonResponse
    {
        $summary = $this->paymentService->getPaymentSummary($booking);

        return response()->json([
            'data' => $summary
        ]);
    }
}


