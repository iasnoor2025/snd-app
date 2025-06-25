<?php

namespace Modules\ProjectManagement\Tests\Integration\Database;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Modules\ProjectManagement\Domain\Models\Project;
use Modules\ProjectManagement\Domain\Models\ProjectDocument;
use Modules\ProjectManagement\Repositories\ProjectDocumentRepository;
use Illuminate\Database\QueryException;
use Carbon\Carbon;

class ProjectDocumentRepositoryTest extends TestCase
{
    use RefreshDatabase;

    protected $repository;
    protected $project;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->repository = app(ProjectDocumentRepository::class);
        $this->project = Project::factory()->create();
    }

    /** @test */
    public function it_can_create_document_with_transaction()
    {
        DB::beginTransaction();

        try {
            $document = $this->repository->create([
                'project_id' => $this->project->id,
                'type' => 'specification',
                'file_name' => 'specs.pdf',
                'file_path' => 'documents/projects/specs.pdf',
                'description' => 'Project Specifications'
            ]);

            $this->assertInstanceOf(ProjectDocument::class, $document);
            $this->assertEquals('specification', $document->type);

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /** @test */
    public function it_enforces_foreign_key_constraints()
    {
        $this->expectException(QueryException::class);

        $this->repository->create([
            'project_id' => 999999, // Non-existent project
            'type' => 'specification',
            'file_name' => 'specs.pdf',
            'file_path' => 'path/to/file.pdf'
        ]);
    }

    /** @test */
    public function it_can_retrieve_documents_with_relations()
    {
        $document = ProjectDocument::factory()->create([
            'project_id' => $this->project->id
        ]);

        $retrieved = $this->repository->findWithRelations($document->id, ['project']);

        $this->assertInstanceOf(ProjectDocument::class, $retrieved);
        $this->assertTrue($retrieved->relationLoaded('project'));
        $this->assertEquals($this->project->id, $retrieved->project->id);
    }

    /** @test */
    public function it_can_handle_document_versioning()
    {
        // Create initial version
        $v1 = $this->repository->create([
            'project_id' => $this->project->id,
            'type' => 'specification',
            'file_name' => 'specs_v1.pdf',
            'version' => '1.0'
        ]);

        // Create new version
        $v2 = $this->repository->createNewVersion($v1->id, [
            'file_name' => 'specs_v2.pdf',
            'version' => '2.0',
            'changes' => 'Updated requirements'
        ]);

        $this->assertEquals('2.0', $v2->version);
        $this->assertEquals($v1->id, $v2->previous_version_id);

        // Get version history
        $history = $this->repository->getVersionHistory($v2->id);
        $this->assertCount(2, $history);
    }

    /** @test */
    public function it_can_handle_document_approvals()
    {
        $document = ProjectDocument::factory()->create([
            'project_id' => $this->project->id,
            'status' => 'pending_approval'
        ]);

        $this->repository->addApproval($document->id, [
            'user_id' => 1,
            'status' => 'approved',
            'comments' => 'Looks good'
        ]);

        $approvals = $this->repository->getApprovals($document->id);
        $this->assertCount(1, $approvals);
        $this->assertEquals('approved', $approvals[0]->status);
    }

    /** @test */
    public function it_can_handle_document_sharing()
    {
        $document = ProjectDocument::factory()->create([
            'project_id' => $this->project->id
        ]);

        $this->repository->shareDocument($document->id, [
            'shared_with' => [1, 2, 3],
            'expires_at' => Carbon::now()->addDays(7),
            'permissions' => ['view', 'download']
        ]);

        $shares = $this->repository->getShares($document->id);
        $this->assertCount(3, $shares);
    }

    /** @test */
    public function it_can_handle_document_tags()
    {
        $document = ProjectDocument::factory()->create([
            'project_id' => $this->project->id
        ]);

        $this->repository->addTags($document->id, ['important', 'reviewed', 'final']);

        $tags = $this->repository->getTags($document->id);
        $this->assertCount(3, $tags);

        // Search by tags
        $documents = $this->repository->findByTags(['important', 'final']);
        $this->assertCount(1, $documents);
    }

    /** @test */
    public function it_can_handle_document_comments()
    {
        $document = ProjectDocument::factory()->create([
            'project_id' => $this->project->id
        ]);

        $this->repository->addComment($document->id, [
            'user_id' => 1,
            'content' => 'Please review section 3',
            'position' => ['page' => 2, 'x' => 100, 'y' => 200]
        ]);

        $comments = $this->repository->getComments($document->id);
        $this->assertCount(1, $comments);
        $this->assertEquals('Please review section 3', $comments[0]->content);
    }

    /** @test */
    public function it_can_handle_document_workflows()
    {
        $document = ProjectDocument::factory()->create([
            'project_id' => $this->project->id
        ]);

        $workflow = $this->repository->createWorkflow($document->id, [
            'steps' => [
                ['role' => 'manager', 'action' => 'review'],
                ['role' => 'director', 'action' => 'approve']
            ]
        ]);

        $this->assertCount(2, $workflow->steps);

        // Progress workflow
        $this->repository->progressWorkflow($document->id, [
            'step_id' => $workflow->steps[0]->id,
            'user_id' => 1,
            'action' => 'completed',
            'comments' => 'Reviewed and approved'
        ]);

        $status = $this->repository->getWorkflowStatus($document->id);
        $this->assertEquals(1, $status['completed_steps']);
        $this->assertEquals(2, $status['total_steps']);
    }

    /** @test */
    public function it_can_handle_document_dependencies()
    {
        $document1 = ProjectDocument::factory()->create([
            'project_id' => $this->project->id,
            'type' => 'requirements'
        ]);

        $document2 = ProjectDocument::factory()->create([
            'project_id' => $this->project->id,
            'type' => 'design'
        ]);

        $this->repository->addDependency($document2->id, $document1->id, [
            'type' => 'requires',
            'description' => 'Design depends on requirements'
        ]);

        $dependencies = $this->repository->getDependencies($document2->id);
        $this->assertCount(1, $dependencies);
        $this->assertEquals($document1->id, $dependencies[0]->required_document_id);
    }

    /** @test */
    public function it_can_handle_document_revisions()
    {
        $document = ProjectDocument::factory()->create([
            'project_id' => $this->project->id
        ]);

        $revision = $this->repository->createRevision($document->id, [
            'changes' => [
                'content' => 'Updated section 4.2',
                'author_id' => 1
            ]
        ]);

        $this->assertNotNull($revision);

        $revisions = $this->repository->getRevisions($document->id);
        $this->assertCount(1, $revisions);
    }

    /** @test */
    public function it_can_handle_document_audit_trail()
    {
        $document = ProjectDocument::factory()->create([
            'project_id' => $this->project->id
        ]);

        $this->repository->logAuditEvent($document->id, [
            'user_id' => 1,
            'action' => 'modified',
            'details' => 'Updated project timeline'
        ]);

        $audit = $this->repository->getAuditTrail($document->id);
        $this->assertCount(1, $audit);
        $this->assertEquals('modified', $audit[0]->action);
    }

    /** @test */
    public function it_can_handle_document_metadata()
    {
        $document = ProjectDocument::factory()->create([
            'project_id' => $this->project->id
        ]);

        $this->repository->updateMetadata($document->id, [
            'author' => 'John Doe',
            'department' => 'Engineering',
            'review_date' => '2024-03-21'
        ]);

        $metadata = $this->repository->getMetadata($document->id);
        $this->assertEquals('John Doe', $metadata['author']);
        $this->assertEquals('Engineering', $metadata['department']);
    }
} 