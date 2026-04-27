import { Head, router, useForm, usePage } from '@inertiajs/react';
import { AlertTriangle, Box, Coffee, ImagePlus, Package2, Pencil, Plus, Power, Trash2 } from 'lucide-react';
import { useState } from 'react';
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

type Item = {
    id: number;
    name: string;
    category: string;
    description: string | null;
    image_url?: string | null;
    stock_quantity: number;
    low_stock_threshold: number;
    is_active: boolean;
};

type Props = {
    items: Item[];
};

const categoryLabels: Record<string, string> = {
    food: 'Food',
    beverage: 'Beverage',
    snack: 'Snack',
    other: 'Other',
};

const defaultCategories = ['food', 'beverage', 'snack', 'other'];

const categoryColors: Record<string, string> = {
    food: 'bg-orange-100 text-orange-700',
    beverage: 'bg-blue-100 text-blue-700',
    snack: 'bg-yellow-100 text-yellow-700',
    other: 'bg-slate-100 text-slate-700',
};

export default function AdminItems({ items }: Props) {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingItem, setEditingItem] = useState<Item | null>(null);
    const [deletingItem, setDeletingItem] = useState<Item | null>(null);
    const categoryOptions = Array.from(new Set([...defaultCategories, ...items.map((item) => item.category).filter(Boolean)])).sort((a, b) =>
        a.localeCompare(b),
    );

    const activeItems = items.filter((item) => item.is_active).length;
    const lowStockItems = items.filter((item) => item.stock_quantity <= item.low_stock_threshold).length;
    const totalStock = items.reduce((sum, item) => sum + item.stock_quantity, 0);

    const getStockState = (item: Item) => {
        if (item.stock_quantity === 0) return 'Out of stock';
        if (item.stock_quantity <= item.low_stock_threshold) return 'Low stock';
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
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Items</h1>
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                Manage refreshment items, track live stock, and keep the structure ready for future mobile APIs.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <SummaryCard label="Total items" value={items.length} />
                            <SummaryCard label="Active" value={activeItems} />
                            <SummaryCard label="Stock units" value={totalStock} />
                            <SummaryCard label="Low stock" value={lowStockItems} />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Inventory Directory</h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Track stock quantity, thresholds, and item availability in one place.
                        </p>
                    </div>
                    <Button onClick={() => setShowCreateModal(true)} className="gap-2 rounded-xl px-4 py-2.5 shadow-sm">
                        <Plus className="h-4 w-4" />
                        Add Item
                    </Button>
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
                            <h3 className="mt-4 text-lg font-semibold text-slate-900">No items yet</h3>
                            <p className="mt-2 text-sm text-slate-500">Create your first refreshment item and start tracking stock.</p>
                            <Button onClick={() => setShowCreateModal(true)} className="mt-5 rounded-xl px-4 py-2.5">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Item
                            </Button>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                                <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-4 text-white">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">{formatCategory(item.category)}</p>
                                        <h3 className="mt-1 text-xl font-semibold">{item.name}</h3>
                                    </div>
                                    {item.image_url ? (
                                        <img src={item.image_url} alt={item.name} className="h-12 w-12 rounded-2xl border border-white/20 object-cover" />
                                    ) : (
                                        <div className="rounded-2xl bg-white/15 p-3">
                                            <Coffee className="h-5 w-5" />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4 p-5">
                                    <div className="flex flex-wrap gap-2">
                                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getCategoryColor(item.category)}`}>
                                            {formatCategory(item.category)}
                                        </span>
                                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                                            item.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                                        }`}>
                                            {item.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                                            item.stock_quantity === 0
                                                ? 'bg-rose-100 text-rose-700'
                                                : item.stock_quantity <= item.low_stock_threshold
                                                    ? 'bg-amber-100 text-amber-700'
                                                    : 'bg-blue-100 text-blue-700'
                                        }`}>
                                            {getStockState(item)}
                                        </span>
                                    </div>

                                    <p className="min-h-10 text-sm leading-6 text-slate-500">
                                        {item.description || 'No description added for this item yet.'}
                                    </p>

                                    <div className="grid grid-cols-2 gap-3">
                                        <InfoStat label="Stock quantity" value={item.stock_quantity} icon={<Box className="h-4 w-4" />} />
                                        <InfoStat label="Low stock at" value={item.low_stock_threshold} icon={<AlertTriangle className="h-4 w-4" />} />
                                    </div>

                                    <div className="rounded-2xl bg-slate-50 p-3">
                                        <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                            <span>Stock level</span>
                                            <span>{item.stock_quantity}</span>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                                            <div
                                                className={`h-full rounded-full ${
                                                    item.stock_quantity === 0
                                                        ? 'bg-rose-500'
                                                        : item.stock_quantity <= item.low_stock_threshold
                                                            ? 'bg-amber-500'
                                                            : 'bg-emerald-500'
                                                }`}
                                                style={{
                                                    width: `${Math.min(
                                                        100,
                                                        Math.max(
                                                            item.stock_quantity > 0 ? 10 : 0,
                                                            (item.stock_quantity / Math.max(item.low_stock_threshold * 4, 20)) * 100,
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
                                                router.patch(`/admin/items/${item.id}/toggle-status`);
                                            }}
                                            className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 ${
                                                item.is_active ? 'bg-rose-500' : 'bg-emerald-500'
                                            }`}
                                        >
                                            <Power className="h-4 w-4" />
                                            {item.is_active ? 'Deactivate' : 'Activate'}
                                        </button>
                                        <button
                                            onClick={() => setDeletingItem(item)}
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

            <ItemModal open={showCreateModal} onClose={() => setShowCreateModal(false)} item={null} categoryOptions={categoryOptions} />

            {editingItem && <ItemModal open={true} onClose={() => setEditingItem(null)} item={editingItem} categoryOptions={categoryOptions} />}

            {deletingItem && <DeactivateItemModal item={deletingItem} onClose={() => setDeletingItem(null)} />}
        </>
    );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
        </div>
    );
}

function formatCategory(category: string) {
    return categoryLabels[category] ?? category.replace(/[_-]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function getCategoryColor(category: string) {
    return categoryColors[category] ?? 'bg-slate-100 text-slate-700';
}

function InfoStat({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
    return (
        <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-2 text-slate-400">{icon}</div>
            <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
        </div>
    );
}

function DeactivateItemModal({ item, onClose }: { item: Item; onClose: () => void }) {
    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Delete item</DialogTitle>
                    <DialogDescription>
                        "{item.name}" will be deleted permanently. Deactivate the item first to avoid accidental removal.
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
    categoryOptions,
}: {
    open: boolean;
    onClose: () => void;
    item: Item | null;
    categoryOptions: string[];
}) {
    const isEditing = item !== null;
    const form = useForm({
        name: item?.name ?? '',
        category: item?.category ?? 'food',
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
            <DialogContent className="overflow-hidden rounded-3xl border border-emerald-100 bg-white p-0 shadow-2xl [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:max-w-2xl">
                <DialogHeader className="border-b border-emerald-100 bg-gradient-to-r from-white to-emerald-50 px-6 py-4">
                    <DialogTitle className="text-xl font-semibold text-slate-900">
                        {isEditing ? `Edit Item - ${item.name}` : 'Add New Item'}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-slate-500">
                        Save item details in a structure that supports stock tracking and future mobile APIs.
                    </DialogDescription>
                </DialogHeader>

                <div className="max-h-[calc(88vh-88px)] overflow-y-auto px-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <form onSubmit={handleSubmit} className="space-y-4 p-4 pr-3">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-600">Item Details</p>
                        <h3 className="mt-1 text-base font-semibold text-slate-900">Basic information</h3>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            <FormField label="Item Image" error={form.errors.image} className="sm:col-span-2">
                                <ItemImageField
                                    file={form.data.image}
                                    currentImage={item?.image_url ?? null}
                                    name={form.data.name}
                                    onChange={(file) => form.setData('image', file)}
                                />
                            </FormField>

                            <FormField label="Item Name" error={form.errors.name} className="sm:col-span-2">
                                <Input
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    placeholder="Lunch, Green Tea, Chocolate"
                                    className="rounded-xl"
                                />
                            </FormField>

                            <FormField label="Category" error={form.errors.category}>
                                <>
                                    <Input
                                        value={form.data.category}
                                        onChange={(e) => form.setData('category', e.target.value)}
                                        placeholder="food"
                                        list="item-category-options"
                                        className="rounded-xl"
                                    />
                                    <datalist id="item-category-options">
                                        {categoryOptions.map((category) => (
                                            <option key={category} value={category} />
                                        ))}
                                    </datalist>
                                </>
                            </FormField>

                            <FormField label="Description" error={form.errors.description}>
                                <Input
                                    value={form.data.description}
                                    onChange={(e) => form.setData('description', e.target.value)}
                                    placeholder="Brief description"
                                    className="rounded-xl"
                                />
                            </FormField>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-600">Inventory</p>
                        <h3 className="mt-1 text-base font-semibold text-slate-900">Stock settings</h3>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            <FormField label="Stock Quantity" error={form.errors.stock_quantity}>
                                <Input
                                    type="number"
                                    min={0}
                                    value={form.data.stock_quantity}
                                    onChange={(e) => form.setData('stock_quantity', Number(e.target.value))}
                                    placeholder="0"
                                    className="rounded-xl"
                                />
                            </FormField>

                            <FormField label="Low Stock Threshold" error={form.errors.low_stock_threshold}>
                                <Input
                                    type="number"
                                    min={0}
                                    value={form.data.low_stock_threshold}
                                    onChange={(e) => form.setData('low_stock_threshold', Number(e.target.value))}
                                    placeholder="5"
                                    className="rounded-xl"
                                />
                            </FormField>
                        </div>
                    </div>

                    <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-200 bg-white/95 pt-3 backdrop-blur">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={form.processing} className="bg-emerald-500 hover:bg-emerald-600">
                            {form.processing ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Item'}
                        </Button>
                    </div>
                </form>
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
                    <img src={previewSrc} alt={name || 'Item preview'} className="h-16 w-16 rounded-xl border-4 border-white object-cover shadow-sm" />
                ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl border-4 border-white bg-emerald-500 text-white shadow-sm">
                        <Coffee className="h-6 w-6" />
                    </div>
                )}
                <div className="flex-1">
                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-emerald-300 bg-white px-4 py-2.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50">
                        <ImagePlus className="h-4 w-4" />
                        Choose item image
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => onChange(e.target.files?.[0] ?? null)} />
                    </label>
                    <p className="mt-1.5 text-xs leading-5 text-slate-500">Upload an image for the item card. Supported: JPG, JPEG, PNG, WEBP.</p>
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
            <Label className="text-sm font-medium text-slate-800">{label}</Label>
            {children}
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}
