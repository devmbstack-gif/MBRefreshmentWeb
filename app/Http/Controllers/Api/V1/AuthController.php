<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    private function avatarUrl(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        return url($path);
    }

    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
            'device_name' => ['nullable', 'string', 'max:120'],
            'fcm_token' => ['nullable', 'string'],
            'fcm_platform' => ['nullable', 'in:android,ios,web'],
        ]);

        $user = User::query()
            ->with('employee')
            ->where('email', $validated['email'])
            ->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'status' => false,
                'message' => 'Invalid credentials.',
            ], 401);
        }

        if (! $user->isEmployee()) {
            return response()->json([
                'status' => false,
                'message' => 'Only employee accounts can use this mobile login.',
            ], 403);
        }

        if (! $user->is_active) {
            return response()->json([
                'status' => false,
                'message' => 'Your account is inactive. Please contact admin.',
            ], 403);
        }

        if (! empty($validated['fcm_token'])) {
            $user->forceFill([
                'fcm_token' => $validated['fcm_token'],
                'fcm_platform' => $validated['fcm_platform'] ?? null,
                'fcm_updated_at' => now(),
            ])->save();
        }

        $token = $user->createToken($validated['device_name'] ?? 'flutter-mobile')->plainTextToken;

        $employee = $user->employee ? [
            'id' => $user->employee->id,
            'employee_code' => $user->employee->employee_code,
            'department' => $user->employee->department,
            'designation' => $user->employee->designation,
            'joining_date' => $user->employee->joining_date?->toDateString(),
        ] : null;

        return response()->json([
            'status' => true,
            'message' => 'Login Successfully',
            'token' => $token,
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'phone' => $user->phone,
                'avatar' => $user->avatar,
                'avatar_url' => $this->avatarUrl($user->avatar),
                'employee' => $employee,
            ],
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->loadMissing('employee');

        $employee = $user->employee ? [
            'id' => $user->employee->id,
            'employee_code' => $user->employee->employee_code,
            'department' => $user->employee->department,
            'designation' => $user->employee->designation,
            'joining_date' => $user->employee->joining_date?->toDateString(),
        ] : null;

        return response()->json([
            'status' => true,
            'message' => 'User Details',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'phone' => $user->phone,
                'avatar' => $user->avatar,
                'avatar_url' => $this->avatarUrl($user->avatar),
                'employee' => $employee,
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->forceFill([
            'fcm_token' => null,
            'fcm_platform' => null,
            'fcm_updated_at' => now(),
        ])->save();

        $accessToken = $request->user()->currentAccessToken();
        if ($accessToken && isset($accessToken->id)) {
            $request->user()->tokens()->whereKey($accessToken->id)->delete();
        }

        return response()->json([
            'status' => true,
            'message' => 'Logged out successfully.',
        ]);
    }
}
