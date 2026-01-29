<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Drop the table if it exists
        Schema::dropIfExists('request_appeals');

        // Update the application_requests.type check constraint to remove APPEAL
        // Note: This assumes the constraint name is 'chk_application_requests_type'
        // based on 2025_12_22_100000_create_application_requests_module.php
        
        if (config('database.default') === 'pgsql') {
            DB::statement("ALTER TABLE application_requests DROP CONSTRAINT IF EXISTS chk_application_requests_type");
            DB::statement("ALTER TABLE application_requests ADD CONSTRAINT chk_application_requests_type CHECK (type IN ('AMENDMENT','ASSIGNMENT','LICENSE','SPLIT','CONVERSION','COMPLAINT','RENEWAL','TERMINATION','WITHDRAWAL'))");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('request_appeals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('request_id')->constrained('application_requests')->onDelete('cascade');
            $table->unsignedBigInteger('target_decision_id')->nullable();
            $table->unsignedBigInteger('target_event_id')->nullable();
            $table->string('appeal_type', 30); // DECISION_APPEAL, NOTICE_OBJECTION
            $table->date('notice_date')->nullable();
            $table->text('grounds');
            $table->date('deadline')->nullable();
            $table->date('resolved_at')->nullable();
            $table->string('resolution', 30)->nullable(); // UPHELD, OVERTURNED, PARTIAL, WITHDRAWN
            $table->timestamps();
        });

        if (config('database.default') === 'pgsql') {
            DB::statement("ALTER TABLE application_requests DROP CONSTRAINT IF EXISTS chk_application_requests_type");
            DB::statement("ALTER TABLE application_requests ADD CONSTRAINT chk_application_requests_type CHECK (type IN ('AMENDMENT','ASSIGNMENT','LICENSE','SPLIT','CONVERSION','APPEAL','COMPLAINT','RENEWAL','TERMINATION','WITHDRAWAL'))");
        }
    }
};