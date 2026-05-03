import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    Briefcase,
    CalendarDays,
    Copy,
    Mail,
    Pencil,
    Plus,
    Power,
    Trash2,
    Upload,
    UserRound,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import {
    DialogClose,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Employee = {
    id: number;
    user_id: number;
    name: string;
    email: string;
    shareable_password: string | null;
    avatar: string | null;
    employee_code: string;
    department: string | null;
    designation: string | null;
    personal_email: string | null;
    joining_date: string | null;
    is_active: boolean;
};

type Props = {
    employees: Employee[];
};

const defaultDepartments = [
    'Engineering',
    'Design',
    'HR',
    'Management',
    'Marketing',
    'Sales',
    'Finance',
    'Other',
];

const avatarColors = [
    'bg-emerald-500',
    'bg-green-600',
    'bg-teal-600',
    'bg-lime-600',
    'bg-emerald-600',
    'bg-green-500',
];

function getEmployeeInitials(name: string) {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase();
}

function getAvatarGradient(name: string) {
    const sum = name
        .split('')
        .reduce((total, char) => total + char.charCodeAt(0), 0);

    return avatarColors[sum % avatarColors.length];
}

export default function AdminEmployees({ employees }: Props) {
    function copyEmployeeDetails(employee: Employee) {
        const details = [
            `Name: ${employee.name}`,
            `Company Email: ${employee.email}`,
            `Password: ${employee.shareable_password ?? 'Not available'}`,
            `Employee Code: ${employee.employee_code}`,
            `Department: ${employee.department ?? 'Not assigned'}`,
            `Job Role: ${employee.designation ?? 'Not added'}`,
            `Personal Email: ${employee.personal_email ?? 'Not added'}`,
            `Joining Date: ${employee.joining_date ?? 'Not added'}`,
            `Status: ${employee.is_active ? 'Active' : 'Inactive'}`,
        ].join('\n');

        navigator.clipboard
            .writeText(details)
            .then(() => toast.success('Employee details copied successfully.'))
            .catch(() =>
                toast.error('Copy failed. Please allow clipboard permission.'),
            );
    }

    function canDeleteEmployee(employee: Employee) {
        return !employee.is_active;
    }

    const { flash } = usePage<{ flash: { success?: string; error?: string } }>()
        .props;

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(
        null,
    );
    const [statusEmployee, setStatusEmployee] = useState<Employee | null>(null);
    const [deleteEmployee, setDeleteEmployee] = useState<Employee | null>(null);
    const activeEmployees = employees.filter(
        (employee) => employee.is_active,
    ).length;
    const inactiveEmployees = employees.length - activeEmployees;
    const departmentsCount = new Set(
        employees.map((employee) => employee.department).filter(Boolean),
    ).size;
    const departmentOptions = Array.from(
        new Set([
            ...defaultDepartments,
            ...(employees
                .map((employee) => employee.department)
                .filter(Boolean) as string[]),
        ]),
    ).sort((a, b) => a.localeCompare(b));

    return (
        <>
            <Head title="Employees" />

            <div className="space-y-6 p-4 sm:p-6">
                <div className="overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-r from-white via-emerald-50/70 to-cyan-50/70 shadow-sm">
                    <div className="flex flex-col gap-6 px-6 py-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
                        <div className="max-w-2xl">
                            <div className="mb-3 inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                                Team management
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                                Employees
                            </h1>
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                Manage employee accounts with a cleaner card
                                layout, quick actions, and a softer visual
                                style.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            <SummaryCard
                                label="Total"
                                value={employees.length}
                            />
                            <SummaryCard
                                label="Active"
                                value={activeEmployees}
                            />
                            <SummaryCard
                                label="Departments"
                                value={departmentsCount}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            Employee Directory
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            {activeEmployees} active employees and{' '}
                            {inactiveEmployees} inactive employees.
                        </p>
                    </div>
                    <Button
                        onClick={() => setShowCreateModal(true)}
                        className="gap-2 rounded-xl px-4 py-2.5 shadow-sm"
                    >
                        <Plus className="h-4 w-4" />
                        Add Employee
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
                    {employees.length === 0 ? (
                        <div className="col-span-full rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                                <UserRound className="h-7 w-7" />
                            </div>
                            <h3 className="mt-4 text-lg font-semibold text-slate-900">
                                No employees yet
                            </h3>
                            <p className="mt-2 text-sm text-slate-500">
                                Create your first employee to start managing the
                                team.
                            </p>
                            <Button
                                onClick={() => setShowCreateModal(true)}
                                className="mt-5 rounded-xl px-4 py-2.5"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Employee
                            </Button>
                        </div>
                    ) : (
                        employees.map((employee) => (
                            <div
                                key={employee.id}
                                className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                            >
                                <div className="h-24 bg-emerald-500" />
                                <div className="relative px-5 pb-5">
                                    <div className="flex items-start justify-between">
                                        <div className="-mt-8 flex min-w-0 items-center gap-3">
                                            {employee.avatar ? (
                                                <img
                                                    src={employee.avatar}
                                                    alt={employee.name}
                                                    className="h-16 w-16 rounded-2xl border-4 border-white object-cover shadow-md"
                                                />
                                            ) : (
                                                <div
                                                    className={`flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-white ${getAvatarGradient(employee.name)} text-lg font-bold text-white shadow-md`}
                                                >
                                                    {getEmployeeInitials(
                                                        employee.name,
                                                    )}
                                                </div>
                                            )}
                                            <div className="min-w-0 pt-8">
                                                <h3 className="truncate text-lg font-semibold text-slate-900">
                                                    {employee.name}
                                                </h3>
                                                <p className="truncate text-xs font-medium tracking-[0.2em] text-slate-400 uppercase">
                                                    {employee.employee_code}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex items-center gap-2">
                                            <button
                                                onClick={() =>
                                                    copyEmployeeDetails(
                                                        employee,
                                                    )
                                                }
                                                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                                                title="Copy employee details"
                                            >
                                                <Copy className="h-3.5 w-3.5" />
                                                Copy
                                            </button>
                                            <span
                                                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                                                    employee.is_active
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : 'bg-rose-100 text-rose-700'
                                                }`}
                                            >
                                                {employee.is_active
                                                    ? 'Active'
                                                    : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-5 space-y-3">
                                        <EmployeeInfoRow
                                            icon={<Mail className="h-4 w-4" />}
                                            label="Company Email"
                                            value={employee.email}
                                        />
                                        <EmployeeInfoRow
                                            icon={<Mail className="h-4 w-4" />}
                                            label="Personal Email"
                                            value={
                                                employee.personal_email ??
                                                'Not added'
                                            }
                                        />
                                        <EmployeeInfoRow
                                            icon={
                                                <Briefcase className="h-4 w-4" />
                                            }
                                            label="Department"
                                            value={
                                                employee.department ??
                                                'Not assigned'
                                            }
                                        />
                                        <EmployeeInfoRow
                                            icon={
                                                <UserRound className="h-4 w-4" />
                                            }
                                            label="Job Role"
                                            value={
                                                employee.designation ??
                                                'Not added'
                                            }
                                        />
                                        <EmployeeInfoRow
                                            icon={
                                                <CalendarDays className="h-4 w-4" />
                                            }
                                            label="Joining date"
                                            value={
                                                employee.joining_date ||
                                                'Not added'
                                            }
                                        />
                                    </div>

                                    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                                        <button
                                            onClick={() =>
                                                setEditingEmployee(employee)
                                            }
                                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 sm:col-span-1"
                                            title="Edit Employee"
                                        >
                                            <Pencil className="h-4 w-4" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() =>
                                                setStatusEmployee(employee)
                                            }
                                            className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 sm:col-span-1 ${
                                                employee.is_active
                                                    ? 'bg-rose-500'
                                                    : 'bg-emerald-500'
                                            }`}
                                            title={
                                                employee.is_active
                                                    ? 'Deactivate'
                                                    : 'Activate'
                                            }
                                        >
                                            <Power className="h-4 w-4" />
                                            {employee.is_active
                                                ? 'Deactivate'
                                                : 'Activate'}
                                        </button>
                                        <button
                                            onClick={() =>
                                                setDeleteEmployee(employee)
                                            }
                                            disabled={
                                                !canDeleteEmployee(employee)
                                            }
                                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 sm:col-span-1"
                                            title={
                                                !canDeleteEmployee(employee)
                                                    ? 'Deactivate before deleting'
                                                    : 'Delete Employee'
                                            }
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

            <CreateEmployeeModal
                open={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                departmentOptions={departmentOptions}
            />

            {editingEmployee && (
                <EditEmployeeModal
                    employee={editingEmployee}
                    onClose={() => setEditingEmployee(null)}
                    departmentOptions={departmentOptions}
                />
            )}

            {statusEmployee && (
                <StatusConfirmModal
                    employee={statusEmployee}
                    onClose={() => setStatusEmployee(null)}
                />
            )}

            {deleteEmployee && (
                <DeleteEmployeeModal
                    employee={deleteEmployee}
                    onClose={() => setDeleteEmployee(null)}
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

function StatusConfirmModal({
    employee,
    onClose,
}: {
    employee: Employee;
    onClose: () => void;
}) {
    const action = employee.is_active ? 'Deactivate' : 'Activate';

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{action} employee</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to {action.toLowerCase()}{' '}
                        {employee.name}? You can change this again later.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2">
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button
                        variant={employee.is_active ? 'destructive' : 'default'}
                        onClick={() => {
                            router.patch(
                                `/admin/employees/${employee.id}/toggle-status`,
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

function DeleteEmployeeModal({
    employee,
    onClose,
}: {
    employee: Employee;
    onClose: () => void;
}) {
    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Delete employee</DialogTitle>
                    <DialogDescription>
                        This will permanently delete {employee.name}, the
                        employee account, image, quota data, and usage history.
                        This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2">
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button
                        variant="destructive"
                        onClick={() => {
                            router.delete(`/admin/employees/${employee.id}`);
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

function EmployeeInfoRow({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-start gap-3 rounded-2xl bg-slate-50 px-3 py-2.5">
            <div className="mt-0.5 text-slate-400">{icon}</div>
            <div className="min-w-0">
                <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                    {label}
                </p>
                <p className="truncate text-sm font-medium text-slate-700">
                    {value}
                </p>
            </div>
        </div>
    );
}

function SectionTitle({
    eyebrow,
    title,
    description,
}: {
    eyebrow: string;
    title: string;
    description: string;
}) {
    return (
        <div className="space-y-1">
            <p className="text-[11px] font-semibold tracking-[0.22em] text-emerald-600 uppercase">
                {eyebrow}
            </p>
            <h3 className="text-base font-semibold text-slate-900">{title}</h3>
            <p className="text-sm text-slate-500">{description}</p>
        </div>
    );
}

function EmployeeAvatarField({
    label,
    error,
    file,
    currentAvatar,
    name,
    helperText,
    onChange,
}: {
    label: string;
    error?: string;
    file: File | null;
    currentAvatar?: string | null;
    name: string;
    helperText: string;
    onChange: (file: File | null) => void;
}) {
    const previewSrc = file ? URL.createObjectURL(file) : currentAvatar;

    return (
        <FormField label={label} error={error} className="sm:col-span-2">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    {previewSrc ? (
                        <img
                            src={previewSrc}
                            alt={name || 'Employee preview'}
                            className="h-20 w-20 rounded-2xl border-4 border-white object-cover shadow-sm"
                        />
                    ) : (
                        <div
                            className={`flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white ${getAvatarGradient(name || 'Employee')} text-xl font-bold text-white shadow-sm`}
                        >
                            {getEmployeeInitials(name || 'Employee')}
                        </div>
                    )}
                    <div className="flex-1">
                        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-emerald-300 bg-white px-4 py-3 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50">
                            <Upload className="h-4 w-4" />
                            Choose employee image
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) =>
                                    onChange(e.target.files?.[0] ?? null)
                                }
                            />
                        </label>
                        <p className="mt-2 text-xs text-slate-500">
                            {helperText}
                        </p>
                    </div>
                </div>
            </div>
        </FormField>
    );
}

function CreateEmployeeModal({
    open,
    onClose,
    departmentOptions,
}: {
    open: boolean;
    onClose: () => void;
    departmentOptions: string[];
}) {
    const form = useForm({
        name: '',
        email: '',
        password: '',
        avatar: null as File | null,
        employee_code: '',
        department: '',
        designation: '',
        personal_email: '',
        joining_date: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        form.post('/admin/employees', {
            forceFormData: true,
            onSuccess: () => {
                onClose();
                form.reset();
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-h-[92vh] overflow-y-auto rounded-3xl border border-emerald-100 bg-white p-0 shadow-2xl [-ms-overflow-style:none] [scrollbar-width:none] sm:max-w-2xl [&::-webkit-scrollbar]:hidden">
                <DialogHeader className="border-b border-emerald-100 bg-gradient-to-r from-white to-emerald-50 px-6 py-5">
                    <DialogTitle className="text-2xl font-semibold text-slate-900">
                        Add Employee
                    </DialogTitle>
                    <DialogDescription className="text-sm text-slate-500">
                        Create a new employee account with profile details,
                        login credentials, and an optional image.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 p-6">
                    <EmployeeAvatarField
                        label="Employee Image"
                        error={form.errors.avatar}
                        file={form.data.avatar}
                        name={form.data.name}
                        helperText="Upload a profile image to personalize the employee card."
                        onChange={(file) => form.setData('avatar', file)}
                    />

                    <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5">
                        <SectionTitle
                            eyebrow="Account Access"
                            title="Login credentials"
                            description="These details will be used by the employee to sign in."
                        />
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <FormField
                                label="Full Name"
                                error={form.errors.name}
                            >
                                <Input
                                    value={form.data.name}
                                    onChange={(e) =>
                                        form.setData('name', e.target.value)
                                    }
                                    placeholder="Ali Hassan"
                                />
                            </FormField>

                            <FormField
                                label="Company Email"
                                error={form.errors.email}
                            >
                                <Input
                                    type="email"
                                    value={form.data.email}
                                    onChange={(e) =>
                                        form.setData('email', e.target.value)
                                    }
                                    placeholder="ali@company.com"
                                />
                            </FormField>

                            <FormField
                                label="Personal Email"
                                error={form.errors.personal_email}
                            >
                                <Input
                                    type="email"
                                    value={form.data.personal_email}
                                    onChange={(e) =>
                                        form.setData(
                                            'personal_email',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="ali.personal@gmail.com"
                                />
                            </FormField>

                            <FormField
                                label="Password"
                                error={form.errors.password}
                            >
                                <PasswordInput
                                    value={form.data.password}
                                    onChange={(e) =>
                                        form.setData('password', e.target.value)
                                    }
                                    placeholder="Min 8 characters"
                                />
                            </FormField>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5">
                        <SectionTitle
                            eyebrow="Employee Details"
                            title="Work profile"
                            description="Basic company information for this employee."
                        />
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <FormField
                                label="Employee ID"
                                error={form.errors.employee_code}
                            >
                                <Input
                                    value={form.data.employee_code}
                                    onChange={(e) =>
                                        form.setData(
                                            'employee_code',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="EMP-001"
                                />
                            </FormField>

                            <FormField
                                label="Department"
                                error={form.errors.department}
                            >
                                <>
                                    <Input
                                        value={form.data.department}
                                        onChange={(e) =>
                                            form.setData(
                                                'department',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Engineering"
                                        list="employee-department-options"
                                    />
                                    <datalist id="employee-department-options">
                                        {departmentOptions.map((department) => (
                                            <option
                                                key={department}
                                                value={department}
                                            />
                                        ))}
                                    </datalist>
                                </>
                            </FormField>

                            <FormField
                                label="Job Role"
                                error={form.errors.designation}
                            >
                                <Input
                                    value={form.data.designation}
                                    onChange={(e) =>
                                        form.setData(
                                            'designation',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Flutter Developer"
                                />
                            </FormField>

                            <FormField
                                label="Joining Date"
                                error={form.errors.joining_date}
                            >
                                <Input
                                    type="date"
                                    value={form.data.joining_date}
                                    onChange={(e) =>
                                        form.setData(
                                            'joining_date',
                                            e.target.value,
                                        )
                                    }
                                />
                            </FormField>
                        </div>
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
                            {form.processing
                                ? 'Creating...'
                                : 'Create Employee'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function EditEmployeeModal({
    employee,
    onClose,
    departmentOptions,
}: {
    employee: Employee;
    onClose: () => void;
    departmentOptions: string[];
}) {
    const form = useForm({
        name: employee.name,
        email: employee.email,
        password: '',
        avatar: null as File | null,
        employee_code: employee.employee_code,
        department: employee.department ?? '',
        designation: employee.designation ?? '',
        personal_email: employee.personal_email ?? '',
        joining_date: employee.joining_date ?? '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        form.transform((data) => ({ ...data, _method: 'put' as const }));
        form.post(`/admin/employees/${employee.id}`, {
            forceFormData: true,
            onSuccess: () => onClose(),
        });
    }

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-h-[92vh] overflow-y-auto rounded-3xl border border-emerald-100 bg-white p-0 shadow-2xl [-ms-overflow-style:none] [scrollbar-width:none] sm:max-w-2xl [&::-webkit-scrollbar]:hidden">
                <DialogHeader className="border-b border-emerald-100 bg-gradient-to-r from-white to-emerald-50 px-6 py-5">
                    <DialogTitle className="text-2xl font-semibold text-slate-900">
                        Edit Employee
                    </DialogTitle>
                    <DialogDescription className="text-sm text-slate-500">
                        Update {employee.name}'s account, profile details, and
                        image from one place.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 p-6">
                    <EmployeeAvatarField
                        label="Employee Image"
                        error={form.errors.avatar}
                        file={form.data.avatar}
                        currentAvatar={employee.avatar}
                        name={form.data.name}
                        helperText={
                            employee.avatar
                                ? 'Choose a new image to replace the current one.'
                                : 'Upload a profile image for the employee.'
                        }
                        onChange={(file) => form.setData('avatar', file)}
                    />

                    <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5">
                        <SectionTitle
                            eyebrow="Account Access"
                            title="Login credentials"
                            description="Update email or password details for this employee."
                        />
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <FormField
                                label="Full Name"
                                error={form.errors.name}
                            >
                                <Input
                                    value={form.data.name}
                                    onChange={(e) =>
                                        form.setData('name', e.target.value)
                                    }
                                />
                            </FormField>

                            <FormField
                                label="Company Email"
                                error={form.errors.email}
                            >
                                <Input
                                    type="email"
                                    value={form.data.email}
                                    onChange={(e) =>
                                        form.setData('email', e.target.value)
                                    }
                                />
                            </FormField>

                            <FormField
                                label="Personal Email"
                                error={form.errors.personal_email}
                            >
                                <Input
                                    type="email"
                                    value={form.data.personal_email}
                                    onChange={(e) =>
                                        form.setData(
                                            'personal_email',
                                            e.target.value,
                                        )
                                    }
                                />
                            </FormField>

                            <FormField
                                label="New Password"
                                error={form.errors.password}
                            >
                                <PasswordInput
                                    value={form.data.password}
                                    onChange={(e) =>
                                        form.setData('password', e.target.value)
                                    }
                                    placeholder="Minimum 8 characters"
                                />
                            </FormField>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5">
                        <SectionTitle
                            eyebrow="Employee Details"
                            title="Work profile"
                            description="Keep company information accurate and up to date."
                        />
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <FormField
                                label="Employee ID"
                                error={form.errors.employee_code}
                            >
                                <Input
                                    value={form.data.employee_code}
                                    onChange={(e) =>
                                        form.setData(
                                            'employee_code',
                                            e.target.value,
                                        )
                                    }
                                />
                            </FormField>

                            <FormField
                                label="Department"
                                error={form.errors.department}
                            >
                                <>
                                    <Input
                                        value={form.data.department}
                                        onChange={(e) =>
                                            form.setData(
                                                'department',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Engineering"
                                        list="employee-department-options"
                                    />
                                    <datalist id="employee-department-options">
                                        {departmentOptions.map((department) => (
                                            <option
                                                key={department}
                                                value={department}
                                            />
                                        ))}
                                    </datalist>
                                </>
                            </FormField>

                            <FormField
                                label="Job Role"
                                error={form.errors.designation}
                            >
                                <Input
                                    value={form.data.designation}
                                    onChange={(e) =>
                                        form.setData(
                                            'designation',
                                            e.target.value,
                                        )
                                    }
                                />
                            </FormField>

                            <FormField
                                label="Joining Date"
                                error={form.errors.joining_date}
                            >
                                <Input
                                    type="date"
                                    value={form.data.joining_date}
                                    onChange={(e) =>
                                        form.setData(
                                            'joining_date',
                                            e.target.value,
                                        )
                                    }
                                />
                            </FormField>
                        </div>
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
                            {form.processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
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
            <Label className="text-sm font-medium text-foreground">
                {label}
            </Label>
            {children}
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}
