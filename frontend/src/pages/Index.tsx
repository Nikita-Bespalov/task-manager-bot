import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { fetchUser, fetchTasks, fetchAllUsers, updateTaskStatus } from '@/lib/api';
import { Task, User, TaskFilter } from '@/lib/types';
import AppHeader from '@/components/AppHeader';
import TaskFilters from '@/components/TaskFilters';
import TaskCard from '@/components/TaskCard';
import EmptyState from '@/components/EmptyState';
import LoadingScreen from '@/components/LoadingScreen';
import { toast } from 'sonner';

declare global {
  interface Window {
    Telegram?: { WebApp: any };
  }
}

const getTelegramId = (): string => {
  return window.Telegram?.WebApp?.initDataUnsafe?.user?.id?.toString();
};

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [loading, setLoading] = useState(true);
  const telegramId = getTelegramId();

  const loadTasks = useCallback(async (currentUser: User) => {
    try {
      const data = await fetchTasks(telegramId, currentUser.role === 'admin');
      setTasks(data);
    } catch (err) {
      console.error('Ошибка загрузки задач:', err);
    }
  }, [telegramId]);

  useEffect(() => {
    const init = async () => {
      try {
        // Expand Telegram WebApp if available
        window.Telegram?.WebApp?.expand();
        
        const userData = await fetchUser(telegramId);
        setUser(userData);
        await loadTasks(userData);

        if (userData.role === 'admin') {
          await fetchAllUsers();
        }
      } catch (err) {
        console.error('Ошибка инициализации:', err);
        toast.error('Ошибка загрузки данных');
      } finally {
        setLoading(false);
      }
    };
    init();

    // Auto-refresh every 10s
    const interval = setInterval(() => {
      if (user) loadTasks(user);
    }, 10000);
    return () => clearInterval(interval);
  }, [telegramId]);

  const handleTakeInProgress = async (taskId: string) => {
    try {
      await updateTaskStatus(taskId, 'in_progress');
      toast.success('🚀 Задача взята в работу!');
      if (user) await loadTasks(user);
    } catch {
      toast.error('Ошибка при обновлении задачи');
    }
  };

  if (loading) return <LoadingScreen />;
  if (!user) return <EmptyState message="Не удалось загрузить профиль" />;

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'all') return task.status !== 'completed' && task.status !== 'cancelled';
    if (filter === 'completed') {
      if (task.status !== 'completed') return false;
      const completedDate = task.completed_date ? new Date(task.completed_date) : null;
      if (!completedDate) return true;
      return completedDate >= sevenDaysAgo;
    }
    return task.status === filter;
  });

  return (
    <div className="min-h-screen pb-24">
      <AppHeader user={user} />
      <TaskFilters
        currentFilter={filter}
        onFilterChange={setFilter}
        isAdmin={user.role === 'admin'}
        onTeamClick={() => navigate('/team')}
      />

      <div className="px-4 space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredTasks.length === 0 ? (
            <EmptyState />
          ) : (
            filteredTasks.map((task, i) => (
              <TaskCard
                key={task.task_id}
                task={task}
                index={i}
                telegramId={telegramId}
                onClick={(t) => navigate(`/task/${t.task_id}`, { state: { task: t, user } })}
                onTakeInProgress={handleTakeInProgress}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {user.role === 'admin' && (
        <motion.button
          className="fixed bottom-6 right-6 w-14 h-14 rounded-2xl gradient-primary text-primary-foreground shadow-xl flex items-center justify-center z-50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => navigate('/create')}
        >
          <Plus size={24} />
        </motion.button>
      )}
    </div>
  );
};

export default Index;
