<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * This migration updates the application status system for SRS compliance:
     * 1. Renames REFUSED to DECLINED
     * 2. Adds FORMALITY_PASSED intermediate state
     * 3. Replaces APPEAL_PENDING/APPEAL_EXAMINING with COMPLAINING/CHECKING_COMPLAINT
     * 4. Adds TERMINATED status for maintenance module
     */
    public function up(): void
    {
        // Step 1: Drop the existing CHECK constraint
        DB::statement("ALTER TABLE applications DROP CONSTRAINT IF EXISTS chk_applications_status");

        // Step 2: Update existing REFUSED records to DECLINED
        DB::table('applications')
            ->where('status', 'REFUSED')
            ->update(['status' => 'DECLINED']);

        // Step 3: Update existing APPEAL_PENDING records to COMPLAINING
        DB::table('applications')
            ->where('status', 'APPEAL_PENDING')
            ->update(['status' => 'COMPLAINING']);

        // Step 4: Update existing APPEAL_EXAMINING records to CHECKING_COMPLAINT
        DB::table('applications')
            ->where('status', 'APPEAL_EXAMINING')
            ->update(['status' => 'CHECKING_COMPLAINT']);

        // Step 5: Add the new CHECK constraint with all valid statuses
        DB::statement("
            ALTER TABLE applications
            ADD CONSTRAINT chk_applications_status
            CHECK (status IN (
                'DRAFT',
                'SUBMITTED',
                'FORMALITY_EXAM',
                'FORMALITY_PASSED',
                'PUBLISHED',
                'SUB_EXAM_REQ',
                'SUB_EXAM',
                'GRANTED',
                'DECLINED',
                'WITHDRAWN',
                'WAITING_RESPONSE',
                'TERMINATED',
                'COMPLAINING',
                'CHECKING_COMPLAINT'
            ))
        ");

        // Step 6: Update request types CHECK constraint to include new types
        DB::statement("ALTER TABLE application_requests DROP CONSTRAINT IF EXISTS chk_application_requests_type");
        DB::statement("
            ALTER TABLE application_requests
            ADD CONSTRAINT chk_application_requests_type
            CHECK (type IN (
                'AMENDMENT',
                'ASSIGNMENT',
                'LICENSE',
                'SPLIT',
                'CONVERSION',
                'COMPLAINT',
                'RENEWAL',
                'TERMINATION'
            ))
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Step 1: Drop the new CHECK constraint
        DB::statement("ALTER TABLE applications DROP CONSTRAINT IF EXISTS chk_applications_status");

        // Step 2: Revert DECLINED back to REFUSED
        DB::table('applications')
            ->where('status', 'DECLINED')
            ->update(['status' => 'REFUSED']);

        // Step 3: Revert COMPLAINING back to APPEAL_PENDING
        DB::table('applications')
            ->where('status', 'COMPLAINING')
            ->update(['status' => 'APPEAL_PENDING']);

        // Step 4: Revert CHECKING_COMPLAINT back to APPEAL_EXAMINING
        DB::table('applications')
            ->where('status', 'CHECKING_COMPLAINT')
            ->update(['status' => 'APPEAL_EXAMINING']);

        // Step 5: Handle FORMALITY_PASSED - revert to PUBLISHED (most logical fallback)
        DB::table('applications')
            ->where('status', 'FORMALITY_PASSED')
            ->update(['status' => 'PUBLISHED']);

        // Step 6: Handle TERMINATED - revert to GRANTED (most logical fallback)
        DB::table('applications')
            ->where('status', 'TERMINATED')
            ->update(['status' => 'GRANTED']);

        // Step 7: Restore the old CHECK constraint
        DB::statement("
            ALTER TABLE applications
            ADD CONSTRAINT chk_applications_status
            CHECK (status IN (
                'DRAFT',
                'SUBMITTED',
                'FORMALITY_EXAM',
                'PUBLISHED',
                'SUB_EXAM_REQ',
                'SUB_EXAM',
                'GRANTED',
                'REFUSED',
                'WITHDRAWN',
                'WAITING_RESPONSE',
                'APPEAL_PENDING',
                'APPEAL_EXAMINING'
            ))
        ");

        // Step 8: Restore old request types CHECK constraint
        DB::statement("ALTER TABLE application_requests DROP CONSTRAINT IF EXISTS chk_application_requests_type");
        DB::statement("
            ALTER TABLE application_requests
            ADD CONSTRAINT chk_application_requests_type
            CHECK (type IN (
                'AMENDMENT',
                'ASSIGNMENT',
                'LICENSE',
                'SPLIT',
                'CONVERSION',
                'APPEAL'
            ))
        ");
    }
};
