import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type FeedbackMessage = {
    id: number;
    kind: string;
    subject: string;
    body: string;
    attachments?: string[];
    created_at: string | null;
};

type FeedbackReply = {
    id: number;
    reply_to_id: number | null;
    kind?: string;
    subject: string;
    body: string;
    attachments?: string[];
    created_at: string | null;
};

export default function EmployeeFeedback({
    messages = [],
    replies = [],
}: {
    messages?: FeedbackMessage[];
    replies?: FeedbackReply[];
}) {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>()
        .props;
    const [replyingToId, setReplyingToId] = useState<number | null>(null);
    const [deletingMessage, setDeletingMessage] =
        useState<FeedbackMessage | null>(null);
    const form = useForm({
        kind: 'issue_report',
        subject: '',
        body: '',
        attachments: [] as File[],
    });
    const replyForm = useForm({
        body: '',
    });

    const repliesByParent = useMemo(() => {
        const map = new Map<number, FeedbackReply[]>();

        for (const reply of replies) {
            if (!reply.reply_to_id) {
                continue;
            }

            const existing = map.get(reply.reply_to_id) ?? [];
            existing.push(reply);
            map.set(reply.reply_to_id, existing);
        }

        return map;
    }, [replies]);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        form.post('/employee/feedback', {
            forceFormData: true,
            onSuccess: () => form.reset('subject', 'body', 'attachments'),
        });
    }

    function handleReplySubmit(e: React.FormEvent, messageId: number) {
        e.preventDefault();
        replyForm.post(`/employee/feedback/${messageId}/reply`, {
            onSuccess: () => {
                replyForm.reset('body');
                setReplyingToId(null);
            },
        });
    }

    function handleDelete(messageId: number) {
        router.delete(`/employee/feedback/${messageId}`);
    }

    return (
        <>
            <Head title="Issue / Feature" />

            <div className="space-y-6 p-4 sm:p-6">
                <div className="overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-r from-white via-emerald-50/70 to-cyan-50/70 shadow-sm">
                    <div className="px-6 py-6 lg:px-8">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                            Issue / Feature Request
                        </h1>
                        <p className="mt-2 text-sm text-slate-600">
                            Send problems or ideas directly to admin.
                        </p>
                    </div>
                </div>

                {flash?.success && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        {flash.error}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label>Type</Label>
                            <select
                                value={form.data.kind}
                                onChange={(e) =>
                                    form.setData(
                                        'kind',
                                        e.target.value as
                                            | 'issue_report'
                                            | 'feature_request',
                                    )
                                }
                                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                            >
                                <option value="issue_report">
                                    Issue Report
                                </option>
                                <option value="feature_request">
                                    Feature Request
                                </option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Subject</Label>
                            <Input
                                value={form.data.subject}
                                onChange={(e) =>
                                    form.setData('subject', e.target.value)
                                }
                                placeholder="Short title"
                            />
                            {form.errors.subject && (
                                <p className="text-xs text-destructive">
                                    {form.errors.subject}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label>Message</Label>
                        <textarea
                            value={form.data.body}
                            onChange={(e) =>
                                form.setData('body', e.target.value)
                            }
                            rows={8}
                            className="w-full rounded-md border border-input bg-background p-3 text-sm"
                            placeholder="Describe issue or feature request"
                        />
                        {form.errors.body && (
                            <p className="text-xs text-destructive">
                                {form.errors.body}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label>Screenshots (optional)</Label>
                        <input
                            type="file"
                            multiple
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            className="w-full rounded-md border border-input bg-background p-2 text-sm"
                            onChange={(e) =>
                                form.setData(
                                    'attachments',
                                    Array.from(e.target.files ?? []),
                                )
                            }
                        />
                        {form.errors.attachments && (
                            <p className="text-xs text-destructive">
                                {form.errors.attachments}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={form.processing}>
                            {form.processing ? 'Sending...' : 'Send to Admin'}
                        </Button>
                    </div>
                </form>

                <div className="space-y-3">
                    <h2 className="text-lg font-semibold text-slate-900">
                        My Requests
                    </h2>
                    {messages.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-6 text-sm text-slate-500">
                            No requests yet.
                        </div>
                    ) : (
                        messages.map((message) => (
                            <div
                                key={message.id}
                                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                            >
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                            message.kind === 'feature_request'
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'bg-rose-100 text-rose-700'
                                        }`}
                                    >
                                        {message.kind === 'feature_request'
                                            ? 'Feature Request'
                                            : 'Issue Report'}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        {message.created_at ?? 'Unknown date'}
                                    </span>
                                </div>
                                <h3 className="mt-2 text-sm font-semibold text-slate-900">
                                    {message.subject}
                                </h3>
                                <p className="mt-2 text-sm whitespace-pre-wrap text-slate-700">
                                    {message.body}
                                </p>
                                {(message.attachments?.length ?? 0) > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {message.attachments?.map(
                                            (attachment, idx) => (
                                                <a
                                                    key={`${message.id}-attachment-${idx}`}
                                                    href={attachment}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="block overflow-hidden rounded-lg border border-slate-200 bg-white"
                                                >
                                                    <img
                                                        src={attachment}
                                                        alt="Attachment"
                                                        className="h-20 w-20 object-cover"
                                                    />
                                                </a>
                                            ),
                                        )}
                                    </div>
                                )}

                                {(repliesByParent.get(message.id) ?? [])
                                    .length > 0 && (
                                    <div className="mt-3 space-y-2 rounded-xl border border-emerald-100 bg-emerald-50/40 p-3">
                                        {(
                                            repliesByParent.get(message.id) ??
                                            []
                                        ).map((reply) => (
                                            <div
                                                key={reply.id}
                                                className="rounded-lg border border-emerald-200 bg-white px-3 py-2"
                                            >
                                                <p className="text-xs font-semibold text-emerald-700">
                                                    {reply.kind ===
                                                    'employee_reply'
                                                        ? 'You'
                                                        : 'Admin reply'}
                                                </p>
                                                <p className="mt-1 text-sm whitespace-pre-wrap text-slate-700">
                                                    {reply.body}
                                                </p>
                                                {(reply.attachments?.length ??
                                                    0) > 0 && (
                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                        {reply.attachments?.map(
                                                            (
                                                                attachment,
                                                                idx,
                                                            ) => (
                                                                <a
                                                                    key={`${reply.id}-attachment-${idx}`}
                                                                    href={
                                                                        attachment
                                                                    }
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="block overflow-hidden rounded-lg border border-slate-200 bg-white"
                                                                >
                                                                    <img
                                                                        src={
                                                                            attachment
                                                                        }
                                                                        alt="Reply attachment"
                                                                        className="h-16 w-16 object-cover"
                                                                    />
                                                                </a>
                                                            ),
                                                        )}
                                                    </div>
                                                )}
                                                <p className="mt-1 text-xs text-slate-500">
                                                    {reply.created_at ??
                                                        'Unknown date'}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                            setReplyingToId((prev) =>
                                                prev === message.id
                                                    ? null
                                                    : message.id,
                                            )
                                        }
                                    >
                                        {replyingToId === message.id
                                            ? 'Cancel Reply'
                                            : 'Reply to admin'}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() =>
                                            setDeletingMessage(message)
                                        }
                                    >
                                        Delete
                                    </Button>
                                </div>
                                {replyingToId === message.id && (
                                    <form
                                        onSubmit={(e) =>
                                            handleReplySubmit(e, message.id)
                                        }
                                        className="mt-3 space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3"
                                    >
                                        <Label>Reply message</Label>
                                        <textarea
                                            value={replyForm.data.body}
                                            onChange={(e) =>
                                                replyForm.setData(
                                                    'body',
                                                    e.target.value,
                                                )
                                            }
                                            rows={4}
                                            className="w-full rounded-md border border-input bg-background p-3 text-sm"
                                            placeholder="Write your reply to admin..."
                                        />
                                        {replyForm.errors.body && (
                                            <p className="text-xs text-destructive">
                                                {replyForm.errors.body}
                                            </p>
                                        )}
                                        <div className="flex justify-end">
                                            <Button
                                                type="submit"
                                                size="sm"
                                                disabled={replyForm.processing}
                                            >
                                                {replyForm.processing
                                                    ? 'Sending...'
                                                    : 'Send reply'}
                                            </Button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {deletingMessage && (
                    <Dialog
                        open={true}
                        onOpenChange={() => setDeletingMessage(null)}
                    >
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Delete request</DialogTitle>
                                <DialogDescription>
                                    This will permanently delete "
                                    {deletingMessage.subject}" and all replies
                                    in this thread.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter className="gap-2">
                                <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button
                                    variant="destructive"
                                    onClick={() => {
                                        handleDelete(deletingMessage.id);
                                        setDeletingMessage(null);
                                    }}
                                >
                                    Delete permanently
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </>
    );
}
