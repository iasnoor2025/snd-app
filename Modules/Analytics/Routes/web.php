<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Analytics Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your Analytics module.
| These routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::prefix('analytics')->name('analytics.')->middleware(['auth', 'verified'])->group(function () {
    Route::get('/', function () {
        return inertia('Analytics/Index');
    })->name('index');

    Route::get('/dashboard', function () {
        return inertia('Analytics/Dashboard');
    })->name('dashboard');

    Route::get('/reports', function () {
        return inertia('Analytics/Reports');
    })->name('reports');
});
