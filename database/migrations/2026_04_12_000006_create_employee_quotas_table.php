<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employee_quotas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
            $table->foreignId('plan_id')->constrained('quota_plans')->onDelete('cascade');
            $table->foreignId('item_id')->constrained('items')->onDelete('cascade');
            $table->integer('total_qty');
            $table->integer('used_qty')->default(0);
            $table->integer('remaining_qty');
            $table->enum('status', ['active', 'exhausted', 'expired'])->default('active');
            $table->timestamps();

            $table->unique(['employee_id', 'plan_id', 'item_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_quotas');
    }
};
