import { Link, usePage } from '@inertiajs/react';
import {
    Bell,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    Clock,
    Coffee,
    LayoutDashboard,
    Package,
    Settings,
    Search,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
}: AppLayoutProps) {
    const { auth } = usePage<{ auth: { user: { name: string; role?: string } | null } }>().props;
    const { isCurrentOrParentUrl } = useCurrentUrl();
    const [collapsed, setCollapsed] = useState(false);
    const isAdmin = auth.user?.role === 'super_admin';
    const sidebarWidth = collapsed ? 72 : 240;

    const groups = isAdmin
        ? [
              {
                  label: 'HOME',
                  items: [{ title: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard }],
              },
              {
                  label: 'MANAGEMENT',
                  items: [
                      { title: 'Employees', href: '/admin/employees', icon: Users },
                      { title: 'Items', href: '/admin/items', icon: Package },
                      { title: 'Quota Plans', href: '/admin/plans', icon: ClipboardList },
                  ],
              },
              {
                  label: 'SETTINGS',
                  items: [{ title: 'Settings', href: '/settings', icon: Settings }],
              },
          ]
        : [
              {
                  label: 'HOME',
                  items: [{ title: 'My Quota', href: '/employee/quota', icon: Coffee }],
              },
              {
                  label: 'ACTIVITY',
                  items: [{ title: 'Usage History', href: '/employee/history', icon: Clock }],
              },
              {
                  label: 'ALERTS',
                  items: [{ title: 'Notifications', href: '/employee/notifications', icon: Bell }],
              },
          ];

    return (
        <div className="min-h-screen bg-[#f6f7fb]">
            <aside
                className="fixed inset-y-0 left-0 z-30 border-r border-gray-200 bg-white transition-all duration-200"
                style={{ width: `${sidebarWidth}px` }}
            >
                <div className="flex h-16 items-center border-b border-gray-100 px-4">
                    <Link href={isAdmin ? '/admin/dashboard' : '/employee/quota'} className="flex items-center gap-2 overflow-hidden">
                        <img src="/common/iconBackground.jpeg" alt="MB Refreshment" className="h-8 w-8 rounded-lg object-cover" />
                        {!collapsed && <span className="truncate text-sm font-semibold text-gray-900">MB Refreshment</span>}
                    </Link>
                </div>

                <button
                    type="button"
                    onClick={() => setCollapsed((s) => !s)}
                    className="absolute -right-3 top-20 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white shadow hover:opacity-90"
                >
                    {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
                </button>

                <div className="h-[calc(100vh-64px)] overflow-y-auto px-3 py-4">
                    {groups.map((group) => (
                        <div key={group.label} className="mb-5">
                            {!collapsed && <p className="mb-2 px-2 text-[10px] font-semibold tracking-widest text-gray-400">{group.label}</p>}
                            <div className="space-y-1">
                                {group.items.map((item) => {
                                    const active = isCurrentOrParentUrl(item.href);

                                    return (
                                        <Link
                                            key={item.title}
                                            href={item.href}
                                            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                                                active ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                        >
                                            <item.icon className={`h-4 w-4 shrink-0 ${active ? 'text-primary' : 'text-gray-400'}`} />
                                            {!collapsed && <span className="truncate">{item.title}</span>}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </aside>

            <main className="min-w-0 transition-all duration-200" style={{ marginLeft: `${sidebarWidth}px` }}>
                <header
                    className="fixed top-0 z-20 h-16 border-b border-gray-200 bg-white transition-all duration-200"
                    style={{ left: `${sidebarWidth}px`, width: `calc(100vw - ${sidebarWidth}px)` }}
                >
                    <div className="flex h-full items-center justify-between px-6">
                        <div className="relative w-full max-w-xl">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full rounded-full border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-sm focus:border-primary/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                        <div className="ml-4 flex items-center gap-3">
                            <Bell className="h-4 w-4 text-gray-500" />
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                                {(auth.user?.name ?? 'U').charAt(0).toUpperCase()}
                            </div>
                            <span className="hidden text-sm font-medium text-gray-700 sm:block">{auth.user?.name ?? 'User'}</span>
                        </div>
                    </div>
                </header>

                <div className="min-h-screen bg-[#f6f7fb] p-6 pt-20">
                    {children}
                </div>
            </main>
        </div>
    );
}
