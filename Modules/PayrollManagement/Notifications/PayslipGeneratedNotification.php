<?php

namespace Modules\PayrollManagement\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Modules\EmployeeManagement\Models\Employee;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class PayslipGeneratedNotification extends Notification
{
    use Queueable;

    protected Employee $employee;
    protected string $payslipPath;
    protected string $period;

    /**
     * Create a new notification instance.
     */
    public function __construct(Employee $employee, string $payslipPath, string $period)
    {
        $this->employee = $employee;
        $this->payslipPath = $payslipPath;
        $this->period = $period;
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $downloadUrl = Storage::temporaryUrl(
            $this->payslipPath,
            Carbon::now()->addDays(7),
            ['Content-Type' => 'application/pdf']
        );

        $periodDate = Carbon::createFromFormat('Y-m', $this->period);
        $monthYear = $periodDate->format('F Y');

        return (new MailMessage)
            ->subject("Payslip for {$monthYear}")
            ->greeting("Dear {$this->employee->first_name},")
            ->line("Your payslip for {$monthYear} is now available.")
            ->line('Please find your payslip attached to this email. For security reasons, the download link will expire in 7 days.')
            ->action('Download Payslip', $downloadUrl)
            ->line('If you have any questions about your payslip, please contact the HR department.')
            ->line('This is an automated message, please do not reply to this email.')
            ->line('Thank you for your continued service with us!')
            ->line('Best regards,')
            ->line(config('app.company_name') . ' HR Team');
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'employee_id' => $this->employee->id,
            'period' => $this->period,
            'payslip_path' => $this->payslipPath,
        ];
    }
} 