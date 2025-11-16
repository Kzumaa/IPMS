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
        Schema::create('application_metrics', function (Blueprint $table) {
            $table->unsignedBigInteger('application_id')->primary();
            $table->integer('description_pages')->default(0);
            $table->integer('claims_independent')->default(0);
            $table->integer('claims_total')->default(0);
            $table->integer('drawings_images')->default(0);
            $table->integer('ipc_groups')->default(0);
            $table->integer('id_variants')->default(0);
            $table->integer('id_images_per_variant')->default(0);
            $table->boolean('has_priority')->default(false);
            $table->integer('priority_count')->default(0);
            $table->foreign('application_id')->references('id')->on('applications')->cascadeOnDelete();
        });
        Schema::create('fee_catalog', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('code', 50)->unique();                // remove ->unique()
            $table->string('app_type', 30);
            $table->string('label', 500);
            $table->string('basis', 30);
            $table->decimal('unit_price', 18, 2);
            $table->string('unit_name', 50)->nullable();
            $table->string('law_version', 20);
            $table->date('effective_from')->nullable();
            $table->date('effective_to')->nullable();
            // replace the non-unique index with a UNIQUE
            $table->unique(['code', 'app_type', 'law_version'], 'fee_catalog_code_app_type_law_version_unique');
            $table->unique(['code', 'law_version'], 'fee_catalog_code_law_version_unique');
        });

        Schema::create('fee_rules', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('fee_code', 50);
            $table->text('expression');
            $table->text('metric_keys')->nullable();
            $table->text('notes')->nullable();
            $table->string('law_version', 20);
            $table->unique(['fee_code', 'law_version'], 'fee_rules_fee_code_law_version_unique');
            // composite FK: law-aware link to catalog
            $table->foreign(['fee_code', 'law_version'], 'fee_rules_fee_code_law_version_fk')
                ->references(['code', 'law_version'])->on('fee_catalog')
                ->cascadeOnDelete();
        });

        Schema::create('fee_quotes', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('application_id');
            $table->integer('version');
            $table->string('currency', 10)->default('VND');
            $table->decimal('total_amount', 18, 2)->default(0);
            $table->string('status', 20);
            $table->timestampTz('generated_at')->useCurrent();
            $table->string('law_version', 20);
            $table->index(['application_id', 'status']);
            $table->unique(['application_id', 'version'], 'fee_quotes_app_version_unique'); // add
            $table->foreign('application_id')->references('id')->on('applications')->cascadeOnDelete();
        });

        Schema::create('fee_quote_lines', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('fee_quote_id');
            $table->string('fee_code', 50);
            $table->string('label', 500);
            $table->decimal('units', 18, 4)->default(0);
            $table->decimal('unit_price', 18, 2)->default(0);
            $table->decimal('amount', 18, 2)->default(0);
            $table->string('source', 10)->default('AUTO'); // AUTO, MANUAL


            $table->foreign('fee_quote_id')->references('id')->on('fee_quotes')->cascadeOnDelete();
            $table->foreign('fee_code')->references('code')->on('fee_catalog');
        });


        Schema::create('payments', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('application_id');
            $table->unsignedBigInteger('fee_quote_id')->nullable();
            $table->decimal('amount', 18, 2);
            $table->string('method', 50)->nullable();
            $table->timestampTz('paid_at')->nullable();
            $table->string('receipt_no', 100)->nullable();
            $table->string('payer_name', 255)->nullable();
            $table->unsignedBigInteger('receipt_file_id')->nullable();


            $table->foreign('application_id')->references('id')->on('applications')->cascadeOnDelete();
            $table->foreign('fee_quote_id')->references('id')->on('fee_quotes');
            $table->foreign('receipt_file_id')->references('id')->on('files');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
        Schema::dropIfExists('fee_quote_lines');
        Schema::dropIfExists('fee_quotes');
        Schema::dropIfExists('fee_rules');
        Schema::dropIfExists('fee_catalog');
        Schema::dropIfExists('application_metrics');
    }
};
