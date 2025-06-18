<?php

namespace Modules\RentalManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Modules\RentalManagement\Services\PaymentService;
use Modules\RentalManagement\Http\Requests\StorePaymentRequest;
use Modules\RentalManagement\Http\Requests\UpdatePaymentRequest;
use Inertia\Inertia;

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
}


