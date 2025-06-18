<?php

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
        Schema::create('notification_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('push_subscription_id')->nullable()->constrained()->onDelete('set null');

            // Notification content
            $table->string('title');
            $table->text('body');
            $table->string('icon')->nullable();
            $table->string('image')->nullable();
            $table->string('url')->nullable();
            $table->string('tag')->nullable();
            $table->json('data')->nullable();

            // Status and tracking
            $table->enum('status', ['pending', 'sent', 'delivered', 'failed', 'expired'])->default('pending');
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('clicked_at')->nullable();
            $table->timestamp('dismissed_at')->nullable();
            $table->timestamp('viewed_at')->nullable();

            // Error handling
            $table->text('error_message')->nullable();
            $table->integer('retry_count')->default(0);

            // Classification
            $table->enum('priority', ['low', 'normal', 'high', 'urgent'])->default('normal');
            $table->enum('category', ['system', 'marketing', 'transactional', 'reminder', 'alert'])->default('system');

            // Additional metadata
            $table->json('metadata')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Indexes for performance
            $table->index(['user_id', 'status']);
            $table->index(['user_id', 'category']);
            $table->index(['user_id', 'priority']);
            $table->index(['status', 'created_at']);
            $table->index(['category', 'created_at']);
            $table->index(['priority', 'created_at']);
            $table->index(['sent_at']);
            $table->index(['delivered_at']);
            $table->index(['clicked_at']);
            $table->index(['tag']);

            // Composite indexes for common queries
            $table->index(['user_id', 'status', 'created_at']);
            $table->index(['status', 'retry_count', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notification_logs');
    }
};
