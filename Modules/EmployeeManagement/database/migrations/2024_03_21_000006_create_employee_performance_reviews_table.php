<?php
namespace Modules\EmployeeManagement\database\migrations;

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employee_performance_reviews', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('employee_id')->cascadeOnDelete();
            $table->unsignedBigInteger('reviewer_id')->cascadeOnDelete();
            $table->date('review_date');
            $table->date('review_period_start');
            $table->date('review_period_end');
            $table->decimal('overall_rating', 3, 1);
            $table->decimal('job_knowledge_rating', 3, 1);
            $table->decimal('work_quality_rating', 3, 1);
            $table->decimal('attendance_rating', 3, 1);
            $table->decimal('communication_rating', 3, 1);
            $table->decimal('teamwork_rating', 3, 1);
            $table->decimal('initiative_rating', 3, 1);
            $table->json('strengths')->nullable();
            $table->json('weaknesses')->nullable();
            $table->json('goals')->nullable();
            $table->text('comments')->nullable();
            $table->text('employee_comments')->nullable();
            $table->string('status')->default('pending');
            $table->unsignedBigInteger('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_performance_reviews');
    }
};


