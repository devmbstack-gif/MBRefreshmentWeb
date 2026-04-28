import { Head } from '@inertiajs/react';
import { CalendarDays, Clock, History } from 'lucide-react';

type Usage = {
    id: number;
    item_name: string;
    item_category: string;
    quantity_used: number;
    used_at: string;
};

type Props = {
    usages: Usage[];
};

const categoryConfig: Record<
    string,
    { emoji: string; bg: string; pill: string; label: string }
> = {
    food: {
        emoji: '🍱',
        bg: 'from-emerald-400 to-emerald-600',
        pill: 'bg-emerald-500',
        label: 'Food',
    },
    beverage: {
        emoji: '☕',
        bg: 'from-amber-400 to-amber-600',
        pill: 'bg-amber-500',
        label: 'Beverage',
    },
    snack: {
        emoji: '🍫',
        bg: 'from-rose-400 to-rose-600',
        pill: 'bg-rose-500',
        label: 'Snack',
    },
    drink: {
        emoji: '🥤',
        bg: 'from-blue-400 to-blue-600',
        pill: 'bg-blue-500',
        label: 'Drink',
    },
    other: {
        emoji: '📦',
        bg: 'from-slate-400 to-slate-600',
        pill: 'bg-slate-500',
        label: 'Other',
    },
};

function getCatConfig(category: string) {
    return categoryConfig[category?.toLowerCase()] ?? categoryConfig.other;
}

export default function EmployeeHistory({ usages }: Props) {
    return (
        <>
            <Head title="Usage History" />

            <div className="space-y-6">
                <div className="overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-r from-white via-emerald-50/70 to-cyan-50/70 shadow-sm">
                    <div className="flex flex-col gap-6 px-6 py-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
                        <div className="max-w-2xl">
                            <div className="mb-3 inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                                Activity timeline
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                                Usage History
                            </h1>
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                Every item you have used, with exact date and
                                time.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
                            <HeroMiniStat
                                label="Total logs"
                                value={usages.length}
                            />
                            <HeroMiniStat
                                label="Total used"
                                value={usages.reduce(
                                    (sum, usage) => sum + usage.quantity_used,
                                    0,
                                )}
                            />
                        </div>
                    </div>
                </div>

                {usages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white py-20 text-center shadow-sm">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                            <History
                                className="h-8 w-8 text-slate-300"
                                aria-hidden
                            />
                        </div>
                        <p className="text-base font-semibold text-slate-800">
                            No usage history yet
                        </p>
                        <p className="mt-2 max-w-sm text-sm text-slate-500">
                            No usage history yet. Start using your quota items
                            to see them here.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-100 px-6 py-4">
                            <p className="text-sm text-slate-500">
                                {usages.length} total usage
                                {usages.length !== 1 ? 's' : ''}
                            </p>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {usages.map((usage) => (
                                <div
                                    key={usage.id}
                                    className="flex items-center justify-between gap-4 px-6 py-4"
                                >
                                    <div className="flex min-w-0 items-center gap-4">
                                        <div
                                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${getCatConfig(usage.item_category).bg}`}
                                        >
                                            <span
                                                className="text-xl"
                                                aria-hidden
                                            >
                                                {
                                                    getCatConfig(
                                                        usage.item_category,
                                                    ).emoji
                                                }
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900">
                                                {usage.item_name}
                                            </p>
                                            <div className="mt-0.5 flex items-center gap-2">
                                                <span
                                                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold text-white ${getCatConfig(usage.item_category).pill}`}
                                                >
                                                    {
                                                        getCatConfig(
                                                            usage.item_category,
                                                        ).label
                                                    }
                                                </span>
                                                <span className="text-xs text-slate-500">
                                                    Qty: {usage.quantity_used}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex shrink-0 items-center gap-1.5 text-xs text-slate-500">
                                        <CalendarDays className="h-3.5 w-3.5" />
                                        <span className="hidden sm:inline">
                                            {usage.used_at}
                                        </span>
                                        <span className="sm:hidden">
                                            <Clock className="h-3.5 w-3.5" />
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
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
