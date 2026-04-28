import { Link } from '@inertiajs/react';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavGroup } from '@/types';

export function NavMain({ groups = [] }: { groups: NavGroup[] }) {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <div className="flex flex-col gap-1 px-2 py-2">
            {groups.map((group) => (
                <SidebarGroup key={group.label} className="p-0">
                    <SidebarGroupLabel className="mb-1 px-3 text-[10px] font-semibold tracking-widest text-sidebar-foreground/40 uppercase">
                        {group.label}
                    </SidebarGroupLabel>
                    <SidebarMenu>
                        {group.items.map((item) => {
                            const active = isCurrentUrl(item.href);

                            return (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={active}
                                        tooltip={{ children: item.title }}
                                        className={`gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                                            active
                                                ? 'bg-violet-100 font-semibold text-violet-700'
                                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                        }`}
                                    >
                                        <Link href={item.href} prefetch>
                                            {item.icon && (
                                                <item.icon
                                                    className={`h-4 w-4 shrink-0 ${active ? 'text-violet-600' : 'text-gray-400'}`}
                                                />
                                            )}
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            );
                        })}
                    </SidebarMenu>
                </SidebarGroup>
            ))}
        </div>
    );
}
