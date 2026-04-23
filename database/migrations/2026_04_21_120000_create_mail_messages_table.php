<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mail_messages', function (Blueprint $table) {
            $table->id();
            $table->string('kind', 32);
            $table->string('direction', 16);
            $table->string('subject');
            $table->text('body');
            $table->string('from_email');
            $table->string('to_email');
            $table->foreignId('employee_id')->nullable()->constrained()->nullOnDelete();
            $table->string('status', 16)->default('sent');
            $table->text('failed_reason')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mail_messages');
    }
};
