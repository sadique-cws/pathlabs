import { AppContent } from '@/components/app-content';
import { AppHeader } from '@/components/app-header';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    return (
        <AppShell variant="sidebar">
            <AppHeader breadcrumbs={breadcrumbs} withSidebarToggle={true} />
            <div className="flex min-h-[calc(100svh-3.5rem)]">
                <AppSidebar />
                <AppContent variant="sidebar" className="overflow-x-hidden">
                    {children}
                </AppContent>
            </div>
        </AppShell>
    );
}
