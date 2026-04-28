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
import { Label } from '@/components/ui/label';

type FeedbackMessage = {
    id: number;
    kind: string;
    direction: string;
    subject: string;
    body: string;
    from_email: string;
    to_email: string;
    status: string;
    failed_reason: string | null;
    created_at: string | null;
    employee_name: string | null;
    employee_id: number | null;
    attachments?: string[];
};

type FeedbackReply = {
    id: number;
    reply_to_id: number | null;
    kind?: string;
    subject: string;
    body: string;
    created_at: string | null;
    employee_id: number | null;
    employee_name: string | null;
    attachments?: string[];
};

export default function AdminFeedback({
    messages,
    replies,
}: {
    messages: FeedbackMessage[];
    replies: FeedbackReply[];
}) {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>()
        .props;
    const [replyingTo, setReplyingTo] = useState<FeedbackMessage | null>(null);
    const [deletingMessage, setDeletingMessage] =
        useState<FeedbackMessage | null>(null);
    const form = useForm({ body: '' });
    const feedbackMessages = messages.filter((message) =>
        ['issue_report', 'feature_request'].includes(message.kind),
    );

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

    function handleReplySubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!replyingTo) {
            return;
        }

        form.post(`/admin/mail-messages/${replyingTo.id}/reply`, {
            onSuccess: () => {
                form.reset();
                setReplyingTo(null);
            },
        });
    }

    function handleDelete(messageId: number) {
        router.delete(`/admin/mail-messages/${messageId}`);
    }

    return (
        <>
            <Head title="Feedback Inbox" />

            <div className="space-y-6 p-4 sm:p-6">
                <div className="overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-r from-white via-emerald-50/70 to-cyan-50/70 shadow-sm">
                    <div className="px-6 py-6 lg:px-8">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                            Feedback Inbox
                        </h1>
                        <p className="mt-2 text-sm text-slate-600">
                            Issue reports and feature requests sent by
                            employees.
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

                {feedbackMessages.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center text-sm text-slate-500">
                        No feedback submitted yet.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {feedbackMessages.map((message) => (
                            <div
                                key={message.id}
                                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                            >
                                <div className="flex flex-wrap items-center gap-2">
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
                                <h3 className="mt-3 text-base font-semibold text-slate-900">
                                    {message.subject}
                                </h3>
                                <p className="mt-1 text-sm text-slate-500">
                                    From:{' '}
                                    {message.employee_name ??
                                        'Unknown employee'}{' '}
                                    ({message.from_email})
                                </p>
                                <p className="mt-3 text-sm leading-6 whitespace-pre-wrap text-slate-700">
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
                                    <div className="mt-4 space-y-2 rounded-xl border border-emerald-100 bg-emerald-50/40 p-3">
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
                                                        ? 'Employee reply'
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
                                <div className="mt-4">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setReplyingTo(message)}
                                    >
                                        Reply to employee
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        className="ml-2"
                                        onClick={() =>
                                            setDeletingMessage(message)
                                        }
                                    >
                                        Delete thread
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {replyingTo && (
                    <form
                        onSubmit={handleReplySubmit}
                        className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                        <p className="text-sm font-semibold text-slate-900">
                            Reply to {replyingTo.employee_name ?? 'Employee'}
                        </p>
                        <p className="text-xs text-slate-500">
                            {replyingTo.subject}
                        </p>
                        <div className="space-y-1.5">
                            <Label>Reply message</Label>
                            <textarea
                                value={form.data.body}
                                onChange={(e) =>
                                    form.setData('body', e.target.value)
                                }
                                rows={5}
                                className="w-full rounded-md border border-input bg-background p-3 text-sm"
                                placeholder="Write your reply..."
                            />
                            {form.errors.body && (
                                <p className="text-xs text-destructive">
                                    {form.errors.body}
                                </p>
                            )}
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setReplyingTo(null)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={form.processing}>
                                {form.processing ? 'Sending...' : 'Send Reply'}
                            </Button>
                        </div>
                    </form>
                )}

                {deletingMessage && (
                    <Dialog
                        open={true}
                        onOpenChange={() => setDeletingMessage(null)}
                    >
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>
                                    Delete feedback thread
                                </DialogTitle>
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
