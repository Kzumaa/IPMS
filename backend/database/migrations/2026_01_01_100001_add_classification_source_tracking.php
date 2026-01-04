<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Adds tracking fields for classification assignment (by user or staff).
     */
    public function up(): void
    {
        // Add source tracking to IPC classes
        Schema::table('ipc_classes', function (Blueprint $table) {
            $table->string('assigned_by_type', 20)->default('USER'); // USER or STAFF
            $table->unsignedBigInteger('assigned_by_id')->nullable();
            $table->timestampTz('assigned_at')->nullable();
        });

        // Add source tracking to Locarno classes
        Schema::table('locarno_classes', function (Blueprint $table) {
            $table->string('assigned_by_type', 20)->default('USER'); // USER or STAFF
            $table->unsignedBigInteger('assigned_by_id')->nullable();
            $table->timestampTz('assigned_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ipc_classes', function (Blueprint $table) {
            $table->dropColumn(['assigned_by_type', 'assigned_by_id', 'assigned_at']);
        });

        Schema::table('locarno_classes', function (Blueprint $table) {
            $table->dropColumn(['assigned_by_type', 'assigned_by_id', 'assigned_at']);
        });
    }
};
