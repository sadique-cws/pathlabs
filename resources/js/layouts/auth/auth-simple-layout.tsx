import { Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
    sidebar,
}: AuthLayoutProps & { sidebar?: React.ReactNode }) {
    return (
        <div className="flex h-screen w-full overflow-hidden items-stretch bg-white">
            {/* Left Column: Form */}
            <div className="flex flex-1 flex-col items-center justify-center p-4 md:p-8 lg:p-12 overflow-y-auto">
                <div className="w-full max-w-sm space-y-6">
                    <div className="flex flex-col items-center gap-6 text-center">
                        <Link
                            href={home()}
                            className="flex h-12 w-12 items-center justify-center  bg-[#147da2] transition-colors hover:bg-[#106385]"
                        >
                            <AppLogoIcon className="size-6 fill-current text-white" />
                        </Link>

                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">{title}</h1>
                            <p className="text-sm text-slate-500">
                                {description}
                            </p>
                        </div>
                    </div>
                    {children}
                </div>
            </div>

            {/* Right Column: Decorative & Sidebar (Hidden on mobile) */}
            <div className="relative hidden flex-1 lg:flex flex-col bg-slate-50 border-l border-slate-100 overflow-hidden">
                <div className="flex-1 relative overflow-hidden">
                    <img 
                        src="/images/login-bg.png" 
                        alt="Lab background" 
                        className="h-full w-full object-cover grayscale-[0.2] opacity-40" 
                    />
                    
                    {sidebar && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-slate-50/20 backdrop-blur-[2px]">
                            <div className="w-full max-w-md">
                                {sidebar}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-8 bg-white border-t border-slate-200 shadow-sm z-10">
                    <div className="max-w-md space-y-3">
                        <div className="inline-flex items-center  bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                            Advanced Healthcare Management
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                            The future of lab management is here.
                        </h2>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Streamline your operations, manage reports, and track collections with our state-of-the-art diagnostic platform.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
