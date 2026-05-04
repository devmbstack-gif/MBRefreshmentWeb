import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, FileText } from 'lucide-react';

type Props = {
    title: string;
    type: string;
    text: string;
    updated_at: string | null;
};

function paragraphs(text: string) {
    return text
        .split(/\n\n+/)
        .map((block) => block.trim())
        .filter(Boolean);
}

export default function TermsOfUse({ title, text, updated_at }: Props) {
    const blocks = paragraphs(text);

    return (
        <>
            <Head title={title} />

            <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/30 text-slate-900">
                <header className="border-b border-emerald-100/80 bg-white/90 backdrop-blur">
                    <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 sm:px-6">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 transition hover:text-emerald-900"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Home
                        </Link>
                        <Link
                            href="/privacy-policy"
                            className="text-sm font-medium text-slate-600 underline-offset-4 hover:text-emerald-700 hover:underline"
                        >
                            Privacy policy
                        </Link>
                    </div>
                </header>

                <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
                    <div className="mb-10 flex items-start gap-4">
                        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25">
                            <FileText className="h-7 w-7" aria-hidden />
                        </span>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                                {title}
                            </h1>
                            {updated_at && (
                                <p className="mt-2 text-sm text-slate-500">
                                    Last updated{' '}
                                    {new Date(updated_at).toLocaleDateString(
                                        undefined,
                                        {
                                            dateStyle: 'long',
                                        },
                                    )}
                                </p>
                            )}
                        </div>
                    </div>

                    <article className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-10">
                        <div className="space-y-6 text-base leading-relaxed text-slate-700">
                            {blocks.map((block, i) => (
                                <p
                                    key={i}
                                    className="whitespace-pre-wrap first:text-lg first:font-semibold first:text-slate-900"
                                >
                                    {block}
                                </p>
                            ))}
                        </div>
                    </article>
                </main>
            </div>
        </>
    );
}
