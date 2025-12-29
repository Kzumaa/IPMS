<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Adds columns to existing tables to support the request module
     */
    public function up(): void
    {
        // 1. Add request_id to application_attachments
        Schema::table('application_attachments', function (Blueprint $table) {
            $table->unsignedBigInteger('request_id')->nullable()->after('application_id');
            $table->foreign('request_id')->references('id')->on('application_requests')->nullOnDelete();
        });

        // Update doc_type check constraint to include new document types
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE application_attachments DROP CONSTRAINT IF EXISTS chk_application_attachments_doc_type");
            DB::statement("ALTER TABLE application_attachments ADD CONSTRAINT chk_application_attachments_doc_type CHECK (doc_type IN ('FORM','DESCRIPTION','CLAIMS','ABSTRACT','DRAWINGS','ID_DESCRIPTION','ID_PHOTOS_SET','PRIORITY_DOC','POA','PAYMENT_RECEIPT','TRANSLATION','ASSIGNMENT_CONTRACT','LICENSE_CONTRACT','AMENDMENT_DOC','APPEAL_EVIDENCE','OTHER','OFFICIAL_NOTICE','GAZETTE','DECISION','CERTIFICATE'))");
        }

        // 2. Add request_id to fee_quotes
        Schema::table('fee_quotes', function (Blueprint $table) {
            $table->unsignedBigInteger('request_id')->nullable()->after('application_id');
            $table->foreign('request_id')->references('id')->on('application_requests')->nullOnDelete();
        });

        // 3. Add history tracking columns to application_parties
        Schema::table('application_parties', function (Blueprint $table) {
            $table->date('valid_from')->nullable()->after('is_primary');
            $table->date('valid_to')->nullable()->after('valid_from');
            $table->unsignedBigInteger('source_request_id')->nullable()->after('valid_to');
            $table->foreign('source_request_id')->references('id')->on('application_requests')->nullOnDelete();
        });

        // Update role check constraint to include LICENSEE
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE application_parties DROP CONSTRAINT IF EXISTS chk_application_parties_role");
            DB::statement("ALTER TABLE application_parties ADD CONSTRAINT chk_application_parties_role CHECK (role IN ('APPLICANT','INVENTOR','REPRESENTATIVE','LICENSEE'))");
        }

        // Set valid_from for existing parties
        DB::table('application_parties')
            ->whereNull('valid_from')
            ->update(['valid_from' => DB::raw('CURRENT_DATE')]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // 1. Remove columns from application_parties
        Schema::table('application_parties', function (Blueprint $table) {
            $table->dropForeign(['source_request_id']);
            $table->dropColumn(['valid_from', 'valid_to', 'source_request_id']);
        });

        // Restore original role constraint
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE application_parties DROP CONSTRAINT IF EXISTS chk_application_parties_role");
            DB::statement("ALTER TABLE application_parties ADD CONSTRAINT chk_application_parties_role CHECK (role IN ('APPLICANT','INVENTOR','REPRESENTATIVE'))");
        }

        // 2. Remove request_id from fee_quotes
        Schema::table('fee_quotes', function (Blueprint $table) {
            $table->dropForeign(['request_id']);
            $table->dropColumn('request_id');
        });

        // 3. Remove request_id from application_attachments
        Schema::table('application_attachments', function (Blueprint $table) {
            $table->dropForeign(['request_id']);
            $table->dropColumn('request_id');
        });

        // Restore original doc_type constraint
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE application_attachments DROP CONSTRAINT IF EXISTS chk_application_attachments_doc_type");
            DB::statement("ALTER TABLE application_attachments ADD CONSTRAINT chk_application_attachments_doc_type CHECK (doc_type IN ('FORM','DESCRIPTION','CLAIMS','ABSTRACT','DRAWINGS','ID_DESCRIPTION','ID_PHOTOS_SET','PRIORITY_DOC','POA','PAYMENT_RECEIPT','TRANSLATION','OTHER','OFFICIAL_NOTICE','GAZETTE','DECISION','CERTIFICATE'))");
        }
    }
};
