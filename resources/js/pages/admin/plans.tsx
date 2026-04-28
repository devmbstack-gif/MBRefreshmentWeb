import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    CheckCircle2,
    ClipboardList,
    Pencil,
    Plus,
    Sparkles,
    Trash2,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

type PlanItem = {
    item_id: number;
    item_name: string;
    quantity: number;
};

type Plan = {
    id: number;
    title: string;
    description: string | null;
    period_type: string;
    starts_at: string;
    ends_at: string;
    is_active: boolean;
    created_by_name: string;
    items: PlanItem[];
    assigned_count: number;
    assigned_employee_ids: number[];
};

type AvailableItem = {
    id: number;
    name: string;
    category: string;
    stock_quantity: number;
};

type Employee = {
    id: number;
    name: string;
    avatar: string | null;
    employee_code: string;
    department: string | null;
};

function getInitials(name: string) {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((chunk) => chunk[0])
        .join('')
        .toUpperCase();
}

type Props = {
    plans: Plan[];
    available_items: AvailableItem[];
    employees: Employee[];
};

export default function AdminPlans({
    plans,
    available_items,
    employees,
}: Props) {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>()
        .props;

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
    const [assigningPlan, setAssigningPlan] = useState<Plan | null>(null);
    const [deletingPlan, setDeletingPlan] = useState<Plan | null>(null);
    const [statusPlan, setStatusPlan] = useState<Plan | null>(null);

    const activePlans = plans.filter((plan) => plan.is_active).length;
    const totalAssignments = plans.reduce(
        (sum, plan) => sum + plan.assigned_count,
        0,
    );
    const totalPlanItems = plans.reduce(
        (sum, plan) => sum + plan.items.length,
        0,
    );

    function handleToggleStatus(plan: Plan) {
        setStatusPlan(plan);
    }

    return (
        <>
            <Head title="Month Plans" />

            <div className="space-y-6 p-4 sm:p-6">
                <div className="overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-r from-white via-emerald-50/70 to-cyan-50/70 shadow-sm">
                    <div className="flex flex-col gap-6 px-6 py-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
                        <div className="max-w-2xl">
                            <div className="mb-3 inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                                Month planning
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                                Month Plans
                            </h1>
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                Build monthly refreshment plans, organize
                                included items, and assign them to employees
                                with a cleaner workflow.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <SummaryCard
                                label="Total plans"
                                value={plans.length}
                            />
                            <SummaryCard label="Active" value={activePlans} />
                            <SummaryCard
                                label="Assigned"
                                value={totalAssignments}
                            />
                            <SummaryCard
                                label="Plan items"
                                value={totalPlanItems}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            Plan Directory
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Create and assign month plans for employees.
                        </p>
                    </div>
                    <Button
                        onClick={() => setShowCreateModal(true)}
                        className="gap-2 rounded-xl px-4 py-2.5 shadow-sm"
                    >
                        <Plus className="h-4 w-4" />
                        Create Month Plan
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

                {plans.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-slate-300 bg-white py-16 text-center shadow-sm">
                        <ClipboardList className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                        <p className="text-sm text-slate-500">
                            No month plans yet. Create your first one.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {plans.map((plan) => (
                            <PlanCard
                                key={plan.id}
                                plan={plan}
                                onEdit={() => setEditingPlan(plan)}
                                onAssign={() => setAssigningPlan(plan)}
                                onToggleStatus={() => handleToggleStatus(plan)}
                                onDelete={() => setDeletingPlan(plan)}
                            />
                        ))}
                    </div>
                )}
            </div>

            <CreatePlanModal
                open={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                availableItems={available_items}
            />
            {editingPlan && (
                <EditPlanModal
                    plan={editingPlan}
                    onClose={() => setEditingPlan(null)}
                    availableItems={available_items}
                />
            )}

            {assigningPlan && (
                <AssignPlanModal
                    plan={assigningPlan}
                    employees={employees}
                    onClose={() => setAssigningPlan(null)}
                />
            )}
            {deletingPlan && (
                <DeletePlanModal
                    plan={deletingPlan}
                    onClose={() => setDeletingPlan(null)}
                />
            )}
            {statusPlan && (
                <StatusPlanModal
                    plan={statusPlan}
                    onClose={() => setStatusPlan(null)}
                />
            )}
        </>
    );
}

