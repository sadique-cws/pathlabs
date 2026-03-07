import type { Auth } from '@/types/auth';

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            wallet?: {
                balance?: number | null;
                currency?: string;
            };
            access?: {
                permissions?: string[];
                roles?: string[];
                is_admin?: boolean;
            };
            [key: string]: unknown;
        };
    }
}
