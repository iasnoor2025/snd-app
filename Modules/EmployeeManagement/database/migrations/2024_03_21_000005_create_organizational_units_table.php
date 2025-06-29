<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateOrganizationalUnitsTable extends Migration
{
    public function up(): void
    {
        Schema::create('organizational_units', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->string('type');
            $table->foreignId('parent_id')->nullable()->constrained('organizational_units')->onDelete('cascade');
            $table->foreignId('manager_id')->nullable()->constrained('employees')->onDelete('set null');
            $table->integer('level')->default(0);
            $table->text('description')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['parent_id', 'type']);
            $table->index('manager_id');
            $table->index('level');
        });

        // Add unit_id to employees table
        Schema::table('employees', function (Blueprint $table) {
            $table->foreignId('unit_id')->nullable()->after('id')->constrained('organizational_units')->onDelete('set null');
            $table->index('unit_id');
        });
    }

    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->dropForeign(['unit_id']);
            $table->dropColumn('unit_id');
        });

        Schema::dropIfExists('organizational_units');
    }
}