function PlanCard({
    plan,
    onEdit,
    onAssign,
    onToggleStatus,
    onDelete,
}: {
    plan: Plan;
    onEdit: () => void;
    onAssign: () => void;
    onToggleStatus: () => void;
    onDelete: () => void;
}) {
    return (
        <div className="flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
            <div className="border-b border-slate-100 bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-4 text-white">
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <h3 className="font-semibold">{plan.title}</h3>
                        <p className="mt-0.5 text-xs text-white/80 capitalize">
                            {plan.period_type} month plan
                        </p>
                    </div>
                    <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                            plan.is_active
                                ? 'bg-white/20 text-white'
                                : 'bg-slate-100 text-slate-700'
                        }`}
                    >
                        {plan.is_active ? 'Active' : 'Inactive'}
                    </span>
                </div>
            </div>

            <div className="space-y-4 p-5">
                <div className="grid grid-cols-2 gap-3">
                    <MiniStat label="Starts" value={plan.starts_at} />
                    <MiniStat label="Ends" value={plan.ends_at} />
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
                        <Sparkles className="h-4 w-4 text-emerald-500" />
                        Included items
                    </div>
                    <div className="space-y-2">
                        {plan.items.map((item) => (
                            <div
                                key={item.item_id}
                                className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm"
                            >
                                <span className="text-slate-700">
                                    {item.item_name}
                                </span>
                                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                    x{item.quantity}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-auto border-t border-slate-200 pt-4">
                    <span className="mb-3 flex items-center gap-1.5 text-xs text-slate-500">
                        <Users className="h-3.5 w-3.5" />
                        {plan.assigned_count} assigned
                    </span>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={onEdit}
                            className="rounded-xl"
                        >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={onToggleStatus}
                            className="rounded-xl"
                        >
                            {plan.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                            size="sm"
                            onClick={onAssign}
                            className="gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600"
                        >
                            <Users className="h-3.5 w-3.5" />
                            Assign
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={onDelete}
                            disabled={plan.is_active}
                            className="rounded-xl disabled:bg-slate-300"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DeletePlanModal({
    plan,
    onClose,
}: {
    plan: Plan;
    onClose: () => void;
}) {
    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Delete plan</DialogTitle>
                    <DialogDescription>
                        "{plan.title}" will be deleted permanently. You can only
                        delete inactive plans without usage history.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2">
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button
                        variant="destructive"
                        onClick={() => {
                            router.delete(`/admin/plans/${plan.id}`);
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

function StatusPlanModal({
    plan,
    onClose,
}: {
    plan: Plan;
    onClose: () => void;
}) {
    const action = plan.is_active ? 'Deactivate' : 'Activate';

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{action} plan</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to {action.toLowerCase()} "
                        {plan.title}"?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2">
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button
                        variant={plan.is_active ? 'destructive' : 'default'}
                        onClick={() => {
                            router.patch(
                                `/admin/plans/${plan.id}/toggle-status`,
                            );
                            onClose();
                        }}
                    >
                        {action}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
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

function MiniStat({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                {label}
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
        </div>
    );
}

function CreatePlanModal({
    open,
    onClose,
    availableItems,
}: {
    open: boolean;
    onClose: () => void;
    availableItems: AvailableItem[];
}) {
    const [selectedItems, setSelectedItems] = useState<
        { item_id: number; item_name: string; quantity: number }[]
    >([]);
    const [selectedItemId, setSelectedItemId] = useState('');

    const form = useForm({
        title: '',
        description: '',
        period_type: 'monthly',
        starts_at: '',
        ends_at: '',
        items: [] as { item_id: number; quantity: number }[],
    });

    function addItem() {
        const id = parseInt(selectedItemId);

        if (!id) {
return;
}

        if (selectedItems.find((i) => i.item_id === id)) {
return;
}

        const item = availableItems.find((i) => i.id === id)!;

        if (item.stock_quantity < 1) {
return;
}

        const newItem = { item_id: id, item_name: item.name, quantity: 1 };
        setSelectedItems((prev) => [...prev, newItem]);
        setSelectedItemId('');
    }

    function updateQuantity(itemId: number, qty: number) {
        const itemStock =
            availableItems.find((item) => item.id === itemId)?.stock_quantity ??
            1;
        const safeQty = Math.max(1, Math.min(itemStock, qty || 1));
        setSelectedItems((prev) =>
            prev.map((i) =>
                i.item_id === itemId ? { ...i, quantity: safeQty } : i,
            ),
        );
    }

    function removeItem(itemId: number) {
        setSelectedItems((prev) => prev.filter((i) => i.item_id !== itemId));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        for (const selected of selectedItems) {
            const item = availableItems.find((i) => i.id === selected.item_id);

            if (!item) {
                form.setError('items', 'One selected item is missing.');

                return;
            }

            if (selected.quantity > item.stock_quantity) {
                form.setError(
                    'items',
                    `${item.name} quantity cannot be greater than stock (${item.stock_quantity}).`,
                );

                return;
            }
        }

        const payloadItems = selectedItems.map((i) => ({
            item_id: i.item_id,
            quantity: i.quantity,
        }));
        form.transform((data) => ({
            ...data,
            items: payloadItems,
        }));
        form.post('/admin/plans', {
            onSuccess: () => {
                onClose();
                form.reset();
                setSelectedItems([]);
                form.transform((data) => data);
            },
            onError: () => {
                form.transform((data) => data);
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-h-[92vh] overflow-y-auto rounded-3xl border border-emerald-100 bg-white p-0 shadow-2xl [-ms-overflow-style:none] [scrollbar-width:none] sm:max-w-2xl [&::-webkit-scrollbar]:hidden">
                <DialogHeader className="border-b border-emerald-100 bg-gradient-to-r from-white to-emerald-50 px-6 py-5">
                    <DialogTitle className="text-2xl font-semibold text-slate-900">
                        Create Month Plan
                    </DialogTitle>
                    <DialogDescription className="text-sm text-slate-500">
                        Build a month plan and attach refreshment items with
                        quantities.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 p-6">
                    <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-5">
                        <div className="space-y-1.5">
                            <Label>Plan Title</Label>
                            <Input
                                value={form.data.title}
                                onChange={(e) =>
                                    form.setData('title', e.target.value)
                                }
                                placeholder="e.g. July 2025 Month Plan"
                            />
                            {form.errors.title && (
                                <p className="text-xs text-destructive">
                                    {form.errors.title}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="space-y-1.5">
                                <Label>Period Type</Label>
                                <Select
                                    value={form.data.period_type}
                                    onValueChange={(val) =>
                                        form.setData('period_type', val)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="monthly">
                                            Monthly
                                        </SelectItem>
                                        <SelectItem value="weekly">
                                            Weekly
                                        </SelectItem>
                                        <SelectItem value="custom">
                                            Custom
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label>Start Date</Label>
                                <Input
                                    type="date"
                                    value={form.data.starts_at}
                                    onChange={(e) =>
                                        form.setData(
                                            'starts_at',
                                            e.target.value,
                                        )
                                    }
                                />
                                {form.errors.starts_at && (
                                    <p className="text-xs text-destructive">
                                        {form.errors.starts_at}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label>End Date</Label>
                                <Input
                                    type="date"
                                    value={form.data.ends_at}
                                    onChange={(e) =>
                                        form.setData('ends_at', e.target.value)
                                    }
                                />
                                {form.errors.ends_at && (
                                    <p className="text-xs text-destructive">
                                        {form.errors.ends_at}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/50 p-5">
                        <Label>Items in this Month Plan</Label>

                        <div className="flex gap-2">
                            <Select
                                value={selectedItemId}
                                onValueChange={setSelectedItemId}
                            >
                                <SelectTrigger className="flex-1">
                                    <SelectValue placeholder="Select an item to add..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableItems
                                        .filter(
                                            (item) => item.stock_quantity > 0,
                                        )
                                        .filter(
                                            (i) =>
                                                !selectedItems.find(
                                                    (s) => s.item_id === i.id,
                                                ),
                                        )
                                        .map((item) => (
                                            <SelectItem
                                                key={item.id}
                                                value={String(item.id)}
                                            >
                                                {item.name} (Stock:{' '}
                                                {item.stock_quantity})
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={addItem}
                            >
                                <Plus className="h-4 w-4" />
                                Add
                            </Button>
                        </div>

                        {form.errors.items && (
                            <p className="text-xs text-destructive">
                                {form.errors.items}
                            </p>
                        )}

                        {selectedItems.length > 0 && (
                            <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
                                {selectedItems.map((item) => (
                                    <div
                                        key={item.item_id}
                                        className="flex items-center justify-between px-4 py-3"
                                    >
                                        <span className="text-sm font-medium text-foreground">
                                            {item.item_name}
                                        </span>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-2">
                                                <Label className="text-xs text-muted-foreground">
                                                    Qty:
                                                </Label>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    max={
                                                        availableItems.find(
                                                            (i) =>
                                                                i.id ===
                                                                item.item_id,
                                                        )?.stock_quantity ?? 1
                                                    }
                                                    value={item.quantity}
                                                    onChange={(e) =>
                                                        updateQuantity(
                                                            item.item_id,
                                                            parseInt(
                                                                e.target.value,
                                                            ) || 1,
                                                        )
                                                    }
                                                    className="h-7 w-16 text-center"
                                                />
                                                <span className="text-xs text-slate-500">
                                                    /{' '}
                                                    {availableItems.find(
                                                        (i) =>
                                                            i.id ===
                                                            item.item_id,
                                                    )?.stock_quantity ?? 0}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeItem(item.item_id)
                                                }
                                                className="text-muted-foreground hover:text-red-500"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 border-t border-slate-200 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={
                                form.processing || selectedItems.length === 0
                            }
                            className="bg-emerald-500 hover:bg-emerald-600"
                        >
                            {form.processing
                                ? 'Creating...'
                                : 'Create Month Plan'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function EditPlanModal({
    plan,
    onClose,
    availableItems,
}: {
    plan: Plan;
    onClose: () => void;
    availableItems: AvailableItem[];
}) {
    const [selectedItems, setSelectedItems] = useState<
        { item_id: number; item_name: string; quantity: number }[]
    >(
        plan.items.map((item) => ({
            item_id: item.item_id,
            item_name: item.item_name,
            quantity: item.quantity,
        })),
    );
    const [selectedItemId, setSelectedItemId] = useState('');

    const form = useForm({
        title: plan.title,
        description: plan.description ?? '',
        period_type: plan.period_type,
        starts_at: plan.starts_at,
        ends_at: plan.ends_at,
        items: [] as { item_id: number; quantity: number }[],
    });

    function addItem() {
        const id = parseInt(selectedItemId);

        if (!id) {
return;
}

        if (selectedItems.find((i) => i.item_id === id)) {
return;
}

        const item = availableItems.find((i) => i.id === id);

        if (!item || item.stock_quantity < 1) {
return;
}

        setSelectedItems((prev) => [
            ...prev,
            { item_id: id, item_name: item.name, quantity: 1 },
        ]);
        setSelectedItemId('');
    }

    function updateQuantity(itemId: number, qty: number) {
        const stock =
            availableItems.find((i) => i.id === itemId)?.stock_quantity ?? 1;
        const safeQty = Math.max(1, Math.min(stock, qty || 1));
        setSelectedItems((prev) =>
            prev.map((item) =>
                item.item_id === itemId ? { ...item, quantity: safeQty } : item,
            ),
        );
    }

    function removeItem(itemId: number) {
        setSelectedItems((prev) =>
            prev.filter((item) => item.item_id !== itemId),
        );
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (selectedItems.length === 0) {
            form.setError('items', 'At least one item is required.');

            return;
        }

        for (const selected of selectedItems) {
            const item = availableItems.find((i) => i.id === selected.item_id);

            if (!item || selected.quantity > item.stock_quantity) {
                form.setError(
                    'items',
                    `Invalid quantity for ${selected.item_name}.`,
                );

                return;
            }
        }

        form.transform((data) => ({
            ...data,
            _method: 'put' as const,
            items: selectedItems.map((i) => ({
                item_id: i.item_id,
                quantity: i.quantity,
            })),
        }));
        form.post(`/admin/plans/${plan.id}`, {
            onSuccess: () => {
                onClose();
                form.transform((data) => data);
            },
            onError: () => {
                form.transform((data) => data);
            },
        });
    }

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-h-[92vh] overflow-y-auto rounded-3xl border border-emerald-100 bg-white p-0 shadow-2xl [-ms-overflow-style:none] [scrollbar-width:none] sm:max-w-2xl [&::-webkit-scrollbar]:hidden">
                <DialogHeader className="border-b border-emerald-100 bg-gradient-to-r from-white to-emerald-50 px-6 py-5">
                    <DialogTitle className="text-2xl font-semibold text-slate-900">
                        Edit Month Plan
                    </DialogTitle>
                    <DialogDescription className="text-sm text-slate-500">
                        Update plan details, item list, and quantities.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-5 p-6">
                    <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-5">
                        <div className="space-y-1.5">
                            <Label>Plan Title</Label>
                            <Input
                                value={form.data.title}
                                onChange={(e) =>
                                    form.setData('title', e.target.value)
                                }
                            />
                            {form.errors.title && (
                                <p className="text-xs text-destructive">
                                    {form.errors.title}
                                </p>
                            )}
                        </div>
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="space-y-1.5">
                                <Label>Period Type</Label>
                                <Select
                                    value={form.data.period_type}
                                    onValueChange={(val) =>
                                        form.setData('period_type', val)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="monthly">
                                            Monthly
                                        </SelectItem>
                                        <SelectItem value="weekly">
                                            Weekly
                                        </SelectItem>
                                        <SelectItem value="custom">
                                            Custom
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Start Date</Label>
                                <Input
                                    type="date"
                                    value={form.data.starts_at}
                                    onChange={(e) =>
                                        form.setData(
                                            'starts_at',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label>End Date</Label>
                                <Input
                                    type="date"
                                    value={form.data.ends_at}
                                    onChange={(e) =>
                                        form.setData('ends_at', e.target.value)
                                    }
                                />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/50 p-5">
                        <Label>Items in this Month Plan</Label>
                        <div className="flex gap-2">
                            <Select
                                value={selectedItemId}
                                onValueChange={setSelectedItemId}
                            >
                                <SelectTrigger className="flex-1">
                                    <SelectValue placeholder="Select an item to add..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableItems
                                        .filter(
                                            (item) => item.stock_quantity > 0,
                                        )
                                        .filter(
                                            (item) =>
                                                !selectedItems.find(
                                                    (selected) =>
                                                        selected.item_id ===
                                                        item.id,
                                                ),
                                        )
                                        .map((item) => (
                                            <SelectItem
                                                key={item.id}
                                                value={String(item.id)}
                                            >
                                                {item.name} (Stock:{' '}
                                                {item.stock_quantity})
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={addItem}
                            >
                                <Plus className="h-4 w-4" />
                                Add
                            </Button>
                        </div>
                        {form.errors.items && (
                            <p className="text-xs text-destructive">
                                {form.errors.items}
                            </p>
                        )}
                        {selectedItems.length > 0 && (
                            <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
                                {selectedItems.map((item) => (
                                    <div
                                        key={item.item_id}
                                        className="flex items-center justify-between px-4 py-3"
                                    >
                                        <span className="text-sm font-medium text-foreground">
                                            {item.item_name}
                                        </span>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-2">
                                                <Label className="text-xs text-muted-foreground">
                                                    Qty:
                                                </Label>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    max={
                                                        availableItems.find(
                                                            (i) =>
                                                                i.id ===
                                                                item.item_id,
                                                        )?.stock_quantity ?? 1
                                                    }
                                                    value={item.quantity}
                                                    onChange={(e) =>
                                                        updateQuantity(
                                                            item.item_id,
                                                            parseInt(
                                                                e.target.value,
                                                            ) || 1,
                                                        )
                                                    }
                                                    className="h-7 w-16 text-center"
                                                />
                                                <span className="text-xs text-slate-500">
                                                    /{' '}
                                                    {availableItems.find(
                                                        (i) =>
                                                            i.id ===
                                                            item.item_id,
                                                    )?.stock_quantity ?? 0}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeItem(item.item_id)
                                                }
                                                className="text-muted-foreground hover:text-red-500"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end gap-3 border-t border-slate-200 pt-2">
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
                            {form.processing ? 'Saving...' : 'Save Plan'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function AssignPlanModal({
    plan,
    employees,
    onClose,
}: {
    plan: Plan;
    employees: Employee[];
    onClose: () => void;
}) {
    const initialEmployeeIds = plan.assigned_employee_ids ?? [];
    const form = useForm({
        employee_ids: initialEmployeeIds,
        allocations: [] as {
            employee_id: number;
            item_id: number;
            quantity: number;
        }[],
    });

    const [allocationMatrix, setAllocationMatrix] = useState<
        Record<string, number>
    >({});

    function key(employeeId: number, itemId: number) {
        return `${employeeId}-${itemId}`;
    }

    function setAllocationValue(
        employeeId: number,
        itemId: number,
        quantity: number,
    ) {
        const safe = Math.max(0, Math.floor(quantity || 0));
        setAllocationMatrix((prev) => ({
            ...prev,
            [key(employeeId, itemId)]: safe,
        }));
    }

    function toggleEmployee(id: number) {
        const current = form.data.employee_ids;

        if (current.includes(id)) {
            form.setData(
                'employee_ids',
                current.filter((e) => e !== id),
            );
        } else {
            form.setData('employee_ids', [...current, id]);
        }
    }

    function selectAll() {
        form.setData(
            'employee_ids',
            employees.map((e) => e.id),
        );
    }

    function clearAll() {
        form.setData('employee_ids', []);
    }

    function distributeEqually() {
        const selected = form.data.employee_ids;

        if (selected.length === 0) {
return;
}

        const next: Record<string, number> = {};

        for (const item of plan.items) {
            const base = Math.floor(item.quantity / selected.length);
            const remainder = item.quantity % selected.length;
            selected.forEach((employeeId, index) => {
                next[key(employeeId, item.item_id)] =
                    base + (index < remainder ? 1 : 0);
            });
        }

        setAllocationMatrix(next);
    }

    function currentAssignedForItem(itemId: number) {
        return form.data.employee_ids.reduce(
            (sum, employeeId) =>
                sum + (allocationMatrix[key(employeeId, itemId)] ?? 0),
            0,
        );
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const allocations = form.data.employee_ids.flatMap((employeeId) =>
            plan.items.map((item) => ({
                employee_id: employeeId,
                item_id: item.item_id,
                quantity: allocationMatrix[key(employeeId, item.item_id)] ?? 0,
            })),
        );

        for (const item of plan.items) {
            const assigned = allocations
                .filter((allocation) => allocation.item_id === item.item_id)
                .reduce((sum, allocation) => sum + allocation.quantity, 0);

            if (assigned > item.quantity) {
                form.setError(
                    'allocations',
                    `${item.item_name} assigned quantity cannot exceed ${item.quantity}.`,
                );

                return;
            }
        }

        form.transform((data) => ({
            ...data,
            allocations,
        }));
        form.post(`/admin/plans/${plan.id}/assign`, {
            onSuccess: () => {
                onClose();
                form.transform((data) => data);
            },
            onError: () => {
                form.transform((data) => data);
            },
        });
    }

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-h-[92vh] overflow-y-auto rounded-3xl border border-emerald-100 bg-white p-0 shadow-2xl [-ms-overflow-style:none] [scrollbar-width:none] sm:max-w-5xl [&::-webkit-scrollbar]:hidden">
                <DialogHeader className="border-b border-emerald-100 bg-gradient-to-r from-emerald-500 via-emerald-500 to-teal-500 px-6 py-5 text-white">
                    <DialogTitle className="text-2xl font-semibold text-white">
                        Assign Month Plan
                    </DialogTitle>
                    <DialogDescription className="text-sm text-emerald-50">
                        {plan.title} · Select employees and distribute each item
                        quantity exactly.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 p-6">
                    {form.errors.employee_ids && (
                        <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
                            {form.errors.employee_ids}
                        </p>
                    )}
                    {form.errors.allocations && (
                        <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
                            {form.errors.allocations}
                        </p>
                    )}

                    <div className="grid gap-4 lg:grid-cols-[1.15fr_1.85fr]">
                        <section className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-slate-900">
                                    Employees
                                </h3>
                                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                    {form.data.employee_ids.length} /{' '}
                                    {employees.length}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={selectAll}
                                    className="rounded-xl"
                                >
                                    Select All
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={clearAll}
                                    className="rounded-xl"
                                >
                                    Clear
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={distributeEqually}
                                    className="rounded-xl"
                                >
                                    Distribute Equally
                                </Button>
                            </div>
                            <div className="max-h-[360px] space-y-2 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                {employees.map((employee) => (
                                    <div
                                        key={employee.id}
                                        role="button"
                                        tabIndex={0}
                                        onClick={(e) => {
                                            const target =
                                                e.target as HTMLElement;

                                            if (
                                                target.closest(
                                                    'input[type="checkbox"][aria-hidden="true"]',
                                                )
                                            ) {
                                                return;
                                            }

                                            toggleEmployee(employee.id);
                                        }}
                                        onKeyDown={(e) => {
                                            if (
                                                e.key === 'Enter' ||
                                                e.key === ' '
                                            ) {
                                                e.preventDefault();
                                                toggleEmployee(employee.id);
                                            }
                                        }}
                                        className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition-all ${
                                            form.data.employee_ids.includes(
                                                employee.id,
                                            )
                                                ? 'border-emerald-200 bg-emerald-50/60 shadow-sm'
                                                : 'border-slate-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/30'
                                        }`}
                                    >
                                        {(() => {
                                            const selected =
                                                form.data.employee_ids.includes(
                                                    employee.id,
                                                );

                                            return (
                                                <>
                                                    <Checkbox
                                                        checked={selected}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleEmployee(
                                                                employee.id,
                                                            );
                                                        }}
                                                    />
                                                    <Avatar className="h-9 w-9 border border-emerald-200">
                                                        {employee.avatar ? (
                                                            <AvatarImage
                                                                src={
                                                                    employee.avatar
                                                                }
                                                                alt={
                                                                    employee.name
                                                                }
                                                                className="object-cover"
                                                            />
                                                        ) : null}
                                                        <AvatarFallback className="bg-emerald-100 text-xs font-semibold text-emerald-700">
                                                            {getInitials(
                                                                employee.name,
                                                            )}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-semibold text-slate-900">
                                                            {employee.name}
                                                        </p>
                                                        <p className="truncate text-xs text-slate-500">
                                                            {
                                                                employee.employee_code
                                                            }
                                                            {employee.department
                                                                ? ` · ${employee.department}`
                                                                : ''}
                                                        </p>
                                                    </div>
                                                    {selected && (
                                                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                                    )}
                                                </>
                                            );
                                        })()}
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-slate-900">
                                    Item Allocation
                                </h3>
                                <p className="text-xs font-medium text-slate-500">
                                    Set quantity per employee
                                </p>
                            </div>
                            {form.data.employee_ids.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500">
                                    Select employees to start assigning item
                                    quantities.
                                </div>
                            ) : (
                                <div className="max-h-[460px] space-y-3 overflow-y-auto pr-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                    {plan.items.map((item) => {
                                        const assigned = currentAssignedForItem(
                                            item.item_id,
                                        );

                                        return (
                                            <div
                                                key={item.item_id}
                                                className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-semibold text-slate-800">
                                                        {item.item_name}
                                                    </p>
                                                    <p
                                                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                            assigned >
                                                            item.quantity
                                                                ? 'bg-rose-100 text-rose-700'
                                                                : 'bg-emerald-100 text-emerald-700'
                                                        }`}
                                                    >
                                                        {assigned} /{' '}
                                                        {item.quantity}
                                                    </p>
                                                </div>
                                                <div className="grid gap-2.5 md:grid-cols-2">
                                                    {form.data.employee_ids.map(
                                                        (employeeId) => {
                                                            const employee =
                                                                employees.find(
                                                                    (e) =>
                                                                        e.id ===
                                                                        employeeId,
                                                                );

                                                            if (!employee) {
return null;
}

                                                            return (
                                                                <div
                                                                    key={`${employeeId}-${item.item_id}`}
                                                                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5"
                                                                >
                                                                    <div className="flex min-w-0 items-center gap-2 pr-2">
                                                                        <Avatar className="h-6 w-6 border border-slate-200">
                                                                            {employee.avatar ? (
                                                                                <AvatarImage
                                                                                    src={
                                                                                        employee.avatar
                                                                                    }
                                                                                    alt={
                                                                                        employee.name
                                                                                    }
                                                                                    className="object-cover"
                                                                                />
                                                                            ) : null}
                                                                            <AvatarFallback className="bg-slate-200 text-[10px] font-semibold text-slate-700">
                                                                                {getInitials(
                                                                                    employee.name,
                                                                                )}
                                                                            </AvatarFallback>
                                                                        </Avatar>
                                                                        <span className="truncate text-xs font-medium text-slate-700">
                                                                            {
                                                                                employee.name
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                    <Input
                                                                        type="number"
                                                                        min={0}
                                                                        value={
                                                                            allocationMatrix[
                                                                                key(
                                                                                    employeeId,
                                                                                    item.item_id,
                                                                                )
                                                                            ] ??
                                                                            0
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            setAllocationValue(
                                                                                employeeId,
                                                                                item.item_id,
                                                                                Number(
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                ) ||
                                                                                    0,
                                                                            )
                                                                        }
                                                                        className="h-8 w-20 rounded-lg border-slate-300 bg-white text-center font-semibold"
                                                                    />
                                                                </div>
                                                            );
                                                        },
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </section>
                    </div>

                    <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            className="rounded-xl"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={
                                form.processing ||
                                form.data.employee_ids.length === 0
                            }
                            className="rounded-xl bg-emerald-500 hover:bg-emerald-600"
                        >
                            {form.processing
                                ? 'Assigning...'
                                : `Assign to ${form.data.employee_ids.length} Employee(s)`}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
