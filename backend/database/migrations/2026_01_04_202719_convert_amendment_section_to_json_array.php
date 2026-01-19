<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // PostgreSQL only
        DB::statement("ALTER TABLE request_amendments DROP CONSTRAINT IF EXISTS chk_request_amendments_section");

        // Add a temporary column
        Schema::table('request_amendments', function (Blueprint $table) {
            $table->json('section_temp')->nullable();
        });

        // Convert existing enum values to JSON arrays
        DB::statement("
            UPDATE request_amendments
            SET section_temp = json_build_array(section::text)
        ");

        // Drop old section column
        Schema::table('request_amendments', function (Blueprint $table) {
            $table->dropColumn('section');
        });

        // Rename temp column to section
        Schema::table('request_amendments', function (Blueprint $table) {
            $table->renameColumn('section_temp', 'section');
        });

        // Make section non-nullable and set default
        DB::statement("
            ALTER TABLE request_amendments
            ALTER COLUMN section SET DEFAULT '[]'::json,
            ALTER COLUMN section SET NOT NULL
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This is a destructive migration, down migration will set to first value
        Schema::table('request_amendments', function (Blueprint $table) {
            $table->string('section_temp')->nullable();
        });

        // Extract first element from JSON array
        DB::statement("
            UPDATE request_amendments
            SET section_temp = section->0
        ");

        Schema::table('request_amendments', function (Blueprint $table) {
            $table->dropColumn('section');
        });

        Schema::table('request_amendments', function (Blueprint $table) {
            $table->renameColumn('section_temp', 'section');
        });

        // Recreate enum constraint
        DB::statement("
            ALTER TABLE request_amendments
            ALTER COLUMN section TYPE VARCHAR(50)
        ");
    }
};
