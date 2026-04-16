<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('app_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('title', 255);
            $table->text('message');
            $table->enum('type', ['quota_assigned', 'quota_used', 'quota_low', 'quota_exhausted', 'quota_expired', 'general']);
            $table->boolean('is_read')->default(false);
            $table->unsignedInteger('related_id')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index('user_id');
            $table->index('is_read');
            $table->index('type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('app_notifications');
    }
};
