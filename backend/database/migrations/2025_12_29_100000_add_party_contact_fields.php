<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Adds missing contact and identification fields to application_parties table.
     * - nationality_text: Full nationality name (e.g., "Việt Nam") - existing 'nationality' is 2-char country code
     * - phone: Contact phone number
     * - id_number: Identification document number (CMND/CCCD/Passport)
     * - id_type: Type of identification document
     */
    public function up(): void
    {
        Schema::table('application_parties', function (Blueprint $table) {
            $table->string('nationality_text', 100)->nullable()->after('nationality');
            $table->string('phone', 20)->nullable()->after('snapshot_email');
            $table->string('id_number', 50)->nullable()->after('phone');
            $table->string('id_type', 20)->nullable()->after('id_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('application_parties', function (Blueprint $table) {
            $table->dropColumn(['nationality_text', 'phone', 'id_number', 'id_type']);
        });
    }
};
