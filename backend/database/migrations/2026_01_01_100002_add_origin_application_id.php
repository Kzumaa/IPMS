<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Adds origin_application_id for split application tracking.
     */
    public function up(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            $table->unsignedBigInteger('origin_application_id')->nullable()->after('current_version');
            $table->foreign('origin_application_id')
                  ->references('id')
                  ->on('applications')
                  ->nullOnDelete();
            $table->index('origin_application_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            $table->dropForeign(['origin_application_id']);
            $table->dropColumn('origin_application_id');
        });
    }
};
