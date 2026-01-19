<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Creates junction table for multiple licensees per license request
     */
    public function up(): void
    {
        // 1. Create junction table for multiple licensees
        Schema::create('request_license_licensees', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('request_id');
            $table->unsignedBigInteger('licensee_user_id');
            $table->timestampTz('created_at')->useCurrent();

            $table->unique(['request_id', 'licensee_user_id']);
            $table->index('licensee_user_id');

            $table->foreign('request_id')->references('id')->on('application_requests')->cascadeOnDelete();
            $table->foreign('licensee_user_id')->references('id')->on('users');
        });

        // 2. Migrate existing licensee data to the junction table
        DB::statement('
            INSERT INTO request_license_licensees (request_id, licensee_user_id)
            SELECT request_id, licensee_user_id FROM request_licenses WHERE licensee_user_id IS NOT NULL
        ');

        // 3. Remove the old licensee_user_id column from request_licenses
        Schema::table('request_licenses', function (Blueprint $table) {
            $table->dropForeign(['licensee_user_id']);
            $table->dropColumn('licensee_user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // 1. Re-add the licensee_user_id column
        Schema::table('request_licenses', function (Blueprint $table) {
            $table->unsignedBigInteger('licensee_user_id')->nullable()->after('licensor_user_id');
            $table->foreign('licensee_user_id')->references('id')->on('users');
        });

        // 2. Migrate data back (take first licensee for each request)
        DB::statement('
            UPDATE request_licenses rl
            SET licensee_user_id = (
                SELECT rll.licensee_user_id
                FROM request_license_licensees rll
                WHERE rll.request_id = rl.request_id
                ORDER BY rll.id ASC
                LIMIT 1
            )
        ');

        // 3. Drop the junction table
        Schema::dropIfExists('request_license_licensees');
    }
};
