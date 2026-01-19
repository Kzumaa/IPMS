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
     * Adds appeal_number to track number of appeals (max 3).
     * Updates application status constraint to include appeal statuses.
     */
    public function up(): void
    {
        // Add appeal_number to request_appeals table
        Schema::table('request_appeals', function (Blueprint $table) {
            $table->unsignedSmallInteger('appeal_number')->default(1)->after('grounds');
        });

        // Update applications status constraint to include new appeal statuses
        if (DB::getDriverName() !== 'sqlite') {
            // Drop old constraint
            DB::statement("ALTER TABLE applications DROP CONSTRAINT IF EXISTS chk_applications_status");

            // Add new constraint with appeal statuses
            DB::statement("ALTER TABLE applications ADD CONSTRAINT chk_applications_status CHECK (status IN ('DRAFT','SUBMITTED','FORMALITY_EXAM','PUBLISHED','SUB_EXAM_REQ','SUB_EXAM','GRANTED','REFUSED','WITHDRAWN','WAITING_RESPONSE','APPEAL_PENDING','APPEAL_EXAMINING'))");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('request_appeals', function (Blueprint $table) {
            $table->dropColumn('appeal_number');
        });

        // Revert applications status constraint
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE applications DROP CONSTRAINT IF EXISTS chk_applications_status");
            DB::statement("ALTER TABLE applications ADD CONSTRAINT chk_applications_status CHECK (status IN ('DRAFT','SUBMITTED','FORMALITY_EXAM','PUBLISHED','SUB_EXAM_REQ','SUB_EXAM','GRANTED','REFUSED','WITHDRAWN','WAITING_RESPONSE'))");
        }
    }
};
