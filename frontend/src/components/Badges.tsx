import { cn } from '@/lib/utils';

type StatusType = 'new' | 'in_progress' | 'completed' | 'cancelled';
type PriorityType = 'low' | 'medium' | 'high';

const statusStyles: Record<StatusType, string> = {
  new: 'bg-info/15 text-info',
  in_progress: 'bg-warning/15 text-warning',
  completed: 'bg-success/15 text-success',
  cancelled: 'bg-destructive/15 text-destructive',
};

const priorityStyles: Record<PriorityType, string> = {
  low: 'bg-success/15 text-success',
  medium: 'bg-warning/15 text-warning',
  high: 'bg-destructive/15 text-destructive',
};

const STATUS_LABEL: Record<string, string> = {
  new: 'Новая',
  in_progress: 'В работе',
  completed: 'Выполнена',
  cancelled: 'Отменена',
};

const PRIORITY_LABEL: Record<string, string> = {
  low: '🟢 Низкий',
  medium: '🟡 Средний',
  high: '🔴 Высокий',
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide',
      statusStyles[status as StatusType] || 'bg-muted text-muted-foreground',
      className
    )}>
      {STATUS_LABEL[status] || status}
    </span>
  );
}

export function PriorityBadge({ priority, className }: { priority: string; className?: string }) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide',
      priorityStyles[priority as PriorityType] || 'bg-muted text-muted-foreground',
      className
    )}>
      {PRIORITY_LABEL[priority] || priority}
    </span>
  );
}

export function RoleBadge({ role }: { role: string }) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide',
      role === 'admin' ? 'bg-warning/15 text-warning' : 'bg-info/15 text-info'
    )}>
      {role === 'admin' ? '👑 Админ' : '👤 Сотрудник'}
    </span>
  );
}
