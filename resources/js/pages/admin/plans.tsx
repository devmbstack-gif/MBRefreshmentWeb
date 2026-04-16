import { Head, router, useForm, usePage } from '@inertiajs/react';
import { ClipboardList, Plus, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
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
import { Checkbox } from '@/components/ui/checkbox';

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
};

type AvailableItem = {
    id: number;
    name: string;
    category: string;
};

type Employee = {
    id: number;
    name: string;
    employee_code: string;
    department: string | null;
};

type Props = {
    plans: Plan[];
    available_items: AvailableItem[];
    employees: Employee[];
};

export default function AdminPlans({ plans, available_items, employees }: Props) {
    const { flash } = usePage<{ flash: { success?: string } }>().props;

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [assigningPlan, setAssigningPlan] = useState<Plan | null>(null);

    function handleToggleStatus(plan: Plan) {
        const action = plan.is_active ? 'deactivate' : 'activate';
        if (confirm(`Are you sure you want to ${action} "${plan.title}"?`)) {
            router.patch(`/admin/plans/${plan.id}/toggle-status`);
        }
    }

    return (
        <>
            <Head title="Quota Plans" />

            <div className="space-y-6 p-6">

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Quota Plans</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Create monthly or weekly refreshment plans and assign them to employees.
                        </p>
                    </div>
                    <Button onClick={() => setShowCreateModal(true)} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Create Plan
                    </Button>
                </div>

                {flash?.success && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400">
                        {flash.success}
                    </div>
                )}

                {plans.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border py-16 text-center">
                        <ClipboardList className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
                        <p className="text-sm text-muted-foreground">No plans yet. Create your first quota plan.</p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {plans.map((plan) => (
                            <PlanCard
                                key={plan.id}
                                plan={plan}
                                onAssign={() => setAssigningPlan(plan)}
                                onToggleStatus={() => handleToggleStatus(plan)}
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

            {assigningPlan && (
                <AssignPlanModal
                    plan={assigningPlan}
                    employees={employees}
                    onClose={() => setAssigningPlan(null)}
                />
            )}
        </>
    );
}

function PlanCard({
    plan,
    onAssign,
    onToggleStatus,
}: {
    plan: Plan;
    onAssign: () => void;
    onToggleStatus: () => void;
}) {
    return (
        <div className="flex flex-col rounded-xl border border-border bg-card p-5">
            <div className="mb-4 flex items-start justify-between gap-2">
                <div>
                    <h3 className="font-semibold text-foreground">{plan.title}</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground capitalize">{plan.period_type} plan</p>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                    plan.is_active
                        ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400'
                        : 'bg-muted text-muted-foreground'
                }`}>
                    {plan.is_active ? 'Active' : 'Inactive'}
                </span>
            </div>

            <div className="mb-4 flex gap-4 text-xs text-muted-foreground">
                <span>From: {plan.starts_at}</span>
                <span>To: {plan.ends_at}</span>
            </div>

            <div className="mb-4 space-y-1">
                {plan.items.map((item) => (
                    <div key={item.item_id} className="flex justify-between text-sm">
                        <span className="text-foreground">{item.item_name}</span>
                        <span className="font-medium text-primary">×{item.quantity}</span>
                    </div>
                ))}
            </div>

            <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    {plan.assigned_count} assigned
                </span>

                <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={onToggleStatus}>
                        {plan.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button size="sm" onClick={onAssign} className="gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        Assign
                    </Button>
                </div>
            </div>
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
    const [selectedItems, setSelectedItems] = useState<{ item_id: number; item_name: string; quantity: number }[]>([]);
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
        if (!id) return;
        if (selectedItems.find((i) => i.item_id === id)) return;

        const item = availableItems.find((i) => i.id === id)!;
        const newItem = { item_id: id, item_name: item.name, quantity: 1 };
        setSelectedItems((prev) => [...prev, newItem]);
        setSelectedItemId('');
    }

    function updateQuantity(itemId: number, qty: number) {
        setSelectedItems((prev) =>
            prev.map((i) => (i.item_id === itemId ? { ...i, quantity: qty } : i))
        );
    }

    function removeItem(itemId: number) {
        setSelectedItems((prev) => prev.filter((i) => i.item_id !== itemId));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        form.setData('items', selectedItems.map((i) => ({ item_id: i.item_id, quantity: i.quantity })));
        form.post('/admin/plans', {
            onSuccess: () => {
                onClose();
                form.reset();
                setSelectedItems([]);
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Create Quota Plan</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5">

                    <div className="space-y-1.5">
                        <Label>Plan Title</Label>
                        <Input
                            value={form.data.title}
                            onChange={(e) => form.setData('title', e.target.value)}
                            placeholder="e.g. July 2025 Monthly Refreshment"
                        />
                        {form.errors.title && <p className="text-xs text-destructive">{form.errors.title}</p>}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="space-y-1.5">
                            <Label>Period Type</Label>
                            <Select
                                value={form.data.period_type}
                                onValueChange={(val) => form.setData('period_type', val)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                    <SelectItem value="weekly">Weekly</SelectItem>
                                    <SelectItem value="custom">Custom</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label>Start Date</Label>
                            <Input
                                type="date"
                                value={form.data.starts_at}
                                onChange={(e) => form.setData('starts_at', e.target.value)}
                            />
                            {form.errors.starts_at && <p className="text-xs text-destructive">{form.errors.starts_at}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label>End Date</Label>
                            <Input
                                type="date"
                                value={form.data.ends_at}
                                onChange={(e) => form.setData('ends_at', e.target.value)}
                            />
                            {form.errors.ends_at && <p className="text-xs text-destructive">{form.errors.ends_at}</p>}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label>Items in this Plan</Label>

                        <div className="flex gap-2">
                            <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                                <SelectTrigger className="flex-1">
                                    <SelectValue placeholder="Select an item to add..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableItems
                                        .filter((i) => !selectedItems.find((s) => s.item_id === i.id))
                                        .map((item) => (
                                            <SelectItem key={item.id} value={String(item.id)}>
                                                {item.name}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                            <Button type="button" variant="outline" onClick={addItem}>
                                <Plus className="h-4 w-4" />
                                Add
                            </Button>
                        </div>

                        {form.errors.items && (
                            <p className="text-xs text-destructive">{form.errors.items}</p>
                        )}

                        {selectedItems.length > 0 && (
                            <div className="rounded-lg border border-border divide-y divide-border">
                                {selectedItems.map((item) => (
                                    <div key={item.item_id} className="flex items-center justify-between px-4 py-2.5">
                                        <span className="text-sm font-medium text-foreground">{item.item_name}</span>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-2">
                                                <Label className="text-xs text-muted-foreground">Qty:</Label>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    value={item.quantity}
                                                    onChange={(e) => updateQuantity(item.item_id, parseInt(e.target.value) || 1)}
                                                    className="h-7 w-16 text-center"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeItem(item.item_id)}
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

                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={form.processing || selectedItems.length === 0}>
                            {form.processing ? 'Creating...' : 'Create Plan'}
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
    const form = useForm({
        employee_ids: [] as number[],
    });

    function toggleEmployee(id: number) {
        const current = form.data.employee_ids;
        if (current.includes(id)) {
            form.setData('employee_ids', current.filter((e) => e !== id));
        } else {
            form.setData('employee_ids', [...current, id]);
        }
    }

    function selectAll() {
        form.setData('employee_ids', employees.map((e) => e.id));
    }

    function clearAll() {
        form.setData('employee_ids', []);
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        form.post(`/admin/plans/${plan.id}/assign`, {
            onSuccess: () => onClose(),
        });
    }

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Assign Plan — {plan.title}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Select the employees you want to assign this quota plan to.
                    </p>

                    <div className="flex gap-3">
                        <Button type="button" size="sm" variant="outline" onClick={selectAll}>
                            Select All
                        </Button>
                        <Button type="button" size="sm" variant="ghost" onClick={clearAll}>
                            Clear
                        </Button>
                    </div>

                    {form.errors.employee_ids && (
                        <p className="text-xs text-destructive">{form.errors.employee_ids}</p>
                    )}

                    <div className="max-h-64 overflow-y-auto rounded-lg border border-border divide-y divide-border">
                        {employees.map((employee) => (
                            <label
                                key={employee.id}
                                className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-muted/50"
                            >
                                <Checkbox
                                    checked={form.data.employee_ids.includes(employee.id)}
                                    onCheckedChange={() => toggleEmployee(employee.id)}
                                />
                                <div>
                                    <p className="text-sm font-medium text-foreground">{employee.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {employee.employee_code}
                                        {employee.department ? ` · ${employee.department}` : ''}
                                    </p>
                                </div>
                            </label>
                        ))}
                    </div>

                    <p className="text-xs text-muted-foreground">
                        {form.data.employee_ids.length} of {employees.length} selected
                    </p>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={form.processing || form.data.employee_ids.length === 0}>
                            {form.processing ? 'Assigning...' : `Assign to ${form.data.employee_ids.length} Employee(s)`}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
