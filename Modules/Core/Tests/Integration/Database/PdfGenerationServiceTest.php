<?php

namespace Modules\Core\Tests\Integration\Database;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Modules\Core\Services\PdfGenerationService;
use Modules\Core\Domain\Models\PdfTemplate;
use Modules\Core\Domain\Models\PdfGeneration;
use Carbon\Carbon;

class PdfGenerationServiceTest extends TestCase
{
    use RefreshDatabase;

    protected $service;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->service = app(PdfGenerationService::class);
    }

    /** @test */
    public function it_can_create_pdf_template()
    {
        DB::beginTransaction();

        try {
            $template = $this->service->createTemplate([
                'name' => 'Invoice Template',
                'description' => 'Standard invoice template',
                'content' => '<div>{{company_name}}</div>',
                'variables' => ['company_name', 'invoice_number', 'date'],
                'type' => 'invoice'
            ]);

            $this->assertInstanceOf(PdfTemplate::class, $template);
            $this->assertEquals('invoice', $template->type);

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /** @test */
    public function it_can_generate_pdf_with_template()
    {
        $template = PdfTemplate::factory()->create([
            'content' => '<div>{{company_name}}</div>',
            'variables' => ['company_name']
        ]);

        $pdf = $this->service->generateFromTemplate($template->id, [
            'company_name' => 'Test Company'
        ]);

        $this->assertNotNull($pdf);
        $this->assertStringContainsString('Test Company', $pdf->getContent());
    }

    /** @test */
    public function it_can_track_pdf_generation_history()
    {
        $template = PdfTemplate::factory()->create();

        $generation = $this->service->trackGeneration([
            'template_id' => $template->id,
            'user_id' => 1,
            'parameters' => ['company_name' => 'Test Company'],
            'status' => 'completed'
        ]);

        $this->assertInstanceOf(PdfGeneration::class, $generation);
        $this->assertEquals('completed', $generation->status);
    }

    /** @test */
    public function it_can_handle_template_versioning()
    {
        $template = PdfTemplate::factory()->create([
            'version' => '1.0'
        ]);

        $newVersion = $this->service->createTemplateVersion($template->id, [
            'content' => '<div>New Content</div>',
            'version' => '2.0',
            'changes' => 'Updated layout'
        ]);

        $this->assertEquals('2.0', $newVersion->version);
        $this->assertEquals($template->id, $newVersion->previous_version_id);
    }

    /** @test */
    public function it_can_handle_template_categories()
    {
        $template = PdfTemplate::factory()->create([
            'category' => 'financial',
            'subcategory' => 'invoices'
        ]);

        $templates = $this->service->findTemplatesByCategory('financial', 'invoices');
        
        $this->assertCount(1, $templates);
        $this->assertEquals($template->id, $templates[0]->id);
    }

    /** @test */
    public function it_can_handle_template_access_logs()
    {
        $template = PdfTemplate::factory()->create();

        $this->service->logTemplateAccess($template->id, [
            'user_id' => 1,
            'action' => 'view',
            'ip_address' => '127.0.0.1'
        ]);

        $logs = $this->service->getTemplateAccessLogs($template->id);
        
        $this->assertCount(1, $logs);
        $this->assertEquals('view', $logs[0]->action);
    }

    /** @test */
    public function it_can_handle_bulk_pdf_generation()
    {
        $template = PdfTemplate::factory()->create();
        
        $data = [
            ['company_name' => 'Company A'],
            ['company_name' => 'Company B'],
            ['company_name' => 'Company C']
        ];

        $results = $this->service->generateBulkPdfs($template->id, $data);

        $this->assertCount(3, $results);
        foreach ($results as $result) {
            $this->assertTrue($result->success);
            $this->assertNotNull($result->pdf);
        }
    }

    /** @test */
    public function it_can_handle_pdf_watermarks()
    {
        $template = PdfTemplate::factory()->create();

        $pdf = $this->service->generateWithWatermark($template->id, [
            'company_name' => 'Test Company'
        ], [
            'text' => 'CONFIDENTIAL',
            'position' => 'center',
            'opacity' => 0.5
        ]);

        $this->assertNotNull($pdf);
        // Additional assertions for watermark presence would require PDF parsing
    }

    /** @test */
    public function it_can_handle_pdf_security()
    {
        $template = PdfTemplate::factory()->create();

        $pdf = $this->service->generateWithSecurity($template->id, [
            'company_name' => 'Test Company'
        ], [
            'password' => 'secret123',
            'permissions' => ['print', 'copy']
        ]);

        $this->assertNotNull($pdf);
        $this->assertTrue($pdf->isEncrypted());
    }

    /** @test */
    public function it_can_handle_template_validation()
    {
        $this->expectException(\InvalidArgumentException::class);

        $this->service->createTemplate([
            'name' => 'Invalid Template',
            'content' => '<div>{{invalid_variable}}</div>',
            'variables' => [] // Missing required variable
        ]);
    }

    /** @test */
    public function it_can_handle_generation_queue()
    {
        $template = PdfTemplate::factory()->create();

        $job = $this->service->queueGeneration($template->id, [
            'company_name' => 'Test Company'
        ], [
            'priority' => 'high',
            'notify_email' => 'test@example.com'
        ]);

        $this->assertNotNull($job->id);
        $this->assertEquals('high', $job->priority);
    }

    /** @test */
    public function it_can_handle_template_permissions()
    {
        $template = PdfTemplate::factory()->create();

        $this->service->updatePermissions($template->id, [
            'roles' => ['admin', 'manager'],
            'users' => [1, 2, 3]
        ]);

        $permissions = $this->service->getPermissions($template->id);
        $this->assertCount(2, $permissions->roles);
        $this->assertCount(3, $permissions->users);
    }

    /** @test */
    public function it_can_handle_generation_statistics()
    {
        $template = PdfTemplate::factory()->create();

        // Generate some PDFs
        for ($i = 0; $i < 5; $i++) {
            $this->service->trackGeneration([
                'template_id' => $template->id,
                'user_id' => 1,
                'status' => 'completed',
                'generated_at' => Carbon::now()->subDays($i)
            ]);
        }

        $stats = $this->service->getGenerationStats($template->id, [
            'start_date' => Carbon::now()->subDays(7),
            'end_date' => Carbon::now()
        ]);

        $this->assertEquals(5, $stats->total_generations);
        $this->assertEquals(100, $stats->success_rate);
    }

    /** @test */
    public function it_can_handle_template_dependencies()
    {
        $headerTemplate = PdfTemplate::factory()->create([
            'type' => 'header'
        ]);

        $footerTemplate = PdfTemplate::factory()->create([
            'type' => 'footer'
        ]);

        $mainTemplate = $this->service->createTemplate([
            'name' => 'Main Template',
            'content' => '<div>{{>header}}Content{{>footer}}</div>',
            'dependencies' => [
                'header' => $headerTemplate->id,
                'footer' => $footerTemplate->id
            ]
        ]);

        $dependencies = $this->service->getTemplateDependencies($mainTemplate->id);
        $this->assertCount(2, $dependencies);
    }

    /** @test */
    public function it_can_handle_template_previews()
    {
        $template = PdfTemplate::factory()->create([
            'content' => '<div>{{company_name}}</div>'
        ]);

        $preview = $this->service->generatePreview($template->id, [
            'company_name' => 'Test Company'
        ]);

        $this->assertNotNull($preview);
        $this->assertStringContainsString('Test Company', $preview->html);
    }
} 