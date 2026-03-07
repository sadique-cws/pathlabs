import { Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="flex min-h-svh w-full items-stretch bg-white">
            {/* Left Column: Form */}
            <div className="flex flex-1 flex-col items-center justify-center p-6 md:p-12 lg:p-16">
                <div className="w-full max-w-sm space-y-8">
                    <div className="flex flex-col items-center gap-6 text-center">
                        <Link
                            href={home()}
                            className="group flex h-14 w-14 items-center justify-center rounded-2xl bg-[#147da2] transition-all hover:scale-105 hover:bg-[#106385] hover:shadow-lg hover:shadow-[#147da2]/20"
                        >
                            <AppLogoIcon className="size-8 fill-current text-white" />
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

            {/* Right Column: Decorative (Hidden on mobile) */}
            <div className="relative hidden flex-1 lg:block">
                <div className="absolute inset-0 bg-gradient-to-br from-[#147da2] to-[#0c4a6e] opacity-90" />
                <img 
                    src="/.gemini/antigravity/brain/0aaa14a1-dc62-485b-831b-84e2621bbe62/login_bg_lab_1772917381187.png" 
                    alt="Lab background" 
                    className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 flex flex-col justify-end p-12 text-white">
                    <div className="max-w-md space-y-4">
                        <div className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-md">
                            Advanced Healthcare Management
                        </div>
                        <h2 className="text-4xl font-bold leading-tight">
                            The future of lab management is here.
                        </h2>
                        <p className="text-lg text-white/80">
                            Streamline your operations, manage reports, and track collections with our state-of-the-art diagnostic platform.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
