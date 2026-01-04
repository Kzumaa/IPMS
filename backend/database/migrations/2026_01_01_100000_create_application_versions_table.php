<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Creates the application_versions table for tracking application history/snapshots.
     */
    public function up(): void
    {
        Schema::create('application_versions', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('application_id');
            $table->unsignedInteger('version_number');
            $table->unsignedBigInteger('amendment_request_id')->nullable();
            $table->jsonb('snapshot_data');
            $table->text('change_summary')->nullable();
            $table->unsignedBigInteger('created_by');
            $table->timestampTz('created_at')->useCurrent();

            $table->unique(['application_id', 'version_number']);
            $table->index(['application_id', 'created_at']);

            $table->foreign('application_id')
                  ->references('id')
                  ->on('applications')
                  ->cascadeOnDelete();
            $table->foreign('amendment_request_id')
                  ->references('id')
                  ->on('application_requests')
                  ->nullOnDelete();
            $table->foreign('created_by')
                  ->references('id')
                  ->on('users');
        });

        // Add current_version column to applications table
        Schema::table('applications', function (Blueprint $table) {
            $table->unsignedInteger('current_version')->default(1)->after('file_validation_results');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            $table->dropColumn('current_version');
        });

        Schema::dropIfExists('application_versions');
    }
};
