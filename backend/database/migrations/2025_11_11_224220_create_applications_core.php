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
        Schema::create('applications', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('app_no', 50)->nullable(); // set when formality accepted
            $table->string('app_type', 30); // app_type
            $table->string('title', 1000);
            $table->date('filing_date')->nullable();
            $table->string('status', 30); // application_status
            $table->boolean('applicant_is_inventor')->default(false);
            $table->boolean('publication_early_requested')->default(false);
            $table->smallInteger('pub_delay_months')->nullable();
            $table->unsignedBigInteger('receiving_org_id')->nullable();
            $table->unsignedBigInteger('current_assignee_id')->nullable();
            $table->unsignedBigInteger('created_by');
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent()->useCurrentOnUpdate();


            $table->unique('app_no');
            $table->index(['status', 'app_type', 'filing_date']);


            $table->foreign('receiving_org_id')->references('id')->on('authority_orgs');
            $table->foreign('current_assignee_id')->references('id')->on('authority_staff');
            $table->foreign('created_by')->references('id')->on('users');
        });
        DB::statement("ALTER TABLE applications ADD CONSTRAINT chk_applications_app_type CHECK (app_type IN ('PATENT','UTILITY','INDUSTRIAL_DESIGN'))");
        DB::statement("ALTER TABLE applications ADD CONSTRAINT chk_applications_status CHECK (status IN ('DRAFT','SUBMITTED','FORMALITY_EXAM','PUBLISHED','SUB_EXAM_REQ','SUB_EXAM','GRANTED','REFUSED','WITHDRAWN'))");


        Schema::create('application_parties', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('application_id');
            $table->string('role', 20); // party_role
            $table->unsignedBigInteger('user_id');
            $table->string('snapshot_name', 500)->nullable();
            $table->text('snapshot_address')->nullable();
            $table->string('snapshot_email', 255)->nullable();
            $table->string('nationality', 2)->nullable();
            $table->boolean('is_primary')->default(false);
            $table->timestampTz('created_at')->useCurrent();


            $table->foreign('application_id')->references('id')->on('applications')->cascadeOnDelete();
            $table->foreign('user_id')->references('id')->on('users');
        });
        DB::statement("ALTER TABLE application_parties ADD CONSTRAINT chk_application_parties_role CHECK (role IN ('APPLICANT','INVENTOR','REPRESENTATIVE'))");


        Schema::create('application_assignments', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('application_id');
            $table->unsignedBigInteger('staff_id');
            $table->string('stage', 30); // assignment_stage
            $table->string('status', 20); // assignment_status
            $table->unsignedBigInteger('assigned_by_id');
            $table->timestampTz('assigned_at')->useCurrent();
            $table->date('due_date')->nullable();
            $table->timestampTz('completed_at')->nullable();
            $table->text('notes')->nullable();


            $table->index(['application_id', 'stage', 'status']);


            $table->foreign('application_id')->references('id')->on('applications')->cascadeOnDelete();
            $table->foreign('staff_id')->references('id')->on('authority_staff');
            $table->foreign('assigned_by_id')->references('id')->on('authority_staff');
        });
        DB::statement("ALTER TABLE application_assignments ADD CONSTRAINT chk_application_assignments_stage CHECK (stage IN ('INTAKE','FORMALITY_EXAM','SUBSTANTIVE_EXAM','PAYMENT_VALIDATION'))");
        DB::statement("ALTER TABLE application_assignments ADD CONSTRAINT chk_application_assignments_status CHECK (status IN ('ACTIVE','COMPLETED','REASSIGNED','CANCELLED'))");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('application_assignments');
        Schema::dropIfExists('application_parties');
        Schema::dropIfExists('applications');
    }
};
