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
     * Creates the request module tables for Amendment, Assignment, License, Split, and Appeals
     */
    public function up(): void
    {
        // 1. Parent table: application_requests
        Schema::create('application_requests', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('application_id');
            $table->string('type', 30); // AMENDMENT, ASSIGNMENT, LICENSE, SPLIT, CONVERSION, APPEAL
            $table->string('status', 30)->default('DRAFT'); // DRAFT, SUBMITTED, EXAMINING, APPROVED, REFUSED, RECORDED
            $table->date('request_date')->nullable();
            $table->date('processed_date')->nullable();
            $table->unsignedBigInteger('processed_by')->nullable();
            $table->text('processing_notes')->nullable();
            $table->unsignedBigInteger('created_by');
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->index(['application_id', 'type']);
            $table->index(['status', 'type']);

            $table->foreign('application_id')->references('id')->on('applications')->cascadeOnDelete();
            $table->foreign('created_by')->references('id')->on('users');
            $table->foreign('processed_by')->references('id')->on('authority_staff');
        });

        if (DB::getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE application_requests ADD CONSTRAINT chk_application_requests_type CHECK (type IN ('AMENDMENT','ASSIGNMENT','LICENSE','SPLIT','CONVERSION','APPEAL'))");
            DB::statement("ALTER TABLE application_requests ADD CONSTRAINT chk_application_requests_status CHECK (status IN ('DRAFT','SUBMITTED','EXAMINING','APPROVED','REFUSED','RECORDED'))");
        }

        // 2. Child table: request_amendments (Sửa đổi đơn)
        Schema::create('request_amendments', function (Blueprint $table) {
            $table->unsignedBigInteger('request_id')->primary();
            $table->string('section', 50); // BIBLIOGRAPHY, SPECIFICATION, CLAIMS, DRAWINGS, REPRESENTATIVE
            $table->text('change_summary')->nullable();
            $table->string('field_name', 100)->nullable();
            $table->text('old_value')->nullable();
            $table->text('new_value')->nullable();

            $table->foreign('request_id')->references('id')->on('application_requests')->cascadeOnDelete();
        });

        if (DB::getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE request_amendments ADD CONSTRAINT chk_request_amendments_section CHECK (section IN ('BIBLIOGRAPHY','SPECIFICATION','CLAIMS','DRAWINGS','REPRESENTATIVE'))");
        }

        // 3. Child table: request_assignments (Chuyển nhượng)
        Schema::create('request_assignments', function (Blueprint $table) {
            $table->unsignedBigInteger('request_id')->primary();
            $table->unsignedBigInteger('assignor_user_id'); // Current owner
            $table->unsignedBigInteger('assignee_user_id'); // New owner
            $table->string('transfer_type', 30); // CONTRACT, INHERITANCE, MERGER, COURT_DECISION
            $table->string('contract_number', 100)->nullable();
            $table->date('contract_date')->nullable();

            $table->foreign('request_id')->references('id')->on('application_requests')->cascadeOnDelete();
            $table->foreign('assignor_user_id')->references('id')->on('users');
            $table->foreign('assignee_user_id')->references('id')->on('users');
        });

        if (DB::getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE request_assignments ADD CONSTRAINT chk_request_assignments_transfer_type CHECK (transfer_type IN ('CONTRACT','INHERITANCE','MERGER','COURT_DECISION'))");
        }

        // 4. Child table: request_licenses (Li-xăng)
        Schema::create('request_licenses', function (Blueprint $table) {
            $table->unsignedBigInteger('request_id')->primary();
            $table->unsignedBigInteger('licensor_user_id'); // Owner/Licensor
            $table->unsignedBigInteger('licensee_user_id'); // Licensee
            $table->string('license_type', 30); // EXCLUSIVE, NON_EXCLUSIVE, COMPULSORY
            $table->string('scope_territory', 255)->default('VN');
            $table->text('scope_products')->nullable();
            $table->date('valid_from');
            $table->date('valid_to');
            $table->string('contract_number', 100)->nullable();

            $table->foreign('request_id')->references('id')->on('application_requests')->cascadeOnDelete();
            $table->foreign('licensor_user_id')->references('id')->on('users');
            $table->foreign('licensee_user_id')->references('id')->on('users');
        });

        if (DB::getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE request_licenses ADD CONSTRAINT chk_request_licenses_license_type CHECK (license_type IN ('EXCLUSIVE','NON_EXCLUSIVE','COMPULSORY'))");
        }

        // 5. Child table: request_appeals (Khiếu nại)
        Schema::create('request_appeals', function (Blueprint $table) {
            $table->unsignedBigInteger('request_id')->primary();
            $table->unsignedBigInteger('target_decision_id')->nullable(); // FK to decision_records
            $table->unsignedBigInteger('target_event_id')->nullable(); // FK to application_events (for notices)
            $table->string('appeal_type', 30); // DECISION_APPEAL, NOTICE_OBJECTION
            $table->text('grounds'); // Legal/factual arguments
            $table->date('deadline'); // 90 days from decision date
            $table->date('resolved_at')->nullable();
            $table->string('resolution', 30)->nullable(); // UPHELD, OVERTURNED, PARTIAL, WITHDRAWN

            $table->foreign('request_id')->references('id')->on('application_requests')->cascadeOnDelete();
            $table->foreign('target_decision_id')->references('id')->on('decision_records');
            $table->foreign('target_event_id')->references('id')->on('application_events');
        });

        if (DB::getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE request_appeals ADD CONSTRAINT chk_request_appeals_appeal_type CHECK (appeal_type IN ('DECISION_APPEAL','NOTICE_OBJECTION'))");
            DB::statement("ALTER TABLE request_appeals ADD CONSTRAINT chk_request_appeals_resolution CHECK (resolution IS NULL OR resolution IN ('UPHELD','OVERTURNED','PARTIAL','WITHDRAWN'))");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('request_appeals');
        Schema::dropIfExists('request_licenses');
        Schema::dropIfExists('request_assignments');
        Schema::dropIfExists('request_amendments');
        Schema::dropIfExists('application_requests');
    }
};
