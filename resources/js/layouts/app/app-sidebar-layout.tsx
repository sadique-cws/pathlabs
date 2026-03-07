import { AppHeader } from '@/components/app-header';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <AppShell variant="sidebar">
            <AppHeader withSidebarToggle={true} />
            <div className="flex w-full min-h-screen bg-slate-50/50 mesh-bg">
                <AppSidebar />
                <main className="flex flex-col flex-1 min-w-0">
                    {/* Integrated Spacer for Fixed Header */}
                    <div className={cn("transition-all duration-300", scrolled ? "h-12" : "h-14")} />
                    
                    {breadcrumbs.length > 0 && (
                        <div className={cn(
                            "sticky z-40 border-b bg-white/80 backdrop-blur-md transition-all duration-300 w-full",
                            scrolled ? "top-[48px]" : "top-[56px]"
                        )}>
                            <div className="mx-auto flex h-10 sm:h-12 items-center px-4 sm:px-6 text-[11px] sm:text-[13px] font-medium text-slate-800 tracking-tight overflow-x-auto no-scrollbar whitespace-nowrap">
                                <Breadcrumbs breadcrumbs={breadcrumbs} />
                            </div>
                        </div>
                    )}
                    
                    <div className="flex-1 p-2 sm:p-4 md:p-6 overflow-x-hidden">
                        {children}
                    </div>
                </main>
            </div>
        </AppShell>
    );
}
