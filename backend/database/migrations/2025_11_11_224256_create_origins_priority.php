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
        Schema::create('pct_info', function (Blueprint $table) {
            $table->unsignedBigInteger('application_id')->primary();
            $table->string('pct_app_no', 50)->nullable();
            $table->date('pct_filing_date')->nullable();
            $table->string('pct_pub_no', 50)->nullable();
            $table->date('pct_pub_date')->nullable();
            $table->boolean('amended_on_national_phase')->default(false);
            $table->foreign('application_id')->references('id')->on('applications')->cascadeOnDelete();
        });


        Schema::create('split_info', function (Blueprint $table) {
            $table->unsignedBigInteger('application_id')->primary();
            $table->string('parent_app_no', 50)->nullable();
            $table->date('parent_filing_date')->nullable();
            $table->unsignedBigInteger('parent_internal_id')->nullable();
            $table->foreign('application_id')->references('id')->on('applications')->cascadeOnDelete();
            $table->foreign('parent_internal_id')->references('id')->on('applications');
        });


        Schema::create('conversion_info', function (Blueprint $table) {
            $table->unsignedBigInteger('application_id')->primary();
            $table->string('from_app_no', 50)->nullable();
            $table->date('from_filing_date')->nullable();
            $table->unsignedBigInteger('from_internal_id')->nullable();
            $table->foreign('application_id')->references('id')->on('applications')->cascadeOnDelete();
            $table->foreign('from_internal_id')->references('id')->on('applications');
        });


        Schema::create('sntc_info', function (Blueprint $table) {
            $table->unsignedBigInteger('application_id')->primary();
            $table->string('agency_name', 500)->nullable();
            $table->string('project_name', 1000)->nullable();
            $table->string('project_code', 100)->nullable();
            $table->foreign('application_id')->references('id')->on('applications')->cascadeOnDelete();
        });


        Schema::create('priority_claims', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('application_id');
            $table->string('kind', 20)->nullable(); // VN_FIRST, PARIS, OTHER
            $table->string('number', 100)->nullable();
            $table->date('filing_date')->nullable();
            $table->string('country_code', 2)->nullable();
            $table->string('agreement_name', 255)->nullable();
            $table->index('application_id');
            $table->foreign('application_id')->references('id')->on('applications')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('priority_claims');
        Schema::dropIfExists('sntc_info');
        Schema::dropIfExists('conversion_info');
        Schema::dropIfExists('split_info');
        Schema::dropIfExists('pct_info');
    }
};
