<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Policy;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PolicyController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $type = $request->query('type');

        if (! is_string($type) || ! in_array($type, Policy::types(), true)) {
            return response()->json([
                'status' => false,
                'message' => 'Invalid or missing type. Use type=terms or type=privacy.',
            ], 422);
        }

        $policy = Policy::query()->where('type', $type)->first();

        if (! $policy) {
            return response()->json([
                'status' => false,
                'message' => 'Policy not found.',
            ], 404);
        }

        return response()->json([
            'status' => true,
            'data' => [
                'type' => $policy->type,
                'text' => $policy->text,
                'updated_at' => $policy->updated_at?->toIso8601String(),
            ],
        ]);
    }
}
