<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Firebase\JWT\JWT;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class CozeAuthController extends Controller
{
    /**
     * Generate and return a Coze access token.
     * 
     * This endpoint creates a signed JWT using the private key,
     * exchanges it with Coze API for an access token, and returns
     * the token to the frontend for SDK authentication.
     */
    public function getToken(): JsonResponse
    {
        // 1. Load Configurations
        $clientId = env('COZE_CLIENT_ID');
        $keyId = env('COZE_KEY_ID');
        $pemPath = base_path(env('COZE_PRIVATE_KEY_PATH'));

        if (!$clientId || !$keyId) {
            return response()->json(['error' => 'Coze credentials not configured'], 500);
        }

        if (!file_exists($pemPath)) {
            return response()->json(['error' => 'Private key not found'], 500);
        }

        // 2. Generate JWT (Signed with Private Key)
        $now = time();
        $payload = [
            'iss' => $clientId,           // Issuer
            'sub' => $clientId,           // Subject
            'aud' => 'api.coze.com',      // Audience
            'iat' => $now,                // Issued At
            'exp' => $now + 3600,         // Expiration (1 hour max for JWT)
            'jti' => Str::random(16),     // Unique JWT ID
        ];

        $privateKey = file_get_contents($pemPath);

        // IMPORTANT: The Header must contain the 'kid' (Key ID)
        $jwt = JWT::encode($payload, $privateKey, 'RS256', $keyId);

        // 3. Exchange JWT for Access Token via Coze API
        $client = new Client();

        try {
            $response = $client->post('https://api.coze.com/open/oauth/token', [
                'headers' => [
                    'Content-Type' => 'application/json',
                    'Authorization' => 'Bearer ' . $jwt,
                ],
                'json' => [
                    'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                    'duration_seconds' => 86400, // Token validity (24 hours)
                ],
            ]);

            $data = json_decode($response->getBody()->getContents(), true);

            // 4. Return the Access Token to Frontend
            return response()->json([
                'access_token' => $data['access_token'],
                'expires_in' => $data['expires_in'] ?? 86400,
            ]);
        } catch (GuzzleException $e) {
            Log::error('Coze Auth Error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to authenticate with AI Service'], 500);
        }
    }
}
