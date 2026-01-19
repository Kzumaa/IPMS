<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Creates the amendment versioning system tables for tracking pending and approved changes.
     */
    public function up(): void
    {
        // 1. Create application_pending_versions table
        // Stores proposed changes before staff approval
        Schema::create('application_pending_versions', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('application_id');
            $table->unsignedBigInteger('request_id');
            $table->unsignedInteger('version_number'); // Will become this version if approved
            $table->jsonb('proposed_data'); // Full proposed application state
            $table->jsonb('changed_fields'); // Array of field paths that changed
            $table->jsonb('field_changes'); // { field_path: { old: x, new: y } }
            $table->unsignedBigInteger('created_by');
            $table->timestampTz('created_at')->useCurrent();

            $table->unique(['application_id', 'request_id']);
            $table->index('application_id');
            $table->index('request_id');

            $table->foreign('application_id')
                  ->references('id')
                  ->on('applications')
                  ->cascadeOnDelete();
            $table->foreign('request_id')
                  ->references('id')
                  ->on('application_requests')
                  ->cascadeOnDelete();
            $table->foreign('created_by')
                  ->references('id')
                  ->on('users');
        });

        // 2. Add field_changes column to application_versions table
        // Stores the before/after changes for each approved version
        Schema::table('application_versions', function (Blueprint $table) {
            $table->jsonb('field_changes')->nullable()->after('change_summary');
        });

        // 3. Add pending_version_id to request_amendments table
        // Links amendment request to its pending version
        Schema::table('request_amendments', function (Blueprint $table) {
            $table->unsignedBigInteger('pending_version_id')->nullable()->after('new_value');

            $table->foreign('pending_version_id')
                  ->references('id')
                  ->on('application_pending_versions')
                  ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('request_amendments', function (Blueprint $table) {
            $table->dropForeign(['pending_version_id']);
            $table->dropColumn('pending_version_id');
        });

        Schema::table('application_versions', function (Blueprint $table) {
            $table->dropColumn('field_changes');
        });

        Schema::dropIfExists('application_pending_versions');
    }
};
