import AuthLayoutTemplate from '@/layouts/auth/auth-simple-layout';

export default function AuthLayout({
    children,
    title,
    description,
    sidebar,
    ...props
}: {
    children: React.ReactNode;
    title: string;
    description: string;
    sidebar?: React.ReactNode;
}) {
    return (
        <AuthLayoutTemplate title={title} description={description} sidebar={sidebar} {...props}>
            {children}
        </AuthLayoutTemplate>
    );
}
