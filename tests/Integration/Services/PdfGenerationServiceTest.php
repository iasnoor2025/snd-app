<?php

namespace Tests\Integration\Services;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Modules\Core\Services\PdfGenerationService;
use Modules\EmployeeManagement\Domain\Models\Employee;
use Modules\EmployeeManagement\Domain\Models\EmployeeDocument;
use Modules\ProjectManagement\Domain\Models\Project;
use Modules\ProjectManagement\Domain\Models\ProjectDocument;

class PdfGenerationServiceTest extends TestCase
{
    use RefreshDatabase;

    protected $pdfService;
    protected $employee;
    protected $project;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('documents');

        $this->pdfService = app(PdfGenerationService::class);
        $this->employee = Employee::factory()->create();
        $this->project = Project::factory()->create();
    }

    /** @test */
    public function it_can_generate_employee_contract()
    {
        $data = [
            'employee_name' => $this->employee->full_name,
            'position' => 'Software Engineer',
            'start_date' => '2024-03-21',
            'salary' => '75000',
            'company_name' => 'Test Company'
        ];

        $pdf = $this->pdfService->generateEmployeeContract($data);

        $this->assertNotNull($pdf);
        $this->assertStringStartsWith('%PDF-', $pdf);

        // Test metadata
        $metadata = $this->pdfService->getMetadata($pdf);
        $this->assertEquals('Employment Contract', $metadata['Title']);
        $this->assertEquals($data['employee_name'], $metadata['Subject']);
    }

    /** @test */
    public function it_can_generate_project_report()
    {
        $data = [
            'project_name' => $this->project->name,
            'start_date' => '2024-01-01',
            'end_date' => '2024-12-31',
            'status' => 'In Progress',
            'metrics' => [
                'completion' => '60%',
                'budget_used' => '45%',
                'tasks_completed' => 75
            ]
        ];

        $pdf = $this->pdfService->generateProjectReport($data);

        $this->assertNotNull($pdf);
        $this->assertStringStartsWith('%PDF-', $pdf);

        // Verify the PDF contains the project data
        $content = $this->pdfService->extractText($pdf);
        $this->assertStringContainsString($data['project_name'], $content);
        $this->assertStringContainsString($data['status'], $content);
    }

    /** @test */
    public function it_can_generate_batch_documents()
    {
        $employees = Employee::factory()->count(3)->create();
        
        $templates = $employees->map(function ($employee) {
            return [
                'template' => 'contract',
                'data' => [
                    'employee_name' => $employee->full_name,
                    'position' => 'Developer',
                    'start_date' => '2024-03-21'
                ]
            ];
        })->toArray();

        $results = $this->pdfService->generateBatchDocuments($templates);

        $this->assertCount(3, $results);
        foreach ($results as $result) {
            $this->assertTrue($result['success']);
            $this->assertStringStartsWith('%PDF-', $result['content']);
        }
    }

    /** @test */
    public function it_can_merge_multiple_pdfs()
    {
        // Generate sample PDFs
        $pdf1 = $this->pdfService->generateEmployeeContract([
            'employee_name' => 'John Doe',
            'position' => 'Developer'
        ]);

        $pdf2 = $this->pdfService->generateEmployeeContract([
            'employee_name' => 'Jane Smith',
            'position' => 'Designer'
        ]);

        $merged = $this->pdfService->mergePdfs([$pdf1, $pdf2]);

        $this->assertNotNull($merged);
        $this->assertStringStartsWith('%PDF-', $merged);

        // Verify the merged PDF contains both documents
        $content = $this->pdfService->extractText($merged);
        $this->assertStringContainsString('John Doe', $content);
        $this->assertStringContainsString('Jane Smith', $content);
    }

    /** @test */
    public function it_can_add_watermark()
    {
        $pdf = $this->pdfService->generateEmployeeContract([
            'employee_name' => $this->employee->full_name,
            'position' => 'Developer'
        ]);

        $watermarked = $this->pdfService->addWatermark($pdf, 'CONFIDENTIAL');

        $this->assertNotNull($watermarked);
        $this->assertNotEquals($pdf, $watermarked);

        // Verify watermark text is present
        $content = $this->pdfService->extractText($watermarked);
        $this->assertStringContainsString('CONFIDENTIAL', $content);
    }

    /** @test */
    public function it_can_generate_pdf_with_custom_fonts()
    {
        $data = [
            'title' => 'Custom Font Document',
            'content' => 'Test content with custom font'
        ];

        $pdf = $this->pdfService->generatePdf('custom-template', $data, [
            'font' => 'Arial',
            'font_size' => 12
        ]);

        $this->assertNotNull($pdf);
        $metadata = $this->pdfService->getMetadata($pdf);
        $this->assertArrayHasKey('Font', $metadata);
        $this->assertEquals('Arial', $metadata['Font']);
    }

    /** @test */
    public function it_can_generate_pdf_with_images()
    {
        $data = [
            'title' => 'Document with Images',
            'logo' => Storage::path('test-logo.png'),
            'content' => 'Test content with images'
        ];

        Storage::put('test-logo.png', file_get_contents(base_path('tests/fixtures/logo.png')));

        $pdf = $this->pdfService->generatePdf('image-template', $data);

        $this->assertNotNull($pdf);
        $this->assertStringStartsWith('%PDF-', $pdf);
    }

    /** @test */
    public function it_can_generate_pdf_with_tables()
    {
        $data = [
            'title' => 'Table Report',
            'headers' => ['Name', 'Position', 'Department'],
            'rows' => [
                ['John Doe', 'Developer', 'IT'],
                ['Jane Smith', 'Designer', 'Creative']
            ]
        ];

        $pdf = $this->pdfService->generatePdf('table-template', $data);

        $this->assertNotNull($pdf);
        $content = $this->pdfService->extractText($pdf);
        foreach ($data['headers'] as $header) {
            $this->assertStringContainsString($header, $content);
        }
    }

    /** @test */
    public function it_can_generate_pdf_with_unicode_characters()
    {
        $data = [
            'title' => 'Unicode Test',
            'content' => 'مرحبا العالم - שָׁלוֹם - 你好世界'
        ];

        $pdf = $this->pdfService->generatePdf('unicode-template', $data);

        $this->assertNotNull($pdf);
        $content = $this->pdfService->extractText($pdf);
        $this->assertStringContainsString($data['content'], $content);
    }

    /** @test */
    public function it_can_generate_pdf_with_page_numbers()
    {
        $data = [
            'title' => 'Multi-page Document',
            'content' => str_repeat('Test content\n', 50) // Create multiple pages
        ];

        $pdf = $this->pdfService->generatePdf('paged-template', $data, [
            'page_numbers' => true
        ]);

        $this->assertNotNull($pdf);
        $content = $this->pdfService->extractText($pdf);
        $this->assertStringContainsString('Page', $content);
    }

    /** @test */
    public function it_handles_template_errors_gracefully()
    {
        $this->expectException(\Exception::class);

        $this->pdfService->generatePdf('non-existent-template', []);
    }

    /** @test */
    public function it_can_generate_password_protected_pdf()
    {
        $data = [
            'title' => 'Confidential Document',
            'content' => 'Secret information'
        ];

        $pdf = $this->pdfService->generatePdf('secure-template', $data, [
            'password' => 'secret123'
        ]);

        $this->assertNotNull($pdf);
        $this->assertTrue($this->pdfService->isPasswordProtected($pdf));
    }

    /** @test */
    public function it_can_compress_pdf()
    {
        $data = [
            'title' => 'Large Document',
            'content' => str_repeat('Test content with lots of repeated text\n', 1000)
        ];

        $pdf = $this->pdfService->generatePdf('standard-template', $data);
        $compressed = $this->pdfService->compressPdf($pdf);

        $this->assertNotNull($compressed);
        $this->assertLessThan(strlen($pdf), strlen($compressed));
    }

    /** @test */
    public function it_can_generate_pdf_with_digital_signature()
    {
        $data = [
            'title' => 'Signed Document',
            'content' => 'This document requires a signature'
        ];

        $pdf = $this->pdfService->generatePdf('signature-template', $data, [
            'signature' => [
                'location' => 'San Francisco',
                'reason' => 'Document Approval',
                'certificate' => storage_path('certificates/test.crt')
            ]
        ]);

        $this->assertNotNull($pdf);
        $this->assertTrue($this->pdfService->isDigitallySigned($pdf));
    }
} 