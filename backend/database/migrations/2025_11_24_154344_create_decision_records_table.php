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
        Schema::create('decision_records', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('application_id');
            $table->dateTime('decision_date');
            $table->string('type'); // GRANT, REFUSE
            $table->text('notes')->nullable();

            $table->foreign('application_id')->references('id')->on('applications')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('decision_records');
    }
};
