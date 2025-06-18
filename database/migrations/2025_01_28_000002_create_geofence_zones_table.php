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
        Schema::create('geofence_zones', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();

            // Center point of the geofence
            $table->decimal('center_latitude', 10, 8);
            $table->decimal('center_longitude', 11, 8);

            // Radius in meters
            $table->integer('radius_meters')->default(100);

            // Polygon coordinates for complex shapes (JSON array of lat/lng points)
            $table->json('polygon_coordinates')->nullable();

            // Zone type: circular, polygon
            $table->enum('zone_type', ['circular', 'polygon'])->default('circular');

            // Associated entities
            $table->unsignedBigInteger('project_id')->nullable();
            $table->unsignedBigInteger('site_id')->nullable();
            $table->string('site_address')->nullable();

            // Zone settings
            $table->boolean('is_active')->default(true);
            $table->boolean('strict_enforcement')->default(false)->comment('Prevent time entry outside zone');
            $table->boolean('allow_buffer_zone')->default(true);
            $table->integer('buffer_meters')->default(50)->comment('Additional buffer around main zone');

            // Time restrictions
            $table->time('active_from')->nullable()->comment('Zone active from time');
            $table->time('active_until')->nullable()->comment('Zone active until time');
            $table->json('active_days')->nullable()->comment('Days of week when zone is active');

            // Monitoring
            $table->boolean('send_alerts')->default(true);
            $table->json('alert_recipients')->nullable()->comment('User IDs to notify on violations');

            // Metadata
            $table->unsignedBigInteger('created_by');
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['project_id', 'is_active']);
            $table->index(['center_latitude', 'center_longitude']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('geofence_zones');
    }
};
