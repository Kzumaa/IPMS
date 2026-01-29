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
        // Renewal requests table
        Schema::create('request_renewals', function (Blueprint $table) {
            $table->foreignId('request_id')->primary()->constrained('application_requests')->cascadeOnDelete();
            $table->integer('renewal_years')->default(1); // How many years to extend
            $table->date('current_expiration_date'); // Current expiration before renewal
            $table->date('new_expiration_date'); // New expiration after approval
            $table->timestamps();
        });

        // Termination requests table
        Schema::create('request_terminations', function (Blueprint $table) {
            $table->foreignId('request_id')->primary()->constrained('application_requests')->cascadeOnDelete();
            $table->text('reason')->nullable(); // Optional reason for termination
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('request_terminations');
        Schema::dropIfExists('request_renewals');
    }
};
