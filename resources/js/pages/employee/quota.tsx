import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    CalendarDays,
    CheckCircle2,
    Coffee,
    History,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

type Quota = {
    id: number;
    item_name: string;
    item_category: string;
    item_image_url?: string | null;
    plan_title: string;
    plan_ends_at: string;
    total_qty: number;
    used_qty: number;
    remaining_qty: number;
    status: 'active' | 'exhausted' | 'expired';
    percentage_used: number;
};

type Props = {
    quotas: Quota[];
    employee_name: string;
};

const categoryConfig: Record<string, { emoji: string; bg: string; pill: string; label: string }> = {
    food: { emoji: '🍱', bg: 'from-emerald-400 to-emerald-600', pill: 'bg-emerald-500', label: 'Food' },
    beverage: { emoji: '☕', bg: 'from-amber-400 to-amber-600', pill: 'bg-amber-500', label: 'Beverage' },
    snack: { emoji: '🍫', bg: 'from-rose-400 to-rose-600', pill: 'bg-rose-500', label: 'Snack' },
    drink: { emoji: '🥤', bg: 'from-blue-400 to-blue-600', pill: 'bg-blue-500', label: 'Drink' },
    drinks: { emoji: '🥤', bg: 'from-blue-400 to-blue-600', pill: 'bg-blue-500', label: 'Drinks' },
    other: { emoji: '📦', bg: 'from-slate-400 to-slate-600', pill: 'bg-slate-500', label: 'Other' },
};

function getCatConfig(category: string) {
    const normalized = category?.toLowerCase().trim();
    return categoryConfig[normalized] ?? categoryConfig.other;
}

