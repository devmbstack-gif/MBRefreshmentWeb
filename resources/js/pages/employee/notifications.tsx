import { Head, Link } from '@inertiajs/react';
import { Bell, CalendarDays, Mail, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

type NotificationItem = {
    id: number;
    kind: string;
    subject: string;
    body: string;
    status: string;
    failed_reason: string | null;
    created_at: string | null;
};

type Props = {
    notifications: NotificationItem[];
};

export default function EmployeeNotifications({ notifications }: Props) {
    return (
        <>
            <Head title="Notifications" />

            <div className="space-y-6">
                <div className="overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-r from-white via-emerald-50/70 to-cyan-50/70 shadow-sm">
                    <div className="flex flex-col gap-6 px-6 py-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
                        <div className="max-w-2xl">
                            <div className="mb-3 inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                                Alerts center
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                                Notifications
                            </h1>
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                Important updates from your administrator and
                                quota plans.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-1">
                            <HeroMiniStat
                                label="Total alerts"
                                value={notifications.length}
                            />
                        </div>
                    </div>
                </div>

                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white py-20 text-center shadow-sm">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                            <Bell
                                className="h-8 w-8 text-slate-300"
                                aria-hidden
                            />
                        </div>
                        <p className="text-base font-semibold text-slate-800">
                            No notifications yet
                        </p>
                        <p className="mt-2 max-w-sm text-sm text-slate-500">
                            New plan assignments and updates from admin will
                            appear here.
                        </p>
                    </div>
                ) : (
                    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
                        <div className="divide-y divide-slate-100">
                            {notifications.map((item) => (
                                <div key={item.id} className="px-6 py-4">
                                    <div className="flex flex-wrap items-center gap-2 text-xs">
                                        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 font-semibold text-emerald-700">
                                            {item.kind.replace('_', ' ')}
                                        </span>
                                        {item.status === 'failed' && (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 font-semibold text-rose-700">
                                                <XCircle className="h-3 w-3" />
                                                Failed
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                                        <Mail className="h-4 w-4 text-slate-500" />
                                        {item.subject}
                                    </p>
                                    <p className="mt-1 text-sm leading-6 whitespace-pre-wrap text-slate-600">
                                        {item.body}
                                    </p>
                                    <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                                        <CalendarDays className="h-3.5 w-3.5" />
                                        {item.created_at ?? 'Unknown date'}
                                    </p>
                                    {item.failed_reason && (
                                        <p className="mt-2 text-xs text-rose-600">
                                            {item.failed_reason}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div>
                    <Button
                        variant="outline"
                        className="rounded-xl border-slate-200 shadow-sm"
                        asChild
                    >
                        <Link href="/employee/quota">
                            <Bell className="h-4 w-4" />
                            Back to quota
                        </Link>
                    </Button>
                </div>
            </div>
        </>
    );
}

function HeroMiniStat({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
            <p className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
                {label}
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900 tabular-nums">
                {value}
            </p>
        </div>
    );
}
