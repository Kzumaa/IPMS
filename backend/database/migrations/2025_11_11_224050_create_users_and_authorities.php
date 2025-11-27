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
        Schema::dropIfExists('users');
        Schema::create('users', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('password');
            $table->rememberToken();
            $table->string('full_name', 255);
            $table->string('email', 255)->unique();
            $table->string('phone', 50)->nullable();
            $table->string('citizen_id', 50)->nullable();
            $table->string('org_name', 255)->nullable();
            $table->text('address')->nullable();
            $table->string('country', 2)->nullable();
            $table->boolean('is_org')->default(false);
            $table->timestampTz('created_at')->useCurrent();
        });


        Schema::create('authority_orgs', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('name', 255);
            $table->string('org_type', 30); // authority_org_type
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->text('address')->nullable();
        });
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE authority_orgs ADD CONSTRAINT chk_authority_orgs_org_type CHECK (org_type IN ('HQ','REGIONAL_OFFICE','DEPARTMENT'))");
        }
        Schema::table('authority_orgs', function (Blueprint $table) {
            $table->foreign('parent_id')->references('id')->on('authority_orgs');
        });


        Schema::create('authority_staff', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('full_name', 255);
            $table->string('email', 255)->unique();
            $table->string('password');
            $table->rememberToken();

            $table->unsignedBigInteger('org_id');
            $table->string('role', 40); // staff_role
            $table->unsignedBigInteger('manager_id')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestampTz('created_at')->useCurrent();

            $table->foreign('org_id')->references('id')->on('authority_orgs');
            $table->foreign('manager_id')->references('id')->on('authority_staff');
        });
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE authority_staff ADD CONSTRAINT chk_authority_staff_role CHECK (role IN ('AUTH_ADMIN','AUTH_MANAGER','FORMALITY_OFFICER','EXAMINER','CASHIER','CLERK'))");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('authority_staff');
        Schema::dropIfExists('authority_orgs');
        Schema::dropIfExists('users');
    }
};
