<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class AuthMiddlewareTest extends TestCase
{
    use RefreshDatabase;

    public function test_application_routes_require_auth()
    {
        // Try to create application without auth
        $response = $this->postJson('/api/applications', [
            'app_type' => 'PATENT',
            'title' => 'Should Fail',
        ]);

        $response->assertStatus(401);
    }
}
