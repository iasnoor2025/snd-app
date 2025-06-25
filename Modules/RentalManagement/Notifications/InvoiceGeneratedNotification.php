<?php

namespace Modules\RentalManagement\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Modules\RentalManagement\Models\Invoice;

class InvoiceGeneratedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public readonly Invoice $invoice
    ) {}

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $message = (new MailMessage)
            ->subject("Invoice #{$this->invoice->invoice_number} for Your Rental")
            ->greeting("Hello {$notifiable->name},")
            ->line("Your invoice #{$this->invoice->invoice_number} has been generated for your rental.")
            ->line("Amount: {$this->invoice->amount} USD")
            ->line("Due Date: {$this->invoice->due_date->format('F j, Y')}")
            ->action('View Invoice', route('invoices.show', $this->invoice->id))
            ->line('Thank you for your business!');

        // Attach the PDF invoice
        if ($pdfPath = $this->generateInvoicePdf()) {
            $message->attach($pdfPath, [
                'as' => "invoice_{$this->invoice->invoice_number}.pdf",
                'mime' => 'application/pdf',
            ]);
        }

        return $message;
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'invoice_id' => $this->invoice->id,
            'invoice_number' => $this->invoice->invoice_number,
            'amount' => $this->invoice->amount,
            'due_date' => $this->invoice->due_date->format('Y-m-d'),
            'booking_id' => $this->invoice->booking_id,
            'customer_id' => $this->invoice->customer_id,
            'type' => 'invoice_generated',
        ];
    }

    /**
     * Generate the invoice PDF
     */
    protected function generateInvoicePdf(): ?string
    {
        try {
            $pdfService = app(PdfGenerationService::class);
            return $pdfService->generateInvoicePdf($this->invoice);
        } catch (\Exception $e) {
            report($e);
            return null;
        }
    }
} 