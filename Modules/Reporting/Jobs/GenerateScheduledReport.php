<?php

namespace Modules\Reporting\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Modules\Reporting\Services\ReportExportService;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Mail;
use Modules\Reporting\Notifications\ReportGeneratedNotification;
use Modules\Reporting\Notifications\ReportGenerationFailedNotification;

class GenerateScheduledReport implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected string $type;
    protected array $data;
    protected array $options;
    protected ?string $notifyEmail;

    /**
     * Create a new job instance.
     */
    public function __construct(string $type, array $data, array $options = [], ?string $notifyEmail = null)
    {
        $this->type = $type;
        $this->data = $data;
        $this->options = $options;
        $this->notifyEmail = $notifyEmail;
    }

    /**
     * Execute the job.
     */
    public function handle(ReportExportService $reportService): void
    {
        try {
            // Generate the report
            $path = $reportService->generateReport($this->type, $this->data, $this->options);

            // Store in a permanent location
            $permanentPath = 'reports/' . basename($path);
            Storage::move($path, $permanentPath);

            // Send notification if email is provided
            if ($this->notifyEmail) {
                $this->sendNotification($permanentPath);
            }

            // Log successful generation
            \Log::info('Scheduled report generated successfully', [
                'type' => $this->type,
                'path' => $permanentPath,
            ]);
        } catch (\Exception $e) {
            // Log error
            \Log::error('Failed to generate scheduled report', [
                'type' => $this->type,
                'error' => $e->getMessage(),
            ]);

            // Notify about failure if email is provided
            if ($this->notifyEmail) {
                $this->sendFailureNotification($e->getMessage());
            }

            throw $e;
        }
    }

    /**
     * Send notification about generated report
     */
    protected function sendNotification(string $path): void
    {
        $notification = new ReportGeneratedNotification(
            $this->type,
            $path,
            Storage::size($path),
            $this->options
        );

        Mail::to($this->notifyEmail)->send($notification);
    }

    /**
     * Send notification about generation failure
     */
    protected function sendFailureNotification(string $error): void
    {
        Mail::to($this->notifyEmail)->send(new ReportGenerationFailedNotification(
            $this->type,
            $error
        ));
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        \Log::error('Report generation job failed', [
            'type' => $this->type,
            'error' => $exception->getMessage(),
        ]);

        if ($this->notifyEmail) {
            $this->sendFailureNotification($exception->getMessage());
        }
    }
} 