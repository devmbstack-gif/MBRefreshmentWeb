import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import {
    AlertTriangle,
    BarChart3,
    ChevronRight,
    ClipboardList,
    Clock,
    Coffee,
    Package,
    Plus,
    Search,
    Users,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type Stats = {
    total_employees: number;
    active_plans: number;
    today_usages: number;
    low_quota_alerts: number;
    total_items: number;
    month_usages: number;
};

type RecentUsage = {
    id: number;
    employee_name: string;
    employee_avatar: string | null;
    item_name: string;
    item_category: string;
    quantity_used: number;
    used_at: string;
    used_at_full: string;
};

type LowQuotaEmployee = {
    employee_name: string;
    employee_avatar: string | null;
    item_name: string;
    remaining_qty: number;
    total_qty: number;
};

type ActivePlan = {
    id: number;
    title: string;
    period_type: string;
    ends_at: string | null;
};

type Props = {
    stats: Stats;
    recent_usages: RecentUsage[];
    low_quota_employees: LowQuotaEmployee[];
    active_plans: ActivePlan[];
    admin_name: string;
};

const categoryEmoji: Record<string, string> = {
    food: '🍱',
    beverage: '☕',
    snack: '🍫',
    drink: '🥤',
};

function getEmoji(cat: string) {
    return categoryEmoji[cat?.toLowerCase()] ?? '🧃';
}

function getInitials(name: string) {
    return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();
}

const avatarPalette = ['#10b981', '#3b82f6', '#8b5cf6', '#f43f5e', '#f59e0b', '#06b6d4', '#ec4899', '#6366f1'];
function avatarBg(name: string) {
    let h = 0;
    for (const c of name) h += c.charCodeAt(0);
    return avatarPalette[h % avatarPalette.length];
}

export default function AdminDashboard({ stats, recent_usages, low_quota_employees, active_plans, admin_name }: Props) {
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');

    const filtered = recent_usages.filter((u) => {
        const matchSearch =
            !search ||
            u.employee_name.toLowerCase().includes(search.toLowerCase()) ||
            u.item_name.toLowerCase().includes(search.toLowerCase());
        const matchCat = categoryFilter === 'All' || u.item_category.toLowerCase() === categoryFilter.toLowerCase();
        const matchStatus =
            statusFilter === 'All' ||
            (statusFilter === 'Active' && u.quantity_used > 0) ||
            (statusFilter === 'Exhausted' && u.quantity_used === 0);

        return matchSearch && matchCat && matchStatus;
    });

    const statCards = [
        {
            label: 'Total Employees',
            value: stats.total_employees,
            icon: <Users className="h-5 w-5 text-primary" />,
            iconBg: 'bg-primary/10',
        },
        {
            label: 'Active Plans',
            value: stats.active_plans,
            icon: <ClipboardList className="h-5 w-5 text-blue-600" />,
            iconBg: 'bg-blue-100',
        },
        {
            label: 'Used Today',
            value: stats.today_usages,
            icon: <BarChart3 className="h-5 w-5 text-emerald-600" />,
            iconBg: 'bg-emerald-100',
        },
        {
            label: 'Low Quota Alerts',
            value: stats.low_quota_alerts,
            icon: <AlertTriangle className="h-5 w-5 text-rose-600" />,
            iconBg: 'bg-rose-100',
            ping: stats.low_quota_alerts > 0,
        },
        {
            label: 'This Month Usages',
            value: stats.month_usages,
            icon: <Coffee className="h-5 w-5 text-amber-600" />,
            iconBg: 'bg-amber-100',
        },
        {
            label: 'Active Items',
            value: stats.total_items,
            icon: <Package className="h-5 w-5 text-cyan-600" />,
            iconBg: 'bg-cyan-100',
        },
    ];

    return (
        <>
            <Head title="Admin Dashboard" />

            <div className="min-h-screen bg-[#f7f8fa]">
                <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-r from-white via-emerald-50/60 to-cyan-50/60 shadow-sm">
                        <div className="flex flex-col gap-5 px-6 py-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
                            <div className="max-w-2xl">
                                <div className="mb-3 inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                                    Admin overview
                                </div>
                                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Welcome back, {admin_name}</h1>
                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                    Monitor employee usage, manage quota plans, and keep refreshment activity under control from one clean dashboard.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                <HeroMiniStat label="Employees" value={stats.total_employees} />
                                <HeroMiniStat label="Plans" value={stats.active_plans} />
                                <HeroMiniStat label="Today" value={stats.today_usages} />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">Operations snapshot</h2>
                            <p className="mt-1 text-sm text-slate-500">Quick actions and live activity from the system.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link
                                href="/admin/employees"
                                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50"
                            >
                                <Users className="h-4 w-4" /> Employees
                            </Link>
                            <Link
                                href="/admin/plans"
                                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:opacity-90"
                            >
                                <Plus className="h-4 w-4" /> Create Plan
                            </Link>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {statCards.map((card) => (
                            <StatCard key={card.label} icon={card.icon} iconBg={card.iconBg} label={card.label} value={card.value} ping={card.ping} />
                        ))}
                    </div>

                   

                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm lg:col-span-2">
                            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                                <div>
                                    <h2 className="text-sm font-semibold text-gray-800">Recent Activity</h2>
                                    <p className="mt-0.5 text-xs text-gray-400">Latest refreshment usages across all employees</p>
                                </div>
                                <Link
                                    href="/admin/employees"
                                    className="flex items-center gap-0.5 text-xs font-medium text-primary hover:underline"
                                >
                                    View all <ChevronRight className="h-3.5 w-3.5" />
                                </Link>
                            </div>

                            {filtered.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                                        <Coffee className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-700">No activity yet</p>
                                    <p className="mt-1 text-xs text-gray-400">Assign a quota plan to get started.</p>
                                    <Link
                                        href="/admin/plans"
                                        className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-white hover:opacity-90"
                                    >
                                        Create Plan
                                    </Link>
                                </div>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-100 bg-gray-50/60">
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400">
                                                Employee
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400">
                                                Item
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400">
                                                Qty
                                            </th>
                                            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-400">
                                                Time
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filtered.map((u) => (
                                            <tr key={u.id} className="transition-colors hover:bg-gray-50/80">
                                                <td className="px-6 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-8 w-8 shrink-0 border border-gray-100">
                                                            {u.employee_avatar ? (
                                                                <AvatarImage src={u.employee_avatar} alt={u.employee_name} className="object-cover" />
                                                            ) : null}
                                                            <AvatarFallback
                                                                className="rounded-full text-xs font-bold text-white"
                                                                style={{ backgroundColor: avatarBg(u.employee_name) }}
                                                            >
                                                                {getInitials(u.employee_name)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="font-medium text-gray-800">{u.employee_name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                                                        {getEmoji(u.item_category)} {u.item_name}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5 font-semibold text-gray-800">{u.quantity_used}×</td>
                                                <td className="px-4 py-3.5 text-right">
                                                    <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                                                        <Clock className="h-3 w-3" /> {u.used_at}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                                    <div>
                                        <h2 className="text-sm font-semibold text-gray-800">Low Quota Alerts</h2>
                                        <p className="mt-0.5 text-xs text-gray-400">Employees running out</p>
                                    </div>
                                    {stats.low_quota_alerts > 0 && (
                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-xs font-bold text-white">
                                            {stats.low_quota_alerts > 9 ? '9+' : stats.low_quota_alerts}
                                        </span>
                                    )}
                                </div>
                                {low_quota_employees.length === 0 ? (
                                    <div className="py-8 text-center">
                                        <p className="text-2xl">✅</p>
                                        <p className="mt-2 text-sm font-medium text-gray-700">All quotas healthy</p>
                                        <p className="mt-0.5 text-xs text-gray-400">No alerts right now</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-100">
                                        {low_quota_employees.map((emp, i) => (
                                            <div key={i} className="flex items-center gap-3 px-5 py-3">
                                                <Avatar className="h-8 w-8 shrink-0 border border-gray-100">
                                                    {emp.employee_avatar ? (
                                                        <AvatarImage src={emp.employee_avatar} alt={emp.employee_name} className="object-cover" />
                                                    ) : null}
                                                    <AvatarFallback
                                                        className="rounded-full text-xs font-bold text-white"
                                                        style={{ backgroundColor: avatarBg(emp.employee_name) }}
                                                    >
                                                        {getInitials(emp.employee_name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-xs font-medium text-gray-800">{emp.employee_name}</p>
                                                    <p className="truncate text-xs text-gray-400">{emp.item_name}</p>
                                                </div>
                                                <span
                                                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                                        emp.remaining_qty === 0
                                                            ? 'bg-rose-100 text-rose-700'
                                                            : 'bg-amber-100 text-amber-700'
                                                    }`}
                                                >
                                                    {emp.remaining_qty} left
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                                    <div>
                                        <h2 className="text-sm font-semibold text-gray-800">Active Plans</h2>
                                        <p className="mt-0.5 text-xs text-gray-400">Currently running</p>
                                    </div>
                                    <Link href="/admin/plans" className="text-xs font-medium text-primary hover:underline">
                                        Manage
                                    </Link>
                                </div>
                                {active_plans.length === 0 ? (
                                    <div className="py-8 text-center">
                                        <p className="text-sm font-medium text-gray-700">No active plans</p>
                                        <Link
                                            href="/admin/plans"
                                            className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                                        >
                                            Create one <ChevronRight className="h-3 w-3" />
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-100">
                                        {active_plans.map((plan) => (
                                            <div key={plan.id} className="flex items-center gap-3 px-5 py-3">
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                                                    <ClipboardList className="h-4 w-4 text-emerald-600" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-xs font-medium text-gray-800">{plan.title}</p>
                                                    <p className="text-xs capitalize text-gray-400">
                                                        {plan.period_type}
                                                        {plan.ends_at ? ` · ends ${plan.ends_at}` : ''}
                                                    </p>
                                                </div>
                                                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                                <div className="border-b border-gray-100 px-5 py-4">
                                    <h2 className="text-sm font-semibold text-gray-800">Quick Actions</h2>
                                </div>
                                <div className="grid grid-cols-2 gap-2 p-4">
                                    <QAction
                                        href="/admin/employees"
                                        icon={<Users className="h-4 w-4 text-blue-600" />}
                                        label="Add Employee"
                                        bg="bg-blue-50"
                                    />
                                    <QAction
                                        href="/admin/items"
                                        icon={<Package className="h-4 w-4 text-amber-600" />}
                                        label="Add Item"
                                        bg="bg-amber-50"
                                    />
                                    <QAction
                                        href="/admin/plans"
                                        icon={<ClipboardList className="h-4 w-4 text-emerald-600" />}
                                        label="New Plan"
                                        bg="bg-emerald-50"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

function StatCard({
    icon,
    iconBg,
    label,
    value,
    ping,
}: {
    icon: React.ReactNode;
    iconBg: string;
    label: string;
    value: number;
    ping?: boolean;
}) {
    return (
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
            {ping && value > 0 && (
                <span className="absolute right-3 top-3 flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-500" />
                </span>
            )}
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}>{icon}</div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
            <p className="mt-1 text-3xl font-bold tabular-nums text-slate-900">{value}</p>
        </div>
    );
}

function HeroMiniStat({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
        </div>
    );
}



function QAction({ href, icon, label, bg }: { href: string; icon: React.ReactNode; label: string; bg: string }) {
    return (
        <Link
            href={href}
            className="flex flex-col items-center gap-2 rounded-xl border border-gray-100 p-3 text-center transition-all hover:border-primary/30 hover:bg-gray-50"
        >
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${bg}`}>{icon}</div>
            <span className="text-xs font-medium text-gray-700">{label}</span>
        </Link>
    );
}
