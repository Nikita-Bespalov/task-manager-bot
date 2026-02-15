import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ScreenHeader from '@/components/ScreenHeader';
import { updateTask, fetchAllTasks, fetchAllUsers } from '@/lib/api';
import { Task, User } from '@/lib/types';
import { toast } from 'sonner';

export default function EditTask() {
  const navigate = useNavigate();
  const location = useLocation();
  const { task, user } = (location.state || {}) as { task: Task; user: User };
  const [users, setUsers] = useState<User[]>([]);

  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [assignee, setAssignee] = useState(task?.assigned_to_id || '');
  const [priority, setPriority] = useState<string>(task?.priority || 'medium');
  const [status, setStatus] = useState<string>(task?.status || 'new');
  const [deadline, setDeadline] = useState(task?.deadline || '');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAllUsers().then(setUsers).catch(console.error);
  }, []);

  if (!task) {
    navigate('/');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Get current task data for rowIndex
      const allTasksData = await fetchAllTasks();
      const currentTask = allTasksData.find((t) => t.task_id === task.task_id);
      if (!currentTask) throw new Error('Задача не найдена');

      await updateTask(task.task_id, {
        rowIndex: currentTask.rowIndex!,
        title,
        description,
        assigned_to_id: assignee,
        assigned_by_id: task.assigned_by_id,
        status,
        priority,
        created_date: task.created_date || '',
        deadline,
        completed_date: status === 'completed' ? new Date().toISOString().split('T')[0] : (task.completed_date || ''),
        comments: task.comments || '',
      });
      toast.success('✅ Задача успешно обновлена!');
      navigate('/');
    } catch {
      toast.error('Ошибка при обновлении задачи');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl bg-background/80 border border-border/60 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/60";
  const labelClass = "block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2";

  return (
    <div className="min-h-screen">
      <ScreenHeader title="Редактировать задачу" onBack={() => navigate(-1)} />
      <motion.form
        onSubmit={handleSubmit}
        className="px-5 py-6 space-y-5 max-w-lg mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <label className={labelClass}>Название задачи *</label>
          <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Описание</label>
          <textarea className={`${inputClass} resize-none`} value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
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
          <label className={labelClass}>Статус</label>
          <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="new">🆕 Новая</option>
            <option value="in_progress">🔄 В работе</option>
            <option value="completed">✅ Выполнена</option>
            <option value="cancelled">❌ Отменена</option>
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
          {submitting ? 'Сохранение...' : 'Сохранить изменения'}
        </motion.button>
      </motion.form>
    </div>
  );
}
