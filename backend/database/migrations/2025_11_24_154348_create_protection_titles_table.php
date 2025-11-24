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
        Schema::create('protection_titles', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('application_id');
            $table->string('registration_number')->unique();
            $table->dateTime('issue_date');
            $table->dateTime('expiry_date');
            $table->string('status'); // ACTIVE, EXPIRED, CANCELLED

            $table->foreign('application_id')->references('id')->on('applications')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('protection_titles');
    }
};
