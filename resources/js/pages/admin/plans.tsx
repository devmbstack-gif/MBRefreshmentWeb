import { Head, router, useForm, usePage } from '@inertiajs/react';
import { CalendarDays, ClipboardList, Plus, Sparkles, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
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
    assigned_employee_ids: number[];
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

    const activePlans = plans.filter((plan) => plan.is_active).length;
    const totalAssignments = plans.reduce((sum, plan) => sum + plan.assigned_count, 0);
    const totalPlanItems = plans.reduce((sum, plan) => sum + plan.items.length, 0);

    function handleToggleStatus(plan: Plan) {
        const action = plan.is_active ? 'deactivate' : 'activate';
        if (confirm(`Are you sure you want to ${action} "${plan.title}"?`)) {
            router.patch(`/admin/plans/${plan.id}/toggle-status`);
        }
    }

    return (
        <>
            <Head title="Month Plans" />

            <div className="space-y-6 p-6">
                <div className="overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-r from-white via-emerald-50/70 to-cyan-50/70 shadow-sm">
                    <div className="flex flex-col gap-6 px-6 py-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
                        <div className="max-w-2xl">
                            <div className="mb-3 inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                                Month planning
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Month Plans</h1>
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                Build monthly refreshment plans, organize included items, and assign them to employees with a cleaner workflow.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <SummaryCard label="Total plans" value={plans.length} />
                            <SummaryCard label="Active" value={activePlans} />
                            <SummaryCard label="Assigned" value={totalAssignments} />
                            <SummaryCard label="Plan items" value={totalPlanItems} />
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Plan Directory</h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Create and assign month plans for employees.
                        </p>
                    </div>
                    <Button onClick={() => setShowCreateModal(true)} className="gap-2 rounded-xl px-4 py-2.5 shadow-sm">
                        <Plus className="h-4 w-4" />
                        Create Month Plan
                    </Button>
                </div>

                {flash?.success && (
                    <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        {flash.success}
                    </div>
                )}

                {plans.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-slate-300 bg-white py-16 text-center shadow-sm">
                        <ClipboardList className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                        <p className="text-sm text-slate-500">No month plans yet. Create your first one.</p>
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
        <div className="flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
            <div className="border-b border-slate-100 bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-4 text-white">
                <div className="flex items-start justify-between gap-2">
                <div>
                    <h3 className="font-semibold">{plan.title}</h3>
                    <p className="mt-0.5 text-xs capitalize text-white/80">{plan.period_type} month plan</p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                    plan.is_active
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-700'
                }`}>
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
                    <div key={item.item_id} className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm">
                        <span className="text-slate-700">{item.item_name}</span>
                        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">x{item.quantity}</span>
                    </div>
                ))}
                </div>
            </div>

            <div className="mt-auto flex items-center justify-between border-t border-slate-200 pt-4">
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Users className="h-3.5 w-3.5" />
                    {plan.assigned_count} assigned
                </span>

                <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={onToggleStatus} className="rounded-xl">
                        {plan.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button size="sm" onClick={onAssign} className="gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600">
                        <Users className="h-3.5 w-3.5" />
                        Assign
                    </Button>
                </div>
            </div>
            </div>
        </div>
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

function MiniStat({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
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
            <DialogContent className="max-h-[92vh] overflow-y-auto rounded-3xl border border-emerald-100 bg-white p-0 shadow-2xl [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:max-w-2xl">
                <DialogHeader className="border-b border-emerald-100 bg-gradient-to-r from-white to-emerald-50 px-6 py-5">
                    <DialogTitle className="text-2xl font-semibold text-slate-900">Create Month Plan</DialogTitle>
                    <DialogDescription className="text-sm text-slate-500">
                        Build a month plan and attach refreshment items with quantities.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 p-6">

                    <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
                    <div className="space-y-1.5">
                        <Label>Plan Title</Label>
                        <Input
                            value={form.data.title}
                            onChange={(e) => form.setData('title', e.target.value)}
                            placeholder="e.g. July 2025 Month Plan"
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
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-3">
                        <Label>Items in this Month Plan</Label>

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
                            <div className="rounded-2xl border border-slate-200 divide-y divide-slate-200 bg-white">
                                {selectedItems.map((item) => (
                                    <div key={item.item_id} className="flex items-center justify-between px-4 py-3">
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

                    <div className="flex justify-end gap-3 border-t border-slate-200 pt-2">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={form.processing || selectedItems.length === 0} className="bg-emerald-500 hover:bg-emerald-600">
                            {form.processing ? 'Creating...' : 'Create Month Plan'}
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
        employee_ids: plan.assigned_employee_ids ?? [],
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
            <DialogContent className="max-h-[92vh] overflow-y-auto rounded-3xl border border-emerald-100 bg-white p-0 shadow-2xl [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:max-w-xl">
                <DialogHeader className="border-b border-emerald-100 bg-gradient-to-r from-white to-emerald-50 px-6 py-5">
                    <DialogTitle className="text-2xl font-semibold text-slate-900">Assign Month Plan</DialogTitle>
                    <DialogDescription className="text-sm text-slate-500">
                        Assign {plan.title} to one or more employees.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 p-6">
                    <p className="text-sm text-slate-500">
                        Select the employees you want to assign this month plan to.
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

                    <div className="max-h-72 space-y-2 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50/50 p-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {employees.map((employee) => (
                            <div
                                key={employee.id}
                                role="button"
                                tabIndex={0}
                                onClick={(e) => {
                                    const target = e.target as HTMLElement;
                                    if (target.closest('input[type="checkbox"][aria-hidden="true"]')) {
                                        return;
                                    }
                                    toggleEmployee(employee.id);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        toggleEmployee(employee.id);
                                    }
                                }}
                                className={`flex w-full cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                                    form.data.employee_ids.includes(employee.id)
                                        ? 'border-emerald-200 bg-white shadow-sm'
                                        : 'border-transparent bg-white/70 hover:border-slate-200 hover:bg-white'
                                }`}
                            >
                                {(() => {
                                    const selected = form.data.employee_ids.includes(employee.id);

                                    return (
                                        <>
                                <Checkbox
                                    checked={selected}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleEmployee(employee.id);
                                    }}
                                />
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-slate-900">{employee.name}</p>
                                    <p className="truncate text-xs text-slate-500">
                                        {employee.employee_code}
                                        {employee.department ? ` · ${employee.department}` : ''}
                                    </p>
                                </div>
                                {selected && (
                                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                        Assigned
                                    </span>
                                )}
                                        </>
                                    );
                                })()}
                            </div>
                        ))}
                    </div>

                    <p className="text-xs text-slate-500">
                        {form.data.employee_ids.length} of {employees.length} selected
                    </p>

                    <div className="flex justify-end gap-3 border-t border-slate-200 pt-2">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={form.processing || form.data.employee_ids.length === 0} className="bg-emerald-500 hover:bg-emerald-600">
                            {form.processing ? 'Assigning...' : `Assign to ${form.data.employee_ids.length} Employee(s)`}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
