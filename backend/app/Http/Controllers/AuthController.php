<?php

namespace App\Http\Controllers;

use App\Models\AuthorityStaff;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Applicant registration (users table).
     */
    public function registerApplicant(Request $request)
    {
        $validated = $request->validate([
            'full_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'], // needs password_confirmation
            'phone' => ['nullable', 'string', 'max:50'],
            'citizen_id' => ['nullable', 'string', 'max:50'],
            'org_name' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string'],
            'country' => ['nullable', 'string', 'size:2'],
            'is_org' => ['nullable', 'boolean'],
        ]);

        $user = User::create([
            'full_name' => $validated['full_name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'phone' => $validated['phone'] ?? null,
            'citizen_id' => $validated['citizen_id'] ?? null,
            'org_name' => $validated['org_name'] ?? null,
            'address' => $validated['address'] ?? null,
            'country' => $validated['country'] ?? null,
            'is_org' => $validated['is_org'] ?? false,
        ]);

        // token for applicant
        $token = $user->createToken('applicant-token')->plainTextToken;

        return response()->json([
            'type' => 'APPLICANT',
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    /**
     * Applicant login (users table).
     */
    public function loginApplicant(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken('applicant-token')->plainTextToken;

        return response()->json([
            'type' => 'APPLICANT',
            'user' => $user,
            'token' => $token,
        ]);
    }

    /**
     * Staff login (authority_staff table).
     */
    public function loginStaff(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $staff = AuthorityStaff::where('email', $credentials['email'])
            ->where('is_active', true)
            ->first();

        if (!$staff || !Hash::check($credentials['password'], $staff->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect or staff account is inactive.'],
            ]);
        }

        $token = $staff->createToken('staff-token')->plainTextToken;

        return response()->json([
            'type' => 'STAFF',
            'staff' => $staff,
            'token' => $token,
        ]);
    }

    /**
     * Current authenticated principal (could be User OR AuthorityStaff).
     */
    public function me(Request $request)
    {
        $principal = $request->user(); // type depends on tokenable_type in sanctum

        $type = match (true) {
            $principal instanceof AuthorityStaff => 'STAFF',
            $principal instanceof User => 'APPLICANT',
            default => 'UNKNOWN',
        };

        return response()->json([
            'type' => $type,
            'data' => $principal,
        ]);
    }

    /**
     * Logout: revoke current token.
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out',
        ]);
    }

    /**
     * Search users by email (for adding co-applicants).
     */
    public function searchByEmail(Request $request)
    {
        $request->validate([
            'email' => ['required', 'string', 'min:3'],
        ]);

        $email = $request->query('email');
        $currentUserId = $request->user()?->id;

        $users = User::where('email', 'like', "%{$email}%")
            ->when($currentUserId, fn($q) => $q->where('id', '!=', $currentUserId))
            ->select(['id', 'full_name', 'email', 'phone', 'address', 'country'])
            ->limit(5)
            ->get();

        return response()->json(['data' => $users]);
    }
}
