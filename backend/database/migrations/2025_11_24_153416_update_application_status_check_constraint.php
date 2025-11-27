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
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE applications DROP CONSTRAINT IF EXISTS chk_applications_status");
            DB::statement("ALTER TABLE applications ADD CONSTRAINT chk_applications_status CHECK (status IN ('DRAFT', 'SUBMITTED', 'FORMALITY_EXAM', 'PUBLISHED', 'SUB_EXAM_REQ', 'SUB_EXAM', 'GRANTED', 'REFUSED', 'WITHDRAWN', 'WAITING_RESPONSE'))");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE applications DROP CONSTRAINT IF EXISTS chk_applications_status");
            DB::statement("ALTER TABLE applications ADD CONSTRAINT chk_applications_status CHECK (status IN ('DRAFT', 'SUBMITTED', 'FORMALITY_EXAM', 'PUBLISHED', 'SUB_EXAM_REQ', 'SUB_EXAM', 'GRANTED', 'REFUSED', 'WITHDRAWN'))");
        }
    }
};
