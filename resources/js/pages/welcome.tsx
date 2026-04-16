import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, BarChart3, Bell, Clock, Coffee, Shield, Users } from 'lucide-react';
import { login, dashboard } from '@/routes';

type AuthUser = {
    id: number;
    name: string;
    role: string;
};

export default function Welcome() {
    const { auth } = usePage<{ auth: { user: AuthUser | null } }>().props;

    const isLoggedIn = !!auth.user;

    return (
        <>
            <Head title="Employee Refreshment Portal" />

            <div className="min-h-screen bg-background">

                {/* Top Navigation Bar */}
                <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-sm">
                    <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
                        <div className="flex items-center">
                            <img src="/common/logo.png" alt="Bs Refreshment" className="h-40 w-auto object-contain" />
                        </div>

                        <Link
                            href={isLoggedIn ? dashboard() : login()}
                            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                        >
                            {isLoggedIn ? 'Go to Dashboard' : 'Sign In'}
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="mx-auto max-w-6xl px-6 py-24 text-center">
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
                        <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                        Monthly Refreshment Management
                    </div>

                    <h1 className="mb-6 text-5xl font-bold tracking-tight text-foreground lg:text-6xl">
                        Your Daily Refreshments,
                        <br />
                        <span className="text-primary">Tracked &amp; Managed.</span>
                    </h1>

                    <p className="mx-auto mb-10 max-w-2xl text-xl text-muted-foreground">
                        Admin creates monthly quota plans — assigns lunches, teas, and snacks to
                        employees — everyone tracks and uses their allowance with ease.
                    </p>

                    <Link
                        href={isLoggedIn ? dashboard() : login()}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3.5 text-base font-medium text-primary-foreground transition-opacity hover:opacity-90"
                    >
                        {isLoggedIn ? 'Go to Dashboard' : 'Sign In to Dashboard'}
                        <ArrowRight className="h-5 w-5" />
                    </Link>

                    {/* Visual Preview Card */}
                    <div className="mx-auto mt-16 max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
                        <div className="border-b border-border bg-background px-6 py-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-foreground">July 2025 — Monthly Refreshment Plan</span>
                                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">Active</span>
                            </div>
                        </div>
                        <div className="divide-y divide-border">
                            {previewItems.map((item) => (
                                <div key={item.name} className="flex items-center justify-between px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">{item.emoji}</span>
                                        <div>
                                            <p className="text-sm font-medium text-foreground">{item.name}</p>
                                            <p className="text-xs text-muted-foreground">{item.category}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-32">
                                            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                                                <span>Used: {item.used}</span>
                                                <span>Total: {item.total}</span>
                                            </div>
                                            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                                                <div
                                                    className="h-full rounded-full bg-primary transition-all"
                                                    style={{ width: `${(item.used / item.total) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                        <span className="w-10 text-right text-sm font-semibold text-foreground">
                                            {item.total - item.used} left
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="border-t border-border bg-card">
                    <div className="mx-auto max-w-6xl px-6 py-20">
                        <div className="mb-14 text-center">
                            <h2 className="mb-4 text-3xl font-bold text-foreground">Everything You Need</h2>
                            <p className="text-muted-foreground">
                                Built for software houses to manage employee refreshments without spreadsheets.
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-3">
                            {features.map((feature) => (
                                <div
                                    key={feature.title}
                                    className="rounded-xl border border-border bg-background p-6 transition-shadow hover:shadow-md"
                                >
                                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                        <feature.icon className="h-5 w-5 text-primary" />
                                    </div>
                                    <h3 className="mb-2 text-base font-semibold text-foreground">{feature.title}</h3>
                                    <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section className="mx-auto max-w-6xl px-6 py-20">
                    <div className="mb-14 text-center">
                        <h2 className="mb-4 text-3xl font-bold text-foreground">How It Works</h2>
                        <p className="text-muted-foreground">Simple three-step process from plan creation to daily use.</p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-3">
                        {steps.map((step, index) => (
                            <div key={step.title} className="flex gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                                    {index + 1}
                                </div>
                                <div className="pt-1">
                                    <h3 className="mb-2 font-semibold text-foreground">{step.title}</h3>
                                    <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Call To Action Section */}
                <section className="mx-auto max-w-6xl px-6 pb-20">
                    <div className="overflow-hidden rounded-2xl bg-primary px-8 py-14 text-center">
                        <h2 className="mb-4 text-3xl font-bold text-primary-foreground">Ready to Get Started?</h2>
                        <p className="mb-8 text-primary-foreground/80">
                            Sign in to your account and start managing refreshment quotas today.
                        </p>
                        <Link
                            href={isLoggedIn ? dashboard() : login()}
                            className="inline-flex items-center gap-2 rounded-lg bg-background px-8 py-3 font-medium text-foreground transition-opacity hover:opacity-90"
                        >
                            {isLoggedIn ? 'Go to Dashboard' : 'Sign In Now'}
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-border">
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <img src="/common/logo.png" alt="Bs Refreshment" className="h-7 w-auto" />
                        </div>
                        <span>© {new Date().getFullYear()} All rights reserved.</span>
                    </div>
                </footer>

            </div>
        </>
    );
}

const previewItems = [
    { name: 'Lunch', emoji: '🍱', category: 'Food', used: 1, total: 4 },
    { name: 'Green Tea', emoji: '🍵', category: 'Beverage', used: 3, total: 8 },
    { name: 'Chocolate', emoji: '🍫', category: 'Snack', used: 2, total: 4 },
    { name: 'Soft Can', emoji: '🥤', category: 'Beverage', used: 4, total: 4 },
];

const features = [
    {
        title: 'Admin Control Panel',
        icon: Shield,
        description:
            'Super admin creates items, builds monthly quota plans, assigns them to specific employees, and monitors all usage.',
    },
    {
        title: 'Personal Quota Tracking',
        icon: Users,
        description:
            'Each employee sees their own remaining lunches, teas, and snacks. One click to mark an item as used.',
    },
    {
        title: 'Smart Notifications',
        icon: Bell,
        description:
            'Employees get notified when quotas are assigned, running low, or exhausted. Admins get usage logs.',
    },
    {
        title: 'Usage Reports',
        icon: BarChart3,
        description:
            'Detailed reports by employee, item, or date range. Know exactly how your refreshment budget is being used.',
    },
    {
        title: 'Flexible Quota Plans',
        icon: Coffee,
        description:
            'Create monthly, weekly, or custom plans. Add any items with any quantities. Assign to all or specific employees.',
    },
    {
        title: 'Full Audit History',
        icon: Clock,
        description:
            'Every usage is logged with an exact timestamp. Nothing is ever lost — full history always available.',
    },
];

const steps = [
    {
        title: 'Admin Creates a Quota Plan',
        description:
            'Admin adds refreshment items (Lunch, Green Tea, etc.) and builds a quota plan specifying quantities per employee.',
    },
    {
        title: 'Plan is Assigned to Employees',
        description:
            'Admin assigns the plan to all employees or selected ones. Each employee gets their own personal quota copy.',
    },
    {
        title: 'Employees Use Their Quota',
        description:
            'Employees log in, see their available items with remaining counts, and mark them as used. Balance updates instantly.',
    },
];
