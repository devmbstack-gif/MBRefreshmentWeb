import { Link, router, usePage } from '@inertiajs/react';
import {
    Bell,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    Clock,
    Coffee,
    LayoutDashboard,
    LogOut,
    Package,
    Search,
    Settings,
    User,
    Users,
    MessageSquareWarning,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { logout } from '@/routes';
import { edit as profileEdit } from '@/routes/profile';
import { edit as securityEdit } from '@/routes/security';
import type { AppLayoutProps } from '@/types';

type SearchResult = {
    type: string;
    title: string;
    subtitle: string;
    href: string;
};

type AdminNotification = {
    id: number;
    title: string;
    message: string;
    type: string;
    is_read: boolean;
    related_id: number | null;
    created_at: string | null;
};

export default function AppSidebarLayout({ children }: AppLayoutProps) {
    const { auth } = usePage().props;
    const { isCurrentOrParentUrl } = useCurrentUrl();
    const [collapsed, setCollapsed] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [notificationOpen, setNotificationOpen] = useState(false);
    const [notifications, setNotifications] = useState<AdminNotification[]>([]);
    const [notificationLoading, setNotificationLoading] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
    const searchWrapRef = useRef<HTMLDivElement>(null);

    const isAdmin = auth.user?.role === 'super_admin';
    const sidebarWidth = collapsed ? 72 : 240;

    const groups = isAdmin
        ? [
              {
                  label: 'HOME',
                  items: [
                      {
                          title: 'Dashboard',
                          href: '/admin/dashboard',
                          icon: LayoutDashboard,
                      },
                  ],
              },
              {
                  label: 'MANAGEMENT',
                  items: [
                      {
                          title: 'Employees',
                          href: '/admin/employees',
                          icon: Users,
                      },
                      { title: 'Items', href: '/admin/items', icon: Package },
                      {
                          title: 'Month Plans',
                          href: '/admin/plans',
                          icon: ClipboardList,
                      },
                      {
                          title: 'Feedback',
                          href: '/admin/mail-messages',
                          icon: MessageSquareWarning,
                      },
                  ],
              },
              {
                  label: 'SETTINGS',
                  items: [
                      {
                          title: 'Settings',
                          href: profileEdit(),
                          icon: Settings,
                      },
                  ],
              },
          ]
        : [
              {
                  label: 'HOME',
                  items: [
                      {
                          title: 'My Quota',
                          href: '/employee/quota',
                          icon: Coffee,
                      },
                  ],
              },
              {
                  label: 'ACTIVITY',
                  items: [
                      {
                          title: 'Usage History',
                          href: '/employee/history',
                          icon: Clock,
                      },
                  ],
              },
              {
                  label: 'ALERTS',
                  items: [
                      {
                          title: 'Notifications',
                          href: '/employee/notifications',
                          icon: Bell,
                      },
                  ],
              },
          ];

    useEffect(() => {
        const q = searchQuery.trim();

        if (q.length < 2) {
            setSearchResults([]);

            return;
        }

        if (searchDebounce.current) {
            clearTimeout(searchDebounce.current);
        }

        searchDebounce.current = setTimeout(async () => {
            const base = isAdmin ? '/admin/search' : '/employee/search';
            const res = await fetch(`${base}?q=${encodeURIComponent(q)}`, {
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
            });
            const data = (await res.json()) as { results?: SearchResult[] };
            setSearchResults(data.results ?? []);
        }, 280);

        return () => {
            if (searchDebounce.current) {
                clearTimeout(searchDebounce.current);
            }
        };
    }, [searchQuery, isAdmin]);

    useEffect(() => {
        const onDoc = (e: MouseEvent) => {
            if (!searchWrapRef.current?.contains(e.target as Node)) {
                setSearchResults([]);
            }
        };
        document.addEventListener('mousedown', onDoc);

        return () => document.removeEventListener('mousedown', onDoc);
    }, []);

    const loadNotifications = useCallback(async () => {
        if (!isAdmin) {
            return;
        }

        setNotificationLoading(true);

        try {
            const res = await fetch('/admin/notifications', {
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
            });
            const data = (await res.json()) as {
                notifications?: AdminNotification[];
                unread_count?: number;
            };
            setNotifications(data.notifications ?? []);
            setUnreadCount(data.unread_count ?? 0);
        } finally {
            setNotificationLoading(false);
        }
    }, [isAdmin]);

    const markNotificationRead = useCallback(async (id: number) => {
        const csrfToken =
            document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute('content') ?? '';
        const res = await fetch(`/admin/notifications/${id}/read`, {
            method: 'PATCH',
            headers: {
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken,
            },
            credentials: 'same-origin',
        });

        if (!res.ok) {
            return;
        }

        const data = (await res.json()) as { unread_count?: number };
        setNotifications((prev) =>
            prev.map((notification) =>
                notification.id === id
                    ? { ...notification, is_read: true }
                    : notification,
            ),
        );
        setUnreadCount(data.unread_count ?? 0);
    }, []);

    useEffect(() => {
        if (notificationOpen && isAdmin) {
            void loadNotifications();
        }
    }, [notificationOpen, isAdmin, loadNotifications]);

    return (
        <div className="min-h-screen bg-[#f6f7fb]">
            <aside
                className="fixed inset-y-0 left-0 z-30 border-r border-gray-200 bg-white transition-all duration-200"
                style={{ width: `${sidebarWidth}px` }}
            >
                <div className="flex h-16 items-center border-b border-gray-100 px-4">
                    <Link
                        href={isAdmin ? '/admin/dashboard' : '/employee/quota'}
                        className="flex items-center gap-2 overflow-hidden"
                    >
                        <img
                            src="/common/iconBackground.jpeg"
                            alt="MB Refreshment"
                            className="h-8 w-8 rounded-lg object-cover"
                        />
                        {!collapsed && (
                            <span className="truncate text-sm font-semibold text-gray-900">
                                MB Refreshment
                            </span>
                        )}
                    </Link>
                </div>

                <button
                    type="button"
                    onClick={() => setCollapsed((s) => !s)}
                    className="absolute top-20 -right-3 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white shadow hover:opacity-90"
                >
                    {collapsed ? (
                        <ChevronRight className="h-3.5 w-3.5" />
                    ) : (
                        <ChevronLeft className="h-3.5 w-3.5" />
                    )}
                </button>

                <div className="h-[calc(100vh-64px)] overflow-y-auto px-3 py-4">
                    {groups.map((group) => (
                        <div key={group.label} className="mb-5">
                            {!collapsed && (
                                <p className="mb-2 px-2 text-[10px] font-semibold tracking-widest text-gray-400">
                                    {group.label}
                                </p>
                            )}
                            <div className="space-y-1">
                                {group.items.map((item) => {
                                    const active = isCurrentOrParentUrl(
                                        item.href,
                                    );

                                    return (
                                        <Link
                                            key={item.title}
                                            href={item.href}
                                            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                                                active
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                        >
                                            <item.icon
                                                className={`h-4 w-4 shrink-0 ${active ? 'text-primary' : 'text-gray-400'}`}
                                            />
                                            {!collapsed && (
                                                <span className="truncate">
                                                    {item.title}
                                                </span>
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </aside>

            <main
                className="min-w-0 transition-all duration-200"
                style={{ marginLeft: `${sidebarWidth}px` }}
            >
                <header
                    className="fixed top-0 z-20 h-16 border-b border-gray-200 bg-white transition-all duration-200"
                    style={{
                        left: `${sidebarWidth}px`,
                        width: `calc(100vw - ${sidebarWidth}px)`,
                    }}
                >
                    <div className="flex h-full items-center justify-between gap-4 px-6">
                        <div
                            ref={searchWrapRef}
                            className="relative w-full max-w-xl"
                        >
                            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search..."
                                autoComplete="off"
                                className="w-full rounded-full border border-emerald-200/80 bg-gray-50 py-2 pr-4 pl-9 text-sm shadow-sm transition-colors focus:border-primary/50 focus:bg-white focus:ring-2 focus:ring-primary/15 focus:outline-none"
                            />
                            {searchResults.length > 0 && (
                                <div className="absolute top-full right-0 left-0 z-50 mt-2 max-h-80 overflow-auto rounded-2xl border border-gray-200 bg-white py-1 shadow-xl">
                                    {searchResults.map((r, idx) => (
                                        <button
                                            key={`${r.href}-${r.title}-${idx}`}
                                            type="button"
                                            className="flex w-full flex-col items-start gap-0.5 px-4 py-2.5 text-left text-sm hover:bg-gray-50"
                                            onMouseDown={(e) =>
                                                e.preventDefault()
                                            }
                                            onClick={() => {
                                                setSearchQuery('');
                                                setSearchResults([]);
                                                router.visit(r.href);
                                            }}
                                        >
                                            <span className="font-medium text-gray-900">
                                                {r.title}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {r.type} · {r.subtitle}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                            {isAdmin && (
                                <>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="relative h-9 w-9 text-gray-600 hover:text-gray-900"
                                        onClick={() =>
                                            setNotificationOpen(true)
                                        }
                                        aria-label="Notifications"
                                    >
                                        <Bell className="h-4 w-4" />
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-1 -right-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                                                {unreadCount > 9
                                                    ? '9+'
                                                    : unreadCount}
                                            </span>
                                        )}
                                    </Button>
                                    <Sheet
                                        open={notificationOpen}
                                        onOpenChange={setNotificationOpen}
                                    >
                                        <SheetContent
                                            side="right"
                                            className="w-full gap-0 border-l border-gray-200 p-0 sm:max-w-lg"
                                        >
                                            <SheetHeader className="border-b border-gray-100 px-6 py-5 text-left">
                                                <SheetTitle className="text-lg font-semibold text-gray-900">
                                                    Notification center
                                                </SheetTitle>
                                                <SheetDescription className="text-sm text-gray-500">
                                                    Live alerts from employee
                                                    requests and admin activity.
                                                </SheetDescription>
                                            </SheetHeader>
                                            <div className="flex-1 overflow-y-auto px-4 py-4">
                                                {notificationLoading ? (
                                                    <p className="text-sm text-gray-500">
                                                        Loading…
                                                    </p>
                                                ) : notifications.length ===
                                                  0 ? (
                                                    <p className="text-sm text-gray-500">
                                                        No notifications yet.
                                                    </p>
                                                ) : (
                                                    <ul className="space-y-3">
                                                        {notifications.map(
                                                            (notification) => (
                                                                <li
                                                                    key={
                                                                        notification.id
                                                                    }
                                                                    className={`rounded-2xl border p-4 shadow-sm transition ${
                                                                        notification.is_read
                                                                            ? 'border-gray-100 bg-gray-50/70'
                                                                            : 'border-emerald-200 bg-emerald-50/60'
                                                                    }`}
                                                                >
                                                                    <div className="flex items-start justify-between gap-2">
                                                                        <div>
                                                                            <p className="text-sm font-semibold text-gray-900">
                                                                                {
                                                                                    notification.title
                                                                                }
                                                                            </p>
                                                                            <p className="mt-1 text-xs leading-relaxed whitespace-pre-wrap text-gray-600">
                                                                                {
                                                                                    notification.message
                                                                                }
                                                                            </p>
                                                                        </div>
                                                                        {!notification.is_read && (
                                                                            <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                                                                        )}
                                                                    </div>
                                                                    <div className="mt-3 flex items-center justify-between">
                                                                        <p className="text-[11px] text-gray-400">
                                                                            {notification.created_at
                                                                                ? new Date(
                                                                                      notification.created_at,
                                                                                  ).toLocaleString(
                                                                                      undefined,
                                                                                      {
                                                                                          dateStyle:
                                                                                              'medium',
                                                                                          timeStyle:
                                                                                              'short',
                                                                                      },
                                                                                  )
                                                                                : 'Unknown date'}
                                                                        </p>
                                                                        <Button
                                                                            size="sm"
                                                                            variant={
                                                                                notification.is_read
                                                                                    ? 'outline'
                                                                                    : 'default'
                                                                            }
                                                                            className="h-7 rounded-lg px-2.5 text-xs"
                                                                            onClick={() =>
                                                                                void markNotificationRead(
                                                                                    notification.id,
                                                                                )
                                                                            }
                                                                        >
                                                                            {notification.is_read
                                                                                ? 'Read'
                                                                                : 'Mark as read'}
                                                                        </Button>
                                                                    </div>
                                                                </li>
                                                            ),
                                                        )}
                                                    </ul>
                                                )}
                                            </div>
                                        </SheetContent>
                                    </Sheet>
                                </>
                            )}
                            {!isAdmin && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="relative h-9 w-9 text-gray-600 hover:text-gray-900"
                                    onClick={() =>
                                        toast.info(
                                            'This notifications panel is for admin only.',
                                        )
                                    }
                                    aria-label="Notifications access"
                                >
                                    <Bell className="h-4 w-4" />
                                </Button>
                            )}
                            {auth.user && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button
                                            type="button"
                                            className="flex items-center gap-2 rounded-full py-1 pr-2 pl-1 ring-offset-2 outline-none hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-primary/30"
                                        >
                                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                                                {(auth.user.name ?? 'U')
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>
                                            <span className="hidden max-w-[140px] truncate text-sm font-medium text-gray-800 sm:inline">
                                                {auth.user.name ?? 'User'}
                                            </span>
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align="end"
                                        sideOffset={8}
                                        className="min-w-[220px] rounded-2xl border border-gray-100 bg-white p-2 shadow-xl"
                                    >
                                        <DropdownMenuItem
                                            asChild
                                            className="cursor-pointer rounded-xl px-3 py-2.5 focus:bg-gray-50"
                                        >
                                            <Link
                                                href={profileEdit()}
                                                className="flex items-center gap-3 text-gray-900"
                                            >
                                                <User className="h-4 w-4 text-gray-400" />
                                                Profile
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            asChild
                                            className="cursor-pointer rounded-xl px-3 py-2.5 focus:bg-gray-50"
                                        >
                                            <Link
                                                href={securityEdit()}
                                                className="flex items-center gap-3 text-gray-900"
                                            >
                                                <Settings className="h-4 w-4 text-gray-400" />
                                                Settings
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator className="my-1 bg-gray-100" />
                                        <DropdownMenuItem
                                            asChild
                                            className="cursor-pointer rounded-xl px-3 py-2.5 text-red-600 focus:bg-red-50 focus:text-red-600"
                                        >
                                            <Link
                                                href={logout()}
                                                method="post"
                                                as="button"
                                                className="flex w-full items-center gap-3"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                Logout
                                            </Link>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
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
