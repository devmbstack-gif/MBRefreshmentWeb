<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AppNotification;
use App\Models\EmployeeQuota;
use App\Models\MailMessage;
use App\Models\QuotaUsage;
use App\Models\User;
use App\Services\NotificationService;
use App\Services\QuotaService;
use App\Support\PublicDiskUpload;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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

    private function buildAttachmentUrls(?array $attachments): array
    {
        if (! $attachments) {
            return [];
        }

        return collect($attachments)
            ->filter(fn ($path) => is_string($path) && $path !== '')
            ->map(fn ($path) => $this->buildImageUrl($path))
            ->filter()
            ->values()
            ->all();
    }

    public function quota(Request $request): JsonResponse
    {
        $employee = $request->user()->employee;

        $quotas = EmployeeQuota::query()
            ->where('employee_id', $employee->id)
            ->whereIn('status', ['active', 'exhausted'])
            ->whereHas('plan', fn ($q) => $q->where('is_active', true))
            ->whereHas('item', fn ($q) => $q->where('is_active', true))
            ->with(['item', 'plan'])
            ->get()
            ->map(fn ($quota) => [
                'id' => $quota->id,
                'item_name' => $quota->item->name,
                'item_category' => $quota->item->category,
                'item_description' => $quota->item->description,
                'item_image_url' => $this->buildImageUrl($quota->item->image_url),
                'plan_title' => $quota->plan->title,
                'plan_description' => $quota->plan->description,
                'plan_period_type' => $quota->plan->period_type,
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

    public function useQuota(Request $request, int $quota, QuotaService $quotaService): JsonResponse
    {
        $validated = $request->validate([
            'quantity' => ['nullable', 'integer', 'min:1', 'max:10'],
        ]);

        $employee = $request->user()->employee;
        $employeeQuota = EmployeeQuota::query()
            ->where('id', $quota)
            ->where('employee_id', $employee->id)
            ->first();

        if (! $employeeQuota) {
            return response()->json([
                'status' => false,
                'message' => 'Quota not found for this employee.',
            ], 404);
        }

        $quantity = $validated['quantity'] ?? 1;
        $isMealCategory = strcasecmp(trim((string) $employeeQuota->item?->category), 'meal') === 0;

        try {
            if ($isMealCategory) {
                $mealRequest = $quotaService->requestMealQuota($employeeQuota, $quantity);

                return response()->json([
                    'status' => true,
                    'message' => 'Meal request submitted and waiting for admin approval.',
                    'request' => [
                        'id' => $mealRequest->id,
                        'status' => $mealRequest->status,
                        'quantity' => $mealRequest->quantity,
                        'requested_at' => $mealRequest->requested_at?->toIso8601String(),
                    ],
                ], 201);
            }

            $quotaService->useQuota($employeeQuota, $quantity);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage(),
            ], 422);
        }

        $employeeQuota->load(['item', 'plan']);

        return response()->json([
            'status' => true,
            'message' => 'Order Placed Successfully',
            'quota' => [
                'id' => $employeeQuota->id,
                'item_name' => $employeeQuota->item->name,
                'item_category' => $employeeQuota->item->category,
                'item_description' => $employeeQuota->item->description,
                'item_image_url' => $this->buildImageUrl($employeeQuota->item->image_url),
                'plan_title' => $employeeQuota->plan->title,
                'plan_description' => $employeeQuota->plan->description,
                'plan_period_type' => $employeeQuota->plan->period_type,
                'plan_ends_at' => $employeeQuota->plan->ends_at->toDateString(),
                'total_qty' => $employeeQuota->total_qty,
                'used_qty' => $employeeQuota->used_qty,
                'remaining_qty' => $employeeQuota->remaining_qty,
                'status' => $employeeQuota->status,
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
                'item_description' => $usage->item->description,
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

    public function markAllNotificationsAsRead(Request $request): JsonResponse
    {
        $user = $request->user();

        $updated = AppNotification::query()
            ->where('user_id', $user->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json([
            'status' => true,
            'message' => 'All notifications marked as read.',
            'marked_count' => $updated,
        ]);
    }

    public function updateProfileAvatar(Request $request): JsonResponse
    {
        $request->validate([
            'avatar' => 'required|file|extensions:jpg,jpeg,png,webp|max:2048',
        ], [
            'avatar.required' => 'Please choose an image file.',
            'avatar.file' => 'Please upload a valid file.',
            'avatar.extensions' => 'Profile image must be a JPG, JPEG, PNG, or WEBP file.',
            'avatar.max' => 'Profile image size must not be greater than 2MB.',
        ]);

        $user = $request->user();

        if ($user->avatar) {
            PublicDiskUpload::deleteFromPublicUrl($user->avatar);
        }

        $user->avatar = PublicDiskUpload::store($request->file('avatar'), 'avatars');
        $user->save();

        return response()->json([
            'status' => true,
            'message' => 'Profile image updated successfully.',
            'avatar' => $user->avatar,
            'avatar_url' => $this->buildImageUrl($user->avatar),
        ]);
    }

    public function feedback(Request $request): JsonResponse
    {
        $employee = $request->user()->employee;

        $messages = MailMessage::query()
            ->where('employee_id', $employee?->id)
            ->whereIn('kind', ['issue_report', 'feature_request'])
            ->latest('created_at')
            ->limit(80)
            ->get();

        $repliesByParent = MailMessage::query()
            ->where('employee_id', $employee?->id)
            ->whereIn('kind', ['admin_reply', 'employee_reply'])
            ->whereNotNull('reply_to_id')
            ->latest('created_at')
            ->limit(120)
            ->get()
            ->map(fn ($m) => [
                'id' => $m->id,
                'reply_to_id' => $m->reply_to_id,
                'subject' => $m->subject,
                'body' => $m->body,
                'attachments' => $this->buildAttachmentUrls($m->attachments),
                'created_at' => $m->created_at?->toIso8601String(),
                'kind' => $m->kind,
            ])
            ->groupBy('reply_to_id');

        $feedback = $messages->map(fn ($m) => [
            'id' => $m->id,
            'kind' => $m->kind,
            'subject' => $m->subject,
            'body' => $m->body,
            'attachments' => $this->buildAttachmentUrls($m->attachments),
            'created_at' => $m->created_at?->toIso8601String(),
            'replies' => ($repliesByParent->get($m->id) ?? collect())->values(),
        ])->values();

        return response()->json([
            'status' => true,
            'message' => 'Employee feedback thread',
            'feedback' => $feedback,
        ]);
    }

    public function submitFeedback(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'kind' => 'required|in:issue_report,feature_request',
            'subject' => 'required|string|max:150',
            'body' => 'required|string|max:5000',
            'attachments' => 'nullable|array|max:5',
            'attachments.*' => 'file|extensions:jpg,jpeg,png,webp|max:4096',
        ]);

        $user = $request->user();
        $employee = $user->employee;
        $toAddress = (string) config('mail.from.address');

        $attachmentPaths = [];
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $attachmentPaths[] = PublicDiskUpload::store(
                    $file,
                    'feedback-attachments',
                );
            }
        }

        $feedback = MailMessage::create([
            'kind' => $validated['kind'],
            'direction' => 'to_admin',
            'subject' => $validated['subject'],
            'body' => $validated['body'],
            'from_email' => (string) $user->email,
            'to_email' => $toAddress !== '' ? $toAddress : (string) $user->email,
            'employee_id' => $employee?->id,
            'status' => 'sent',
            'attachments' => $attachmentPaths,
        ]);

        $title = $validated['kind'] === 'feature_request' ? 'New feature request' : 'New issue report';
        $message = "{$user->name}: {$validated['subject']}";

        User::query()
            ->where('role', 'super_admin')
            ->where('is_active', true)
            ->each(function (User $admin) use ($title, $message, $feedback) {
                app(NotificationService::class)->saveInApp($admin, 'general', $title, $message, $feedback->id);
            });

        return response()->json([
            'status' => true,
            'message' => 'Feedback sent successfully.',
            'feedback_id' => $feedback->id,
            'attachments' => $this->buildAttachmentUrls($attachmentPaths),
        ], 201);
    }

    public function replyFeedback(Request $request, MailMessage $message): JsonResponse
    {
        $validated = $request->validate([
            'body' => 'required|string|max:5000',
            'attachments' => 'nullable|array|max:5',
            'attachments.*' => 'file|extensions:jpg,jpeg,png,webp|max:4096',
        ]);

        $employee = $request->user()->employee;
        if (! $employee || $message->employee_id !== $employee->id) {
            return response()->json([
                'status' => false,
                'message' => 'This request does not belong to you.',
            ], 403);
        }
        if (! in_array($message->kind, ['issue_report', 'feature_request'], true)) {
            return response()->json([
                'status' => false,
                'message' => 'Reply can only be sent on request threads.',
            ], 422);
        }

        $attachmentPaths = [];
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $attachmentPaths[] = PublicDiskUpload::store(
                    $file,
                    'feedback-attachments',
                );
            }
        }

        $reply = MailMessage::create([
            'kind' => 'employee_reply',
            'direction' => 'to_admin',
            'subject' => "Re: {$message->subject}",
            'body' => $validated['body'],
            'from_email' => (string) $request->user()->email,
            'to_email' => (string) config('mail.from.address'),
            'employee_id' => $employee->id,
            'reply_to_id' => $message->id,
            'status' => 'sent',
            'attachments' => $attachmentPaths,
        ]);

        User::query()
            ->where('role', 'super_admin')
            ->where('is_active', true)
            ->each(function (User $admin) use ($validated, $message) {
                app(NotificationService::class)->saveInApp(
                    $admin,
                    'general',
                    'Employee replied to request',
                    $validated['body'],
                    $message->id
                );
            });

        return response()->json([
            'status' => true,
            'message' => 'Reply sent successfully.',
            'reply' => [
                'id' => $reply->id,
                'reply_to_id' => $reply->reply_to_id,
                'kind' => $reply->kind,
                'subject' => $reply->subject,
                'body' => $reply->body,
                'attachments' => $this->buildAttachmentUrls($attachmentPaths),
                'created_at' => $reply->created_at?->toIso8601String(),
            ],
        ], 201);
    }

    public function deleteFeedback(Request $request, MailMessage $message): JsonResponse
    {
        $employee = $request->user()->employee;
        if (! $employee || $message->employee_id !== $employee->id) {
            return response()->json([
                'status' => false,
                'message' => 'This request does not belong to you.',
            ], 403);
        }
        if (! in_array($message->kind, ['issue_report', 'feature_request'], true)) {
            return response()->json([
                'status' => false,
                'message' => 'Only request threads can be deleted.',
            ], 422);
        }

        MailMessage::query()->where('reply_to_id', $message->id)->delete();
        $message->delete();

        return response()->json([
            'status' => true,
            'message' => 'Feedback thread deleted successfully.',
        ]);
    }
}
