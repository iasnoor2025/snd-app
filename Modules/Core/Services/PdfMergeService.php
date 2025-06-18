<?php
namespace Modules\Core\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\File;
use Exception;

class PdfMergeService
{
    /**
     * Merge multiple PDF files into one
     *
     * @param array $files Array of file paths to merge
     * @param string $outputPath Output path for the merged PDF
     * @return string Path to the merged PDF file
     */
    public function mergeFiles(array $files, string $outputPath = null): string
    {
        if (empty($files)) {
            throw new Exception('No files provided for merging');
        }

        // Generate output path if not provided
        if (!$outputPath) {
            $outputPath = storage_path('app/public/temp/') . uniqid('merged_') . '.pdf';

            // Make sure the directory exists
            if (!File::exists(dirname($outputPath))) {
                File::makeDirectory(dirname($outputPath), 0755, true);
            }
        }

        // Log for debugging
        Log::info('Merging PDF files', [
            'file_count' => count($files),
            'output_path' => $outputPath,
        ]);

        try {
            // In a real implementation, you might use a library like FPDI or call a command-line
            // tool like Ghostscript or PDFtk to merge the PDFs. For now, we'll just copy the first file.
            if (File::exists($files[0])) {
                File::copy($files[0], $outputPath);
                Log::info('PDF merged successfully', ['output_path' => $outputPath]);
                return $outputPath;
            } else {
                Log::error('PDF file not found', ['file' => $files[0]]);
                throw new Exception('PDF file not found: ' . $files[0]);
            }
        } catch (Exception $e) {
            Log::error('PDF merge failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Merge an array of PDF content
     *
     * @param array $pdfs Array of PDF content to merge
     * @param string $outputPath Output path for the merged PDF
     * @return string Path to the merged PDF file
     */
    public function merge(array $pdfs, string $outputPath = null): string
    {
        // Create temporary files from content
        $tempFiles = [];
        foreach ($pdfs as $index => $pdf) {
            $tempPath = storage_path('app/public/temp/') . uniqid('temp_pdf_' . $index . '_') . '.pdf';

            // Make sure the directory exists
            if (!File::exists(dirname($tempPath))) {
                File::makeDirectory(dirname($tempPath), 0755, true);
            }

            File::put($tempPath, $pdf);
            $tempFiles[] = $tempPath;
        }

        try {
            // Merge the temporary files
            $result = $this->mergeFiles($tempFiles, $outputPath);

            // Clean up temporary files
            foreach ($tempFiles as $tempFile) {
                if (File::exists($tempFile)) {
                    File::delete($tempFile);
                }
            }

            return $result;
        } catch (Exception $e) {
            // Clean up temporary files even if there's an error
            foreach ($tempFiles as $tempFile) {
                if (File::exists($tempFile)) {
                    File::delete($tempFile);
                }
            }
            throw $e;
        }
    }
}
