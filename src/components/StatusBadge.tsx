import type { OrderStatus } from '../types';

interface StatusBadgeProps {
  status: OrderStatus;
}

const statusConfig: Record<
  OrderStatus,
  { label: string; classes: string }
> = {
  PENDING: {
    label: 'Pending',
    classes:
      'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  },
  CONFIRMED: {
    label: 'Confirmed',
    classes:
      'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  },
  DELIVERED: {
    label: 'Delivered',
    classes:
      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  },
  DISPUTED: {
    label: 'Disputed',
    classes: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  },
  RESOLVED: {
    label: 'Resolved',
    classes:
      'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  },
  REFUNDED: {
    label: 'Refunded',
    classes:
      'bg-gray-100 text-gray-700 dark:bg-gray-700/40 dark:text-gray-300',
  },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${config.classes}`}
    >
      {config.label}
    </span>
  );
}
