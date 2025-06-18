<?php

namespace Modules\TimesheetManagement\Database\Migrations;

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('timesheets', function (Blueprint $table) {
            // GPS and Location tracking
            $table->decimal('start_latitude', 10, 8)->nullable()->after('location');
            $table->decimal('start_longitude', 11, 8)->nullable()->after('start_latitude');
            $table->decimal('end_latitude', 10, 8)->nullable()->after('start_longitude');
            $table->decimal('end_longitude', 11, 8)->nullable()->after('end_latitude');
            $table->string('start_address')->nullable()->after('end_longitude');
            $table->string('end_address')->nullable()->after('start_address');

            // Geofencing
            $table->boolean('is_within_geofence')->default(false)->after('end_address');
            $table->json('geofence_violations')->nullable()->after('is_within_geofence');
            $table->decimal('distance_from_site', 8, 2)->nullable()->comment('Distance in meters')->after('geofence_violations');

            // Mobile app tracking
            $table->string('device_id')->nullable()->after('distance_from_site');
            $table->string('app_version')->nullable()->after('device_id');
            $table->boolean('is_offline_entry')->default(false)->after('app_version');
            $table->timestamp('synced_at')->nullable()->after('is_offline_entry');

            // Enhanced GPS logs
            $table->json('location_history')->nullable()->comment('GPS tracking during work')->after('synced_at');
            $table->integer('accuracy_meters')->nullable()->comment('GPS accuracy in meters')->after('location_history');

            // Work site verification
            $table->boolean('location_verified')->default(false)->after('accuracy_meters');
            $table->string('verification_method')->nullable()->comment('manual, gps, qr_code, nfc')->after('location_verified');
            $table->json('verification_data')->nullable()->after('verification_method');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('timesheets', function (Blueprint $table) {
            $table->dropColumn([
                'start_latitude',
                'start_longitude',
                'end_latitude',
                'end_longitude',
                'start_address',
                'end_address',
                'is_within_geofence',
                'geofence_violations',
                'distance_from_site',
                'device_id',
                'app_version',
                'is_offline_entry',
                'synced_at',
                'location_history',
                'accuracy_meters',
                'location_verified',
                'verification_method',
                'verification_data'
            ]);
        });
    }
};
