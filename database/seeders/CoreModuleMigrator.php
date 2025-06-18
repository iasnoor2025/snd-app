<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\File;

class CoreModuleMigrator extends Seeder
{
    /**
     * Run the core module migrations.
     */
    public function run(): void
    {
        $this->command->info('Running Core module essential migrations manually...');

        // Create key Core tables that don't conflict with existing tables
        $this->createCategoriesTable();
        $this->createLocationsTable();
        $this->createSuppliersTable();
        $this->createInventoryItemsTable();
        $this->createFeedbackTable();
        $this->createReportTemplatesTable();

        $this->command->info('Core module essential migrations completed.');
    }

    protected function createCategoriesTable()
    {
        if (!Schema::hasTable('categories')) {
            Schema::create('categories', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('slug')->unique();
                $table->text('description')->nullable();
                $table->unsignedBigInteger('parent_id')->nullable();
                $table->boolean('active')->default(true);
                $table->timestamps();
                $table->softDeletes();

                $table->foreign('parent_id')->references('id')->on('categories')->onDelete('set null');
            });

            $this->command->info('Created categories table');
        }
    }

    protected function createLocationsTable()
    {
        if (!Schema::hasTable('locations')) {
            Schema::create('locations', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('address')->nullable();
                $table->string('city')->nullable();
                $table->string('state')->nullable();
                $table->string('country')->nullable();
                $table->string('postal_code')->nullable();
                $table->decimal('latitude', 10, 7)->nullable();
                $table->decimal('longitude', 10, 7)->nullable();
                $table->text('notes')->nullable();
                $table->boolean('active')->default(true);
                $table->timestamps();
                $table->softDeletes();
            });

            $this->command->info('Created locations table');
        }
    }

    protected function createSuppliersTable()
    {
        if (!Schema::hasTable('suppliers')) {
            Schema::create('suppliers', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('contact_person')->nullable();
                $table->string('email')->nullable();
                $table->string('phone')->nullable();
                $table->string('address')->nullable();
                $table->text('notes')->nullable();
                $table->unsignedBigInteger('location_id')->nullable();
                $table->boolean('active')->default(true);
                $table->timestamps();
                $table->softDeletes();

                $table->foreign('location_id')->references('id')->on('locations')->onDelete('set null');
            });

            $this->command->info('Created suppliers table');
        }
    }

    protected function createInventoryItemsTable()
    {
        if (!Schema::hasTable('inventory_items')) {
            Schema::create('inventory_items', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('sku')->unique();
                $table->text('description')->nullable();
                $table->decimal('cost', 10, 2)->default(0);
                $table->decimal('price', 10, 2)->default(0);
                $table->integer('quantity')->default(0);
                $table->integer('min_quantity')->default(0);
                $table->unsignedBigInteger('category_id')->nullable();
                $table->unsignedBigInteger('supplier_id')->nullable();
                $table->unsignedBigInteger('location_id')->nullable();
                $table->boolean('active')->default(true);
                $table->timestamps();
                $table->softDeletes();

                $table->foreign('category_id')->references('id')->on('categories')->onDelete('set null');
                $table->foreign('supplier_id')->references('id')->on('suppliers')->onDelete('set null');
                $table->foreign('location_id')->references('id')->on('locations')->onDelete('set null');
            });

            $this->command->info('Created inventory_items table');
        }
    }

    protected function createFeedbackTable()
    {
        if (!Schema::hasTable('feedback')) {
            Schema::create('feedback', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id')->nullable();
                $table->string('type'); // product, service, support, etc.
                $table->text('comment');
                $table->integer('rating')->nullable();
                $table->boolean('resolved')->default(false);
                $table->timestamps();
                $table->softDeletes();

                $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
            });

            $this->command->info('Created feedback table');
        }
    }

    protected function createReportTemplatesTable()
    {
        if (!Schema::hasTable('report_templates')) {
            Schema::create('report_templates', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->text('description')->nullable();
                $table->text('content'); // JSON or HTML
                $table->string('type'); // PDF, Excel, etc.
                $table->timestamps();
                $table->softDeletes();
            });

            $this->command->info('Created report_templates table');
        }
    }
}
