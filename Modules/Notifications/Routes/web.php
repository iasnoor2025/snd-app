<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group.
|
*/

use Illuminate\Support\Facades\Route;

// TODO: Temporarily comment out all routes in this file to debug EmployeeManagement API and missing NotificationsController

Route::prefix('notifications')->name('notifications.')->middleware(['web', 'auth'])->group(function () {
    // User notifications management
    // Route::get('/', 'NotificationsController@index')->name('index');
    // Route::get('/unread', 'NotificationsController@unread')->name('unread');
    // Route::post('/mark-as-read/{notification}', 'NotificationsController@markAsRead')->name('mark-as-read');
    // Route::post('/mark-all-as-read', 'NotificationsController@markAllAsRead')->name('mark-all-as-read');
    // Route::delete('/{notification}', 'NotificationsController@destroy')->name('destroy');
    // Route::delete('/clear-all', 'NotificationsController@clearAll')->name('clear-all');

    // Notification preferences
    // Route::get('/preferences', 'NotificationPreferencesController@index')->name('preferences');
    // Route::post('/preferences', 'NotificationPreferencesController@update')->name('preferences.update');
    // Route::post('/preferences/reset', 'NotificationPreferencesController@resetToDefault')->name('preferences.reset');

    // Notification channels
    // Route::get('/channels', 'NotificationChannelsController@index')->name('channels');
    // Route::post('/channels/email/verify', 'NotificationChannelsController@verifyEmail')->name('channels.email.verify');
    // Route::post('/channels/sms/verify', 'NotificationChannelsController@verifySms')->name('channels.sms.verify');
    // Route::post('/channels/update', 'NotificationChannelsController@update')->name('channels.update');

    // Admin notification settings (accessible to admin users)
    // Route::middleware(['can:manage notifications'])->prefix('admin')->name('admin.')->group(function () {
    //     Route::get('/settings', 'NotificationAdminController@settings')->name('settings');
    //     Route::post('/settings', 'NotificationAdminController@updateSettings')->name('settings.update');
    //     Route::get('/templates', 'NotificationAdminController@templates')->name('templates');
    //     Route::get('/templates/{template}', 'NotificationAdminController@editTemplate')->name('templates.edit');
    //     Route::put('/templates/{template}', 'NotificationAdminController@updateTemplate')->name('templates.update');
    // });
});



