<?php

namespace Modules\Core\Tests\Unit\Services;

use Tests\TestCase;
use Modules\Core\Services\PdfGenerationService;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\View;
use Illuminate\Support\Str;

class PdfGenerationServiceTest extends TestCase
{
    protected PdfGenerationService $service;
    protected string $tempPath;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->service = app(PdfGenerationService::class);
        $this->tempPath = 'temp/tests/' . Str::random(40);
        
        // Create temp directory
        Storage::makeDirectory('temp/tests');
    }

    protected function tearDown(): void
    {
        // Cleanup temp files
        Storage::deleteDirectory('temp/tests');
        
        parent::tearDown();
    }

    /** @test */
    public function it_can_generate_pdf_from_html()
    {
        $html = '<h1>Test Document</h1><p>This is a test.</p>';
        $options = [
            'paper' => 'a4',
            'orientation' => 'portrait',
        ];

        $path = $this->service->generateFromHtml($html, $options);

        $this->assertTrue(Storage::exists($path));
        $this->assertStringEndsWith('.pdf', $path);
    }

    /** @test */
    public function it_can_generate_pdf_from_view()
    {
        View::addLocation(__DIR__ . '/../../resources/views');
        
        $viewData = [
            'title' => 'Test Document',
            'content' => 'This is a test.',
        ];
        
        $options = [
            'paper' => 'a4',
            'orientation' => 'portrait',
        ];

        $path = $this->service->generateFromView('test-template', $viewData, $options);

        $this->assertTrue(Storage::exists($path));
        $this->assertStringEndsWith('.pdf', $path);
    }

    /** @test */
    public function it_can_add_watermark_to_pdf()
    {
        $html = '<h1>Test Document</h1><p>This is a test.</p>';
        $options = [
            'watermark' => 'CONFIDENTIAL',
            'show_watermark' => true,
        ];

        $path = $this->service->generateFromHtml($html, $options);

        $this->assertTrue(Storage::exists($path));
        // Note: We can't easily verify the watermark content in a unit test
        // This would require PDF content inspection which is better suited for visual testing
    }

    /** @test */
    public function it_can_add_page_numbers_to_pdf()
    {
        $html = '<h1>Page 1</h1><div style="page-break-before: always;"><h1>Page 2</h1></div>';
        $options = [
            'include_page_numbers' => true,
        ];

        $path = $this->service->generateFromHtml($html, $options);

        $this->assertTrue(Storage::exists($path));
        // Note: Similar to watermark, verifying page numbers would require PDF content inspection
    }

    /** @test */
    public function it_handles_invalid_html_gracefully()
    {
        $this->expectException(\Exception::class);
        
        $invalidHtml = '<<invalid>html>';
        $this->service->generateFromHtml($invalidHtml);
    }

    /** @test */
    public function it_handles_missing_view_gracefully()
    {
        $this->expectException(\Exception::class);
        
        $this->service->generateFromView('non-existent-view', []);
    }

    /** @test */
    public function it_respects_paper_size_options()
    {
        $html = '<h1>Test Document</h1>';
        
        $options = [
            'paper' => 'letter',
            'orientation' => 'landscape',
        ];

        $path = $this->service->generateFromHtml($html, $options);

        $this->assertTrue(Storage::exists($path));
        // Note: Verifying actual paper size would require PDF inspection
    }

    /** @test */
    public function it_can_handle_unicode_content()
    {
        $html = '<h1>Unicode Test</h1><p>测试 • テスト • 테스트</p>';
        
        $path = $this->service->generateFromHtml($html);

        $this->assertTrue(Storage::exists($path));
    }

    /** @test */
    public function it_can_handle_custom_fonts()
    {
        $html = '<h1 style="font-family: Arial;">Custom Font Test</h1>';
        $options = [
            'font_path' => resource_path('fonts'),
            'font_family' => 'Arial',
        ];

        $path = $this->service->generateFromHtml($html, $options);

        $this->assertTrue(Storage::exists($path));
    }

    /** @test */
    public function it_generates_unique_filenames()
    {
        $html = '<h1>Test Document</h1>';
        
        $path1 = $this->service->generateFromHtml($html);
        $path2 = $this->service->generateFromHtml($html);

        $this->assertNotEquals($path1, $path2);
    }

    /** @test */
    public function it_cleans_up_temporary_files()
    {
        $html = '<h1>Test Document</h1>';
        $path = $this->service->generateFromHtml($html);

        // Simulate time passing
        $this->travel(2)->hours();

        // Trigger cleanup (this would typically be done by a scheduled task)
        $this->service->cleanupTemporaryFiles();

        $this->assertFalse(Storage::exists($path));
    }
} 