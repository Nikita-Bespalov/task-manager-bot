import { cn } from '@/lib/utils';
import { TaskFilter } from '@/lib/types';
import { motion } from 'framer-motion';

interface TaskFiltersProps {
  currentFilter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
  isAdmin: boolean;
  onTeamClick?: () => void;
}

const filters: { key: TaskFilter; label: string }[] = [
  { key: 'all', label: 'Все' },
  { key: 'new', label: 'Новые' },
  { key: 'in_progress', label: 'В работе' },
  { key: 'completed', label: 'Готово' },
];

export default function TaskFilters({ currentFilter, onFilterChange, isAdmin, onTeamClick }: TaskFiltersProps) {
  return (
    <div className="flex gap-2 px-5 py-3 overflow-x-auto scrollbar-hide">
      {filters.map((f) => (
        <motion.button
          key={f.key}
          onClick={() => onFilterChange(f.key)}
          className={cn(
            'relative px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors duration-200',
            currentFilter === f.key
              ? 'text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground btn-glass'
          )}
          whileTap={{ scale: 0.95 }}
        >
          {currentFilter === f.key && (
            <motion.div
              layoutId="activeFilter"
              className="absolute inset-0 gradient-primary rounded-xl shadow-md"
              transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
            />
          )}
          <span className="relative z-10">{f.label}</span>
        </motion.button>
      ))}
      {isAdmin && (
        <motion.button
          onClick={onTeamClick}
          className="px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap text-muted-foreground hover:text-foreground btn-glass"
          whileTap={{ scale: 0.95 }}
        >
          👥 Команда
        </motion.button>
      )}
    </div>
  );
}
