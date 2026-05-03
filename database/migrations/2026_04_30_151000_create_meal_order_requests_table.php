<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('meal_order_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees');
            $table->foreignId('employee_quota_id')->constrained('employee_quotas');
            $table->foreignId('item_id')->constrained('items');
            $table->integer('quantity')->default(1);
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->dateTime('requested_at');
            $table->dateTime('processed_at')->nullable();
            $table->foreignId('processed_by_user_id')->nullable()->constrained('users');
            $table->string('rejection_reason', 255)->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('employee_id');
            $table->index('requested_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('meal_order_requests');
    }
};
