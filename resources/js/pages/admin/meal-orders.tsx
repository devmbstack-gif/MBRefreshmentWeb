import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type MealOrderRequest = {
    id: number;
    employee_name: string | null;
    item_name: string | null;
    item_category: string | null;
    quantity: number;
    status: 'pending' | 'approved' | 'rejected';
    requested_at: string | null;
    processed_at: string | null;
    processed_by: string | null;
    rejection_reason: string | null;
};

export default function AdminMealOrders({
    requests,
}: {
    requests: MealOrderRequest[];
}) {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>()
        .props;
    const [reasons, setReasons] = useState<Record<number, string>>({});

    const pendingCount = requests.filter((request) => request.status === 'pending').length;

    function approveRequest(requestId: number) {
        router.post(`/admin/meal-orders/${requestId}/approve`);
    }

    function rejectRequest(requestId: number) {
        router.post(`/admin/meal-orders/${requestId}/reject`, {
            reason: reasons[requestId] ?? '',
        });
    }

    return (
        <>
            <Head title="Meal Orders" />

            <div className="space-y-6 p-4 sm:p-6">
                <div className="rounded-3xl border border-emerald-100 bg-gradient-to-r from-white via-emerald-50/70 to-cyan-50/70 px-6 py-6 shadow-sm lg:px-8">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        Meal Order Requests
                    </h1>
                    <p className="mt-2 text-sm text-slate-600">
                        Pending requests need admin approval before meal quota is consumed.
                    </p>
                    <p className="mt-3 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                        Pending: {pendingCount}
                    </p>
                </div>

                {flash?.success && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        {flash.error}
                    </div>
                )}

                {requests.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center text-sm text-slate-500">
                        No meal order requests yet.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {requests.map((request) => (
                            <div
                                key={request.id}
                                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <h3 className="text-base font-semibold text-slate-900">
                                            {request.employee_name ?? 'Unknown employee'} requested{' '}
                                            {request.quantity} x {request.item_name ?? 'Item'}
                                        </h3>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Category: {request.item_category ?? 'N/A'} | Requested:{' '}
                                            {request.requested_at ?? 'Unknown date'}
                                        </p>
                                    </div>
                                    <span
                                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                            request.status === 'pending'
                                                ? 'bg-amber-100 text-amber-800'
                                                : request.status === 'approved'
                                                  ? 'bg-emerald-100 text-emerald-800'
                                                  : 'bg-rose-100 text-rose-800'
                                        }`}
                                    >
                                        {request.status.toUpperCase()}
                                    </span>
                                </div>

                                {request.status === 'pending' ? (
                                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                                        <Button onClick={() => approveRequest(request.id)}>
                                            Approve
                                        </Button>
                                        <Input
                                            placeholder="Rejection reason (optional)"
                                            value={reasons[request.id] ?? ''}
                                            onChange={(event) =>
                                                setReasons((prev) => ({
                                                    ...prev,
                                                    [request.id]: event.target.value,
                                                }))
                                            }
                                        />
                                        <Button
                                            variant="destructive"
                                            onClick={() => rejectRequest(request.id)}
                                        >
                                            Reject
                                        </Button>
                                    </div>
                                ) : (
                                    <p className="mt-3 text-sm text-slate-500">
                                        Processed by {request.processed_by ?? 'Admin'} at{' '}
                                        {request.processed_at ?? 'N/A'}
                                        {request.status === 'rejected' && request.rejection_reason
                                            ? ` | Reason: ${request.rejection_reason}`
                                            : ''}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
