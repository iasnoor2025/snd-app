<?php

namespace Modules\RentalManagement\Services;

use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Modules\RentalManagement\Models\Booking;
use Modules\RentalManagement\Models\Payment;
use Modules\RentalManagement\Models\Invoice;
use Modules\RentalManagement\Models\Refund;
use Modules\RentalManagement\Events\PaymentProcessedEvent;
use Modules\RentalManagement\Events\PaymentFailedEvent;
use Modules\RentalManagement\Events\RefundProcessedEvent;
use Stripe\Stripe;
use Stripe\PaymentIntent;
use Stripe\Refund as StripeRefund;

class PaymentService
{
    protected $stripe;

    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    /**
     * Process a payment for a booking
     */
    public function processPayment(Booking $booking, array $paymentData): Payment
    {
        DB::beginTransaction();
        try {
            // Create Stripe Payment Intent
            $paymentIntent = PaymentIntent::create([
                'amount' => $this->convertToCents($paymentData['amount']),
                'currency' => 'usd',
                'payment_method' => $paymentData['payment_method_id'],
                'confirmation_method' => 'manual',
                'confirm' => true,
                'metadata' => [
                    'booking_id' => $booking->id,
                    'customer_id' => $booking->customer_id,
                    'equipment_id' => $booking->equipment_id,
                ]
            ]);

            // Create local payment record
            $payment = Payment::create([
                'booking_id' => $booking->id,
                'amount' => $paymentData['amount'],
                'payment_method' => $paymentData['payment_method'],
                'transaction_id' => $paymentIntent->id,
                'status' => $paymentIntent->status,
                'payment_date' => Carbon::now(),
                'metadata' => [
                    'stripe_payment_intent_id' => $paymentIntent->id,
                    'payment_method_details' => $paymentIntent->payment_method_details,
                ]
            ]);

            // Update booking status if payment is successful
            if ($paymentIntent->status === 'succeeded') {
                $booking->update([
                    'payment_status' => 'paid',
                    'status' => 'confirmed'
                ]);

                // Generate invoice and send notification
                $invoice = $this->generateInvoice($booking, $payment);
                
                // Send notifications
                $booking->customer->notify(new InvoiceGeneratedNotification($invoice));
                $booking->customer->notify(new PaymentProcessedNotification($payment));

                event(new PaymentProcessedEvent($payment));
            } else {
                event(new PaymentFailedEvent($payment));
            }

            DB::commit();
            return $payment;

        } catch (\Exception $e) {
            DB::rollBack();
            event(new PaymentFailedEvent(null, $e->getMessage()));
            throw $e;
        }
    }

    /**
     * Process a refund
     */
    public function processRefund(Payment $payment, array $refundData): Refund
    {
        DB::beginTransaction();
        try {
            // Process refund through Stripe
            $stripeRefund = StripeRefund::create([
                'payment_intent' => $payment->transaction_id,
                'amount' => $this->convertToCents($refundData['amount']),
                'reason' => $refundData['reason'] ?? 'requested_by_customer',
                'metadata' => [
                    'booking_id' => $payment->booking_id,
                    'refund_reason' => $refundData['reason'] ?? null,
                ]
            ]);

            // Create local refund record
            $refund = Refund::create([
                'payment_id' => $payment->id,
                'booking_id' => $payment->booking_id,
                'amount' => $refundData['amount'],
                'reason' => $refundData['reason'] ?? null,
                'status' => $stripeRefund->status,
                'refund_date' => Carbon::now(),
                'processed_by' => $refundData['processed_by'] ?? null,
                'transaction_id' => $stripeRefund->id,
                'metadata' => [
                    'stripe_refund_id' => $stripeRefund->id,
                    'refund_details' => $stripeRefund->toArray(),
                ]
            ]);

            // Update booking status
            if ($refund->amount >= $payment->amount) {
                $payment->booking->update([
                    'payment_status' => 'refunded',
                    'status' => 'cancelled'
                ]);
            } else {
                $payment->booking->update([
                    'payment_status' => 'partially_refunded'
                ]);
            }

            DB::commit();

            // Send notification
            $payment->booking->customer->notify(new RefundProcessedNotification($refund));

            event(new RefundProcessedEvent($refund));

            return $refund;

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Generate an invoice for a booking
     */
    protected function generateInvoice(Booking $booking, Payment $payment): Invoice
    {
        $invoice = Invoice::create([
            'booking_id' => $booking->id,
            'payment_id' => $payment->id,
            'invoice_number' => $this->generateInvoiceNumber(),
            'customer_id' => $booking->customer_id,
            'amount' => $payment->amount,
            'status' => 'paid',
            'issue_date' => Carbon::now(),
            'due_date' => Carbon::now()->addDays(30),
            'items' => [
                [
                    'description' => "Rental of {$booking->equipment->name}",
                    'quantity' => 1,
                    'unit_price' => $payment->amount,
                    'total' => $payment->amount
                ]
            ],
            'metadata' => [
                'payment_method' => $payment->payment_method,
                'transaction_id' => $payment->transaction_id,
            ]
        ]);

        // Generate PDF invoice
        $this->generateInvoicePDF($invoice);

        return $invoice;
    }

    /**
     * Generate invoice PDF
     */
    protected function generateInvoicePDF(Invoice $invoice): void
    {
        // TODO: Implement PDF generation using a PDF service
        // This will be implemented when we add PDF generation support
    }

    /**
     * Generate a unique invoice number
     */
    protected function generateInvoiceNumber(): string
    {
        $prefix = 'INV';
        $timestamp = Carbon::now()->format('Ymd');
        $random = strtoupper(Str::random(4));
        return "{$prefix}-{$timestamp}-{$random}";
    }

    /**
     * Convert amount to cents for Stripe
     */
    protected function convertToCents(float $amount): int
    {
        return (int) ($amount * 100);
    }

    /**
     * Get payment history for a booking
     */
    public function getPaymentHistory(Booking $booking): array
    {
        $payments = Payment::where('booking_id', $booking->id)
            ->with(['refunds'])
            ->orderBy('payment_date', 'desc')
            ->get();

        return $payments->map(function ($payment) {
            return [
                'id' => $payment->id,
                'amount' => $payment->amount,
                'payment_method' => $payment->payment_method,
                'status' => $payment->status,
                'payment_date' => $payment->payment_date,
                'transaction_id' => $payment->transaction_id,
                'refunds' => $payment->refunds->map(function ($refund) {
                    return [
                        'id' => $refund->id,
                        'amount' => $refund->amount,
                        'reason' => $refund->reason,
                        'status' => $refund->status,
                        'refund_date' => $refund->refund_date,
                    ];
                })
            ];
        })->toArray();
    }

    /**
     * Get payment summary for a booking
     */
    public function getPaymentSummary(Booking $booking): array
    {
        $payments = Payment::where('booking_id', $booking->id)->get();
        $refunds = Refund::where('booking_id', $booking->id)->get();

        return [
            'total_amount' => $booking->total_amount,
            'total_paid' => $payments->sum('amount'),
            'total_refunded' => $refunds->sum('amount'),
            'balance' => $booking->total_amount - ($payments->sum('amount') - $refunds->sum('amount')),
            'payment_status' => $booking->payment_status,
            'last_payment_date' => $payments->max('payment_date'),
            'last_refund_date' => $refunds->max('refund_date'),
        ];
    }
}
