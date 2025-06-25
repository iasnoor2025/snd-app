<?php

namespace Modules\ProjectManagement\Tests\Unit\Models;

use Tests\TestCase;
use Modules\ProjectManagement\Models\Project;
use Modules\ProjectManagement\Models\ProjectDocument;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class ProjectDocumentTest extends TestCase
{
    use RefreshDatabase;

    protected ProjectDocument $document;
    protected Project $project;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->project = Project::factory()->create([
            'name' => 'Test Project',
            'code' => 'PRJ001',
            'status' => 'active'
        ]);
        
        $this->document = ProjectDocument::factory()->create([
            'project_id' => $this->project->id,
            'title' => 'Project Contract',
            'type' => 'contract',
            'file_path' => 'projects/PRJ001/contract.pdf',
            'version' => '1.0',
            'status' => 'active',
            'metadata' => [
                'author' => 'John Doe',
                'department' => 'Legal',
                'tags' => ['contract', 'legal', 'signed']
            ]
        ]);

        // Create necessary directories
        Storage::makeDirectory('projects/PRJ001');
    }

    protected function tearDown(): void
    {
        Storage::deleteDirectory('projects');
        parent::tearDown();
    }

    /** @test */
    public function it_has_correct_fillable_attributes()
    {
        $fillable = [
            'project_id',
            'title',
            'type',
            'file_path',
            'version',
            'status',
            'metadata',
            'description',
            'expiry_date',
            'created_by',
            'updated_by'
        ];

        $this->assertEquals($fillable, $this->document->getFillable());
    }

    /** @test */
    public function it_has_correct_casts()
    {
        $expectedCasts = [
            'id' => 'integer',
            'project_id' => 'integer',
            'metadata' => 'array',
            'expiry_date' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'created_by' => 'integer',
            'updated_by' => 'integer'
        ];

        $this->assertEquals($expectedCasts, $this->document->getCasts());
    }

    /** @test */
    public function it_belongs_to_project()
    {
        $this->assertInstanceOf(BelongsTo::class, $this->document->project());
        $this->assertInstanceOf(Project::class, $this->document->project);
        $this->assertEquals($this->project->id, $this->document->project->id);
    }

    /** @test */
    public function it_can_scope_by_type()
    {
        ProjectDocument::factory()->create(['type' => 'invoice']);
        ProjectDocument::factory()->create(['type' => 'contract']);

        $contracts = ProjectDocument::byType('contract')->get();

        $this->assertEquals(2, $contracts->count());
        $this->assertEquals('contract', $contracts->first()->type);
    }

    /** @test */
    public function it_can_scope_by_status()
    {
        ProjectDocument::factory()->create(['status' => 'archived']);
        ProjectDocument::factory()->create(['status' => 'active']);

        $activeDocuments = ProjectDocument::byStatus('active')->get();

        $this->assertEquals(2, $activeDocuments->count());
        $this->assertEquals('active', $activeDocuments->first()->status);
    }

    /** @test */
    public function it_can_get_file_url()
    {
        $expectedUrl = url('storage/projects/PRJ001/contract.pdf');
        $this->assertEquals($expectedUrl, $this->document->file_url);
    }

    /** @test */
    public function it_can_get_download_url()
    {
        $expectedUrl = route('project.documents.download', $this->document->id);
        $this->assertEquals($expectedUrl, $this->document->download_url);
    }

    /** @test */
    public function it_can_check_if_expired()
    {
        $this->document->expiry_date = now()->subDay();
        $this->assertTrue($this->document->isExpired());

        $this->document->expiry_date = now()->addDay();
        $this->assertFalse($this->document->isExpired());
    }

    /** @test */
    public function it_can_check_if_expiring_soon()
    {
        $this->document->expiry_date = now()->addDays(25);
        $this->assertTrue($this->document->isExpiringSoon());

        $this->document->expiry_date = now()->addDays(40);
        $this->assertFalse($this->document->isExpiringSoon());
    }

    /** @test */
    public function it_can_get_metadata_value()
    {
        $this->assertEquals('John Doe', $this->document->getMetadata('author'));
        $this->assertEquals(['contract', 'legal', 'signed'], $this->document->getMetadata('tags'));
        $this->assertNull($this->document->getMetadata('non_existent'));
    }

    /** @test */
    public function it_can_update_metadata()
    {
        $this->document->updateMetadata('reviewer', 'Jane Smith');
        $this->assertEquals('Jane Smith', $this->document->getMetadata('reviewer'));

        $this->document->updateMetadata('tags', ['contract', 'updated']);
        $this->assertEquals(['contract', 'updated'], $this->document->getMetadata('tags'));
    }

    /** @test */
    public function it_can_get_version_history()
    {
        ProjectDocument::factory()->create([
            'project_id' => $this->project->id,
            'title' => 'Project Contract',
            'type' => 'contract',
            'version' => '1.1',
        ]);

        ProjectDocument::factory()->create([
            'project_id' => $this->project->id,
            'title' => 'Project Contract',
            'type' => 'contract',
            'version' => '1.2',
        ]);

        $history = $this->document->getVersionHistory();

        $this->assertCount(3, $history);
        $this->assertEquals('1.2', $history->first()->version);
        $this->assertEquals('1.0', $history->last()->version);
    }

    /** @test */
    public function it_can_get_related_documents()
    {
        ProjectDocument::factory()->create([
            'project_id' => $this->project->id,
            'type' => 'contract',
            'metadata' => ['related_to' => $this->document->id]
        ]);

        $related = $this->document->getRelatedDocuments();

        $this->assertCount(1, $related);
        $this->assertEquals('contract', $related->first()->type);
    }

    /** @test */
    public function it_can_check_document_permissions()
    {
        $this->document->metadata = array_merge(
            $this->document->metadata,
            ['permissions' => ['view' => ['legal', 'management']]]
        );

        $this->assertTrue($this->document->hasPermission('view', 'legal'));
        $this->assertFalse($this->document->hasPermission('view', 'engineering'));
    }

    /** @test */
    public function it_can_generate_audit_trail()
    {
        $this->document->metadata = array_merge(
            $this->document->metadata,
            [
                'audit_trail' => [
                    ['action' => 'created', 'by' => 1, 'at' => now()->subDays(2)],
                    ['action' => 'updated', 'by' => 2, 'at' => now()->subDay()]
                ]
            ]
        );

        $auditTrail = $this->document->getAuditTrail();

        $this->assertCount(2, $auditTrail);
        $this->assertEquals('updated', $auditTrail[1]['action']);
    }

    /** @test */
    public function it_can_handle_document_workflow()
    {
        $this->document->updateWorkflowStatus('review');
        $this->assertEquals('review', $this->document->status);

        $this->document->addWorkflowComment('Ready for approval');
        $this->assertArrayHasKey('workflow_comments', $this->document->metadata);
    }
} 