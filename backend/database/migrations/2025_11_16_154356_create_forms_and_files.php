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
        Schema::create('files', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('storage', 10); // storage_type
            $table->string('bucket', 255);
            $table->string('object_key', 1000);
            $table->string('url', 1000)->nullable();
            $table->string('filename', 500);
            $table->string('mime', 100)->nullable();
            $table->unsignedBigInteger('size_bytes')->nullable();
            $table->string('sha256', 64)->unique();
            $table->string('etag', 64)->nullable();
            $table->unsignedBigInteger('uploaded_by');
            $table->timestampTz('uploaded_at')->useCurrent();
            $table->integer('page_count')->nullable();
            $table->integer('figure_count')->nullable();
            $table->string('language', 10)->nullable();


            $table->foreign('uploaded_by')->references('id')->on('users');
        });

        Schema::create('form_answers', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('application_id');
            $table->string('form', 20); // form_code
            $table->text('answers_json');
            $table->string('signed_by', 255)->nullable();
            $table->timestampTz('signed_at')->nullable();
            $table->unsignedBigInteger('signature_file_id')->nullable();
            $table->timestampTz('created_at')->useCurrent();


            $table->foreign('application_id')->references('id')->on('applications')->cascadeOnDelete();
            $table->foreign('signature_file_id')->references('id')->on('files');
        });
        DB::statement("ALTER TABLE form_answers ADD CONSTRAINT chk_form_answers_form CHECK (form IN ('M01_SC_GP','M07_KDCN'))");



        DB::statement("ALTER TABLE files ADD CONSTRAINT chk_files_storage CHECK (storage IN ('S3','R2'))");


        Schema::create('application_attachments', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('application_id');
            $table->unsignedBigInteger('file_id');
            $table->string('doc_type', 30); // doc_type
            $table->boolean('is_current')->default(true);
            $table->text('notes')->nullable();
            $table->timestampTz('created_at')->useCurrent();
            $table->index(['application_id','doc_type','is_current']);


            $table->foreign('application_id')->references('id')->on('applications')->cascadeOnDelete();
            $table->foreign('file_id')->references('id')->on('files')->cascadeOnDelete();
        });
        DB::statement("ALTER TABLE application_attachments ADD CONSTRAINT chk_application_attachments_doc_type CHECK (doc_type IN ('FORM','DESCRIPTION','CLAIMS','ABSTRACT','DRAWINGS','ID_DESCRIPTION','ID_PHOTOS_SET','PRIORITY_DOC','POA','PAYMENT_RECEIPT','TRANSLATION','OTHER','OFFICIAL_NOTICE','GAZETTE','DECISION','CERTIFICATE'))");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('application_attachments');
        Schema::dropIfExists('files');
        Schema::dropIfExists('form_answers');
    }
};
