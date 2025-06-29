<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePerformanceReviewsTable extends Migration
{
    public function up(): void
    {
        Schema::create('performance_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->onDelete('cascade');
            $table->foreignId('reviewer_id')->constrained('employees')->onDelete('set null')->nullable();
            $table->date('review_date');
            $table->unsignedTinyInteger('job_knowledge_rating');
            $table->unsignedTinyInteger('work_quality_rating');
            $table->unsignedTinyInteger('attendance_rating');
            $table->unsignedTinyInteger('communication_rating');
            $table->unsignedTinyInteger('teamwork_rating');
            $table->unsignedTinyInteger('initiative_rating');
            $table->float('overall_rating');
            $table->json('strengths')->nullable();
            $table->json('weaknesses')->nullable();
            $table->json('goals')->nullable();
            $table->text('comments')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('performance_reviews');
    }
}
