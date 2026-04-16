<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quota_usages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees');
            $table->foreignId('employee_quota_id')->constrained('employee_quotas');
            $table->foreignId('item_id')->constrained('items');
            $table->integer('quantity_used')->default(1);
            $table->dateTime('used_at');
            $table->string('note', 255)->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index('employee_id');
            $table->index('item_id');
            $table->index('used_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quota_usages');
    }
};
