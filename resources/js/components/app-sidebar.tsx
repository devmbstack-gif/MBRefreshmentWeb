import { Link, usePage } from '@inertiajs/react';
import {
    Bell,
    ClipboardList,
    Clock,
    Coffee,
    Flag,
    LayoutDashboard,
    MessageSquareWarning,
    Package,
    Settings,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavGroup } from '@/types';
import { edit as profileEdit } from '@/routes/profile';

const adminNavGroups: NavGroup[] = [
    {
        label: 'Home',
        items: [
            { title: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        ],
    },
    {
        label: 'Management',
        items: [
            { title: 'Employees', href: '/admin/employees', icon: Users },
            { title: 'Items', href: '/admin/items', icon: Package },
            { title: 'Month Plans', href: '/admin/plans', icon: ClipboardList },
            { title: 'Feedback', href: '/admin/mail-messages', icon: MessageSquareWarning },
        ],
    },
    {
        label: 'Settings',
        items: [
            { title: 'Settings', href: profileEdit(), icon: Settings },
        ],
    },
];

const employeeNavGroups: NavGroup[] = [
    {
        label: 'Home',
        items: [
            { title: 'My Quota', href: '/employee/quota', icon: Coffee },
        ],
    },
    {
        label: 'Activity',
        items: [
            { title: 'Usage History', href: '/employee/history', icon: Clock },
        ],
    },
    {
        label: 'Alerts',
        items: [
            { title: 'Notifications', href: '/employee/notifications', icon: Bell },
            { title: 'Issue / Feature', href: '/employee/feedback', icon: Flag },
        ],
    },
];

export function AppSidebar() {
    const { auth } = usePage<{ auth: { user: { role: string } | null } }>().props;

    const isAdmin = auth.user?.role === 'super_admin';
    const navGroups = isAdmin ? adminNavGroups : employeeNavGroups;
    const homeLink = isAdmin ? '/admin/dashboard' : '/employee/quota';

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader className="border-b border-sidebar-border pb-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={homeLink} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain groups={navGroups} />
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border pt-2">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
