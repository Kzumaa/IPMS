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
        Schema::create('request_examination_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('request_id')
                ->constrained('application_requests')
                ->onDelete('cascade');
            $table->foreignId('examined_by')
                ->constrained('authority_staff')
                ->onDelete('restrict');

            // Action taken by staff
            $table->enum('action', [
                'STARTED',      // Staff started examining
                'APPROVED',     // Request approved
                'REFUSED',      // Request refused
                'RETURNED',     // Returned for corrections
            ]);

            // Examination notes/reason
            $table->text('notes')->nullable();

            // Timestamp of the action
            $table->timestamp('examined_at');

            $table->timestamps();

            // Indexes
            $table->index('request_id');
            $table->index('examined_by');
            $table->index('examined_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('request_examination_records');
    }
};
