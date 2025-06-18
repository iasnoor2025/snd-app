<?php
namespace Modules\Core\database\migrations;

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
        Schema::create('feedback_forms', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('type')->default('general');
            $table->boolean('is_active')->default(true);
            $table->string('title');
            $table->json('fields');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('feedback_form_id');
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('customer_id')->nullable();
            $table->unsignedBigInteger('equipment_id')->nullable();
            $table->string('status')->default('pending');
            $table->json('submission_data');
            $table->decimal('rating', 3, 1)->nullable();
            $table->string('rating_type')->nullable();
            $table->text('comments')->nullable();
            $table->unsignedBigInteger('feedback_submission_id');
            $table->text('response');
            $table->boolean('is_public')->default(false);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('feedback_forms');
    }
};
