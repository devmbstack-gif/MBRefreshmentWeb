<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AppNotification;
use App\Models\EmployeeQuota;
use App\Models\QuotaUsage;
use App\Services\QuotaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class EmployeeController extends Controller
{
    private function buildImageUrl(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        return url($path);
    }

    public function quota(Request $request): JsonResponse
    {
        $employee = $request->user()->employee;

        $quotas = EmployeeQuota::query()
            ->where('employee_id', $employee->id)
            ->whereIn('status', ['active', 'exhausted'])
            ->with(['item', 'plan'])
            ->get()
            ->map(fn ($quota) => [
                'id' => $quota->id,
                'item_name' => $quota->item->name,
                'item_category' => $quota->item->category,
                'item_image_url' => $this->buildImageUrl($quota->item->image_url),
                'plan_title' => $quota->plan->title,
                'plan_ends_at' => $quota->plan->ends_at->toDateString(),
                'total_qty' => $quota->total_qty,
                'used_qty' => $quota->used_qty,
                'remaining_qty' => $quota->remaining_qty,
                'status' => $quota->status,
                'percentage_used' => $quota->total_qty > 0
                    ? round(($quota->used_qty / $quota->total_qty) * 100)
                    : 0,
            ]);

        return response()->json([
            'status' => true,
            'message' => 'Employee Quotas',
            'quotas' => $quotas,
        ]);
    }

    public function useQuota(Request $request, EmployeeQuota $quota, QuotaService $quotaService): JsonResponse
    {
        $validated = $request->validate([
            'quantity' => ['nullable', 'integer', 'min:1', 'max:10'],
        ]);

        $employee = $request->user()->employee;
        if ($quota->employee_id !== $employee->id) {
            return response()->json([
                'message' => 'This quota does not belong to you.',
            ], 403);
        }

        $quantity = $validated['quantity'] ?? 1;

        try {
            $quotaService->useQuota($quota, $quantity);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }

        $quota->load(['item', 'plan']);

        return response()->json([
            'status' => true,
            'message' => 'Order Placed Successfully',
            'quota' => [
                'id' => $quota->id,
                'item_name' => $quota->item->name,
                'item_image_url' => $this->buildImageUrl($quota->item->image_url),
                'plan_title' => $quota->plan->title,
                'total_qty' => $quota->total_qty,
                'used_qty' => $quota->used_qty,
                'remaining_qty' => $quota->remaining_qty,
                'status' => $quota->status,
            ],
        ]);
    }

    public function history(Request $request): JsonResponse
    {
        $employee = $request->user()->employee;

        $usages = QuotaUsage::query()
            ->where('employee_id', $employee->id)
            ->with('item')
            ->latest('used_at')
            ->get()
            ->map(fn ($usage) => [
                'id' => $usage->id,
                'item_name' => $usage->item->name,
                'item_category' => $usage->item->category,
                'item_image_url' => $this->buildImageUrl($usage->item->image_url),
                'quantity_used' => $usage->quantity_used,
                'used_at' => $usage->used_at?->toIso8601String(),
            ]);

        return response()->json([
            'status' => true,
            'message' => 'Employee History',
            'history' => $usages,
        ]);
    }

    public function notifications(Request $request): JsonResponse
    {
        $user = $request->user();

        $notifications = AppNotification::query()
            ->where('user_id', $user->id)
            ->latest('created_at')
            ->limit(100)
            ->get()
            ->map(fn ($notification) => [
                'id' => $notification->id,
                'title' => $notification->title,
                'message' => $notification->message,
                'type' => $notification->type,
                'is_read' => (bool) $notification->is_read,
                'related_id' => $notification->related_id,
                'created_at' => $notification->created_at?->toIso8601String(),
            ]);

        return response()->json([
            'status' => true,
            'message' => 'Employee Notifications',
            'notifications' => $notifications,
        ]);
    }

    public function markNotificationAsRead(Request $request, int $notification): JsonResponse
    {
        $notificationModel = AppNotification::query()
            ->where('id', $notification)
            ->where('user_id', $request->user()->id)
            ->first();

        if (! $notificationModel) {
            return response()->json([
                'status' => false,
                'message' => 'Notification not found.',
            ], 404);
        }

        $notificationModel->update(['is_read' => true]);

        return response()->json([
            'status' => true,
            'message' => 'Notification marked as read.',
        ]);
    }

    public function updateProfileAvatar(Request $request): JsonResponse
    {
        $request->validate([
            'avatar' => 'required|file|mimes:jpg,jpeg,png,webp|max:2048',
        ], [
            'avatar.required' => 'Please choose an image file.',
            'avatar.file' => 'Please upload a valid file.',
            'avatar.mimes' => 'Profile image must be a JPG, JPEG, PNG, or WEBP file.',
            'avatar.max' => 'Profile image size must not be greater than 2MB.',
        ]);

        $user = $request->user();

        if ($user->avatar) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $user->avatar));
        }

        $user->avatar = '/storage/'.$request->file('avatar')->store('avatars', 'public');
        $user->save();

        return response()->json([
            'status' => true,
            'message' => 'Profile image updated successfully.',
            'avatar' => $user->avatar,
            'avatar_url' => $this->buildImageUrl($user->avatar),
        ]);
    }
}
