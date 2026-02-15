import { User } from '@/lib/types';
import { RoleBadge } from './Badges';
import { motion } from 'framer-motion';

interface AppHeaderProps {
  user: User;
}

export default function AppHeader({ user }: AppHeaderProps) {
  return (
    <motion.header
      className="glass-panel sticky top-0 z-40 px-5 py-4"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg shadow-md">
          {(user.full_name || user.username || '?').charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold text-foreground truncate">
            {user.full_name || user.username}
          </h2>
          <RoleBadge role={user.role} />
        </div>
      </div>
    </motion.header>
  );
}
