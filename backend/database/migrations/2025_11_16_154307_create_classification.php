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
        Schema::create('ipc_classes', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('application_id');
            $table->string('ipc_code', 50);
            $table->string('version', 20)->nullable();
            $table->integer('sort_order')->default(0);
            $table->index('application_id');
            $table->foreign('application_id')->references('id')->on('applications')->cascadeOnDelete();
        });


        Schema::create('locarno_classes', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('application_id');
            $table->string('class_no', 5);
            $table->string('subclass_no', 5)->nullable();
            $table->string('version', 20)->nullable();
            $table->string('field_of_use', 255)->nullable();
            $table->integer('sort_order')->default(0);
            $table->index('application_id');
            $table->foreign('application_id')->references('id')->on('applications')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('locarno_classes');
        Schema::dropIfExists('ipc_classes');
    }
};
