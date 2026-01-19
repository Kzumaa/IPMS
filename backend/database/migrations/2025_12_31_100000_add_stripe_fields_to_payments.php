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
        Schema::table('payments', function (Blueprint $table) {
            // Payment status tracking
            $table->string('status', 30)->default('PENDING')->after('method');

            // Stripe-specific fields
            $table->string('stripe_session_id', 255)->nullable()->after('status');
            $table->string('stripe_payment_intent_id', 255)->nullable()->after('stripe_session_id');

            // Additional metadata
            $table->string('currency', 10)->default('VND')->after('stripe_payment_intent_id');
            $table->text('description')->nullable()->after('currency');
            $table->json('metadata')->nullable()->after('description');
            $table->timestampTz('expires_at')->nullable()->after('metadata');

            // Timestamps
            $table->timestamps();

            // Indexes for Stripe lookups
            $table->index('stripe_session_id');
            $table->index('stripe_payment_intent_id');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropIndex(['stripe_session_id']);
            $table->dropIndex(['stripe_payment_intent_id']);
            $table->dropIndex(['status']);

            $table->dropColumn([
                'status',
                'stripe_session_id',
                'stripe_payment_intent_id',
                'currency',
                'description',
                'metadata',
                'expires_at',
                'created_at',
                'updated_at',
            ]);
        });
    }
};
