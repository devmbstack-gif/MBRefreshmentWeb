import { Link } from '@inertiajs/react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="relative grid min-h-dvh flex-col items-center justify-center bg-gradient-to-br from-white via-emerald-50/30 to-cyan-50/40 px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative hidden h-full flex-col overflow-hidden border-r border-emerald-100 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-10 text-white lg:flex">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.28),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.18),transparent_30%)]" />
                <Link href={home()} className="relative z-20 flex items-center">
                    <img
                        src="/common/logo.png"
                        alt="Bs Refreshment"
                        className="h-10 w-auto"
                    />
                </Link>
                <div className="relative z-20 mt-auto max-w-md">
                    <h2 className="text-3xl font-semibold tracking-tight">
                        MB Refreshment Portal
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-white/85">
                        Manage employees, quota plans, and daily refreshment
                        activity with a clean, light interface.
                    </p>
                </div>
            </div>
            <div className="w-full lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 rounded-3xl border border-white/80 bg-white/90 p-8 shadow-xl shadow-emerald-100/60 backdrop-blur sm:w-[430px]">
                    <Link
                        href={home()}
                        className="relative z-20 flex items-center justify-center lg:hidden"
                    >
                        <img
                            src="/common/iconBackground.jpeg"
                            alt="Bs Refreshment"
                            className="h-10 w-auto rounded-md sm:h-12"
                        />
                    </Link>
                    <div className="flex flex-col items-start gap-2 text-left sm:items-center sm:text-center">
                        <h1 className="text-xl font-medium">{title}</h1>
                        <p className="text-sm text-balance text-muted-foreground">
                            {description}
                        </p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
