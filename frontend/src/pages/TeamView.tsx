import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ScreenHeader from '@/components/ScreenHeader';
import TeamMemberCard from '@/components/TeamMemberCard';
import { fetchAllUsers, fetchAllTasks } from '@/lib/api';
import { User, Task } from '@/lib/types';
import LoadingScreen from '@/components/LoadingScreen';

interface UserTaskData {
  user: User;
  tasks: { new: Task[]; in_progress: Task[]; completed: Task[] };
}

export default function TeamView() {
  const navigate = useNavigate();
  const [teamData, setTeamData] = useState<UserTaskData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [users, allTasksData] = await Promise.all([fetchAllUsers(), fetchAllTasks()]);
        
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const map: Record<string, UserTaskData> = {};
        users.forEach(u => {
          map[u.telegram_id] = { user: u, tasks: { new: [], in_progress: [], completed: [] } };
        });

        allTasksData.forEach(task => {
          const entry = map[task.assigned_to_id];
          if (!entry) return;
          if (task.status === 'new') entry.tasks.new.push(task);
          else if (task.status === 'in_progress') entry.tasks.in_progress.push(task);
          else if (task.status === 'completed') {
            const d = task.completed_date ? new Date(task.completed_date) : null;
            if (d && d >= sevenDaysAgo) entry.tasks.completed.push(task);
          }
        });

        setTeamData(Object.values(map).filter(d => d.user.active === 'TRUE'));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen">
      <ScreenHeader title="Команда" onBack={() => navigate('/')} />
      <div className="px-4 py-4 space-y-3">
        {teamData.map((d, i) => (
          <TeamMemberCard
            key={d.user.telegram_id}
            name={d.user.full_name}
            role={d.user.role}
            index={i}
            stats={{
              active: d.tasks.new.length + d.tasks.in_progress.length,
              new: d.tasks.new.length,
              inProgress: d.tasks.in_progress.length,
              completed: d.tasks.completed.length,
            }}
            onClick={() => {
              // Navigate back to main with user's tasks
              navigate('/', { state: { userTasks: [...d.tasks.new, ...d.tasks.in_progress, ...d.tasks.completed] } });
            }}
          />
        ))}
      </div>
    </div>
  );
}
