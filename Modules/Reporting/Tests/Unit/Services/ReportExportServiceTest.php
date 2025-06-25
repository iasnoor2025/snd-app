<?php

namespace Modules\Reporting\Tests\Unit\Services;

use Tests\TestCase;
use Modules\Reporting\Services\ReportExportService;
use Modules\Core\Services\PdfGenerationService;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\View;
use Mockery;
use Carbon\Carbon;

class ReportExportServiceTest extends TestCase
{
    protected ReportExportService $service;
    protected PdfGenerationService $pdfService;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->pdfService = Mockery::mock(PdfGenerationService::class);
        $this->service = new ReportExportService($this->pdfService);
        
        // Create necessary directories
        Storage::makeDirectory('temp/tests');
        Storage::makeDirectory('reports');
    }

    protected function tearDown(): void
    {
        // Cleanup test files
        Storage::deleteDirectory('temp/tests');
        Storage::deleteDirectory('reports/tests');
        
        Mockery::close();
        parent::tearDown();
    }

    /** @test */
    public function it_can_generate_single_report()
    {
        $type = 'financial';
        $data = ['revenue' => 1000, 'expenses' => 500];
        $options = ['template' => 'default'];

        $expectedPath = 'temp/test-report.pdf';
        
        $this->pdfService
            ->shouldReceive('generateFromView')
            ->once()
            ->with(
                "reporting::pdfs.financial.default",
                Mockery::type('array'),
                Mockery::type('array')
            )
            ->andReturn($expectedPath);

        $path = $this->service->generateReport($type, $data, $options);

        $this->assertEquals($expectedPath, $path);
    }

    /** @test */
    public function it_can_generate_batch_reports()
    {
        $type = 'financial';
        $items = [
            ['revenue' => 1000],
            ['revenue' => 2000],
        ];
        $options = ['combine' => true];

        $this->pdfService
            ->shouldReceive('generateFromView')
            ->twice()
            ->andReturn('temp/report1.pdf', 'temp/report2.pdf');

        $paths = $this->service->generateBatchReports($type, $items, $options);

        $this->assertIsArray($paths);
        $this->assertCount(1, $paths); // Combined into one file
    }

    /** @test */
    public function it_can_schedule_report_generation()
    {
        $type = 'financial';
        $data = ['revenue' => 1000];
        $options = ['template' => 'default'];
        $scheduledAt = Carbon::now()->addHour();

        $this->expectsJobs(\Modules\Reporting\Jobs\GenerateScheduledReport::class);

        $this->service->scheduleReport($type, $data, $options, $scheduledAt);
    }

    /** @test */
    public function it_validates_report_type()
    {
        $this->expectException(\InvalidArgumentException::class);

        $this->service->generateReport('invalid-type', []);
    }

    /** @test */
    public function it_merges_default_options()
    {
        $type = 'financial';
        $data = ['revenue' => 1000];
        $customOptions = ['orientation' => 'landscape'];

        $this->pdfService
            ->shouldReceive('generateFromView')
            ->once()
            ->withArgs(function ($template, $data, $options) {
                return $options['orientation'] === 'landscape' &&
                       $options['paper'] === 'a4' && // Default option
                       $options['include_header'] === true; // Default option
            })
            ->andReturn('temp/test.pdf');

        $this->service->generateReport($type, $data, $customOptions);
    }

    /** @test */
    public function it_handles_empty_batch_gracefully()
    {
        $paths = $this->service->generateBatchReports('financial', []);

        $this->assertIsArray($paths);
        $this->assertEmpty($paths);
    }

    /** @test */
    public function it_includes_company_information()
    {
        $type = 'financial';
        $data = ['revenue' => 1000];

        $this->pdfService
            ->shouldReceive('generateFromView')
            ->once()
            ->withArgs(function ($template, $viewData) {
                return isset($viewData['company']['name']) &&
                       isset($viewData['company']['logo']) &&
                       isset($viewData['company']['address']);
            })
            ->andReturn('temp/test.pdf');

        $this->service->generateReport($type, $data);
    }

    /** @test */
    public function it_includes_generation_timestamp()
    {
        $type = 'financial';
        $data = ['revenue' => 1000];

        $this->pdfService
            ->shouldReceive('generateFromView')
            ->once()
            ->withArgs(function ($template, $viewData) {
                return isset($viewData['generated_at']) &&
                       $viewData['generated_at'] instanceof Carbon;
            })
            ->andReturn('temp/test.pdf');

        $this->service->generateReport($type, $data);
    }

    /** @test */
    public function it_handles_template_variations()
    {
        $templates = ['default', 'detailed', 'summary'];

        foreach ($templates as $template) {
            $this->pdfService
                ->shouldReceive('generateFromView')
                ->once()
                ->with(
                    "reporting::pdfs.financial.{$template}",
                    Mockery::type('array'),
                    Mockery::type('array')
                )
                ->andReturn('temp/test.pdf');

            $this->service->generateReport('financial', [], ['template' => $template]);
        }
    }

    /** @test */
    public function it_respects_watermark_options()
    {
        $type = 'financial';
        $data = ['revenue' => 1000];
        $options = [
            'watermark' => 'CONFIDENTIAL',
            'show_watermark' => true,
        ];

        $this->pdfService
            ->shouldReceive('generateFromView')
            ->once()
            ->withArgs(function ($template, $data, $options) {
                return $options['watermark'] === 'CONFIDENTIAL' &&
                       $options['show_watermark'] === true;
            })
            ->andReturn('temp/test.pdf');

        $this->service->generateReport($type, $data, $options);
    }

    /** @test */
    public function it_handles_errors_in_batch_processing()
    {
        $type = 'financial';
        $items = [
            ['revenue' => 1000],
            ['revenue' => 2000],
        ];

        $this->pdfService
            ->shouldReceive('generateFromView')
            ->twice()
            ->andThrow(new \Exception('PDF generation failed'));

        $this->expectException(\Exception::class);
        $this->service->generateBatchReports($type, $items);
    }
} 