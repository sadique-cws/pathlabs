import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type PanelQuickLogin = {
    panel: string;
    email: string;
    password: string;
    hint: string;
};

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
    panelQuickLogins: PanelQuickLogin[];
};

export default function Login({
    status,
    canResetPassword,
    canRegister,
    panelQuickLogins,
}: Props) {
    const fillCredentials = (email: string, password: string): void => {
        const emailInput = document.getElementById('email') as HTMLInputElement | null;
        const passwordInput = document.getElementById('password') as HTMLInputElement | null;

        if (emailInput !== null) {
            emailInput.value = email;
            emailInput.dispatchEvent(new Event('input', { bubbles: true }));
        }

        if (passwordInput !== null) {
            passwordInput.value = password;
            passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
    };

    return (
        <AuthLayout
            title="Log in to your account"
            description="Use your panel credentials or tap a quick-fill profile below"
        >
            <Head title="Log in" />

            <div className="rounded-xl border border-cyan-100 bg-cyan-50/70 p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-cyan-700">Quick Fill Login</p>
                <div className="grid gap-2 sm:grid-cols-2">
                    {panelQuickLogins.map((profile) => (
                        <button
                            key={profile.panel}
                            type="button"
                            onClick={() => fillCredentials(profile.email, profile.password)}
                            className="rounded-lg border border-cyan-200 bg-white p-2 text-left transition hover:border-cyan-400 hover:bg-cyan-50"
                        >
                            <p className="text-sm font-semibold text-slate-800">{profile.panel}</p>
                            <p className="text-xs text-slate-500">{profile.email}</p>
                            <p className="mt-1 text-xs font-medium text-cyan-700">{profile.hint}</p>
                        </button>
                    ))}
                </div>
            </div>

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="email@example.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Password</Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="ml-auto text-sm"
                                            tabIndex={5}
                                        >
                                            Forgot password?
                                        </TextLink>
                                    )}
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Password"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                />
                                <Label htmlFor="remember">Remember me</Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-4 w-full"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner />}
                                Log in
                            </Button>
                        </div>

                        {canRegister && (
                            <div className="text-center text-sm text-muted-foreground">
                                Don't have an account?{' '}
                                <TextLink href={register()} tabIndex={5}>
                                    Sign up
                                </TextLink>
                            </div>
                        )}
                    </>
                )}
            </Form>

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}
        </AuthLayout>
    );
}
