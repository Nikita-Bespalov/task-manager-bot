export interface User {
  telegram_id: string;
  username: string;
  full_name: string;
  role: 'admin' | 'employee';
  active: string;
}

export interface Task {
  task_id: string;
  title: string;
  description?: string;
  assigned_to_id: string;
  assigned_by_id: string;
  status: 'new' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  created_date?: string;
  deadline?: string;
  completed_date?: string;
  comments?: string;
  rowIndex?: number;
}

export type TaskFilter = 'all' | 'new' | 'in_progress' | 'completed';

export const STATUS_TEXT: Record<string, string> = {
  new: 'Новая',
  in_progress: 'В работе',
  completed: 'Выполнена',
  cancelled: 'Отменена',
};

export const PRIORITY_TEXT: Record<string, string> = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
};

export const STATUS_EMOJI: Record<string, string> = {
  new: '🆕',
  in_progress: '🔄',
  completed: '✅',
  cancelled: '❌',
};

export const PRIORITY_EMOJI: Record<string, string> = {
  low: '🟢',
  medium: '🟡',
  high: '🔴',
};
