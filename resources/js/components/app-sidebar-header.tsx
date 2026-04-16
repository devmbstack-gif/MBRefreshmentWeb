import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { useSidebar } from '@/components/ui/sidebar';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

function SidebarCircleTrigger() {
    const { toggleSidebar, state } = useSidebar();

    return (
        <button
            onClick={toggleSidebar}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white shadow-md transition-colors hover:bg-blue-600 focus:outline-none"
        >
            {state === 'collapsed'
                ? <ChevronRight className="h-4 w-4" />
                : <ChevronLeft className="h-4 w-4" />}
        </button>
    );
}

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    return (
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <SidebarCircleTrigger />
            <Breadcrumbs breadcrumbs={breadcrumbs} />
        </header>
    );
}
