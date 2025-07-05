<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Modules\ProjectManagement\Http\Controllers\Api\ProjectApiController;
use Modules\ProjectManagement\Http\Controllers\ProjectDocumentController;
use Modules\ProjectManagement\Http\Controllers\Api\ProjectTaskController;
use Modules\ProjectManagement\Http\Controllers\Api\ProjectResourceController;
use Modules\ProjectManagement\Http\Controllers\Api\MilestoneController;
use Modules\ProjectManagement\Http\Controllers\Api\BudgetController;
use Modules\ProjectManagement\Http\Controllers\Api\ProjectRiskController;
use Modules\ProjectManagement\Http\Controllers\Api\ProjectChatController;
use Modules\ProjectManagement\Http\Controllers\Api\ProjectTaskDependencyController;
use Modules\ProjectManagement\Http\Controllers\Api\ProjectTemplateController;
use Modules\ProjectManagement\Http\Controllers\Api\WidgetController;
use Modules\ProjectManagement\Http\Controllers\Api\FilesWidgetController;
use Modules\ProjectManagement\Http\Controllers\Api\KanbanWidgetController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// API routes uncommented
Route::middleware(['auth:sanctum'])->prefix('v1/projects')->group(function () {
    Route::get('/', [ProjectApiController::class, 'index']);
    Route::post('/', [ProjectApiController::class, 'store']);
    Route::get('/{project}', [ProjectApiController::class, 'show']);
    Route::put('/{project}', [ProjectApiController::class, 'update']);
    Route::delete('/{project}', [ProjectApiController::class, 'destroy']);
});

// Project Document Routes
Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('projects/{project}/documents', [ProjectDocumentController::class, 'store'])
        ->name('project.documents.store');

    Route::put('documents/{document}', [ProjectDocumentController::class, 'update'])
        ->name('project.documents.update');

    Route::delete('documents/{document}', [ProjectDocumentController::class, 'destroy'])
        ->name('project.documents.destroy');

    Route::get('projects/{project}/documents/{category}', [ProjectDocumentController::class, 'getByCategory'])
        ->name('project.documents.by-category');

    Route::get('documents/{document}/versions', [ProjectDocumentController::class, 'getVersions'])
        ->name('project.documents.versions');

    Route::post('documents/{document}/share', [ProjectDocumentController::class, 'share'])
        ->name('project.documents.share');
});

Route::get('/projects/{project}/tasks', [ProjectTaskController::class, 'tasks']);

Route::get('/projects/{project}/resources', [ProjectResourceController::class, 'index']);
Route::post('/projects/{project}/resources', [ProjectResourceController::class, 'store']);

Route::get('/projects/{project}/milestones', [MilestoneController::class, 'index']);
Route::post('/projects/{project}/milestones', [MilestoneController::class, 'store']);
Route::patch('/projects/{project}/milestones/{milestone}', [MilestoneController::class, 'update']);
Route::delete('/projects/{project}/milestones/{milestone}', [MilestoneController::class, 'destroy']);
Route::post('/projects/{project}/milestones/{milestone}/complete', [MilestoneController::class, 'complete']);

Route::get('/projects/{project}/budget', [BudgetController::class, 'show']);
Route::put('/projects/{project}/budget', [BudgetController::class, 'update']);

Route::prefix('projects/{project}')->group(function () {
    Route::apiResource('risks', ProjectRiskController::class);
    Route::get('chats', [ProjectChatController::class, 'index']);
    Route::post('chats', [ProjectChatController::class, 'store']);
    Route::get('documents', [ProjectDocumentController::class, 'index']);
    Route::post('documents', [ProjectDocumentController::class, 'store']);
    Route::get('documents/{document}', [ProjectDocumentController::class, 'show']);
    Route::get('documents/{document}/download', [ProjectDocumentController::class, 'download']);
    Route::post('documents/{document}/version', [ProjectDocumentController::class, 'addVersion']);
});

Route::prefix('tasks/{task}')->group(function () {
    Route::get('dependencies', [ProjectTaskDependencyController::class, 'index']);
    Route::post('dependencies', [ProjectTaskDependencyController::class, 'store']);
    Route::delete('dependencies/{dependsOnId}', [ProjectTaskDependencyController::class, 'destroy']);
});

Route::prefix('project-templates')->group(function () {
    Route::get('/', [ProjectTemplateController::class, 'index']);
    Route::post('/', [ProjectTemplateController::class, 'store']);
    Route::get('{template}', [ProjectTemplateController::class, 'show']);
    Route::put('{template}', [ProjectTemplateController::class, 'update']);
    Route::delete('{template}', [ProjectTemplateController::class, 'destroy']);
    Route::post('{template}/apply', [ProjectTemplateController::class, 'apply']);
});

Route::get('/projects', [WidgetController::class, 'all']);

Route::get('/files/recent', [FilesWidgetController::class, 'recent']);

Route::get('/kanban', [KanbanWidgetController::class, 'index']);



