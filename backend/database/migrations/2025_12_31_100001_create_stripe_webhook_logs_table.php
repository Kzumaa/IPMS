<?php

declare(strict_types=1);

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
        Schema::create('stripe_webhook_logs', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('event_id', 255)->unique();
            $table->string('event_type', 100);
            $table->json('payload');
            $table->string('processing_status', 30)->default('PENDING');
            $table->text('error_message')->nullable();
            $table->integer('retry_count')->default(0);
            $table->timestamps();

            $table->index('event_type');
            $table->index('processing_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stripe_webhook_logs');
    }
};
