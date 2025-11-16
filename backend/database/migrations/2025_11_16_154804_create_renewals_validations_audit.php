<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('renewals', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('application_id');
            $table->integer('year_no');
            $table->date('due_date')->nullable();
            $table->date('paid_date')->nullable();
            $table->decimal('amount', 18, 2)->nullable();
            $table->string('status', 20)->nullable(); // DUE, PAID, LATE
            $table->foreign('application_id')->references('id')->on('applications')->cascadeOnDelete();
        });


        Schema::create('validations', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('application_id');
            $table->string('rule_code', 100);
            $table->string('level', 10); // WARN, ERROR
            $table->text('message');
            $table->text('context_json')->nullable();
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('resolved_at')->nullable();
            $table->foreign('application_id')->references('id')->on('applications')->cascadeOnDelete();
        });


        Schema::create('audit_logs', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('application_id');
            $table->unsignedBigInteger('actor_user_id');
            $table->string('action', 100);
            $table->text('meta_json')->nullable();
            $table->timestampTz('at')->useCurrent();


            $table->foreign('application_id')->references('id')->on('applications')->cascadeOnDelete();
            $table->foreign('actor_user_id')->references('id')->on('users');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('validations');
        Schema::dropIfExists('renewals');
    }
};
