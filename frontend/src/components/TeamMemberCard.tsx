import GlassCard from './GlassCard';

interface TeamMemberCardProps {
  name: string;
  role: string;
  stats: { active: number; new: number; inProgress: number; completed: number };
  onClick: () => void;
  index: number;
}

export default function TeamMemberCard({ name, role, stats, onClick, index }: TeamMemberCardProps) {
  return (
    <GlassCard
      hoverable
      className="cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      onClick={onClick}
    >
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border/50">
        <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg shadow-md">
          {name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{name}</p>
          <p className="text-xs text-muted-foreground">
            {role === 'admin' ? '👑 Администратор' : '👤 Сотрудник'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {[
          { value: stats.active, label: 'Активных' },
          { value: stats.new, label: 'Новых' },
          { value: stats.inProgress, label: 'В работе' },
          { value: stats.completed, label: 'Готово' },
        ].map((s) => (
          <div key={s.label} className="flex flex-col items-center p-2 rounded-xl bg-background/50">
            <span className="text-lg font-bold text-foreground">{s.value}</span>
            <span className="text-[10px] text-muted-foreground text-center leading-tight mt-0.5">{s.label}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
