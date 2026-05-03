import { Head, router, useForm, usePage } from '@inertiajs/react';
import { ImagePlus, Pencil, Plus, Power, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Banner = {
    id: number;
    title: string;
    description: string | null;
    image_url: string | null;
    sort_order: number;
    is_active: boolean;
};

export default function AdminBanners({ banners }: { banners: Banner[] }) {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>()
        .props;
    const [editing, setEditing] = useState<Banner | null>(null);

    const createForm = useForm({
        title: '',
        description: '',
        image: null as File | null,
        sort_order: 0,
        is_active: true,
    });

    const editForm = useForm({
        title: '',
        description: '',
        image: null as File | null,
        sort_order: 0,
        is_active: true,
    });

    function submitCreate(e: React.FormEvent) {
        e.preventDefault();
        createForm.post('/admin/banners', {
            forceFormData: true,
            onSuccess: () => createForm.reset(),
        });
    }

    function submitEdit(e: React.FormEvent) {
        e.preventDefault();

        if (!editing) {
            return;
        }

        editForm.transform((data) => ({ ...data, _method: 'put' as const }));
        editForm.post(`/admin/banners/${editing.id}`, {
            forceFormData: true,
            onSuccess: () => {
                editForm.transform((data) => data);
                setEditing(null);
            },
            onError: () => editForm.transform((data) => data),
        });
    }

    return (
        <>
            <Head title="Banners" />

            <div className="space-y-6 p-4 sm:p-6">
                <div className="rounded-3xl border border-emerald-100 bg-gradient-to-r from-white via-emerald-50/70 to-cyan-50/70 px-6 py-6 shadow-sm lg:px-8">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        App banners
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm text-slate-600">
                        These appear in the mobile app via{' '}
                        <code className="rounded-md bg-white/80 px-1.5 py-0.5 text-xs text-slate-800">
                            GET /api/v1/banners
                        </code>
                        . Active banners are ordered by sort order (lowest
                        first).
                    </p>
                </div>

                {flash?.success && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                        {flash.error}
                    </div>
                )}

                <form
                    onSubmit={submitCreate}
                    className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                >
                    <div className="flex items-center gap-2">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                            <Plus className="h-4 w-4" />
                        </span>
                        <h2 className="text-lg font-semibold text-slate-900">
                            New banner
                        </h2>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2 sm:col-span-2">
                            <Label>Title</Label>
                            <Input
                                value={createForm.data.title}
                                onChange={(e) =>
                                    createForm.setData('title', e.target.value)
                                }
                                className="rounded-xl"
                                required
                            />
                            {createForm.errors.title && (
                                <p className="text-xs text-destructive">
                                    {createForm.errors.title}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                            <Label>Description</Label>
                            <textarea
                                value={createForm.data.description}
                                onChange={(e) =>
                                    createForm.setData(
                                        'description',
                                        e.target.value,
                                    )
                                }
                                rows={3}
                                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                            />
                            {createForm.errors.description && (
                                <p className="text-xs text-destructive">
                                    {createForm.errors.description}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label>Sort order</Label>
                            <Input
                                type="number"
                                min={0}
                                value={createForm.data.sort_order}
                                onChange={(e) =>
                                    createForm.setData(
                                        'sort_order',
                                        Number(e.target.value),
                                    )
                                }
                                className="rounded-xl"
                            />
                            {createForm.errors.sort_order && (
                                <p className="text-xs text-destructive">
                                    {createForm.errors.sort_order}
                                </p>
                            )}
                        </div>
                        <div className="flex items-end gap-2 pb-1">
                            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                                <input
                                    type="checkbox"
                                    checked={createForm.data.is_active}
                                    onChange={(e) =>
                                        createForm.setData(
                                            'is_active',
                                            e.target.checked,
                                        )
                                    }
                                    className="rounded border-slate-300"
                                />
                                Active
                            </label>
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                            <Label>Image</Label>
                            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/50 px-4 py-3 text-sm font-medium text-emerald-800">
                                <ImagePlus className="h-4 w-4" />
                                <span>
                                    {createForm.data.image
                                        ? createForm.data.image.name
                                        : 'Choose image (optional)'}
                                </span>
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className="sr-only"
                                    onChange={(e) =>
                                        createForm.setData(
                                            'image',
                                            e.target.files?.[0] ?? null,
                                        )
                                    }
                                />
                            </label>
                            {createForm.errors.image && (
                                <p className="text-xs text-destructive">
                                    {createForm.errors.image}
                                </p>
                            )}
                        </div>
                    </div>
                    <Button
                        type="submit"
                        disabled={createForm.processing}
                        className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
                    >
                        {createForm.processing ? 'Saving…' : 'Create banner'}
                    </Button>
                </form>

                <div className="space-y-3">
                    <h2 className="text-base font-semibold text-slate-900">
                        All banners ({banners.length})
                    </h2>
                    {banners.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/80 px-6 py-16 text-center text-sm text-slate-500">
                            No banners yet. Create one above.
                        </div>
                    ) : (
                        <ul className="space-y-3">
                            {banners.map((banner) => (
                                <li
                                    key={banner.id}
                                    className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5"
                                >
                                    <div className="flex min-w-0 flex-1 gap-4">
                                        {banner.image_url ? (
                                            <img
                                                src={banner.image_url}
                                                alt=""
                                                className="h-20 w-32 shrink-0 rounded-2xl object-cover ring-1 ring-slate-100"
                                            />
                                        ) : (
                                            <div className="flex h-20 w-32 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-xs text-slate-400">
                                                No image
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <p className="font-semibold text-slate-900">
                                                {banner.title}
                                            </p>
                                            {banner.description && (
                                                <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                                                    {banner.description}
                                                </p>
                                            )}
                                            <p className="mt-2 text-xs text-slate-500">
                                                Sort {banner.sort_order} ·{' '}
                                                {banner.is_active
                                                    ? 'Active'
                                                    : 'Hidden'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="rounded-xl"
                                            onClick={() => {
                                                setEditing(banner);
                                                editForm.setData(
                                                    'title',
                                                    banner.title,
                                                );
                                                editForm.setData(
                                                    'description',
                                                    banner.description ?? '',
                                                );
                                                editForm.setData(
                                                    'sort_order',
                                                    banner.sort_order,
                                                );
                                                editForm.setData(
                                                    'is_active',
                                                    banner.is_active,
                                                );
                                                editForm.setData('image', null);
                                            }}
                                        >
                                            <Pencil className="mr-1 h-3.5 w-3.5" />
                                            Edit
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="rounded-xl"
                                            onClick={() =>
                                                router.patch(
                                                    `/admin/banners/${banner.id}/toggle-status`,
                                                )
                                            }
                                        >
                                            <Power className="mr-1 h-3.5 w-3.5" />
                                            {banner.is_active
                                                ? 'Deactivate'
                                                : 'Activate'}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            className="rounded-xl"
                                            onClick={() =>
                                                router.delete(
                                                    `/admin/banners/${banner.id}`,
                                                )
                                            }
                                        >
                                            <Trash2 className="mr-1 h-3.5 w-3.5" />
                                            Delete
                                        </Button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            <Dialog
                open={editing !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setEditing(null);
                    }
                }}
            >
                <DialogContent className="max-w-lg gap-0 overflow-hidden rounded-3xl border border-emerald-100 p-0 sm:max-w-lg">
                    <DialogHeader className="border-b border-emerald-100 bg-gradient-to-r from-white to-emerald-50/80 px-6 py-4">
                        <DialogTitle>Edit banner</DialogTitle>
                        <DialogDescription>
                            Changes apply to the mobile app on the next fetch.
                        </DialogDescription>
                    </DialogHeader>
                    {editing && (
                        <form
                            onSubmit={submitEdit}
                            className="space-y-4 px-6 py-5"
                        >
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input
                                    value={editForm.data.title}
                                    onChange={(e) =>
                                        editForm.setData(
                                            'title',
                                            e.target.value,
                                        )
                                    }
                                    className="rounded-xl"
                                    required
                                />
                                {editForm.errors.title && (
                                    <p className="text-xs text-destructive">
                                        {editForm.errors.title}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <textarea
                                    value={editForm.data.description}
                                    onChange={(e) =>
                                        editForm.setData(
                                            'description',
                                            e.target.value,
                                        )
                                    }
                                    rows={3}
                                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                                />
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Sort order</Label>
                                    <Input
                                        type="number"
                                        min={0}
                                        value={editForm.data.sort_order}
                                        onChange={(e) =>
                                            editForm.setData(
                                                'sort_order',
                                                Number(e.target.value),
                                            )
                                        }
                                        className="rounded-xl"
                                    />
                                </div>
                                <div className="flex items-end pb-1">
                                    <label className="flex items-center gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={editForm.data.is_active}
                                            onChange={(e) =>
                                                editForm.setData(
                                                    'is_active',
                                                    e.target.checked,
                                                )
                                            }
                                            className="rounded border-slate-300"
                                        />
                                        Active
                                    </label>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>New image (optional)</Label>
                                <Input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={(e) =>
                                        editForm.setData(
                                            'image',
                                            e.target.files?.[0] ?? null,
                                        )
                                    }
                                    className="rounded-xl"
                                />
                            </div>
                            <DialogFooter className="gap-2 border-0 p-0 sm:justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="rounded-xl"
                                    onClick={() => setEditing(null)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={editForm.processing}
                                    className="rounded-xl bg-emerald-600"
                                >
                                    {editForm.processing
                                        ? 'Saving…'
                                        : 'Save changes'}
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
