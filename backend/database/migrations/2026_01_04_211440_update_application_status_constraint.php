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
        DB::statement("ALTER TABLE applications DROP CONSTRAINT IF EXISTS chk_applications_status");
        DB::statement("ALTER TABLE applications ADD CONSTRAINT chk_applications_status
            CHECK (status IN ('DRAFT','SUBMITTED','FORMALITY_EXAM','FORMALITY_PASSED',
                             'PUBLISHED','SUB_EXAM_REQ','SUB_EXAM','GRANTED','DECLINED',
                             'WITHDRAWN','UNDER_AMENDMENT','WAITING_RESPONSE','TERMINATED',
                             'COMPLAINING','CHECKING_COMPLAINT'))");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE applications DROP CONSTRAINT IF EXISTS chk_applications_status");
        DB::statement("ALTER TABLE applications ADD CONSTRAINT chk_applications_status
            CHECK (status IN ('DRAFT','SUBMITTED','FORMALITY_EXAM','FORMALITY_PASSED',
                             'PUBLISHED','SUB_EXAM_REQ','SUB_EXAM','GRANTED','DECLINED',
                             'WITHDRAWN','WAITING_RESPONSE','TERMINATED',
                             'COMPLAINING','CHECKING_COMPLAINT'))");
    }
};
