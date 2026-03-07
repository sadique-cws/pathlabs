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
            description="Use your panel credentials to access your dashboard"
            sidebar={
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="h-1 w-6 rounded-full bg-[#147da2]" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Quick Fill Profiles</p>
                    </div>
                    <div className="grid gap-3">
                        {panelQuickLogins.map((profile) => (
                            <button
                                key={profile.panel}
                                type="button"
                                onClick={() => fillCredentials(profile.email, profile.password)}
                                className="group flex flex-col rounded-xl border border-slate-200 bg-white/80 p-4 text-left shadow-sm transition-all hover:border-[#147da2] hover:bg-white hover:shadow-md"
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <p className="text-sm font-bold text-slate-800 group-hover:text-[#147da2]">{profile.panel}</p>
                                    <div className="rounded-md bg-cyan-50 px-2 py-0.5 text-[10px] font-medium text-cyan-700">
                                        {profile.hint}
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 truncate w-full">{profile.email}</p>
                            </button>
                        ))}
                    </div>
                </div>
            }
        >
            <Head title="Log in" />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-4"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
                            <div className="grid gap-1.5">
                                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="your@email.com"
                                    className="h-11 rounded-xl border-slate-200 bg-white px-4 text-sm transition-all focus:border-[#147da2] focus:ring-[#147da2]/10"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-1.5">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Password</Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="text-xs font-medium text-[#147da2] hover:text-[#106385]"
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
                                    placeholder="••••••••"
                                    className="h-11 rounded-xl border-slate-200 bg-white px-4 text-sm transition-all focus:border-[#147da2] focus:ring-[#147da2]/10"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                    className="h-4 w-4 rounded-md border-slate-300 text-[#147da2] transition focus:ring-[#147da2]/20"
                                />
                                <Label htmlFor="remember" className="text-sm font-medium text-slate-600">Keep me logged in</Label>
                            </div>

                            <Button
                                type="submit"
                                className="h-10 w-full rounded-xl bg-[#147da2] text-sm font-bold transition-all hover:bg-[#106385] active:scale-[0.98]"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing ? <Spinner className="mr-2 h-4 w-4" /> : null}
                                Sign In
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
