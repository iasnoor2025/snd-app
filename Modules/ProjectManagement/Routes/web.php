<?php

use Illuminate\Support\Facades\Route;
use Modules\ProjectManagement\Http\Controllers\ProjectController;
use Modules\ProjectManagement\Http\Controllers\ProjectResourceController;
use Modules\ProjectManagement\Http\Controllers\ManpowerController;
use Modules\ProjectManagement\Http\Controllers\EquipmentController;
use Modules\ProjectManagement\Http\Controllers\MaterialController;
use Modules\ProjectManagement\Http\Controllers\FuelController;
use Modules\ProjectManagement\Http\Controllers\ExpenseController;
use Modules\ProjectManagement\Http\Controllers\TaskController;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

// Web routes uncommented
Route::prefix('projects')->name('projects.')->middleware(['web', 'auth'])->group(function() {
    // Project routes
    Route::get('/', [ProjectController::class, 'index'])
        ->middleware('permission:project.view')
        ->name('index');
    Route::get('/create', [ProjectController::class, 'create'])
        ->middleware('permission:project.create')
        ->name('create');
    Route::post('/', [ProjectController::class, 'store'])
        ->middleware('permission:project.create')
        ->name('store');
    Route::get('/{project}', [ProjectController::class, 'show'])
        ->middleware('permission:project.view')
        ->name('show')->where('project', '[0-9]+');
    Route::get('/{project}/edit', [ProjectController::class, 'edit'])
        ->middleware('permission:project.edit')
        ->name('edit')->where('project', '[0-9]+');
    Route::put('/{project}', [ProjectController::class, 'update'])
        ->middleware('permission:project.edit')
        ->name('update')->where('project', '[0-9]+');
    Route::delete('/{project}', [ProjectController::class, 'destroy'])
        ->middleware('permission:project.delete')
        ->name('destroy')->where('project', '[0-9]+');

    // Project Progress Demo Route
    Route::get('/progress/demo', function() {
        return Inertia::render('ProjectProgressDemo');
    })->name('progress.demo');

    // Project resources routes
    Route::get('/{project}/resources', [ProjectResourceController::class, 'index'])
        ->middleware('permission:project.view')
        ->name('resources');

    // Generic resource destroy route to handle delete requests from the main Resources component
    Route::delete('/{project}/resources/{resource}', [ProjectResourceController::class, 'destroy'])
        ->middleware('permission:project.delete')
        ->name('resources.destroy');

    // Project tasks routes
    Route::get('/{project}/tasks', [TaskController::class, 'index'])
        ->middleware('permission:tasks.view')
        ->name('tasks.index');
    Route::post('/{project}/tasks', [TaskController::class, 'store'])
        ->middleware('permission:tasks.create')
        ->name('tasks.store');
    Route::put('/{project}/tasks/{task}', [TaskController::class, 'update'])
        ->middleware('permission:tasks.edit')
        ->name('tasks.update')
        ->where('task', '[0-9]+');
    Route::put('/{project}/tasks/{task}/status', [TaskController::class, 'updateStatus'])
        ->middleware('permission:tasks.edit')
        ->name('tasks.status')
        ->where('task', '[0-9]+');
    Route::delete('/{project}/tasks/{task}', [TaskController::class, 'destroy'])
        ->middleware('permission:tasks.delete')
        ->name('tasks.destroy')
        ->where('task', '[0-9]+');

    // Project resource routes grouped by type
    Route::prefix('{project}/resources')->name('resources.')->group(function () {
        // Manpower routes
        Route::get('/manpower', [ManpowerController::class, 'index'])
            ->middleware('permission:manpower.view')
            ->name('manpower.index');
        Route::post('/manpower', [ProjectResourceController::class, 'storeManpower'])
            ->middleware('permission:manpower.create')
            ->name('manpower.store');
        Route::put('/manpower/{manpower}', [ProjectResourceController::class, 'updateManpower'])
            ->middleware('permission:manpower.edit')
            ->name('manpower.update');

        // Equipment routes
        Route::get('/equipment', [EquipmentController::class, 'index'])
            ->middleware('permission:equipment.view')
            ->name('project.equipment.index');
        Route::post('/equipment', [ProjectResourceController::class, 'storeEquipment'])
            ->middleware('permission:equipment.create')
            ->name('equipment.store');
        Route::put('/equipment/{equipment}', [ProjectResourceController::class, 'updateEquipment'])
            ->middleware('permission:equipment.edit')
            ->name('equipment.update');
        Route::delete('/equipment/{equipment}', [ProjectResourceController::class, 'destroyEquipment'])
            ->middleware('permission:equipment.delete')
            ->name('equipment.destroy');

        // Material routes
        Route::get('/material', [MaterialController::class, 'index'])
            ->middleware('permission:material.view')
            ->name('material.index');
        Route::post('/material', [ProjectResourceController::class, 'storeMaterial'])
            ->middleware('permission:material.create')
            ->name('material.store');
        Route::put('/material/{material}', [ProjectResourceController::class, 'updateMaterial'])
            ->middleware('permission:material.edit')
            ->name('material.update');
        Route::delete('/material/{material}', [ProjectResourceController::class, 'destroyMaterial'])
            ->middleware('permission:material.delete')
            ->name('material.destroy');

        // Fuel routes
        Route::get('/fuel', [FuelController::class, 'index'])
            ->middleware('permission:fuel.view')
            ->name('fuel.index');
        Route::post('/fuel', [ProjectResourceController::class, 'storeFuel'])
            ->middleware('permission:fuel.create')
            ->name('fuel.store');
        Route::put('/fuel/{fuel}', [ProjectResourceController::class, 'updateFuel'])
            ->middleware('permission:fuel.edit')
            ->name('fuel.update');
        Route::delete('/fuel/{fuel}', [ProjectResourceController::class, 'destroyFuel'])
            ->middleware('permission:fuel.delete')
            ->name('fuel.destroy');

        // Expense routes
        Route::get('/expense', [ExpenseController::class, 'index'])
            ->middleware('permission:expense.view')
            ->name('expense.index');
        Route::post('/expense', [ProjectResourceController::class, 'storeExpense'])
            ->middleware('permission:expense.create')
            ->name('expense.store');
        Route::put('/expense/{expense}', [ProjectResourceController::class, 'updateExpense'])
            ->middleware('permission:expense.edit')
            ->name('expense.update');
        Route::delete('/expense/{expense}', [ProjectResourceController::class, 'destroyExpense'])
            ->middleware('permission:expense.delete')
            ->name('expense.destroy');

        // Generic resource delete route with type parameter
        // Route::delete('/{type}/{resource}', [ProjectResourceController::class, 'destroyResource'])
        //     ->middleware('permission:project.delete')
        //     ->name('resource.destroy');
    });

    // Project Reports routes
    Route::get('/reports', function() {
        return Inertia::render('Projects/Reports/Index');
    })->middleware('permission:project.view')->name('reports');

    Route::post('/reports/generate', function() {
        Route::get('/projects/{project}/report', [ProjectController::class, 'generateReport'])
    ->middleware('permission:projects.view')
    ->name('projects.report');
        return response()->json(['message' => 'Project reports feature coming soon']);
    })->middleware('permission:project.view')->name('reports.generate');
});

