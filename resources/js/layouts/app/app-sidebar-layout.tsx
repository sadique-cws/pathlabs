import { AppHeader } from '@/components/app-header';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { useEffect, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
                    
                    <div className="flex-1 overflow-x-hidden">
                            {(() => {
                                const reminder = usePage().props.subscriptionReminder as string | null;
                                if (!reminder) return null;
                                return (
                                    <div className="bg-amber-50 border-b border-amber-100 p-3 flex items-center gap-3">
                                        <AlertCircle className="h-4 w-4 text-amber-500" />
                                        <p className="text-[11px] font-bold uppercase tracking-widest text-amber-700">
                                            {reminder}
                                        </p>
                                        <Button 
                                            variant="link" 
                                            className="ml-auto h-auto p-0 text-[11px] font-black uppercase tracking-widest text-[#147da2]"
                                            onClick={() => router.get('/lab/subscription')}
                                        >
                                            Renew Implementation
                                        </Button>
                                    </div>
                                );
                            })()}
                        {children}
                    </div>
                </main>
            </div>
        </AppShell>
    );
}
