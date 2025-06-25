<?php

namespace Tests\Integration\Api;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use App\Models\User;
use Modules\EmployeeManagement\Domain\Models\Employee;
use Modules\EmployeeManagement\Domain\Models\EmployeeDocument;
use Modules\ProjectManagement\Domain\Models\Project;
use Modules\ProjectManagement\Domain\Models\ProjectDocument;
use Modules\EquipmentManagement\Domain\Models\Equipment;
use Modules\EquipmentManagement\Domain\Models\EquipmentMedia;

class DocumentManagementTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $employee;
    protected $project;
    protected $equipment;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('documents');

        $this->user = User::factory()->create(['role' => 'admin']);
        $this->employee = Employee::factory()->create();
        $this->project = Project::factory()->create();
        $this->equipment = Equipment::factory()->create();
    }

    /** @test */
    public function it_can_upload_employee_document()
    {
        $this->actingAs($this->user);

        $file = UploadedFile::fake()->create('contract.pdf', 100);

        $response = $this->postJson('/api/employees/'.$this->employee->id.'/documents', [
            'document' => $file,
            'type' => 'contract',
            'description' => 'Employment Contract'
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'file_name',
                    'file_path',
                    'type',
                    'description'
                ]
            ]);

        $this->assertDatabaseHas('employee_documents', [
            'employee_id' => $this->employee->id,
            'type' => 'contract'
        ]);

        Storage::disk('documents')->assertExists($response->json('data.file_path'));
    }

    /** @test */
    public function it_can_upload_project_document()
    {
        $this->actingAs($this->user);

        $file = UploadedFile::fake()->create('specs.pdf', 100);

        $response = $this->postJson('/api/projects/'.$this->project->id.'/documents', [
            'document' => $file,
            'type' => 'specification',
            'version' => '1.0',
            'description' => 'Project Specifications'
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'file_name',
                    'file_path',
                    'type',
                    'version',
                    'description'
                ]
            ]);

        $this->assertDatabaseHas('project_documents', [
            'project_id' => $this->project->id,
            'type' => 'specification',
            'version' => '1.0'
        ]);

        Storage::disk('documents')->assertExists($response->json('data.file_path'));
    }

    /** @test */
    public function it_can_upload_equipment_media()
    {
        $this->actingAs($this->user);

        $file = UploadedFile::fake()->image('equipment.jpg', 800, 600);

        $response = $this->postJson('/api/equipment/'.$this->equipment->id.'/media', [
            'media' => $file,
            'type' => 'image',
            'description' => 'Equipment Photo'
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'file_name',
                    'file_path',
                    'type',
                    'description',
                    'thumbnails'
                ]
            ]);

        $this->assertDatabaseHas('equipment_media', [
            'equipment_id' => $this->equipment->id,
            'type' => 'image'
        ]);

        Storage::disk('documents')->assertExists($response->json('data.file_path'));
    }

    /** @test */
    public function it_validates_document_type()
    {
        $this->actingAs($this->user);

        $file = UploadedFile::fake()->create('malicious.exe', 100);

        $response = $this->postJson('/api/employees/'.$this->employee->id.'/documents', [
            'document' => $file,
            'type' => 'contract'
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['document']);
    }

    /** @test */
    public function it_validates_document_size()
    {
        $this->actingAs($this->user);

        $file = UploadedFile::fake()->create('large.pdf', 11 * 1024); // 11MB

        $response = $this->postJson('/api/employees/'.$this->employee->id.'/documents', [
            'document' => $file,
            'type' => 'contract'
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['document']);
    }

    /** @test */
    public function it_can_list_employee_documents()
    {
        $this->actingAs($this->user);

        EmployeeDocument::factory()->count(3)->create([
            'employee_id' => $this->employee->id
        ]);

        $response = $this->getJson('/api/employees/'.$this->employee->id.'/documents');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data')
            ->assertJsonStructure([
                'data' => [[
                    'id',
                    'file_name',
                    'type',
                    'description',
                    'created_at'
                ]]
            ]);
    }

    /** @test */
    public function it_can_download_document()
    {
        $this->actingAs($this->user);

        $document = EmployeeDocument::factory()->create([
            'employee_id' => $this->employee->id
        ]);

        Storage::disk('documents')->put($document->file_path, 'test content');

        $response = $this->getJson('/api/documents/'.$document->id.'/download');

        $response->assertStatus(200)
            ->assertHeader('Content-Type', 'application/pdf')
            ->assertHeader('Content-Disposition');
    }

    /** @test */
    public function it_can_delete_document()
    {
        $this->actingAs($this->user);

        $document = EmployeeDocument::factory()->create([
            'employee_id' => $this->employee->id
        ]);

        Storage::disk('documents')->put($document->file_path, 'test content');

        $response = $this->deleteJson('/api/documents/'.$document->id);

        $response->assertStatus(200);

        $this->assertDatabaseMissing('employee_documents', ['id' => $document->id]);
        Storage::disk('documents')->assertMissing($document->file_path);
    }

    /** @test */
    public function it_enforces_document_permissions()
    {
        $regularUser = User::factory()->create(['role' => 'user']);
        $this->actingAs($regularUser);

        $document = EmployeeDocument::factory()->create([
            'employee_id' => $this->employee->id,
            'is_confidential' => true
        ]);

        $response = $this->getJson('/api/documents/'.$document->id);

        $response->assertStatus(403);
    }

    /** @test */
    public function it_can_update_document_metadata()
    {
        $this->actingAs($this->user);

        $document = EmployeeDocument::factory()->create([
            'employee_id' => $this->employee->id
        ]);

        $response = $this->patchJson('/api/documents/'.$document->id, [
            'description' => 'Updated description',
            'type' => 'updated_type'
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'description' => 'Updated description',
                    'type' => 'updated_type'
                ]
            ]);

        $this->assertDatabaseHas('employee_documents', [
            'id' => $document->id,
            'description' => 'Updated description',
            'type' => 'updated_type'
        ]);
    }

    /** @test */
    public function it_can_handle_document_versioning()
    {
        $this->actingAs($this->user);

        // Upload initial version
        $file1 = UploadedFile::fake()->create('document_v1.pdf', 100);
        $response1 = $this->postJson('/api/projects/'.$this->project->id.'/documents', [
            'document' => $file1,
            'type' => 'specification',
            'version' => '1.0'
        ]);

        // Upload new version
        $file2 = UploadedFile::fake()->create('document_v2.pdf', 100);
        $response2 = $this->postJson('/api/projects/'.$this->project->id.'/documents', [
            'document' => $file2,
            'type' => 'specification',
            'version' => '2.0',
            'previous_version_id' => $response1->json('data.id')
        ]);

        $response2->assertStatus(201);

        $this->assertDatabaseHas('project_documents', [
            'version' => '2.0',
            'previous_version_id' => $response1->json('data.id')
        ]);
    }

    /** @test */
    public function it_can_generate_document_preview()
    {
        $this->actingAs($this->user);

        $document = ProjectDocument::factory()->create([
            'project_id' => $this->project->id
        ]);

        Storage::disk('documents')->put($document->file_path, 'test content');

        $response = $this->getJson('/api/documents/'.$document->id.'/preview');

        $response->assertStatus(200)
            ->assertHeader('Content-Type', 'image/png');
    }

    /** @test */
    public function it_tracks_document_access()
    {
        $this->actingAs($this->user);

        $document = EmployeeDocument::factory()->create([
            'employee_id' => $this->employee->id
        ]);

        $this->getJson('/api/documents/'.$document->id);

        $this->assertDatabaseHas('document_access_logs', [
            'document_id' => $document->id,
            'user_id' => $this->user->id,
            'action' => 'view'
        ]);
    }
} 