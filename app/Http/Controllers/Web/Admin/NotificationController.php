<?php

namespace App\Http\Controllers\Web\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $notifications = AppNotification::query()
            ->where('user_id', $user->id)
            ->latest('created_at')
            ->limit(120)
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

        $unreadCount = AppNotification::query()
            ->where('user_id', $user->id)
            ->where('is_read', false)
            ->count();

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $unreadCount,
        ]);
    }

    public function markAsRead(Request $request, int $notification): JsonResponse
    {
        $user = $request->user();

        $notificationModel = AppNotification::query()
            ->where('id', $notification)
            ->where('user_id', $user->id)
            ->first();

        if (! $notificationModel) {
            return response()->json(['message' => 'Notification not found.'], 404);
        }

        $notificationModel->update(['is_read' => true]);

        $unreadCount = AppNotification::query()
            ->where('user_id', $user->id)
            ->where('is_read', false)
            ->count();

        return response()->json([
            'message' => 'Notification marked as read.',
            'unread_count' => $unreadCount,
        ]);
    }
}
