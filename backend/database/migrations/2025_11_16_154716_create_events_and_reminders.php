<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('application_events', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('application_id');
            $table->string('type', 40); // event_type
            $table->timestampTz('at')->useCurrent();
            $table->unsignedBigInteger('actor_user_id')->nullable();
            $table->text('data_json')->nullable();
            $table->unsignedBigInteger('file_id')->nullable();


            $table->foreign('application_id')->references('id')->on('applications')->cascadeOnDelete();
            $table->foreign('actor_user_id')->references('id')->on('users');
            $table->foreign('file_id')->references('id')->on('files');
        });
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE application_events ADD CONSTRAINT chk_application_events_type CHECK (type IN ('STATUS_CHANGE','FILE_ADDED','FEE_QUOTE_CREATED','PAYMENT_POSTED','OFFICIAL_NOTICE_RECEIVED','PUBLICATION','SUB_EXAM_REQUESTED','GRANT','REFUSAL','RENEWAL_DUE','REMINDER_SENT','META_UPDATE'))");
        }


        Schema::create('user_reminders', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('application_id');
            $table->string('kind', 50); // PAY_FEE, REQ_SUB_EXAM, PRIORITY_DOC, RENEWAL, etc.
            $table->date('due_date');
            $table->string('status', 20); // reminder_status
            $table->boolean('auto_created')->default(true);
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestampTz('created_at')->useCurrent();
            $table->unsignedBigInteger('related_event_id')->nullable();
            $table->index(['application_id', 'status', 'due_date']);


            $table->foreign('application_id')->references('id')->on('applications')->cascadeOnDelete();
            $table->foreign('created_by')->references('id')->on('users');
            $table->foreign('related_event_id')->references('id')->on('application_events');
        });
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE user_reminders ADD CONSTRAINT chk_user_reminders_status CHECK (status IN ('OPEN','DONE','OVERDUE'))");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_reminders');
        Schema::dropIfExists('application_events');
    }
};
