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
        Schema::create('maintenance_schedules', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('protection_title_id');
            $table->integer('year');
            $table->date('due_date');
            $table->decimal('amount', 15, 2);
            $table->string('status'); // PENDING, PAID, OVERDUE
            $table->dateTime('paid_at')->nullable();

            $table->foreign('protection_title_id')->references('id')->on('protection_titles')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('maintenance_schedules');
    }
};
