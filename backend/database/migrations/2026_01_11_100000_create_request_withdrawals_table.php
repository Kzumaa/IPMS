<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Creates the request_withdrawals table for pre-grant application withdrawals.
     * Withdrawal is different from termination:
     * - Withdrawal: Before GRANTED status (applicant voluntarily withdraws)
     * - Termination: After GRANTED status (owner voluntarily ends protection)
     */
    public function up(): void
    {
        Schema::create('request_withdrawals', function (Blueprint $table) {
            $table->unsignedBigInteger('request_id')->primary();
            $table->text('reason')->nullable();
            $table->date('effective_date');
            $table->timestamps();

            $table->foreign('request_id')
                ->references('id')
                ->on('application_requests')
                ->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('request_withdrawals');
    }
};
