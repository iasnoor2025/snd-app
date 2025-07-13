<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        // Rename positions table to designations
        // Schema::rename('positions', 'designations');
        // Rename position_id columns to designation_id in related tables
        // if (Schema::hasColumn('employees', 'position_id')) {
        //     Schema::table('employees', function (Blueprint $table) {
        //         $table->renameColumn('position_id', 'designation_id');
        //     });
        // }
        // If there are other related tables, add similar logic here
    }

    public function down()
    {
        // Rename designations table back to positions
        // Schema::rename('designations', 'positions');
        // Rename designation_id columns back to position_id in related tables
        // if (Schema::hasColumn('employees', 'designation_id')) {
        //     Schema::table('employees', function (Blueprint $table) {
        //         $table->renameColumn('designation_id', 'position_id');
        //     });
        // }
        // If there are other related tables, add similar logic here
    }
};
