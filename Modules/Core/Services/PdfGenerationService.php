<?php

namespace Modules\Core\Services;

use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\View;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Carbon\Carbon;

class PdfGenerationService
{
    /**
     * Generate a PDF from a blade template
     *
     * @param string $template
     * @param array $data
     * @param array $options
     * @return string
     */
    public function generateFromTemplate(string $template, array $data, array $options = []): string
    {
        $defaultOptions = [
            'paper' => 'a4',
            'orientation' => 'portrait',
            'watermark' => null,
            'watermarkAngle' => 45,
            'headerTemplate' => null,
            'footerTemplate' => null,
            'companyLogo' => null,
            'fileName' => null
        ];

        $options = array_merge($defaultOptions, $options);
        
        // Generate view HTML
        $html = View::make($template, array_merge($data, [
            'watermark' => $options['watermark'],
            'companyLogo' => $options['companyLogo']
        ]))->render();

        // Add watermark if specified
        if ($options['watermark']) {
            $html = $this->addWatermark($html, $options['watermark'], $options['watermarkAngle']);
        }

        // Add header if specified
        if ($options['headerTemplate']) {
            $headerHtml = View::make($options['headerTemplate'], $data)->render();
            $html = $this->addHeader($html, $headerHtml);
        }

        // Add footer if specified
        if ($options['footerTemplate']) {
            $footerHtml = View::make($options['footerTemplate'], $data)->render();
            $html = $this->addFooter($html, $footerHtml);
        }

        // Generate PDF
        $pdf = PDF::loadHTML($html)
            ->setPaper($options['paper'], $options['orientation']);

        // Generate filename if not provided
        $fileName = $options['fileName'] ?? $this->generateFileName();
        
        // Save to storage
        $path = 'pdfs/' . $fileName;
        Storage::put($path, $pdf->output());

        return $path;
    }

    /**
     * Generate multiple PDFs in batch
     *
     * @param array $batch
     * @param array $globalOptions
     * @return array
     */
    public function generateBatch(array $batch, array $globalOptions = []): array
    {
        $results = [];

        foreach ($batch as $item) {
            $template = $item['template'];
            $data = $item['data'];
            $options = array_merge($globalOptions, $item['options'] ?? []);

            try {
                $path = $this->generateFromTemplate($template, $data, $options);
                $results[] = [
                    'success' => true,
                    'path' => $path,
                    'data' => $data
                ];
            } catch (\Exception $e) {
                $results[] = [
                    'success' => false,
                    'error' => $e->getMessage(),
                    'data' => $data
                ];
            }
        }

        return $results;
    }

    /**
     * Add watermark to PDF HTML
     *
     * @param string $html
     * @param string $watermarkText
     * @param int $angle
     * @return string
     */
    protected function addWatermark(string $html, string $watermarkText, int $angle): string
    {
        $watermarkStyle = "
            .watermark {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate({$angle}deg);
                opacity: 0.2;
                font-size: 72px;
                z-index: 1000;
                color: #888;
                pointer-events: none;
            }
        ";

        $watermarkHtml = "<div class='watermark'>{$watermarkText}</div>";

        return str_replace(
            '</head>',
            "<style>{$watermarkStyle}</style></head>",
            str_replace('<body>', "<body>{$watermarkHtml}", $html)
        );
    }

    /**
     * Add header to PDF HTML
     *
     * @param string $html
     * @param string $headerHtml
     * @return string
     */
    protected function addHeader(string $html, string $headerHtml): string
    {
        $headerStyle = "
            .pdf-header {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                height: 100px;
                padding: 20px;
                border-bottom: 1px solid #ddd;
            }
            .pdf-content {
                margin-top: 120px;
            }
        ";

        return str_replace(
            '</head>',
            "<style>{$headerStyle}</style></head>",
            str_replace(
                '<body>',
                "<body><div class='pdf-header'>{$headerHtml}</div><div class='pdf-content'>",
                str_replace('</body>', "</div></body>", $html)
            )
        );
    }

