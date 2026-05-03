import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    Box,
    Coffee,
    ImagePlus,
    LayoutGrid,
    Package2,
    Pencil,
    Plus,
    Power,
    Sparkles,
    Tags,
    Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

type Item = {
    id: number;
    name: string;
    category: string;
    category_id?: number | null;
    description: string | null;
    image_url?: string | null;
    stock_quantity: number;
    low_stock_threshold: number;
    is_active: boolean;
};

type Props = {
    items: Item[];
    categories: Category[];
};

type Category = {
    id: number;
    name: string;
    slug: string;
    image_url?: string | null;
};

const categoryColors: Record<string, string> = {
    food: 'bg-orange-100 text-orange-700',
    beverage: 'bg-blue-100 text-blue-700',
    snack: 'bg-yellow-100 text-yellow-700',
    other: 'bg-slate-100 text-slate-700',
};

export default function AdminItems({ items, categories }: Props) {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>()
        .props;
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingItem, setEditingItem] = useState<Item | null>(null);
    const [deletingItem, setDeletingItem] = useState<Item | null>(null);
    const [showCategoryModal, setShowCategoryModal] = useState(false);

    const activeItems = items.filter((item) => item.is_active).length;
    const lowStockItems = items.filter(
        (item) => item.stock_quantity <= item.low_stock_threshold,
    ).length;
    const totalStock = items.reduce(
        (sum, item) => sum + item.stock_quantity,
        0,
    );

    const getStockState = (item: Item) => {
        if (item.stock_quantity === 0) {
            return 'Out of stock';
        }

        if (item.stock_quantity <= item.low_stock_threshold) {
            return 'Low stock';
        }

        return 'In stock';
    };

    return (
        <>
            <Head title="Items" />

            <div className="space-y-6 p-4 sm:p-6">
                <div className="overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-r from-white via-emerald-50/70 to-cyan-50/70 shadow-sm">
                    <div className="flex flex-col gap-6 px-6 py-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
                        <div className="max-w-2xl">
                            <div className="mb-3 inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                                Inventory management
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                                Items
                            </h1>
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                Manage refreshment items, track live stock, and
                                keep the structure ready for future mobile APIs.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <SummaryCard
                                label="Total items"
                                value={items.length}
                            />
                            <SummaryCard label="Active" value={activeItems} />
                            <SummaryCard
                                label="Stock units"
                                value={totalStock}
                            />
                            <SummaryCard
                                label="Low stock"
                                value={lowStockItems}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            Inventory Directory
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Track stock quantity, thresholds, and item
                            availability in one place.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowCategoryModal(true)}
                            className="gap-2 rounded-xl px-4 py-2.5"
                        >
                            <Tags className="h-4 w-4" />
                            Categories
                        </Button>
                        <Button
                            onClick={() => setShowCreateModal(true)}
                            className="gap-2 rounded-xl px-4 py-2.5 shadow-sm"
                        >
                            <Plus className="h-4 w-4" />
                            Add Item
                        </Button>
                    </div>
                </div>

                {flash?.success && (
                    <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        {flash.error}
                    </div>
                )}

                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {items.length === 0 ? (
                        <div className="col-span-full rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                                <Package2 className="h-7 w-7" />
                            </div>
                            <h3 className="mt-4 text-lg font-semibold text-slate-900">
                                No items yet
                            </h3>
                            <p className="mt-2 text-sm text-slate-500">
                                Create your first refreshment item and start
                                tracking stock.
                            </p>
                            <Button
                                onClick={() => setShowCreateModal(true)}
                                className="mt-5 rounded-xl px-4 py-2.5"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Item
                            </Button>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div
                                key={item.id}
                                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                            >
                                <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-4 text-white">
                                    <div>
                                        <p className="text-xs font-semibold tracking-[0.18em] text-white/80 uppercase">
                                            {formatCategory(item.category)}
                                        </p>
                                        <h3 className="mt-1 text-xl font-semibold">
                                            {item.name}
                                        </h3>
                                    </div>
                                    {item.image_url ? (
                                        <img
                                            src={item.image_url}
                                            alt={item.name}
                                            className="h-12 w-12 rounded-2xl border border-white/20 object-cover"
                                        />
                                    ) : (
                                        <div className="rounded-2xl bg-white/15 p-3">
                                            <Coffee className="h-5 w-5" />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4 p-5">
                                    <div className="flex flex-wrap gap-2">
                                        <span
                                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getCategoryColor(item.category)}`}
                                        >
                                            {formatCategory(item.category)}
                                        </span>
                                        <span
                                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                                                item.is_active
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : 'bg-slate-100 text-slate-700'
                                            }`}
                                        >
                                            {item.is_active
                                                ? 'Active'
                                                : 'Inactive'}
                                        </span>
                                        <span
                                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                                                item.stock_quantity === 0
                                                    ? 'bg-rose-100 text-rose-700'
                                                    : item.stock_quantity <=
                                                        item.low_stock_threshold
                                                      ? 'bg-amber-100 text-amber-700'
                                                      : 'bg-blue-100 text-blue-700'
                                            }`}
                                        >
                                            {getStockState(item)}
                                        </span>
                                    </div>

                                    <p className="min-h-10 text-sm leading-6 text-slate-500">
                                        {item.description ||
                                            'No description added for this item yet.'}
                                    </p>

                                    <div className="grid grid-cols-2 gap-3">
                                        <InfoStat
                                            label="Stock quantity"
                                            value={item.stock_quantity}
                                            icon={<Box className="h-4 w-4" />}
                                        />
                                        <InfoStat
                                            label="Low stock at"
                                            value={item.low_stock_threshold}
                                            icon={
                                                <AlertTriangle className="h-4 w-4" />
                                            }
                                        />
                                    </div>

                                    <div className="rounded-2xl bg-slate-50 p-3">
                                        <div className="mb-2 flex items-center justify-between text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
                                            <span>Stock level</span>
                                            <span>{item.stock_quantity}</span>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                                            <div
                                                className={`h-full rounded-full ${
                                                    item.stock_quantity === 0
                                                        ? 'bg-rose-500'
                                                        : item.stock_quantity <=
                                                            item.low_stock_threshold
                                                          ? 'bg-amber-500'
                                                          : 'bg-emerald-500'
                                                }`}
                                                style={{
                                                    width: `${Math.min(
                                                        100,
                                                        Math.max(
                                                            item.stock_quantity >
                                                                0
                                                                ? 10
                                                                : 0,
                                                            (item.stock_quantity /
                                                                Math.max(
                                                                    item.low_stock_threshold *
                                                                        4,
                                                                    20,
                                                                )) *
                                                                100,
                                                        ),
                                                    )}%`,
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                        <button
                                            onClick={() => setEditingItem(item)}
                                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                                        >
                                            <Pencil className="h-4 w-4" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => {
                                                router.patch(
                                                    `/admin/items/${item.id}/toggle-status`,
                                                );
                                            }}
                                            className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 ${
                                                item.is_active
                                                    ? 'bg-rose-500'
                                                    : 'bg-emerald-500'
                                            }`}
                                        >
                                            <Power className="h-4 w-4" />
                                            {item.is_active
                                                ? 'Deactivate'
                                                : 'Activate'}
                                        </button>
                                        <button
                                            onClick={() =>
                                                setDeletingItem(item)
                                            }
                                            disabled={item.is_active}
                                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <ItemModal
                key={`create-${categories.map((c) => c.id).join('-')}-${showCreateModal}`}
                open={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                item={null}
                categories={categories}
            />

            {editingItem && (
                <ItemModal
                    key={`edit-${editingItem.id}-${categories.map((c) => c.id).join('-')}`}
                    open={true}
                    onClose={() => setEditingItem(null)}
                    item={editingItem}
                    categories={categories}
                />
            )}

            <CategoryModal
                open={showCategoryModal}
                onClose={() => setShowCategoryModal(false)}
                categories={categories}
            />

            {deletingItem && (
                <DeactivateItemModal
                    item={deletingItem}
                    onClose={() => setDeletingItem(null)}
                />
            )}
        </>
    );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
            <p className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
                {label}
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
        </div>
    );
}

