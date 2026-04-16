import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Clock, Coffee, History, Package, Search } from 'lucide-react';

type Quota = {
    id: number;
    item_name: string;
    item_category: string;
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
    other: { emoji: '📦', bg: 'from-gray-400 to-gray-600', pill: 'bg-gray-500', label: 'Other' },
};

function getCatConfig(category: string) {
    return categoryConfig[category?.toLowerCase()] ?? categoryConfig.other;
}

export default function EmployeeQuota({ quotas, employee_name }: Props) {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;
    const [confirmQuota, setConfirmQuota] = useState<Quota | null>(null);
    const [isUsing, setIsUsing] = useState(false);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');

    function handleUse(quota: Quota) {
        setIsUsing(true);
        router.post(`/employee/quota/${quota.id}/use`, {}, {
            onFinish: () => {
                setIsUsing(false);
                setConfirmQuota(null);
            },
        });
    }

    const filtered = quotas.filter((q) => {
        const matchSearch =
            !search ||
            q.item_name.toLowerCase().includes(search.toLowerCase()) ||
            q.plan_title.toLowerCase().includes(search.toLowerCase());
        const matchCat = categoryFilter === 'All' || q.item_category.toLowerCase() === categoryFilter.toLowerCase();
        const matchStatus = statusFilter === 'All' || q.status === statusFilter.toLowerCase();
        return matchSearch && matchCat && matchStatus;
    });

    const totalItems = quotas.length;
    const usedItems = quotas.reduce((s, q) => s + q.used_qty, 0);
    const remaining = quotas.reduce((s, q) => s + q.remaining_qty, 0);
    const activePlans = new Set(quotas.map((q) => q.plan_title)).size;

    return (
        <>
            <Head title="My Quota" />

            <div className="min-h-screen bg-[#f7f8fa]">
                <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">My Refreshment Quota</h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Hello, {employee_name}! Track and use your assigned refreshment allowances.
                            </p>
                        </div>
                        <Link
                            href="/employee/history"
                            className="inline-flex items-center gap-1.5 self-start rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-violet-700"
                        >
                            <History className="h-4 w-4" /> View History
                        </Link>
                    </div>

                    {flash?.success && (
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                            ✅ {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                            ❌ {flash.error}
                        </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            icon={<Package className="h-5 w-5 text-violet-600" />}
                            iconBg="bg-violet-100"
                            label="Total Items"
                            value={totalItems}
                        />
                        <StatCard
                            icon={<Coffee className="h-5 w-5 text-emerald-600" />}
                            iconBg="bg-emerald-100"
                            label="Total Used"
                            value={usedItems}
                        />
                        <StatCard
                            icon={<Clock className="h-5 w-5 text-amber-600" />}
                            iconBg="bg-amber-100"
                            label="Remaining"
                            value={remaining}
                        />
                        <StatCard
                            icon={<Search className="h-5 w-5 text-blue-600" />}
                            iconBg="bg-blue-100"
                            label="Active Plans"
                            value={activePlans}
                        />
                    </div>

                    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="relative min-w-48 flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by item or plan name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-sm focus:border-violet-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-200"
                            />
                        </div>
                        <FilterSelect
                            label="Category"
                            value={categoryFilter}
                            options={['All', 'Food', 'Beverage', 'Snack', 'Drink', 'Other']}
                            onChange={setCategoryFilter}
                        />
                        <FilterSelect
                            label="Status"
                            value={statusFilter}
                            options={['All', 'active', 'exhausted', 'expired']}
                            onChange={setStatusFilter}
                        />
                        <button
                            type="button"
                            onClick={() => {
                                setSearch('');
                                setCategoryFilter('All');
                                setStatusFilter('All');
                            }}
                            className="rounded-lg bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-700"
                        >
                            Reset
                        </button>
                    </div>

                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-20 text-center">
                            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                                <Coffee className="h-8 w-8 text-gray-300" />
                            </div>
                            <p className="text-base font-semibold text-gray-700">No quota items found</p>
                            <p className="mt-1 text-sm text-gray-400">
                                {quotas.length === 0
                                    ? 'No quota assigned yet. Please contact your admin.'
                                    : 'Try adjusting your filters.'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {filtered.map((quota) => (
                                <QuotaCard key={quota.id} quota={quota} onUse={() => setConfirmQuota(quota)} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {confirmQuota && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
                        <h3 className="text-lg font-semibold text-gray-900">Confirm Usage</h3>
                        <div className="mt-4 space-y-4">
                            <div className={`flex flex-col items-center justify-center rounded-xl bg-gradient-to-br py-8 ${getCatConfig(confirmQuota.item_category).bg}`}>
                                <span className="text-5xl">{getCatConfig(confirmQuota.item_category).emoji}</span>
                                <p className="mt-2 text-lg font-bold text-white">{confirmQuota.item_name}</p>
                                <p className="text-sm text-white/80">{confirmQuota.plan_title}</p>
                            </div>
                            <p className="text-sm text-gray-600">
                                You have <strong>{confirmQuota.remaining_qty}</strong> remaining. After this you&apos;ll have <strong>{confirmQuota.remaining_qty - 1}</strong> left. This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    onClick={() => setConfirmQuota(null)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="flex-1 rounded-lg bg-violet-600 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
                                    onClick={() => handleUse(confirmQuota)}
                                    disabled={isUsing}
                                >
                                    {isUsing ? 'Processing...' : 'Confirm Use'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function QuotaCard({ quota, onUse }: { quota: Quota; onUse?: () => void }) {
    const isActive = quota.status === 'active';
    const isLow = quota.remaining_qty <= 1 && isActive;
    const cat = getCatConfig(quota.item_category);

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
            <div className={`relative flex h-36 items-center justify-center bg-gradient-to-br ${cat.bg}`}>
                <span className="text-6xl drop-shadow-lg">{cat.emoji}</span>
                <span
                    className={`absolute left-3 top-3 inline-flex items-center rounded-full ${cat.pill} px-2.5 py-1 text-xs font-semibold text-white shadow`}
                >
                    {cat.label}
                </span>
                <span
                    className={`absolute right-3 top-3 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                        isActive ? 'bg-emerald-500 text-white' : quota.status === 'exhausted' ? 'bg-gray-800 text-white' : 'bg-gray-500 text-white'
                    }`}
                >
                    {quota.status}
                </span>
                {isLow && (
                    <span className="absolute bottom-3 right-3 rounded-full bg-amber-400 px-2 py-0.5 text-xs font-bold text-white">
                        ⚠ Low
                    </span>
                )}
            </div>
            <div className="p-4">
                <h3 className="text-sm font-bold text-gray-900">{quota.item_name}</h3>
                <p className="mt-0.5 text-xs text-gray-400">{quota.plan_title}</p>
                <div className="mt-3">
                    <div className="mb-1 flex justify-between text-xs text-gray-400">
                        <span>Used: {quota.used_qty}</span>
                        <span>Total: {quota.total_qty}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                        <div
                            className={`h-full rounded-full transition-all ${
                                quota.percentage_used >= 100
                                    ? 'bg-rose-500'
                                    : quota.percentage_used >= 75
                                      ? 'bg-amber-500'
                                      : 'bg-violet-500'
                            }`}
                            style={{ width: `${quota.percentage_used}%` }}
                        />
                    </div>
                </div>
                <p className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="h-3 w-3" /> Expires {quota.plan_ends_at}
                </p>
                <div className="mt-3">
                    {isActive && onUse ? (
                        <button
                            type="button"
                            onClick={onUse}
                            className="w-full rounded-lg bg-violet-600 py-2 text-xs font-semibold text-white transition hover:bg-violet-700"
                        >
                            Use 1 {quota.item_name}
                        </button>
                    ) : (
                        <div className="w-full rounded-lg bg-gray-100 py-2 text-center text-xs font-medium text-gray-400">
                            {quota.status === 'exhausted' ? 'All Used Up' : 'Expired'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, iconBg, label, value }: { icon: React.ReactNode; iconBg: string; label: string; value: number }) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}>{icon}</div>
            <p className="mt-4 text-xs font-medium text-gray-400">{label}</p>
            <p className="mt-0.5 text-3xl font-bold tabular-nums text-gray-900">{value}</p>
        </div>
    );
}

function FilterSelect({
    label,
    value,
    options,
    onChange,
}: {
    label: string;
    value: string;
    options: string[];
    onChange: (v: string) => void;
}) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-300"
            >
                {options.map((o) => (
                    <option key={o} value={o}>
                        {o}
                    </option>
                ))}
            </select>
        </div>
    );
}
