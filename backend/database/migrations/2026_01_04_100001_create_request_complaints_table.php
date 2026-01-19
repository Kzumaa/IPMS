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
        Schema::create('request_complaints', function (Blueprint $table) {
            $table->foreignId('request_id')->primary()->constrained('application_requests')->cascadeOnDelete();
            $table->text('grounds'); // Legal grounds for the complaint
            $table->date('deadline'); // 90-day deadline from decision date
            $table->integer('complaint_number')->default(1); // Which complaint this is (1, 2, or 3)
            $table->date('resolved_at')->nullable();
            $table->string('resolution', 20)->nullable(); // ACCEPTED or REJECTED
            $table->timestamps();

            // Index for finding complaints by resolution status
            $table->index(['resolution', 'resolved_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('request_complaints');
    }
};
