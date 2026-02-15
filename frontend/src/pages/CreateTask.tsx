import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ScreenHeader from '@/components/ScreenHeader';
import { createTask as apiCreateTask, fetchAllUsers } from '@/lib/api';
import { User } from '@/lib/types';
import { toast } from 'sonner';

declare global {
  interface Window {
    Telegram?: { WebApp: any };
  }
}

const getTelegramId = (): string => {
  return window.Telegram?.WebApp?.initDataUnsafe?.user?.id?.toString() || '7714999378';
};

export default function CreateTask() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignee, setAssignee] = useState('');
  const [priority, setPriority] = useState('medium');
  const [deadline, setDeadline] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAllUsers().then(setUsers).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiCreateTask({
        title,
        description,
        assigned_to_id: assignee,
        assigned_by_id: getTelegramId(),
        priority,
        deadline,
      });
      toast.success('✅ Задача успешно создана!');
      navigate('/');
    } catch {
      toast.error('Ошибка при создании задачи');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl bg-background/80 border border-border/60 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/60";
  const labelClass = "block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2";

  return (
    <div className="min-h-screen">
      <ScreenHeader title="Новая задача" onBack={() => navigate('/')} />
      <motion.form
        onSubmit={handleSubmit}
        className="px-5 py-6 space-y-5 max-w-lg mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <label className={labelClass}>Название задачи *</label>
          <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Введите название" required />
        </div>
        <div>
          <label className={labelClass}>Описание</label>
          <textarea className={`${inputClass} resize-none`} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Опишите задачу" rows={4} />
        </div>
        <div>
          <label className={labelClass}>Исполнитель *</label>
          <select className={inputClass} value={assignee} onChange={(e) => setAssignee(e.target.value)} required>
            <option value="">Выберите исполнителя</option>
            {users.filter(u => u.active === 'TRUE').map(u => (
              <option key={u.telegram_id} value={u.telegram_id}>
                {u.full_name} ({u.role})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Приоритет</label>
          <select className={inputClass} value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="low">🟢 Низкий</option>
            <option value="medium">🟡 Средний</option>
            <option value="high">🔴 Высокий</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Дедлайн</label>
          <input type="date" className={inputClass} value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        </div>
        <motion.button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 rounded-xl text-sm font-semibold text-primary-foreground gradient-primary shadow-lg disabled:opacity-50"
          whileTap={{ scale: 0.97 }}
        >
          {submitting ? 'Создание...' : 'Создать задачу'}
        </motion.button>
      </motion.form>
    </div>
  );
}