export default function EmployeeQuota({ quotas, employee_name }: Props) {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;
    const [confirmQuota, setConfirmQuota] = useState<Quota | null>(null);
    const [isUsing, setIsUsing] = useState(false);

    function handleUse(quota: Quota) {
        setIsUsing(true);
        router.post(`/employee/quota/${quota.id}/use`, {}, {
            onFinish: () => {
                setIsUsing(false);
                setConfirmQuota(null);
            },
        });
    }

    const totalItems = quotas.length;
    const usedItems = quotas.reduce((s, q) => s + q.used_qty, 0);
    const remaining = quotas.reduce((s, q) => s + q.remaining_qty, 0);
    const activePlans = new Set(quotas.map((q) => q.plan_title)).size;

    return (
        <>
            <Head title="My Quota" />

            <div className="space-y-6">
                <div className="overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-r from-white via-emerald-50/70 to-cyan-50/70 shadow-sm">
                    <div className="flex flex-col gap-6 px-6 py-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
                        <div className="max-w-2xl">
                            <div className="mb-3 inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                                Your refreshment quota
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Refreshment Quota</h1>
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                Hello, <span className="font-semibold text-slate-800">{employee_name}</span>. Track allowances
                                across your plans. Use the header search when you need to find a page quickly.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <HeroMiniStat label="Quota lines" value={totalItems} />
                            <HeroMiniStat label="Total used" value={usedItems} />
                            <HeroMiniStat label="Remaining" value={remaining} />
                            <HeroMiniStat label="Active plans" value={activePlans} />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Your items</h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Tap &quot;Use 1&quot; when you take an item from your allowance.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" className="gap-2 self-start rounded-xl border-slate-200 shadow-sm" asChild>
                            <Link href="/employee/history">
                                <History className="h-4 w-4" />
                                View history
                            </Link>
                        </Button>
                        <Button variant="outline" className="gap-2 self-start rounded-xl border-slate-200 shadow-sm" asChild>
                            <Link href="/employee/feedback">Issue / Feature</Link>
                        </Button>
                    </div>
                </div>

                {flash?.success && (
                    <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
                        <p className="font-medium leading-relaxed">{flash.success}</p>
                    </div>
                )}
                {flash?.error && (
                    <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                        <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" aria-hidden />
                        <p className="font-medium leading-relaxed">{flash.error}</p>
                    </div>
                )}

                {quotas.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white py-20 text-center shadow-sm">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                            <Coffee className="h-8 w-8 text-slate-300" aria-hidden />
                        </div>
                        <p className="text-base font-semibold text-slate-800">No quota assigned yet</p>
                        <p className="mt-2 max-w-sm text-sm text-slate-500">
                            Contact your administrator if you expect to see allowances here.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {quotas.map((quota) => (
                            <QuotaCard key={quota.id} quota={quota} onUse={() => setConfirmQuota(quota)} />
                        ))}
                    </div>
                )}
            </div>

            <Dialog
                open={confirmQuota !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setConfirmQuota(null);
                    }
                }}
            >
                <DialogContent className="max-w-md rounded-3xl border border-emerald-100 p-0 shadow-2xl sm:max-w-md">
                    {confirmQuota && (
                        <>
                            <DialogHeader className="border-b border-emerald-100 bg-gradient-to-r from-white to-emerald-50/80 px-6 py-5 text-left">
                                <DialogTitle className="text-xl font-semibold text-slate-900">Confirm usage</DialogTitle>
                                <DialogDescription className="text-sm text-slate-600">
                                    This records one unit from your allowance. It cannot be undone.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="px-6 pb-2 pt-4">
                                <div
                                    className={`flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br py-8 ${getCatConfig(confirmQuota.item_category).bg}`}
                                >
                                    {confirmQuota.item_image_url ? (
                                        <img
                                            src={confirmQuota.item_image_url}
                                            alt={confirmQuota.item_name}
                                            className="h-20 w-20 rounded-2xl border border-white/30 object-cover shadow"
                                        />
                                    ) : (
                                        <span className="text-5xl drop-shadow-md" aria-hidden>
                                            {getCatConfig(confirmQuota.item_category).emoji}
                                        </span>
                                    )}
                                    <p className="mt-3 text-lg font-bold text-white">{confirmQuota.item_name}</p>
                                    <p className="text-sm text-white/90">{confirmQuota.plan_title}</p>
                                </div>
                                <p className="mt-4 text-sm leading-relaxed text-slate-600">
                                    You have <strong className="text-slate-900">{confirmQuota.remaining_qty}</strong> remaining
                                    {confirmQuota.remaining_qty > 0 ? (
                                        <>
                                            . After this you will have{' '}
                                            <strong className="text-slate-900">{confirmQuota.remaining_qty - 1}</strong> left.
                                        </>
                                    ) : (
                                        '.'
                                    )}
                                </p>
                            </div>
                            <DialogFooter className="gap-2 border-t border-slate-100 px-6 py-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full rounded-xl sm:w-auto"
                                    onClick={() => setConfirmQuota(null)}
                                    disabled={isUsing}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    className="w-full rounded-xl bg-primary shadow-sm hover:opacity-95 sm:w-auto"
                                    onClick={() => handleUse(confirmQuota)}
                                    disabled={isUsing || confirmQuota.remaining_qty < 1}
                                >
                                    {isUsing ? 'Processing…' : 'Confirm use'}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

function QuotaCard({ quota, onUse }: { quota: Quota; onUse?: () => void }) {
    const isActive = quota.status === 'active';
    const isLow = quota.remaining_qty <= 1 && isActive && quota.remaining_qty > 0;
    const cat = getCatConfig(quota.item_category);
    const statusLabel =
        quota.status === 'active' ? 'Active' : quota.status === 'exhausted' ? 'Exhausted' : 'Expired';

    return (
        <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-200/60 hover:shadow-md">
            <div className={`relative flex h-40 items-center justify-center bg-gradient-to-br ${cat.bg}`}>
                {quota.item_image_url ? (
                    <img
                        src={quota.item_image_url}
                        alt={quota.item_name}
                        className="h-20 w-20 rounded-2xl border border-white/30 object-cover shadow-lg transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <span className="text-6xl drop-shadow-lg transition-transform duration-300 group-hover:scale-105" aria-hidden>
                        {cat.emoji}
                    </span>
                )}
                <span
                    className={`absolute left-3 top-3 inline-flex items-center rounded-full ${cat.pill} px-2.5 py-1 text-xs font-semibold text-white shadow`}
                >
                    {cat.label}
                </span>
                <span
                    className={`absolute right-3 top-3 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold shadow ${
                        isActive
                            ? 'bg-white/95 text-emerald-800'
                            : quota.status === 'exhausted'
                              ? 'bg-slate-900/90 text-white'
                              : 'bg-slate-600/95 text-white'
                    }`}
                >
                    {statusLabel}
                </span>
                {isLow && (
                    <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-1 text-xs font-bold text-amber-950 shadow">
                        <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
                        Low
                    </span>
                )}
            </div>
            <div className="p-4">
                <h3 className="text-base font-bold tracking-tight text-slate-900">{quota.item_name}</h3>
                <p className="mt-0.5 text-xs font-medium text-slate-500">{quota.plan_title}</p>
                <div className="mt-4">
                    <div className="mb-1.5 flex justify-between text-xs font-medium text-slate-500">
                        <span>Used {quota.used_qty}</span>
                        <span>of {quota.total_qty}</span>
                    </div>
                    <div
                        className="h-2 overflow-hidden rounded-full bg-slate-100"
                        role="progressbar"
                        aria-valuenow={quota.percentage_used}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${quota.percentage_used}% used`}
                    >
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${
                                quota.percentage_used >= 100
                                    ? 'bg-rose-500'
                                    : quota.percentage_used >= 75
                                      ? 'bg-amber-500'
                                      : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(0, quota.percentage_used))}%` }}
                        />
                    </div>
                </div>
                <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                    <CalendarDays className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
                    <span>Plan ends {quota.plan_ends_at}</span>
                </p>
                <div className="mt-4">
                    {isActive && onUse && quota.remaining_qty > 0 ? (
                        <Button type="button" onClick={onUse} className="h-10 w-full rounded-xl font-semibold shadow-sm">
                            Use 1 · {quota.item_name}
                        </Button>
                    ) : (
                        <div className="flex h-10 w-full items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-center text-xs font-semibold text-slate-400">
                            {quota.status === 'exhausted' ? 'Fully used' : quota.status === 'expired' ? 'Expired' : 'Unavailable'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function HeroMiniStat({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">{value}</p>
        </div>
    );
}