    /**
     * Add footer to PDF HTML
     *
     * @param string $html
     * @param string $footerHtml
     * @return string
     */
    protected function addFooter(string $html, string $footerHtml): string
    {
        $footerStyle = "
            .pdf-footer {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                height: 50px;
                padding: 10px;
                border-top: 1px solid #ddd;
                text-align: center;
            }
            .pdf-content {
                margin-bottom: 70px;
            }
        ";

        return str_replace(
            '</head>',
            "<style>{$footerStyle}</style></head>",
            str_replace(
                '</body>',
                "<div class='pdf-footer'>{$footerHtml}</div></body>",
                $html
            )
        );
    }

    /**
     * Generate a unique filename for the PDF
     *
     * @return string
     */
    protected function generateFileName(): string
    {
        return Carbon::now()->format('Y-m-d_His') . '_' . Str::random(8) . '.pdf';
    }

    /**
     * Merge multiple PDFs into a single file
     *
     * @param array $paths
     * @param string|null $outputFileName
     * @return string
     */
    public function mergePdfs(array $paths, ?string $outputFileName = null): string
    {
        $merger = new \Webklex\PDFMerger\PDFMerger;

        foreach ($paths as $path) {
            $merger->addPDF(Storage::path($path));
        }

        $outputFileName = $outputFileName ?? 'merged_' . $this->generateFileName();
        $outputPath = 'pdfs/' . $outputFileName;
        
        $merger->merge();
        $merger->save(Storage::path($outputPath));

        return $outputPath;
    }

    /**
     * Add digital signature to PDF
     *
     * @param string $pdfPath
     * @param array $signatureData
     * @return string
     */
    public function addDigitalSignature(string $pdfPath, array $signatureData): string
    {
        $signatureHtml = View::make('core::pdfs.signature', $signatureData)->render();
        
        $pdf = PDF::loadFile(Storage::path($pdfPath));
        $currentHtml = $pdf->output();
        
        // Add signature to the last page
        $updatedHtml = str_replace('</body>', $signatureHtml . '</body>', $currentHtml);
        
        $pdf = PDF::loadHTML($updatedHtml);
        $signedPdfPath = 'pdfs/signed_' . basename($pdfPath);
        
        Storage::put($signedPdfPath, $pdf->output());
        
        return $signedPdfPath;
    }

    /**
     * Add page numbers to PDF
     *
     * @param string $pdfPath
     * @return string
     */
    public function addPageNumbers(string $pdfPath): string
    {
        $pdf = PDF::loadFile(Storage::path($pdfPath));
        $currentHtml = $pdf->output();
        
        $pageNumberStyle = "
            .page-number:before {
                content: counter(page);
            }
            .page-number {
                position: fixed;
                bottom: 10px;
                right: 10px;
                font-size: 12px;
                counter-increment: page;
            }
        ";
        
        $updatedHtml = str_replace(
            '</head>',
            "<style>{$pageNumberStyle}</style></head>",
            str_replace('</body>', '<div class="page-number"></div></body>', $currentHtml)
        );
        
        $pdf = PDF::loadHTML($updatedHtml);
        $numberedPdfPath = 'pdfs/numbered_' . basename($pdfPath);
        
        Storage::put($numberedPdfPath, $pdf->output());
        
        return $numberedPdfPath;
    }

    /**
     * Protect PDF with password
     *
     * @param string $pdfPath
     * @param string $password
     * @return string
     */
    public function protectPdf(string $pdfPath, string $password): string
    {
        $pdf = PDF::loadFile(Storage::path($pdfPath));
        $pdf->setEncryption($password);
        
        $protectedPdfPath = 'pdfs/protected_' . basename($pdfPath);
        Storage::put($protectedPdfPath, $pdf->output());
        
        return $protectedPdfPath;
    }

    /**
     * Generate PDF preview (first page only)
     *
     * @param string $pdfPath
     * @return string
     */
    public function generatePreview(string $pdfPath): string
    {
        $pdf = PDF::loadFile(Storage::path($pdfPath));
        $pdf->setOptions(['dpi' => 72]); // Lower resolution for preview
        
        $previewPath = 'pdfs/preview_' . basename($pdfPath);
        Storage::put($previewPath, $pdf->output());
        
        return $previewPath;
    }
} 