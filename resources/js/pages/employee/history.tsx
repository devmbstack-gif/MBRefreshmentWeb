import { Head } from '@inertiajs/react';
import { Clock } from 'lucide-react';

type Usage = {
    id: number;
    item_name: string;
    item_category: string;
    quantity_used: number;
    used_at: string;
};

type Props = {
    usages: Usage[];
};

const categoryEmoji: Record<string, string> = {
    food: '🍱',
    beverage: '🍵',
    snack: '🍫',
    other: '📦',
};

const categoryColors: Record<string, string> = {
    food: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400',
    beverage: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
    snack: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400',
    other: 'bg-muted text-muted-foreground',
};

export default function EmployeeHistory({ usages }: Props) {
    return (
        <>
            <Head title="Usage History" />

            <div className="space-y-6 p-6">

                <div>
                    <h1 className="text-2xl font-bold text-foreground">Usage History</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Every item you have used — with exact date and time.
                    </p>
                </div>

                {usages.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border py-20 text-center">
                        <Clock className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
                        <p className="text-sm text-muted-foreground">
                            No usage history yet. Start using your quota items to see them here.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-xl border border-border bg-card">
                        <div className="border-b border-border px-5 py-4">
                            <p className="text-sm text-muted-foreground">
                                {usages.length} total usage{usages.length !== 1 ? 's' : ''}
                            </p>
                        </div>

                        <div className="divide-y divide-border">
                            {usages.map((usage) => (
                                <div key={usage.id} className="flex items-center justify-between px-5 py-3.5">
                                    <div className="flex items-center gap-4">
                                        <span className="text-2xl">{categoryEmoji[usage.item_category] ?? '📦'}</span>
                                        <div>
                                            <p className="text-sm font-medium text-foreground">{usage.item_name}</p>
                                            <div className="mt-0.5 flex items-center gap-2">
                                                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${categoryColors[usage.item_category]}`}>
                                                    {usage.item_category.charAt(0).toUpperCase() + usage.item_category.slice(1)}
                                                </span>
                                                {usage.quantity_used > 1 && (
                                                    <span className="text-xs text-muted-foreground">×{usage.quantity_used}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Clock className="h-3.5 w-3.5" />
                                        {usage.used_at}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
