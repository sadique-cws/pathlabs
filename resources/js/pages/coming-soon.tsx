import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

export default function ComingSoon() {
    return (
        <AppLayout breadcrumbs={[{ title: 'Coming Soon', href: '#' }]}>
            <Head title="Coming Soon" />
            <div className="flex h-full min-h-[50vh] flex-col items-center justify-center p-6 text-center">
                <h1 className="text-2xl font-bold text-slate-800">Coming Soon</h1>
                <p className="mt-2 text-slate-500">This feature is currently under development.</p>
            </div>
        </AppLayout>
    );
}
