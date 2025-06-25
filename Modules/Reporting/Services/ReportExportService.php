<?php

namespace Modules\Reporting\Services;

use Modules\Core\Services\PdfGenerationService;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Carbon\Carbon;

class ReportExportService
{
    protected PdfGenerationService $pdfService;
    protected array $defaultOptions;

    public function __construct(PdfGenerationService $pdfService)
    {
        $this->pdfService = $pdfService;
        $this->defaultOptions = [
            'paper' => 'a4',
            'orientation' => 'portrait',
            'watermark' => config('app.company_logo'),
            'show_watermark' => true,
            'template' => 'default',
            'include_header' => true,
            'include_footer' => true,
            'include_page_numbers' => true,
            'include_timestamp' => true,
        ];
    }

    /**
     * Generate a single report
     */
    public function generateReport(string $type, array $data, array $options = []): string
    {
        $mergedOptions = array_merge($this->defaultOptions, $options);
        
        $viewData = [
            'data' => $data,
            'company' => [
                'name' => config('app.company_name'),
                'logo' => config('app.company_logo'),
                'address' => config('app.company_address'),
            ],
            'generated_at' => Carbon::now()->format('Y-m-d H:i:s'),
            'options' => $mergedOptions,
        ];

        $template = $this->getTemplate($type, $mergedOptions['template']);
        
        return $this->pdfService->generateFromView($template, $viewData, $mergedOptions);
    }

    /**
     * Generate multiple reports in batch
     */
    public function generateBatchReports(string $type, array $items, array $options = []): array
    {
        $paths = [];
        $mergedOptions = array_merge($this->defaultOptions, $options);

        foreach ($items as $item) {
            $paths[] = $this->generateReport($type, $item, $mergedOptions);
        }

        if ($mergedOptions['combine'] ?? false) {
            return [$this->combineReports($paths)];
        }

        return $paths;
    }

    /**
     * Schedule a report for generation
     */
    public function scheduleReport(string $type, array $data, array $options = [], ?Carbon $scheduledAt = null): void
    {
        $scheduledAt = $scheduledAt ?? Carbon::now()->addMinutes(5);
        
        dispatch(new GenerateScheduledReport($type, $data, $options))
            ->delay($scheduledAt);
    }

    /**
     * Get the appropriate template for the report type
     */
    protected function getTemplate(string $type, string $template): string
    {
        return match ($type) {
            'financial' => "reporting::pdfs.financial.{$template}",
            'inventory' => "reporting::pdfs.inventory.{$template}",
            'employee' => "reporting::pdfs.employee.{$template}",
            'project' => "reporting::pdfs.project.{$template}",
            'equipment' => "reporting::pdfs.equipment.{$template}",
            'rental' => "reporting::pdfs.rental.{$template}",
            default => "reporting::pdfs.generic.{$template}",
        };
    }

    /**
     * Combine multiple PDF reports into one
     */
    protected function combineReports(array $paths): string
    {
        $merger = new \Webklex\PDFMerger\PDFMerger;
        
        foreach ($paths as $path) {
            $merger->addPDF(Storage::path($path));
        }
        
        $outputPath = 'temp/' . Str::random(40) . '.pdf';
        $merger->merge();
        $merger->save(Storage::path($outputPath));
        
        // Cleanup individual files
        foreach ($paths as $path) {
            Storage::delete($path);
        }
        
        return $outputPath;
    }

    /**
     * Add watermark to a report
     */
    protected function addWatermark(string $path, string $watermarkText): string
    {
        $watermarkedPath = 'temp/' . Str::random(40) . '.pdf';
        
        $pdf = new \setasign\Fpdi\Fpdi();
        $pageCount = $pdf->setSourceFile(Storage::path($path));
        
        for ($i = 1; $i <= $pageCount; $i++) {
            $template = $pdf->importPage($i);
            $size = $pdf->getTemplateSize($template);
            $pdf->AddPage($size['orientation'], [$size['width'], $size['height']]);
            $pdf->useTemplate($template);
            
            $pdf->SetFont('Arial', 'B', 50);
            $pdf->SetTextColor(255, 192, 203);
            $pdf->SetAlpha(0.2);
            
            $pdf->Rotate(45, $size['width'] / 2, $size['height'] / 2);
            $pdf->Text($size['width'] / 2 - 50, $size['height'] / 2, $watermarkText);
        }
        
        $pdf->Output(Storage::path($watermarkedPath), 'F');
        Storage::delete($path);
        
        return $watermarkedPath;
    }

    /**
     * Add page numbers to a report
     */
    protected function addPageNumbers(string $path): string
    {
        $numberedPath = 'temp/' . Str::random(40) . '.pdf';
        
        $pdf = new \setasign\Fpdi\Fpdi();
        $pageCount = $pdf->setSourceFile(Storage::path($path));
        
        for ($i = 1; $i <= $pageCount; $i++) {
            $template = $pdf->importPage($i);
            $size = $pdf->getTemplateSize($template);
            $pdf->AddPage($size['orientation'], [$size['width'], $size['height']]);
            $pdf->useTemplate($template);
            
            $pdf->SetFont('Arial', '', 8);
            $pdf->SetTextColor(128, 128, 128);
            $pdf->SetXY($size['width'] - 30, $size['height'] - 10);
            $pdf->Write(0, "Page {$i} of {$pageCount}");
        }
        
        $pdf->Output(Storage::path($numberedPath), 'F');
        Storage::delete($path);
        
        return $numberedPath;
    }
} 