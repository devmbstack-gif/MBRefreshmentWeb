import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ExternalLink, FileText, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type PolicyPayload = {
    type: string;
    text: string;
    updated_at: string | null;
};

type Props = {
    terms: PolicyPayload;
    privacy: PolicyPayload;
};

function PolicyEditor({
    label,
    description,
    previewHref,
    icon: Icon,
    accent,
    policy,
    routePath,
}: {
    label: string;
    description: string;
    previewHref: string;
    icon: typeof FileText;
    accent: 'emerald' | 'cyan';
    policy: PolicyPayload;
    routePath: string;
}) {
    const form = useForm({ text: policy.text });

    const ring =
        accent === 'emerald'
            ? 'border-emerald-200/80 ring-emerald-100/60'
            : 'border-cyan-200/80 ring-cyan-100/60';

    const btn =
        accent === 'emerald'
            ? 'bg-emerald-600 hover:bg-emerald-700'
            : 'bg-cyan-600 hover:bg-cyan-700';

    const iconWrap =
        accent === 'emerald'
            ? 'from-emerald-500 to-teal-600 shadow-emerald-500/25'
            : 'from-cyan-500 to-emerald-600 shadow-cyan-500/25';

    return (
        <section
            className={cn(
                'overflow-hidden rounded-3xl border bg-white shadow-sm ring-1',
                ring,
            )}
        >
            <div className="flex flex-col gap-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-white px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                <div className="flex items-start gap-3">
                    <span
                        className={cn(
                            'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg',
                            iconWrap,
                        )}
                    >
                        <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            {label}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            {description}
                        </p>
                        {policy.updated_at && (
                            <p className="mt-1 text-xs text-slate-400">
                                Last saved{' '}
                                {new Date(policy.updated_at).toLocaleString()}
                            </p>
                        )}
                    </div>
                </div>
                <Button variant="outline" size="sm" className="shrink-0 gap-2" asChild>
                    <Link href={previewHref} target="_blank" rel="noreferrer">
                        <ExternalLink className="h-3.5 w-3.5" />
                        Public page
                    </Link>
                </Button>
            </div>

            <form
                className="space-y-4 p-5 sm:p-8"
                onSubmit={(e) => {
                    e.preventDefault();
                    form.put(routePath, { preserveScroll: true });
                }}
            >
                <div className="space-y-2">
                    <Label
                        htmlFor={`policy-${policy.type}`}
                        className="text-sm font-medium text-slate-800"
                    >
                        Content
                    </Label>
                    <textarea
                        id={`policy-${policy.type}`}
                        value={form.data.text}
                        onChange={(e) => form.setData('text', e.target.value)}
                        rows={16}
                        className="border-input placeholder:text-muted-foreground w-full resize-y rounded-xl border bg-white px-4 py-3 font-mono text-sm leading-relaxed shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-500/20"
                    />
                    {form.errors.text && (
                        <p className="text-xs text-destructive">{form.errors.text}</p>
                    )}
                </div>
                <div className="flex justify-end gap-2 pt-1">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => form.reset()}
                        disabled={form.processing}
                    >
                        Reset
                    </Button>
                    <Button
                        type="submit"
                        disabled={form.processing}
                        className={cn('min-w-[7rem] font-semibold text-white', btn)}
                    >
                        {form.processing ? 'Saving…' : 'Save'}
                    </Button>
                </div>
            </form>
        </section>
    );
}

export default function AdminPolicies({ terms, privacy }: Props) {
    const { flash } = usePage<{ flash: { success?: string } }>().props;

    return (
        <>
            <Head title="Policies" />

            <div className="mx-auto w-full max-w-5xl space-y-8">
                <div className="overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-r from-white via-emerald-50/60 to-cyan-50/50 px-5 py-6 shadow-sm sm:px-8 sm:py-8">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        Terms &amp; privacy
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
                        Edit the legal copy shown on the public site and returned
                        by the API. Use blank lines between paragraphs for
                        spacing.
                    </p>
                    {flash?.success && (
                        <p className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-800">
                            {flash.success}
                        </p>
                    )}
                </div>

                <div className="space-y-10 pb-8">
                    <PolicyEditor
                        key={`terms-${terms.updated_at ?? ''}`}
                        label="Terms of use"
                        description="Shown at /terms-of-use and via API with type=terms."
                        previewHref="/terms-of-use"
                        icon={FileText}
                        accent="emerald"
                        policy={terms}
                        routePath={`/admin/policies/${terms.type}`}
                    />
                    <PolicyEditor
                        key={`privacy-${privacy.updated_at ?? ''}`}
                        label="Privacy policy"
                        description="Shown at /privacy-policy and via API with type=privacy."
                        previewHref="/privacy-policy"
                        icon={Shield}
                        accent="cyan"
                        policy={privacy}
                        routePath={`/admin/policies/${privacy.type}`}
                    />
                </div>
            </div>
        </>
    );
}
