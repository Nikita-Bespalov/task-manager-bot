import { Task } from '@/lib/types';
import { StatusBadge, PriorityBadge } from './Badges';
import GlassCard from './GlassCard';
import { motion } from 'framer-motion';

interface TaskCardProps {
  task: Task;
  index: number;
  telegramId: string;
  onClick: (task: Task) => void;
  onTakeInProgress: (taskId: string) => void;
}

export default function TaskCard({ task, index, telegramId, onClick, onTakeInProgress }: TaskCardProps) {
  const isAssignedToMe = task.assigned_to_id === String(telegramId);
  const canTakeInProgress = isAssignedToMe && task.status === 'new';

  return (
    <GlassCard
      hoverable
      className="cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      onClick={() => onClick(task)}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-sm font-semibold text-foreground leading-snug flex-1">
          {task.title}
        </h3>
        <StatusBadge status={task.status} />
      </div>

      {task.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
          {task.description}
        </p>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <PriorityBadge priority={task.priority} />
        {task.deadline && (
          <span className="inline-flex items-center text-xs text-muted-foreground gap-1">
            📅 {task.deadline}
          </span>
        )}
      </div>

      {canTakeInProgress && (
        <motion.button
          className="w-full mt-4 py-2.5 rounded-xl text-sm font-semibold text-primary-foreground gradient-primary shadow-md"
          whileTap={{ scale: 0.97 }}
          onClick={(e) => {
            e.stopPropagation();
            onTakeInProgress(task.task_id);
          }}
        >
          🚀 Взять в работу
        </motion.button>
      )}
    </GlassCard>
  );
}