function formatCategory(category: string) {
    return category
        .toString()
        .replace(/[_-]+/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getCategoryColor(category: string) {
    return (
        categoryColors[category.toLowerCase()] ?? 'bg-slate-100 text-slate-700'
    );
}

function resolveInitialCategoryId(
    item: Item | null,
    categories: Category[],
): number {
    if (item?.category_id != null && item.category_id > 0) {
        return item.category_id;
    }

    const normalized = (item?.category ?? '').toLowerCase().trim();
    const byName = categories.find(
        (c) => c.name.toLowerCase().trim() === normalized,
    );

    if (byName) {
        return byName.id;
    }

    return categories[0]?.id ?? 0;
}

function InfoStat({
    label,
    value,
    icon,
}: {
    label: string;
    value: number;
    icon: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-2 text-slate-400">{icon}</div>
            <p className="mt-2 text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                {label}
            </p>
            <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
        </div>
    );
}

function DeactivateItemModal({
    item,
    onClose,
}: {
    item: Item;
    onClose: () => void;
}) {
    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Delete item</DialogTitle>
                    <DialogDescription>
                        "{item.name}" will be deleted permanently. Deactivate
                        the item first to avoid accidental removal.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2">
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button
                        variant="destructive"
                        onClick={() => {
                            router.delete(`/admin/items/${item.id}`);
                            onClose();
                        }}
                    >
                        Delete permanently
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function ItemModal({
    open,
    onClose,
    item,
    categories,
}: {
    open: boolean;
    onClose: () => void;
    item: Item | null;
    categories: Category[];
}) {
    const isEditing = item !== null;
    const initialCategoryId = resolveInitialCategoryId(item, categories);
    const form = useForm({
        name: item?.name ?? '',
        category_id:
            initialCategoryId > 0
                ? initialCategoryId
                : (categories[0]?.id ?? 0),
        description: item?.description ?? '',
        image: null as File | null,
        stock_quantity: item?.stock_quantity ?? 0,
        low_stock_threshold: item?.low_stock_threshold ?? 5,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (isEditing) {
            form.transform((data) => ({
                ...data,
                _method: 'put',
            }));

            form.post(`/admin/items/${item.id}`, {
                forceFormData: true,
                onSuccess: () => {
                    form.transform((data) => data);
                    onClose();
                },
                onError: () => {
                    form.transform((data) => data);
                },
            });
        } else {
            form.post('/admin/items', {
                forceFormData: true,
                onSuccess: () => {
                    onClose();
                    form.reset();
                },
            });
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="overflow-hidden rounded-3xl border border-emerald-100 bg-white p-0 shadow-2xl [-ms-overflow-style:none] [scrollbar-width:none] sm:max-w-2xl [&::-webkit-scrollbar]:hidden">
                <DialogHeader className="border-b border-emerald-100 bg-gradient-to-r from-white to-emerald-50 px-6 py-4">
                    <DialogTitle className="text-xl font-semibold text-slate-900">
                        {isEditing
                            ? `Edit Item - ${item.name}`
                            : 'Add New Item'}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-slate-500">
                        Save item details in a structure that supports stock
                        tracking and future mobile APIs.
                    </DialogDescription>
                </DialogHeader>

                <div className="max-h-[calc(88vh-88px)] overflow-y-auto px-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-4 p-4 pr-3"
                    >
                        <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                            <p className="text-[11px] font-semibold tracking-[0.22em] text-emerald-600 uppercase">
                                Item Details
                            </p>
                            <h3 className="mt-1 text-base font-semibold text-slate-900">
                                Basic information
                            </h3>
                            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                <FormField
                                    label="Item Image"
                                    error={form.errors.image}
                                    className="sm:col-span-2"
                                >
                                    <ItemImageField
                                        file={form.data.image}
                                        currentImage={item?.image_url ?? null}
                                        name={form.data.name}
                                        onChange={(file) =>
                                            form.setData('image', file)
                                        }
                                    />
                                </FormField>

                                <FormField
                                    label="Item Name"
                                    error={form.errors.name}
                                    className="sm:col-span-2"
                                >
                                    <Input
                                        value={form.data.name}
                                        onChange={(e) =>
                                            form.setData('name', e.target.value)
                                        }
                                        placeholder="Lunch, Green Tea, Chocolate"
                                        className="rounded-xl"
                                    />
                                </FormField>

                                <FormField
                                    label="Category"
                                    error={form.errors.category_id}
                                >
                                    <>
                                        <select
                                            value={
                                                form.data.category_id > 0
                                                    ? String(
                                                          form.data.category_id,
                                                      )
                                                    : ''
                                            }
                                            onChange={(e) =>
                                                form.setData(
                                                    'category_id',
                                                    Number(e.target.value),
                                                )
                                            }
                                            className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                                            disabled={categories.length === 0}
                                        >
                                            {categories.map((category) => (
                                                <option
                                                    key={category.id}
                                                    value={String(category.id)}
                                                >
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                    </>
                                </FormField>

                                <FormField
                                    label="Description"
                                    error={form.errors.description}
                                >
                                    <Input
                                        value={form.data.description}
                                        onChange={(e) =>
                                            form.setData(
                                                'description',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Brief description"
                                        className="rounded-xl"
                                    />
                                </FormField>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                            <p className="text-[11px] font-semibold tracking-[0.22em] text-emerald-600 uppercase">
                                Inventory
                            </p>
                            <h3 className="mt-1 text-base font-semibold text-slate-900">
                                Stock settings
                            </h3>
                            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                <FormField
                                    label="Stock Quantity"
                                    error={form.errors.stock_quantity}
                                >
                                    <Input
                                        type="number"
                                        min={0}
                                        value={form.data.stock_quantity}
                                        onChange={(e) =>
                                            form.setData(
                                                'stock_quantity',
                                                Number(e.target.value),
                                            )
                                        }
                                        placeholder="0"
                                        className="rounded-xl"
                                    />
                                </FormField>

                                <FormField
                                    label="Low Stock Threshold"
                                    error={form.errors.low_stock_threshold}
                                >
                                    <Input
                                        type="number"
                                        min={0}
                                        value={form.data.low_stock_threshold}
                                        onChange={(e) =>
                                            form.setData(
                                                'low_stock_threshold',
                                                Number(e.target.value),
                                            )
                                        }
                                        placeholder="5"
                                        className="rounded-xl"
                                    />
                                </FormField>
                            </div>
                        </div>

                        <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-200 bg-white/95 pt-3 backdrop-blur">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={form.processing}
                                className="bg-emerald-500 hover:bg-emerald-600"
                            >
                                {form.processing
                                    ? 'Saving...'
                                    : isEditing
                                      ? 'Save Changes'
                                      : 'Create Item'}
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function CategoryImagePicker({
    file,
    currentImageUrl,
    onChange,
}: {
    file: File | null;
    currentImageUrl: string | null;
    onChange: (next: File | null) => void;
}) {
    const objectUrl = useMemo(() => {
        if (!file) {
            return null;
        }

        return URL.createObjectURL(file);
    }, [file]);

    useEffect(() => {
        if (!objectUrl) {
            return undefined;
        }

        return () => URL.revokeObjectURL(objectUrl);
    }, [objectUrl]);

    const displaySrc = objectUrl ?? currentImageUrl ?? null;

    return (
        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/30 to-cyan-50/40 p-4 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="shrink-0">
                    {displaySrc ? (
                        <img
                            src={displaySrc}
                            alt=""
                            className="h-20 w-20 rounded-2xl border-4 border-white object-cover shadow-md ring-1 ring-emerald-100"
                        />
                    ) : (
                        <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-md ring-1 ring-emerald-100">
                            <Tags className="h-8 w-8 opacity-90" aria-hidden />
                        </div>
                    )}
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                    <label className="flex cursor-pointer flex-col items-stretch gap-2 sm:flex-row sm:items-center">
                        <span className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-dashed border-emerald-300 bg-white/90 px-4 py-3 text-sm font-medium text-emerald-800 shadow-sm transition hover:border-emerald-400 hover:bg-emerald-50/80">
                            <ImagePlus
                                className="h-4 w-4 shrink-0"
                                aria-hidden
                            />
                            <span className="truncate">
                                {file ? file.name : 'Choose category image'}
                            </span>
                        </span>
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/jpg"
                            className="sr-only"
                            onChange={(e) =>
                                onChange(e.target.files?.[0] ?? null)
                            }
                        />
                    </label>
                    {file && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 self-start rounded-lg text-xs text-slate-600 hover:text-rose-700"
                            onClick={() => onChange(null)}
                        >
                            Remove selected file
                        </Button>
                    )}
                    <p className="text-xs leading-relaxed text-slate-500">
                        JPG, PNG, or WEBP. Used in filters and item cards.
                    </p>
                </div>
            </div>
        </div>
    );
}

function CategoryModal({
    open,
    onClose,
    categories,
}: {
    open: boolean;
    onClose: () => void;
    categories: Category[];
}) {
    const [editingCategory, setEditingCategory] = useState<Category | null>(
        null,
    );
    const createForm = useForm({
        name: '',
        image: null as File | null,
    });
    const editForm = useForm({
        name: '',
        image: null as File | null,
    });

    function submitCreate(e: React.FormEvent) {
        e.preventDefault();
        createForm.post('/admin/categories', {
            forceFormData: true,
            onSuccess: () => createForm.reset(),
        });
    }

    function submitEdit(e: React.FormEvent) {
        e.preventDefault();

        if (!editingCategory) {
            return;
        }

        editForm.transform((data) => ({ ...data, _method: 'put' as const }));
        editForm.post(`/admin/categories/${editingCategory.id}`, {
            forceFormData: true,
            onSuccess: () => {
                editForm.transform((data) => data);
                setEditingCategory(null);
            },
            onError: () => editForm.transform((data) => data),
        });
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="flex max-h-[90vh] w-[calc(100vw-1.5rem)] max-w-2xl flex-col gap-0 overflow-hidden rounded-3xl border border-emerald-100 bg-white p-0 shadow-2xl sm:w-full">
                <DialogHeader className="shrink-0 space-y-2 border-b border-emerald-100 bg-gradient-to-r from-white via-emerald-50/70 to-cyan-50/50 px-6 py-5 text-left sm:px-8">
                    <div className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25">
                            <Sparkles className="h-5 w-5" aria-hidden />
                        </span>
                        <div className="min-w-0 flex-1">
                            <DialogTitle className="text-xl font-bold tracking-tight text-slate-900">
                                Manage categories
                            </DialogTitle>
                            <DialogDescription className="mt-1.5 text-sm leading-relaxed text-slate-600">
                                Organize how items are grouped. Names and images
                                power filters and a polished catalog experience.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-8">
                    <div className="mx-auto max-w-xl space-y-8">
                        <section className="rounded-2xl border border-slate-200/90 bg-gradient-to-b from-slate-50/90 to-white p-5 shadow-sm sm:p-6">
                            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
                                        <Plus className="h-5 w-5" aria-hidden />
                                    </span>
                                    <div>
                                        <h3 className="text-base font-semibold text-slate-900">
                                            Create a category
                                        </h3>
                                        <p className="text-xs text-slate-500">
                                            Appears when you assign items and in
                                            employee filters.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={submitCreate} className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-slate-800">
                                        Display name
                                    </Label>
                                    <Input
                                        value={createForm.data.name}
                                        onChange={(e) =>
                                            createForm.setData(
                                                'name',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="e.g. Drinks, Snacks, Meals"
                                        className="h-11 rounded-xl border-slate-200 bg-white text-base shadow-sm transition focus-visible:border-emerald-400"
                                    />
                                    {createForm.errors.name && (
                                        <p className="text-xs text-destructive">
                                            {createForm.errors.name}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-slate-800">
                                        Image
                                    </Label>
                                    <CategoryImagePicker
                                        file={createForm.data.image}
                                        currentImageUrl={null}
                                        onChange={(f) =>
                                            createForm.setData('image', f)
                                        }
                                    />
                                    {createForm.errors.image && (
                                        <p className="text-xs text-destructive">
                                            {createForm.errors.image}
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="rounded-xl border-slate-200"
                                        onClick={() => {
                                            createForm.reset();
                                            onClose();
                                        }}
                                    >
                                        Close
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={createForm.processing}
                                        className="rounded-xl bg-emerald-600 px-6 font-semibold shadow-md shadow-emerald-600/25 hover:bg-emerald-700"
                                    >
                                        {createForm.processing ? (
                                            <span>Saving…</span>
                                        ) : (
                                            <span className="inline-flex items-center gap-2">
                                                <Plus className="h-4 w-4" />
                                                Add category
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </section>

                        <Separator className="bg-gradient-to-r from-transparent via-emerald-200/60 to-transparent" />

                        <section className="space-y-4">
                            <div className="flex flex-wrap items-end justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <LayoutGrid
                                        className="h-5 w-5 text-emerald-600"
                                        aria-hidden
                                    />
                                    <div>
                                        <h3 className="text-base font-semibold text-slate-900">
                                            Your categories
                                        </h3>
                                        <p className="text-xs text-slate-500">
                                            {categories.length}{' '}
                                            {categories.length === 1
                                                ? 'category'
                                                : 'categories'}{' '}
                                            in the library
                                        </p>
                                    </div>
                                </div>
                                <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                                    {categories.length} total
                                </span>
                            </div>

                            {categories.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-14 text-center">
                                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
                                        <Tags className="h-6 w-6 text-slate-400" />
                                    </div>
                                    <p className="text-sm font-medium text-slate-700">
                                        No categories yet
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Add your first category above to get
                                        started.
                                    </p>
                                </div>
                            ) : (
                                <ul className="space-y-3">
                                    {categories.map((category) => {
                                        const isEditing =
                                            editingCategory?.id === category.id;

                                        return (
                                            <li key={category.id}>
                                                <div
                                                    className={`group rounded-2xl border bg-white p-4 shadow-sm transition-all sm:p-5 ${
                                                        isEditing
                                                            ? 'border-emerald-300 ring-2 ring-emerald-100'
                                                            : 'border-slate-200/90 hover:border-emerald-200/80 hover:shadow-md'
                                                    }`}
                                                >
                                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                                        <div className="flex min-w-0 flex-1 items-center gap-4">
                                                            <div className="relative shrink-0">
                                                                {category.image_url ? (
                                                                    <img
                                                                        src={
                                                                            category.image_url
                                                                        }
                                                                        alt=""
                                                                        className="h-14 w-14 rounded-2xl border-2 border-white object-cover shadow-md ring-1 ring-slate-100"
                                                                    />
                                                                ) : (
                                                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-white bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500 shadow-inner ring-1 ring-slate-100">
                                                                        <Tags className="h-6 w-6" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="truncate text-base font-semibold text-slate-900">
                                                                    {
                                                                        category.name
                                                                    }
                                                                </p>
                                                                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                                                                    <span className="inline-flex max-w-full items-center rounded-full bg-slate-100 px-2.5 py-0.5 font-mono text-[11px] font-medium tracking-wide text-slate-600 uppercase">
                                                                        {
                                                                            category.slug
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                className="rounded-xl border-slate-200 font-medium shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50/60"
                                                                onClick={() => {
                                                                    setEditingCategory(
                                                                        category,
                                                                    );
                                                                    editForm.setData(
                                                                        'name',
                                                                        category.name,
                                                                    );
                                                                    editForm.setData(
                                                                        'image',
                                                                        null,
                                                                    );
                                                                }}
                                                            >
                                                                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                                                                Edit
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                variant="destructive"
                                                                size="sm"
                                                                className="rounded-xl font-medium shadow-sm"
                                                                onClick={() =>
                                                                    router.delete(
                                                                        `/admin/categories/${category.id}`,
                                                                    )
                                                                }
                                                            >
                                                                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                                                                Delete
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>

                                                {isEditing && (
                                                    <form
                                                        onSubmit={submitEdit}
                                                        className="mt-3 space-y-4 rounded-2xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50/50 to-white p-4 shadow-inner sm:p-5"
                                                    >
                                                        <p className="text-sm font-semibold text-slate-900">
                                                            Edit “
                                                            {
                                                                editingCategory.name
                                                            }
                                                            ”
                                                        </p>
                                                        <div className="space-y-2">
                                                            <Label className="text-sm font-medium text-slate-800">
                                                                Display name
                                                            </Label>
                                                            <Input
                                                                value={
                                                                    editForm
                                                                        .data
                                                                        .name
                                                                }
                                                                onChange={(e) =>
                                                                    editForm.setData(
                                                                        'name',
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                className="h-11 rounded-xl border-slate-200 bg-white shadow-sm"
                                                            />
                                                            {editForm.errors
                                                                .name && (
                                                                <p className="text-xs text-destructive">
                                                                    {
                                                                        editForm
                                                                            .errors
                                                                            .name
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-sm font-medium text-slate-800">
                                                                New image
                                                                (optional)
                                                            </Label>
                                                            <CategoryImagePicker
                                                                file={
                                                                    editForm
                                                                        .data
                                                                        .image
                                                                }
                                                                currentImageUrl={
                                                                    editingCategory.image_url ??
                                                                    null
                                                                }
                                                                onChange={(f) =>
                                                                    editForm.setData(
                                                                        'image',
                                                                        f,
                                                                    )
                                                                }
                                                            />
                                                            {editForm.errors
                                                                .image && (
                                                                <p className="text-xs text-destructive">
                                                                    {
                                                                        editForm
                                                                            .errors
                                                                            .image
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                className="rounded-xl border-slate-200"
                                                                onClick={() =>
                                                                    setEditingCategory(
                                                                        null,
                                                                    )
                                                                }
                                                            >
                                                                Cancel
                                                            </Button>
                                                            <Button
                                                                type="submit"
                                                                disabled={
                                                                    editForm.processing
                                                                }
                                                                className="rounded-xl bg-emerald-600 font-semibold shadow-md shadow-emerald-600/25 hover:bg-emerald-700"
                                                            >
                                                                {editForm.processing
                                                                    ? 'Saving…'
                                                                    : 'Save changes'}
                                                            </Button>
                                                        </div>
                                                    </form>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </section>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function ItemImageField({
    file,
    currentImage,
    name,
    onChange,
}: {
    file: File | null;
    currentImage: string | null;
    name: string;
    onChange: (file: File | null) => void;
}) {
    const previewSrc = file ? URL.createObjectURL(file) : currentImage;

    return (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {previewSrc ? (
                    <img
                        src={previewSrc}
                        alt={name || 'Item preview'}
                        className="h-16 w-16 rounded-xl border-4 border-white object-cover shadow-sm"
                    />
                ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl border-4 border-white bg-emerald-500 text-white shadow-sm">
                        <Coffee className="h-6 w-6" />
                    </div>
                )}
                <div className="flex-1">
                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-emerald-300 bg-white px-4 py-2.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50">
                        <ImagePlus className="h-4 w-4" />
                        Choose item image
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                                onChange(e.target.files?.[0] ?? null)
                            }
                        />
                    </label>
                    <p className="mt-1.5 text-xs leading-5 text-slate-500">
                        Upload an image for the item card. Supported: JPG, JPEG,
                        PNG, WEBP.
                    </p>
                </div>
            </div>
        </div>
    );
}

function FormField({
    label,
    error,
    className,
    children,
}: {
    label: string;
    error?: string;
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <div className={`space-y-1.5 ${className ?? ''}`}>
            <Label className="text-sm font-medium text-slate-800">
                {label}
            </Label>
            {children}
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}
