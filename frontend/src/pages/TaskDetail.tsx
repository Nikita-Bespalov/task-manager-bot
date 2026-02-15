import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ScreenHeader from '@/components/ScreenHeader';
import GlassCard from '@/components/GlassCard';
import { StatusBadge, PriorityBadge } from '@/components/Badges';
import { updateTaskStatus } from '@/lib/api';
import { Task, User } from '@/lib/types';
import { toast } from 'sonner';

export default function TaskDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { task, user } = (location.state || {}) as { task: Task; user: User };

  if (!task) {
    navigate('/');
    return null;
  }

  const handleComplete = async () => {
    try {
      await updateTaskStatus(task.task_id, 'completed');
      toast.success('✅ Задача отмечена как выполненная!');
      navigate('/');
    } catch {
      toast.error('Ошибка при обновлении задачи');
    }
  };

  const isCompleted = task.status === 'completed' || task.status === 'cancelled';

  return (
    <div className="min-h-screen">
      <ScreenHeader title="Детали задачи" onBack={() => navigate('/')} />
      <motion.div
        className="px-5 py-6 space-y-5 max-w-lg mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h1 className="text-xl font-bold text-foreground mb-3">{task.title}</h1>
          <StatusBadge status={task.status} />
        </div>

        <GlassCard>
          <div className="space-y-3">
            {[
              { label: 'Приоритет', value: <PriorityBadge priority={task.priority} /> },
              { label: 'Дедлайн', value: task.deadline || 'Не указан' },
              { label: 'Создана', value: task.created_date || 'Неизвестно' },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                <span className="text-xs font-medium text-muted-foreground">{row.label}</span>
                <span className="text-sm text-foreground">{row.value}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {task.description && (
          <GlassCard>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Описание</h4>
            <p className="text-sm text-foreground leading-relaxed">{task.description}</p>
          </GlassCard>
        )}

        <div className="space-y-3 pt-2">
          {user?.role === 'admin' && (
            <motion.button
              className="w-full py-3 rounded-xl text-sm font-semibold text-primary btn-glass border border-primary/20"
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(`/edit/${task.task_id}`, { state: { task, user } })}
            >
              ✏️ Редактировать
            </motion.button>
          )}
          <motion.button
            disabled={isCompleted}
            className="w-full py-3.5 rounded-xl text-sm font-semibold text-primary-foreground shadow-lg disabled:opacity-40"
            style={{ background: isCompleted ? undefined : 'hsl(var(--success))' }}
            whileTap={isCompleted ? undefined : { scale: 0.97 }}
            onClick={handleComplete}
          >
            {isCompleted ? '✅ Выполнена' : '✅ Отметить выполненной'}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
